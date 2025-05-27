import dotenv from "dotenv";
dotenv.config();
import {Request, Response, Router} from "express";
import {adminAuth} from "../DB/firebaseAdminConfig";

const router = Router();

router.post('/customToken', async (req: Request, res: Response) => {
    try {
        const {guestUid} = await req.body;

        if (!guestUid) {
            return res.status(403).json({message: "게스트 유저 정보가 유효하지 않습니다."});
        }

        const customToken =
        await adminAuth.createCustomToken(guestUid, {roles: {guest: true}});

        return res.status(200).json({
            message: "토큰 발급 성공",
            customToken,
        });
    } catch (error) {
        console.error("커스텀 토큰 발급 실패.", error);
        return res.status(403).json({message: "커스텀 토큰 발급에 실패했습니다."});
    }
});

export default router;
