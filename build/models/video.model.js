"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VideoSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    duration: {
        type: String
    },
    rating: {
        type: Number,
        default: 0.0
    },
    genre: [
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
    writer: [
        {
            type: String
        }
    ],
    poster: {
        type: String
    },
    video_uri: {
        type: String
    }
});
exports.Video = mongoose_1.default.model("Video", VideoSchema);
