import dotenv from "dotenv";
import connectDb from "./db";
import {app} from "./app"

dotenv.config();

connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log("Server running...");
    })
})
.catch((error)=>{
    console.log("Database connection error: ", error);
})
