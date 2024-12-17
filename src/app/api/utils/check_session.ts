import { adminAuth } from "@/app/DB/firebaseAdminConfig";

export default async function handler(req: any, res: any) {
    const { cookies } = req;
    const token = cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        res.status(200).json({ userId: decodedToken.uid });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(403).json({ message: "Invalid token" });
    }
}
