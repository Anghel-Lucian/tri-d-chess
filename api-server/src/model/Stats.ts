import { AbstractEntity } from "@model/types/index.js";

export default class Stats extends AbstractEntity {
    private id: string;
    private winRate: number;
    private wins: number;
    private losses: number;
    private userId: string;

    constructor(wins: number, losses: number, winRate?: number, userId?: string, id?: string) {
        super();

        this.wins = wins;
        this.losses = losses;

        if (winRate) {
            this.winRate = winRate;
        }

        if (userId) {
            this.userId = userId;
        }

        if (id) {
            this.id = id;
        }
    }

    public store(): void  {
        // dbconnection.store(the data);
    }

       
    public getFields(): { [key: string]: any; } {
        return {};
    } 

    public getWinRate(): number {
        return this.winRate;
    }

    public getWins(): number {
        return this.wins;
    }

    public getLosses(): number {
        return this.losses;
    }

    public getUserId(): string {
        return this.userId;
    }
}
