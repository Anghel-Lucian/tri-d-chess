export default class ResponseBody {
    private message: string;
    private data: any;

    constructor(message: string, data?: any) {
        this.message = message;
        
        if (data) {
            this.data = data;
        }
    }

    public toJSON(): string {
        try {
            const data: {message: string, data?: any} = {message: this.message};

            if (this.data) {
                data.data = this.data;
            }

            const dataJSON = JSON.stringify(data);

            return dataJSON;
        } catch (err) {
            console.error(err);
            return '';
        }
    }

    public setMessage(message: string): void {
        this.message = message;
    }

    public setData(data: any): void {
        this.data = data;
    }
}
