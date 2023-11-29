import { AbstractEntity } from "@model/types/index.js";

export default class Stats extends AbstractEntity {
    private id: string;
    private winRate: number;
    private wins: number;
    private losses: number;
    private userId: string;

    constructor(wins: number, losses: number, winRate?: number, id?: string, userId?: string) {
        super();

        this.wins = wins;
        this.losses = losses;

        if (typeof winRate === 'number') {
            this.winRate = winRate;
        }

        if (id) {
            this.id = id;
        }

        if (userId) {
            this.userId = userId;
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

    public getId(): string {
        return this.id;
    }
}
