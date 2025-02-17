import express from "express";
import cookieParser from "cookie-parser";
import {Request, Response} from "express";
import {authenticateUser, deleteSession} from "../utils/redisClient";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/logout', async (req: Request, res: Response) => {
    try {
        const userToken = req.cookies.userToken;
        const hasGuest = req.cookies.hasGuest;

        if (!userToken) {
            return res.status(403).json({
                message: "유저 토큰이 존재하지 않습니다.",
             });
        }

        if (!authenticateUser(userToken)) {
            return res.status(403).json({
                 message: "유저 토큰이 유효하지 않거나 만료되었습니다.",
            });
        }

        const uid = await authenticateUser(userToken) as string;

        // 클라이언트 측 쿠키 삭제
        const response = res.status(403).json({success: true});

        // httpOnly 쿠키 삭제
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.clearCookie("csrfToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.clearCookie("userToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.clearCookie("hasGuest", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });

        if (!hasGuest) {
            deleteSession(uid);
        }
        // UID를 기반으로 Redis에서 세션 삭제
        return response;
    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({
            success: false,
            message: error || "Logout failed",
         });
    }
});


export default router;
