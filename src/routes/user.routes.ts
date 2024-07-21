import { Router } from "express";
import { loginUser, logOutUser, registerUser, testJWTAuth } from "../controllers/user.controller"
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


router.get("/logout", verifyJWT, logOutUser);
router.get("/verifyJwt", verifyJWT, testJWTAuth);


export default router;