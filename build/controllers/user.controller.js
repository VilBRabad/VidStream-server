"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testJWTAuth = exports.removeFromWatchlist = exports.resetPassword = exports.getWatchlist = exports.addToWatchList = exports.resetPasswordLinkGenerator = exports.logOutUser = exports.loginUser = exports.registerUser = void 0;
const ApiError_1 = require("../utils/ApiError");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const user_model_1 = require("../models/user.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const nodemailer_1 = __importDefault(require("nodemailer"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const movie_model_1 = require("../models/movie.model");
const mongoose_1 = __importDefault(require("mongoose"));
const options = {
    httpOnly: true,
    secure: true,
    path: '/',
};
const generateAccessRefreshToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = yield user.generateAccessToken();
        const refreshToken = yield user.generateRefreshToken();
        user.refreshToken = refreshToken;
        yield user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError_1.ApiError(402, "Error while generating access & refresh token..!");
    }
});
const registerUser = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if ([email, password].some((fields) => fields.trim() === "")) {
        throw new ApiError_1.ApiError(400, "All fields required");
    }
    console.log(req.body);
    const existUser = yield user_model_1.User.findOne({ email });
    if (existUser)
        throw new ApiError_1.ApiError(402, "User already exists");
    const user = yield user_model_1.User.create({
        email: email,
        password: password
    });
    const createdUser = yield user_model_1.User.findOne({ _id: user._id }).select("-password -refreshToken");
    if (!createdUser)
        throw new ApiError_1.ApiError(401, "Something wrong while registering user");
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, createdUser, "User created successfully"));
}));
exports.registerUser = registerUser;
const loginUser = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email == "" || password == "")
        throw new ApiError_1.ApiError(400, "Email or password required!");
    const existUser = yield user_model_1.User.findOne({ email });
    if (!existUser)
        throw new ApiError_1.ApiError(404, "User Not Found");
    const isPasswordValid = yield existUser.isPasswordCorrect(password);
    if (!isPasswordValid)
        throw new ApiError_1.ApiError(402, "Invalid Passwoord!");
    const { accessToken, refreshToken } = yield generateAccessRefreshToken(existUser);
    // const user = {
    //     _id: existUser._id,
    //     email: existUser.email,
    // };
    const userInDb = yield user_model_1.User.findById(existUser._id).select("-password -refreshToken -resetToken");
    const user = userInDb ? userInDb : {};
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse_1.ApiResponse(200, user, "Login successfully"));
}));
exports.loginUser = loginUser;
const logOutUser = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse_1.ApiResponse(200, {}, "logout successfully"));
}));
exports.logOutUser = logOutUser;
const sendResetPasswordLink = (email, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_SERVICE_PASS
        }
    });
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
        const res = yield transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
});
const resetPasswordLinkGenerator = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email.trim())
        throw new ApiError_1.ApiError(400, "All fields required");
    const user = yield user_model_1.User.findOne({ email });
    if (!user)
        throw new ApiError_1.ApiError(404, "Invalid email address");
    const verificationToken = jsonwebtoken_1.default.sign({
        userId: user._id,
    }, process.env.TOKEN_GENERATOR, { expiresIn: process.env.TOKEN_EXPIRY });
    const mailres = sendResetPasswordLink(email, verificationToken);
    if (!mailres)
        throw new ApiError_1.ApiError(401, "Error while sending mail");
    user.resetToken = verificationToken;
    user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Send reset password link on mail"));
}));
exports.resetPasswordLinkGenerator = resetPasswordLinkGenerator;
const resetPassword = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.query.token;
    const { password } = req.body;
    if (!password.trim())
        throw new ApiError_1.ApiError(400, "Password required!");
    if (!token)
        throw new ApiError_1.ApiError(404, "Invalid link");
    const verifiedToken = jsonwebtoken_1.default.verify(token, process.env.TOKEN_GENERATOR);
    if (!verifiedToken)
        throw new ApiError_1.ApiError(402, "Link expired!");
    const userId = verifiedToken.userId;
    const user = yield user_model_1.User.findOne({ _id: userId });
    if (!user)
        throw new ApiError_1.ApiError(404, "Invalid link");
    const userToken = user.resetToken;
    if (!userToken)
        throw new ApiError_1.ApiError(402, "Link expired");
    user.password = password;
    user.resetToken = undefined;
    user.save();
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Password reset successfully"));
}));
exports.resetPassword = resetPassword;
const addToWatchList = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { movieId } = req.body;
    const user = req.user;
    console.log(movieId);
    if (!movieId)
        throw new ApiError_1.ApiError(400, "Invalid movie details");
    const movie = yield movie_model_1.Movie.findOne({ _id: movieId });
    if (!movie)
        throw new ApiError_1.ApiError(404, "Movie not found");
    if (!user)
        throw new ApiError_1.ApiError(401, "Please login in again");
    if ((_a = user.watchList) === null || _a === void 0 ? void 0 : _a.includes(movieId))
        throw new ApiError_1.ApiError(405, "Movie already added");
    user.watchList.push(new mongoose_1.default.Types.ObjectId(movie._id));
    yield user.save({ validateBeforeSave: false });
    // console.log(user);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, movie));
}));
exports.addToWatchList = addToWatchList;
const getWatchlist = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // console.log(user);
    if (!user)
        throw new ApiError_1.ApiError(402, "Please login again!");
    const watchList = user.watchList;
    const movies = yield movie_model_1.Movie.find({ _id: { $in: watchList } });
    // console.log(movies);
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, movies));
}));
exports.getWatchlist = getWatchlist;
const removeFromWatchlist = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { movieId } = req.body;
    const user = req.user;
    if (!movieId)
        throw new ApiError_1.ApiError(400, "Invalid movie id!");
    if (!user)
        throw new ApiError_1.ApiError(402, "Un-authorized request");
    const movie = yield movie_model_1.Movie.findById(movieId);
    if (!movie)
        throw new ApiError_1.ApiError(400, "Invalid movie id!");
    user.watchList = (_a = user.watchList) === null || _a === void 0 ? void 0 : _a.filter((mov) => mov._id.toString() !== movie._id.toString());
    yield user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, movie));
}));
exports.removeFromWatchlist = removeFromWatchlist;
//! JWT Verification Test Handler
const testJWTAuth = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Checkpoint 1");
        res.json(new ApiResponse_1.ApiResponse(201, {}, "Verifed"));
    }
    catch (error) {
        console.log(error);
        throw new ApiError_1.ApiError(400, "Server error!");
    }
}));
exports.testJWTAuth = testJWTAuth;
