import { Router } from "express";
import { 
    loginUser, 
    logOutUser, 
    registerUser, 
    resetPasswordLinkGenerator, 
    resetPassword, 
    testJWTAuth, 
    addToWatchList, 
    getWatchlist 
} from "../controllers/user.controller"
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/send-reset-link", resetPasswordLinkGenerator);
router.post("/reset-password", resetPassword);

router.get("/logout", verifyJWT, logOutUser);
router.get("/verifyJwt", verifyJWT, testJWTAuth);
router.post("/add-to-watchlist", verifyJWT, addToWatchList);
router.get("/get-watchlists", verifyJWT, getWatchlist);

export default router;