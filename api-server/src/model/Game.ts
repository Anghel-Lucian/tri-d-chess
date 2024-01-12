import { AbstractEntity } from "@model/types/index.js";

export default class Game extends AbstractEntity {
    private id: string;
    private winnerUsername: string;
    private loserUsername: string;
    private forfeited: boolean;

    constructor(winnerUsername: string, loserUsername: string, forfeited: boolean, id?: string) {
        super();

        this.winnerUsername = winnerUsername;
        this.loserUsername = loserUsername;
        this.forfeited = forfeited;

        if (id) {
            this.id = id;
        }
    }

    public store(): void  {
        // dbconnection.store(the data);
    }

    public getFields(): { [key: string]: any; } {
       return {
            winnerUsername: this.getWinnerUsername(),
            loserUsername: this.getLoserUsername(),
            forfeited: this.getForfeited()
       }; 
    }

    public getId(): string {
        return this.id;
    }

    public getWinnerUsername(): string {
        return this.winnerUsername;
    }

    public getLoserUsername(): string {
        return this.loserUsername;
    }

    public getForfeited(): boolean {
        return this.forfeited;
    }
}
