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


const generateAccessRefreshToken = async(userId: string)=>{
    try {
        const user = await User.findOne({_id: userId});
        
        if(!user) throw new ApiError(400, "Unable to find user");

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};
    } 
    catch (error) {
        throw new ApiError(402, "Error while generating access & refresh token..!");
    }
}


const registerUser = asyncHandler(async(req: Request<{}, {}, userInformation>, res: Response)=>{
    const { firstName, lastName, email, password } = req.body;

    
    if([firstName, lastName, email, password].some((fields)=> fields.trim()==="")){
        throw new ApiError(400, "All fields required");
    }
    
    console.log(req.body);
    const existUser = await User.findOne({email})
    
    if(existUser) throw new ApiError(402, "User already exists");
    
    const user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    })

    const createdUser = await User.findOne({_id: user._id}).select("-password -refreshToken");

    if(!createdUser) throw new ApiError(401, "Something wrong while registering user");

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User created successfully")
    );
})

const loginUser = asyncHandler(async(req:Request, res: Response)=>{
    try {
        const {email, password} = req.body;
        if(email == "" || password == "") throw new ApiError(400, "Email or password required!");
    
        const user = await User.findOne({email});
        if(!user) throw new ApiError(404, "User Not Found");
    
        const isPasswordValid = await user.isPasswordCorrect(password);
        if(!isPasswordValid) throw new ApiError(402, "Invalid Passwoord!");
    
        const {accessToken, refreshToken} = await generateAccessRefreshToken(user._id as string);
        
        const options = {
            httpOnly: true,
            secure: true
        }
    
        res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {}, "Login successfully")
        )
    } catch (error) {
        throw new ApiError(400, "Server Error");
    }
})




//! JWT Verification Test Handler
const testJWTAuth = asyncHandler(async(req:Request, res:Response)=>{
    try {
        console.log("Checkpoint 1");
        res.json(new ApiResponse(201, {}, "Verifed"));
    } catch (error) {
        console.log(error);
        throw new ApiError(400, "Server error!");
    }
})


export { registerUser, loginUser, testJWTAuth };

