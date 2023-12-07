export default abstract class AbstractEntity {
    public store(): void {
        // TODO: call db connection from here and insert the data
    }

    public abstract getFields(): {[key: string]: any}

    /*
     * Get data of an entity as JSON. Useful when responding to a request 
     * with an entity.
     *
     * All data returned by this.getFields() function will be attached to the
     * JSON returned by this function.
     *
     * Since JSON.stringify can throw a TypeError, its handled here by logging
     * the error.
     */
    public toJSON(): string {
        try {
            const json = JSON.stringify(this.getFields());

            return json;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}
