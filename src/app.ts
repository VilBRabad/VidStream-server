import express from "express";
import cors from "cors"
// import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.json({limit: "16kb"}));


import userRouter from "./routes/user.routes";
import movieRouter from "./routes/movie.routes"

app.use("/api/v1/user", userRouter);
app.use("/api/v1/movie", movieRouter);

export {app};