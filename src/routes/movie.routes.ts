import { Router } from "express";
import {
    getHomePageMovieInfo,
    getMovieById,
    getMoviesByGenreFilters,
    testUrl
} from "../controllers/movie.controller"

const router = Router();

router.get("/home-movies-info", getHomePageMovieInfo);
router.get("/get-movie-by-id", getMovieById);
router.get("/movies", getMoviesByGenreFilters);
router.get("/test/movie", testUrl);

export default router;