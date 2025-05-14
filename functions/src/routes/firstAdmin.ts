import dotenv from "dotenv";
dotenv.config();
import express, {Request, Response, Router} from "express";
import cookieParser from "cookie-parser";
import {adminAuth} from "../DB/firebaseAdminConfig";

const router = Router();
const app = express();
app.use(cookieParser());

router.post('/firstAdmin', async (req: Request, res: Response) => {
    try {
        // 쿠키에서 authToken 가져오기
        const {uid} = await req.body;

        console.log(uid, '관리자 부여 UID');

        // (2) Custom Claims 설정: roles.admin = true
        await adminAuth.setCustomUserClaims(uid, {roles: {admin: true}});

        // 사용자 정보 반환
        return res.status(200).json({
            message: "어드민 권한 부여 성공",
        });
    } catch (error) {
        console.error("어드민 권한 부여 실패.", error);
        return res.status(403).json({message: "어드민 권한 부여 실패 했습니다."});
    }
});

export default router;
