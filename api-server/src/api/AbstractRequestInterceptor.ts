/**
  * Used for chaining different kinds of interceptor to one single request.
  * E.g.: request to server goes through security filter, then parser, then handler.
  */
abstract class AbstractRequestInterceptor {
    protected nextInterceptor: AbstractRequestInterceptor;

    constructor(protected interceptor?: AbstractRequestInterceptor) {
        if (interceptor) {
            this.nextInterceptor = interceptor;
        }
    }

    public setNextInterceptor(interceptor: AbstractRequestInterceptor) {
        this.nextInterceptor = interceptor;
    }

    // TODO: think whether it is better to create a general request
    // object to get as a parameter here and also pass it to onRequest in next() 
    abstract onRequest(...args: any[]): any;

    /**
      * Call the next interceptor. This method should be called in
      * each interceptor that needs to pass the request to some other
      * handler/handler/etc.
      *
      * The arbitrary arguments are passed to the onRequest method
      * to ensure the next interceptor has something to intercept...
      */
    protected next(...args: any[]): any {
        const result = this.nextInterceptor?.onRequest(...args);

        console.log({result});
        return result;
    }
}

export default AbstractRequestInterceptor;
