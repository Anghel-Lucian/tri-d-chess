import pg from 'pg';
import 'dotenv/config';
import User from '@model/User.js';
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

// TODO: complete this table
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

    public async createNewUser(username: string, email: string, password: string) {
        const client = await this.pool.connect();

        console.log("creating new user");

        try {
            const stats = await this.insertStats(client, 0, 0); 
            const userData = await this.insertUser(client, username, email, password, stats.getId());

            console.log({userData});
            
            return userData;
        } catch (err) {
            this.onClientError(err, client);
        }

    }

    public async insertUser(client: pg.PoolClient, username: string, email: string, password: string, statsId: string) {
        const valuesArray = [statsId, username, email, password];
        const query = `INSERT INTO ${TABLES.USERS} (statsId, username, email, password) VALUES ($1, $2, $3, $4) RETURNING uid, username, email, password, statsId`;

        const result = await client.query({
            text: query, 
            values: valuesArray,
            rowMode: 'array'
        });

        if (result.fields?.length === 0 || result.rows?.length === 0) {
            throw new Error("[DBConnection:insertUser]: inserted user returned fields are empty");
        }

        const insertedUserData: any = {};
  
        for (let i = 0; i < result.fields.length; i++) {
            const columnName = result.fields[i].name;
            const value = result.rows[0][i];

            switch (dbColumnsTypesTable[columnName]) {
                case 'number':
                    insertedUserData[columnName] = Number(value);
                    break;
                case 'string':
                    insertedUserData[columnName] = String(value);
                    break;
                default:
                    insertedUserData[columnName] = value;
            }
        }

        return new User(insertedUserData.username, insertedUserData.email, insertedUserData.password, insertedUserData.statsid, insertedUserData.uid);
    }

    public async insertStats(client: pg.PoolClient, wins: number, losses: number): Promise<Stats> {
        const valuesArray = [wins, losses];
        const query = `INSERT INTO ${TABLES.STATS} (wins, losses) VALUES ($1, $2) RETURNING uid, wins, losses, winRate`;

        const result = await client.query({
            text: query, 
            values: valuesArray,
            rowMode: 'array'
        });

        if (result.fields?.length === 0 || result.rows?.length === 0) {
            throw new Error("[DBConnection:insertStats]: inserted stats returned fields are empty");
        }

        const insertedStatsData: any = {};
  
        for (let i = 0; i < result.fields.length; i++) {
            const columnName = result.fields[i].name;
            const value = result.rows[0][i];

            switch (dbColumnsTypesTable[columnName]) {
                case 'number':
                    insertedStatsData[columnName] = Number(value);
                    break;
                case 'string':
                    insertedStatsData[columnName] = String(value);
                    break;
                default:
                    insertedStatsData[columnName] = value;
            }
        }

        return new Stats(insertedStatsData.wins, insertedStatsData.losses, insertedStatsData.winrate, insertedStatsData.uid);
    }

    private onPoolError(err: Error, client: pg.PoolClient): void {

    }

    private onClientError(err: Error, client: pg.PoolClient): void {
        console.error(err);
        client.release();
    }
}
