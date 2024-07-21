import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface jwtInterface extends jwt.JwtPayload{
    _id: string;
    email: string;
}

const verifyJWT = asyncHandler(async(req:Request, res:Response, next: NextFunction)=>{

    const token = req.cookies.accessToken || req.headers.authorization?.replace("Bearer ", "");

    if(!token) throw new ApiError(402, "Un-authorized request!");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwtInterface;

    // console.log(decodedToken._id);
    const user = await User.findOne({_id: decodedToken._id});
    if(!user) throw new ApiError(401, "Unable to find user, Please login again..");

    next();
})

export default verifyJWT;