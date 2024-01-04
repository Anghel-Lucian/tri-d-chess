import pg from 'pg';

import User from '@model/User.js';
import Guest from '@model/Guest.js';
import Stats from '@model/Stats.js';
import Game from '@model/Game.js';

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
const DB_COLUMN_TYPES: {[key: string]: string} = {
    wins: 'number',
    losses: 'number',
    winrate: 'number',
    username: 'string',
    email: 'string',
    statsid: 'string',
    password: 'string',
    uid: 'string',
    forfeited: 'boolean'
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
                text: `INSERT INTO ${TABLES.GUEST} (username) VALUES ($1) RETURNING username`
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
   
    public async getStatsByUsernameOrUserId(userIdentifiers: {username?: string, userId?: string}): Promise<Stats> {
        const client = await this.pool.connect();

        try {
            if (!userIdentifiers.username && !userIdentifiers.userId) {
                throw new Error('[DBConnection:getStatsByUsernameOrUserId]: username or id for user identification missing');
            }

            const userIdentificationColumn = userIdentifiers.userId ? 'uid' : 'username';
            const userIdentificationValue = userIdentifiers.userId || userIdentifiers.username;

            const statsQueryOptions = {
                values: [userIdentificationValue],
                text: `
                    SELECT s.uid, s.wins, s.losses, s.winrate, u.uid AS userId, u.username 
                    FROM "${TABLES.STATS}" s 
                    JOIN "${TABLES.USERS}" u ON s.uid = u.statsid 
                    WHERE u.${userIdentificationColumn} = $1
                `
            }

            const statsResult = await client.query({
                ...statsQueryOptions,
                rowMode: 'array'
            });

            if (statsResult.fields?.length === 0 || statsResult.rows?.length === 0) {
                return null;
            }

            const statsData = this.parseDBResult(statsResult);

            const gamesQueryOptions = {
                values: [statsData.userid],
                text: `SELECT * FROM ${TABLES.GAME} WHERE (winner = $1 OR loser = $1)`
            };

            const gamesResult = await client.query({
                ...gamesQueryOptions,
                rowMode: 'array'
            });

            const games = this.parseDBResultMulti(gamesResult);
            const parsedGames: Game[] = [];

            for (const game of games) {
                parsedGames.push(new Game(game.winner, game.loser, game.forfeited, game.uid));
            }

            return new Stats(statsData.wins, statsData.losses, parsedGames, statsData.winrate, statsData.uid, statsData.userid, statsData.username);
        } catch (err) {
            this.onClientError(err);
            return null;
        } finally {
            client.release();
        }
    }

    public async getStatsByUsername(username: string): Promise<Stats> {
        return await this.getStatsByUsernameOrUserId({username});
    }

    public async getStatsByUserId(userId: string): Promise<Stats> {
        return await this.getStatsByUsernameOrUserId({userId});
    }

    private parseDBResult(result: pg.QueryArrayResult<any[]>): any {
        if (result.fields?.length === 0 || result.rows?.length === 0) {
            throw new Error("[DBConnection:parseDBResult]: parsing failed. Result is empty or doesn't have fields or rows.");
        }

        const parsedResult: any = {};
  
        for (let i = 0; i < result.fields.length; i++) {
            const columnName = result.fields[i].name;
            const value = result.rows[0][i];

            parsedResult[columnName] = this.getCorrectlyTypedColumnValue(value, columnName);
        }

        return parsedResult;
    }

    private parseDBResultMulti(result: pg.QueryArrayResult<any[]>): any[] {
        if (result.fields?.length === 0) {
            throw new Error("[DBConnection:parseDBResultMulti]: parsing failed. Result is empty or doesn't have fields or rows.");
        }

        if (result.rows?.length === 0) {
            return [];
        }

        const parsedResult: any[] = [];

        for (let i = 0; i < result.rows.length; i++) {
            const item: any = {};

            for (let j = 0; j < result.fields.length; j++) {
                const columnName = result.fields[j].name;
                const value = result.rows[i][j];

                item[columnName] = this.getCorrectlyTypedColumnValue(value, columnName);
            }

            parsedResult.push(item);
        }

        return parsedResult;
    }

    private getCorrectlyTypedColumnValue(value: string, columnName: string): any {
        let castedValue;
        
        switch (DB_COLUMN_TYPES[columnName]) {
            case 'number':
                castedValue = Number(value);
            break;
            case 'string':
                castedValue = String(value);
            break;
            case 'boolean':
                castedValue = Boolean(value);
            break;
            default:
                castedValue = value;
        }

        return castedValue;
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
