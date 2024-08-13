import { Router } from "express";
import { loginUser, logOutUser, registerUser, resetPasswordLinkGenerator, resetPassword, testJWTAuth } from "../controllers/user.controller"
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/send-reset-link", resetPasswordLinkGenerator);
router.post("/reset-password", resetPassword);

router.get("/logout", verifyJWT, logOutUser);
router.get("/verifyJwt", verifyJWT, testJWTAuth);


export default router;