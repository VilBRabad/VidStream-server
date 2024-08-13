import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";
import { Response, Request } from "express";
import { IUser, User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import nodemailer from "nodemailer"
import jwt, {JwtPayload} from "jsonwebtoken";

interface userInformation{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const options = {
    httpOnly: true,
    secure: true,
    path: '/',
}

const generateAccessRefreshToken = async(user: IUser)=>{
    try {
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
    const { email, password } = req.body;

    
    if([email, password].some((fields)=> fields.trim()==="")){
        throw new ApiError(400, "All fields required");
    }
    
    
    console.log(req.body);
    const existUser = await User.findOne({email})
    
    if(existUser) throw new ApiError(402, "User already exists");
    
    const user = await User.create({
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

    const {email, password} = req.body;
    if(email == "" || password == "") throw new ApiError(400, "Email or password required!");

    const existUser = await User.findOne({email});
    if(!existUser) throw new ApiError(404, "User Not Found");

    const isPasswordValid = await existUser.isPasswordCorrect(password);
    if(!isPasswordValid) throw new ApiError(402, "Invalid Passwoord!");

    const {accessToken, refreshToken} = await generateAccessRefreshToken(existUser);

    const user = {
        _id: existUser._id,
        email: existUser.email,
    };

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, user, "Login successfully")
    )
})



const logOutUser = asyncHandler(async(req:Request, res:Response)=>{
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "logout successfully")
    );
})



const sendResetPasswordLink = async (email: string, verificationToken: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_SERVICE_PASS
        }
    })

    const mailOptions = {
        from: "vidstream.vil.com",
        to: email,
        subject: "Reset password | VidStream",
        // text: `Please verify email address by following link: http://localhost:8000/verify-email?token=${verificationToken}`
        html: `<!DOCTYPE html>
                <html>
                <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        width: 80%;
                        margin: auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    p {
                        font-size: 16px;
                        color: #666;
                    }
                    a {
                        color: #FFFFFF;
                        text-decoration: none;
                        background-color: #FF8225;
                        padding: 8px 15px;
                        text-decoration: none;
                        border-radius: 3px;
                        font-weight: 600;
                    }
                </style>
                </head>
                <body>
                <div class="container">
                    <p>Click the link below to reset password:</p>
                    <a href="http://localhost:5173/reset-password?token=${verificationToken}">Reset Password</a>
                    <p>Thank you!</p>
                </div>
                </body>
                </html>
            `
    };

    try {
        const res = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}


const resetPasswordLinkGenerator = asyncHandler(async(req:Request, res:Response)=>{
    const {email} = req.body;

    if(!email.trim()) throw new ApiError(400, "All fields required");

    const user = await User.findOne({email});

    if(!user) throw new ApiError(404, "Invalid email address");

    const verificationToken = jwt.sign(
        { 
            userId: user._id,
        },
        process.env.TOKEN_GENERATOR as string,
        { expiresIn: process.env.TOKEN_EXPIRY }
    )

    const mailres = sendResetPasswordLink(email, verificationToken);

    if(!mailres) throw new ApiError(401, "Error while sending mail");

    user.resetToken = verificationToken;
    user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, {}, "Send reset password link on mail")
    )
})


const resetPassword = asyncHandler(async(req:Request, res:Response)=>{
    const token = req.query.token as string;
    const {password} = req.body;

    if(!password.trim()) throw new ApiError(400, "Password required!");
    if(!token) throw new ApiError(404, "Invalid link")

    const verifiedToken = jwt.verify(token, process.env.TOKEN_GENERATOR as string);
    
    if(!verifiedToken) throw new ApiError(402, "Link expired!")

    const userId = (verifiedToken as JwtPayload).userId;

    const user = await User.findOne({_id: userId});

    if(!user) throw new ApiError(404, "Invalid link");

    const userToken = user.resetToken;
    if(!userToken) throw new ApiError(402, "Link expired");

    user.password = password;
    user.resetToken = undefined;
    user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully")
    )
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


export { registerUser, loginUser, logOutUser, resetPasswordLinkGenerator, resetPassword, testJWTAuth };

