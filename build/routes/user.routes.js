"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.post("/register", user_controller_1.registerUser);
router.post("/login", user_controller_1.loginUser);
router.post("/send-reset-link", user_controller_1.resetPasswordLinkGenerator);
router.post("/reset-password", user_controller_1.resetPassword);
router.get("/logout", auth_middleware_1.default, user_controller_1.logOutUser);
router.get("/verifyJwt", auth_middleware_1.default, user_controller_1.testJWTAuth);
router.post("/add-to-watchlist", auth_middleware_1.default, user_controller_1.addToWatchList);
router.get("/get-watchlists", auth_middleware_1.default, user_controller_1.getWatchlist);
exports.default = router;
