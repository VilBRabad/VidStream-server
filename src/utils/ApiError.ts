class ApiError extends Error{
    statusCode: number;
    data: null;
    errors: never[];
    
    constructor(
       statusCode: number,
       message= "Something went wrong",
       errors= [],
       stack= ""
    ){
       super(message);
       this.statusCode = statusCode;
       this.message = message;
       this.data = null;
       this.errors = errors;
 
       if(stack){
          this.stack = stack;
       }
       else{
          Error.captureStackTrace(this, this.constructor);
       }
    }
 }
 
 export {ApiError};