"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import bodyParser from "body-parser";
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
app.use(express_1.default.json({ limit: "16kb" }));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const movie_routes_1 = __importDefault(require("./routes/movie.routes"));
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/movie", movie_routes_1.default);
