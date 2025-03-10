import express, {Request, Response} from "express";
import cookieParser from "cookie-parser";

const router = express.Router();
const app = express();
app.use(cookieParser());

router.post('/logout', async (req: Request, res: Response) => {
    const host = req.headers['x-project-host'] || "";

    const cookieDomain = host.includes("localhost") ?
    "https://localhost:3000" : "https://memome-delta.vercel.app";
    try {
        // httpOnly 쿠키 삭제
        res.clearCookie("authToken", {
            domain: cookieDomain,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.clearCookie("csrfToken", {
            domain: cookieDomain,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.clearCookie("userToken", {
            domain: cookieDomain,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        res.clearCookie("hasGuest", {
            domain: cookieDomain,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
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
