import { AbstractEntity } from "@model/types/index.js";

export default class User extends AbstractEntity {
    private id: string;
    private username: string;
    private email: string;
    private passwordHash: string;
    private statsId: string;

    constructor(username: string, email?: string, passwordHash?: string, statsId?: string, id?: string) {
        super();

        this.username = username;

        if (email) {
            this.email = email;
        }

        if (passwordHash) {
            this.passwordHash = passwordHash;
        }

        if (statsId) {
            this.statsId = statsId;
        }

        if (id) {
            this.id = id;
        }
    }

    public store(): void  {
        // dbconnection.store(the data);
    }

    public getFields(): { [key: string]: any; } {
        return {
            username: this.getUsername()
        };
    }

    public getUsername(): string {
        return this.username;
    }

    public getEmail(): string {
        return this.email;
    }

    public getPasswordHash(): string {
        return this.passwordHash;
    }

    public getStatsId(): string {
        return this.statsId;
    }

    public getId(): string {
        return this.id;
    }
}
