import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        lowercase: true
    },
    lastName: {
        type: String,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    watchHistory: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Video",
        },
    ],
    watchList: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken: {
        type: String
    }
}, {timestamps: true});


UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        console.log(1.3);
        return next();
    }
    
    this.password = await bcrypt.hash(this.password, 10);
    return next();
})


UserSchema.methods.isPasswordCorrect = async function(password:string){
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model("User", UserSchema);