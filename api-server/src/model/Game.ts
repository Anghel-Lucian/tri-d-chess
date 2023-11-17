import { AbstractEntity } from "@model/types/index.js";

export default class Game extends AbstractEntity {
    private id: string;
    private winner: string;
    private loser: string;
    private forfeited: boolean;

    constructor(winner: string, loser: string, forfeited: boolean, id?: string) {
        super();

        this.winner = winner;
        this.loser = loser;
        this.forfeited = forfeited;

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
}
