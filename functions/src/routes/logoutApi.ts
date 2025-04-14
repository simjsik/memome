import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/logout', async (req: Request, res: Response) => {
    const clientOrigin = req.headers["Project-Host"] || req.headers.origin;
    const isProduction = clientOrigin?.includes("memome-delta.vercel.app");

    const cookieOptions = {
        domain: isProduction ? "memome-delta.vercel.app" : undefined,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax" as const,
        path: "/",
    };

    try {
        // httpOnly 쿠키 삭제
        res.clearCookie("csrfToken", cookieOptions);
        res.clearCookie("authToken", cookieOptions);
        res.clearCookie("userToken", cookieOptions);
        res.clearCookie("hasGuest", cookieOptions);

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
