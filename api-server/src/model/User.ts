import { AbstractEntity } from "@model/types/index.js";

export default class User extends AbstractEntity {
    private id: string;
    private username: string;
    private email: string;
    private password: string;
    private statsId: string;

    constructor(username: string, email: string, password: string, statsId: string, id?: string) {
        super();

        this.username = username;
        this.email = email;
        this.password = password;
        this.statsId = statsId;

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

    public getUsername(): string {
        return this.username;
    }

    public getEmail(): string {
        return this.email;
    }

    public getPassword(): string {
        return this.password;
    }

    public getStatsId(): string {
        return this.statsId;
    }
}
