import { AbstractEntity } from "@model/types/index.js";

export default class Guest extends AbstractEntity {
    private id: string;
    private username: string;

    constructor(username: string, id?: string) {
        super();

        this.username = username;

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
