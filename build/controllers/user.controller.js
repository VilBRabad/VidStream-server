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
exports.registerUser = void 0;
const ApiError_1 = require("../utils/ApiError");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const user_model_1 = require("../models/user.model");
const ApiResponse_1 = require("../utils/ApiResponse");
const registerUser = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    if ([firstName, lastName, email, password].some((fields) => fields.trim() === "")) {
        throw new ApiError_1.ApiError(400, "All fields required");
    }
    console.log(req.body);
    const existUser = yield user_model_1.User.findOne({ email });
    if (existUser) {
        throw new ApiError_1.ApiError(402, "User already exists");
    }
    const user = yield user_model_1.User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    });
    const createdUser = yield user_model_1.User.findOne(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError_1.ApiError(401, "Something wrong while registering user");
    }
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, createdUser, "User created successfully"));
}));
exports.registerUser = registerUser;
