import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { Response, Request } from "express";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";

interface userInformation{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}


const registerUser = asyncHandler(async(req: Request<{}, {}, userInformation>, res: Response)=>{
    const { firstName, lastName, email, password } = req.body;

    
    if([firstName, lastName, email, password].some((fields)=> fields.trim()==="")){
        throw new ApiError(400, "All fields required");
    }
    
    console.log(req.body);
    const existUser = await User.findOne({email})
    
    if(existUser){
        throw new ApiError(402, "User already exists");
    }
    
    const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    })

    const createdUser = await User.findOne(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(401, "Something wrong while registering user");
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User created successfully")
    );
})


export { registerUser };

