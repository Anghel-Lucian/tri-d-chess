import pg from 'pg';

import User from '@model/User.js';
import Guest from '@model/Guest.js';
import Stats from '@model/Stats.js';

const TABLES = {
    USERS: "users",
    STATS: "stats",
    STATS_GAME: "stats_game",
    GAME: "game",
    GUEST: "guest"
}

const dbClientConfig: pg.ClientConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
};

/**
  * The pg package does not keep track of the type in Postgres.
  * When a number column is queried, the result might be a string.
  * To avoid this, this table keeps track of the column names and
  * their types.
  */
const dbColumnsTypesTable: {[key: string]: string} = {
    wins: 'number',
    losses: 'number',
    winrate: 'number',
    username: 'string',
    email: 'string',
    statsid: 'string',
    password: 'string',
    uid: 'string'
};

export default class DBConnection {
    private static instance: DBConnection;
    private pool: pg.Pool;

    private constructor() {
        this.pool = new pg.Pool(dbClientConfig);

        this.pool.on('error', this.onPoolError);
    }

    public static getInstance(): DBConnection {
        if (this.instance) {
            return this.instance;
        }

        this.instance = new DBConnection();

        return this.instance;
    }

    public async createNewUser(username: string, email: string, password: string): Promise<User> {
        const client = await this.pool.connect();

        try {
            // Begin transaction
            await client.query('BEGIN');

            // Inserting stats
            const statsQueryOptions = {
                values: [0, 0],
                text: `INSERT INTO ${TABLES.STATS} (wins, losses) VALUES ($1, $2) RETURNING uid, wins, losses, winRate`
            };

            const resultStats = await client.query({
                ...statsQueryOptions,
                rowMode: 'array'
            });

            const dataStats = this.parseDBResult(resultStats);

            // Inserting user
            const userQueryOptions = {
                values: [username, email, password, dataStats.uid],
                text: `INSERT INTO ${TABLES.USERS} (username, email, password, statsId) VALUES ($1, $2, $3, $4) RETURNING uid, username, email, password, statsId`
            };

            const resultUser = await client.query({
                ...userQueryOptions,
                rowMode: 'array'
            });

            const dataUser = this.parseDBResult(resultUser);

            // Commit transaction
            await client.query('COMMIT');

            return new User(dataUser.username, dataUser.email, dataUser.password, dataUser.statsid, dataUser.uid);
        } catch (err) {
            // Rollback transaction in case of error
            await client.query('ROLLBACK');
            this.onClientError(err);
            return null;
        } finally {
            client.release();
        }
    }

    public async createGuest(username: string): Promise<Guest> {
        const client = await this.pool.connect();

        try {
            const queryOptions = {
                values: [username],
                text: `INSERT INTO ${TABLES.GUEST} (username) VALUES ($1) RETURNING uid, username`
            };

            const result = await client.query({
                ...queryOptions,
                rowMode: 'array'
            });

            if (result.fields?.length === 0 || result.rows?.length === 0) {
                return null;
            }

            const data = this.parseDBResult(result);

            return new Guest(data.username, data.uid);
        } catch (err) {
            this.onClientError(err);
            return null;
        } finally {
            client.release();
        }
    }

    public async getEntityByProperties(table: string, properties: {
        email?: string, 
        username?: string, 
        password?: string, 
        uid?: string,
        userId?: string
    }): Promise<User | Stats> {
        const client = await this.pool.connect();

        try {
            const queryStringWhereClauseArguments = this.getQueryStringWhereClauseArgumentsBasedOnProperties(properties);
           
            const queryOptions = {
                values: Object.values(properties),
                text: `SELECT * FROM ${table} WHERE (${queryStringWhereClauseArguments})`
            }

            const result = await client.query({
                ...queryOptions,
                rowMode: 'array'
            });

            if (result.fields?.length === 0 || result.rows?.length === 0) {
                return null;
            }

            const data = this.parseDBResult(result);

            if (table === TABLES.USERS) {
                return new User(data.username, data.email, data.password, data.statsid, data.uid);
            } else if (table === TABLES.STATS) {
                return new Stats(data.wins, data.losses, data.winrate, data.userid, data.uid);
            }
        } catch (err) {
            this.onClientError(err);
            return null;
        } finally {
            client.release();
        }
    }

    public async getUserByEmailAndPassword(email: string, password: string): Promise<User> {
        return await this.getEntityByProperties(TABLES.USERS, {email, password}) as User;
    }

    public async getUserByUsername(username: string): Promise<User> {
        return await this.getEntityByProperties(TABLES.USERS, {username}) as User;
    }

    public async getUserByEmail(email: string): Promise<User> {
        return await this.getEntityByProperties(TABLES.USERS, {email}) as User;
    }

    public async getStatsByUsername(username: string): Promise<Stats> {
        return await this.getEntityByProperties(TABLES.STATS, {username}) as Stats;
    }

    public async getStatsByUserId(userId: string): Promise<Stats> {
        return await this.getEntityByProperties(TABLES.STATS, {userId}) as Stats;
    }

    private parseDBResult(result: pg.QueryArrayResult<any[]>) {
        if (result.fields?.length === 0 || result.rows?.length === 0) {
            throw new Error("[DBConnection:parseDBResult]: parsing didn't function. Result is empty or doesn't have fields or rows.");
        }

        const parsedResult: any = {};
  
        for (let i = 0; i < result.fields.length; i++) {
            const columnName = result.fields[i].name;
            const value = result.rows[0][i];

            switch (dbColumnsTypesTable[columnName]) {
                case 'number':
                    parsedResult[columnName] = Number(value);
                    break;
                case 'string':
                    parsedResult[columnName] = String(value);
                    break;
                default:
                    parsedResult[columnName] = value;
            }
        }

        return parsedResult;
    }

    private getQueryStringWhereClauseArgumentsBasedOnProperties(properties: {[key: string]: string}): string {
        return Object
            .keys(properties)
            .map((key, index, arr) => index !== arr.length - 1 
                ? `${key} = $${index + 1}` 
                : `${key} = $${index + 1}`)
            .join(' AND ')
    }

    private onPoolError(err: Error, client: pg.PoolClient): void {

    }

    private onClientError(err: Error): void {
        console.error(err);
    }

    public async closeConnections(): Promise<void> {
        await this.pool.end();
    }
}
