import { Request, Response } from "express";
import { asyncHandler } from "../utils/AsyncHandler";
import { Movie } from "../models/movie.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";

const getHomePageMovieInfo = asyncHandler(async (req: Request, res: Response) => {
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
                    $elemMatch: { $eq: "Romance" }
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


    if (!movie && !topFiveMovie && !topRommance) throw new ApiError(400, "Movies not found");

    return res.json(
        new ApiResponse(200, movieData, "found successfully")
    )
})


const getMovieById = asyncHandler(async (req: Request, res: Response) => {
    const { movieId } = req.query;

    if (typeof movieId !== 'string' || !mongoose.Types.ObjectId.isValid(movieId)) {
        throw new ApiError(400, "Invalid id");
    }

    const movie = await Movie.findOne({ _id: movieId });

    if (!movie) throw new ApiError(402, "Movie not found");

    return res.json(
        new ApiResponse(200, movie)
    );
})


const allGenres = [
    "Romance", "Drama", "Action", "Comedy", "Biography", "Sport", "Music", "Sci-Fi", "Crime", "Thriller", "History", "Adventure", "War", "Horror", "Family", "Fantasy"
]

const getMoviesByGenreFilters = asyncHandler(async (req: Request, res: Response)=>{
    const {genre, page='1', limit='15'} = req.query;

    const arr: string[] = typeof genre === 'string' ? genre.split(","): [];
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);


    const genreArray = arr.filter((gen)=> allGenres.includes(gen));

    // console.log(genreArray);
    // console.log(genreArray, genres);

    const movies = await Movie.aggregate([
        {
            $match: genre? {
                genre: {
                    $in: genreArray
                }
            }: {}
        },
        {
            $sort: {rating: -1}
        },
        {
            $facet: {
                metaData: [{$count: 'total'}],
                data: [
                    { $skip: (pageNumber-1)*limitNumber },
                    { $limit: limitNumber },
                ]
            }
        },
        {
            $project: {
                totalPages: {
                    $ceil: {
                        $divide: [
                            {$arrayElemAt: ['$metaData.total', 0]},
                            limitNumber
                        ]
                    }
                },
                totalMovies: { $arrayElemAt: ["$metaData.total", 0] },
                movies: '$data'
            }
        }
    ]);

    const moviesData = {currentPage: pageNumber, ...movies[0]};
    // console.log(moviesData);
    res.status(200).json(
        new ApiResponse(200, moviesData)
    );
})


const searchMovie = asyncHandler(async(req: Request, res: Response)=>{
    const {title, page='1', limit='10'} = req.query;
    
    if(!title) throw new ApiError(400, "Search string not valid!");

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    const movies = await Movie.aggregate([
        {
            $match: {
                title: {
                    $regex: new RegExp(title as string, 'i')
                }
            }
        },
        {
            $skip: (pageNumber-1)*limitNumber
        },
        {
            $limit: limitNumber
        }
    ]);

    const totalCount = await Movie.countDocuments({
        title: {
            $regex: new RegExp(title as string, 'i')
        }
    });

    const movieData = {
        pageNumber,
        totalCount,
        movies,
    }

    console.log(movieData);

    return res.status(201).json(
        new ApiResponse(201, movieData)
    );
})


const testUrl = asyncHandler(async (req: Request, res: Response) => {
    const { vi } = req.query;
    console.log(vi);

    return res.json(
        new ApiResponse(200, { vi }, "res")
    );
})

export {
    getHomePageMovieInfo,
    getMovieById,
    getMoviesByGenreFilters,
    searchMovie,
    testUrl
};