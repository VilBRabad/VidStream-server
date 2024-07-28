import { Router } from "express";
import {getHomePageMovieInfo} from "../controllers/movie.controller"

const router = Router();

router.get("/home-movies-info", getHomePageMovieInfo);

export default router;