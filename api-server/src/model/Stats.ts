import { AbstractEntity } from "@model/types/index.js";
import Game from "@model/Game.js";

export default class Stats extends AbstractEntity {
    private id: string;
    private winRate: number;
    private wins: number;
    private losses: number;
    private games: Game[];
    private username: string;
    private userId: string;

    constructor(wins: number, losses: number, games: Game[], winRate?: number, id?: string, userId?: string, username?: string) {
        super();

        this.wins = wins;
        this.losses = losses;
        this.games = games;

        if (typeof winRate === 'number') {
            this.winRate = winRate;
        }

        if (id) {
            this.id = id;
        }

        if (username) {
            this.username = username;
        }

        if (userId) {
            this.userId = userId;
        }
    }

    public store(): void  {
        // dbconnection.store(the data);
    }

       
    public getFields(): { [key: string]: any; } {
        return {
            wins: this.getWins(),
            losses: this.getLosses(),
            winRate: this.getWinRate(),
            games: this.getGames().map(game => game.getFields()),
            id: this.getId(),
            username: this.getUsername(),
            userId: this.getUserId()
        };
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

    public getGames(): Game[] {
        return this.games;
    }

    public getUsername(): string {
        return this.username;
    }

    public getUserId(): string {
        return this.userId;
    }

    public getId(): string {
        return this.id;
    }
}
