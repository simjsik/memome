import express, { Request, Response } from "express";
import { adminDb } from "../../DB/firebaseAdminConfig";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

router.delete('/post/delete', async (req: Request, res: Response) => {
    const { postId } = req.body;
    const user = req.headers['x-user-uid'];
    const admin = req.headers['x-user-admin'];

    try {
        const prefix = `meloudy_imgs/post/${postId}/`;

        const postRef = adminDb.doc(`posts/${postId}`);
        const postSnap = await postRef.get();

        if (!postSnap.exists) {
            throw new Error('존재하지 않는 포스트');
        }

        const postData = postSnap.data();

        if (postData?.userId !== user && !admin) {
            throw new Error('작성자 불일치');
        }

        if (postData?.thumbnail) {
            await cloudinary.api.delete_resources_by_prefix(prefix, {
                resource_type: 'image',
            });
            await cloudinary.api.delete_folder(prefix.replace(/\/$/, ''));
        }

        const writer = adminDb.bulkWriter({ throttling: { initialOpsPerSecond: 500, maxOpsPerSecond: 1000 } });
        await adminDb.recursiveDelete(postRef, writer);
        await writer.close();

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('포스트 삭제 실패:' + error);
        return res.status(500).json({
            message: "포스트 삭제 실패",
            error: error,
        });
    }
});

export default router;
