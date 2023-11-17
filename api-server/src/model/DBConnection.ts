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

    // make userData arg mandatory
    public async createNewUser(userData?: User) {
        const client = await this.pool.connect();

        await this.insertStats(client, new Stats(10, 33)); 
    }

    public async insertUser(client: pg.PoolClient, userData: User) {
        const valuesArray = [userData.getStatsId(), userData.getUsername(), userData.getEmail(), userData.getPassword()];
        const query = `INSERT INTO ${TABLES.USERS} (statsId, username, email, password) VALUES ($1, $2, $3, $4)`;

        const result = await client.query(query, valuesArray);

        console.log(result);
    }

    public async insertStats(client: pg.PoolClient, statsData: Stats) {
        const valuesArray = [statsData.getWins(), statsData.getLosses()];
        const query = `INSERT INTO ${TABLES.STATS} (wins, losses) VALUES ($1, $2) RETURNING uid, wins, losses, winRate`;

        const result = await client.query({
            text: query, 
            values: valuesArray,
            rowMode: 'array'
        });

        console.log(result.fields[0]?.name);
        console.log(result.fields[1]?.name);
        console.log(result.rows);
    }

    private onPoolError(err: Error, client: pg.PoolClient): void {

    }
}
