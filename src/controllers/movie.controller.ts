import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { Movie } from "../models/movie.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const getHomePageMovieInfo = asyncHandler(async(req: Request, res: Response)=>{
    const topFiveMovie = await Movie.aggregate([
        {
            $sort: {
                rating: -1
            }
        },
        {
            $limit: 5
        }
    ]);

    const movie = await Movie.aggregate([
        {
            $sort: {
                rating: -1
            }
        },
        {
            $limit: 15
        },
        {
            $skip: 5
        }
    ])

    const topRommance = await Movie.aggregate([
        {
            $match: {
                genre: {
                    $elemMatch: {$eq: "Romance"}
                }
            }
        },
        {
            $sort: {
                rating: -1
            }
        },
        {
            $limit: 10
        }
    ])

    const movieData = {
        topFiveMovie,
        movie,
        topRommance
    }


    if(!movie && !topFiveMovie && !topRommance) throw new ApiError(400, "Movies not found");

    return res.json(
        new ApiResponse(200, movieData, "found successfully")
    )
})


export {getHomePageMovieInfo};