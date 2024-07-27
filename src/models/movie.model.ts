import mongoose from "mongoose";

interface IMovie{
    title: String;
    description?: String;
    duration?: String;
    rating?: Number;
    poster: String;
    url?: String;
    genre?: String[];
    actors?: mongoose.Types.ObjectId[];
    released_date?: String;
    director?: String;
    producer?: String;
    writer?: String[];
}

const movieSchema = new mongoose.Schema<IMovie>({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    duration: {
        type: Number
    },
    rating: {
        type: Number
    },
    poster: {
        type: String,
        required: true
    },
    url: {
        type: String
    },
    genre: [
        {
            type: String
        }
    ],
    actors: [
        {
            type: String
        }
    ],
    released_date: {
        type: String
    },
    director: {
        type: String
    },
    producer: [
        {
            type: String
        }
    ],
    writer:[
        {
            type: String
        }
    ]
})


export const Movie = mongoose.model("Movie", movieSchema);