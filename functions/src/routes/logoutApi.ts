import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/logout', async (req: Request, res: Response) => {
    try {
        // httpOnly 쿠키 삭제
        res.clearCookie("csrfToken", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });
        res.clearCookie("userToken", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });
        res.clearCookie("hasGuest", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({success: true});
    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({
            success: false,
            message: error || "Logout failed",
         });
    }
});

export default router;
