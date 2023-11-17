export default abstract class AbstractEntity {
    public store(): void {
        // TODO: call db connection from here and insert the data
    }

    public abstract getFields(): {[key: string]: any}
}
