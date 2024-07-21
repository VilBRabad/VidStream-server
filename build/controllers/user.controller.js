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
Object.defineProperty(exports, "__esModule", { value: true });
exports.testJWTAuth = exports.logOutUser = exports.loginUser = exports.registerUser = void 0;
const ApiError_1 = require("../utils/ApiError");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const user_model_1 = require("../models/user.model");
const ApiResponse_1 = require("../utils/ApiResponse");
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
    const user = {
        _id: existUser._id,
        email: existUser.email,
    };
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
