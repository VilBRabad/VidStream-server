const asyncHandler = (fn: Function)=>{
    return (req: object, res: object, next: Function)=>{
        Promise.resolve(fn(req, res, next))
        .catch((err)=> next(err));
    }
}

export {asyncHandler};