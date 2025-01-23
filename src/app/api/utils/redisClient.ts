import { createClient } from "redis";
import jwt, { JwtPayload } from 'jsonwebtoken';

interface SessionData {
    name: string;
    photo: string;
    email: string,
    role: number;
    [key: string]: any;
}

const JWT_SECRET = process.env.JWT_SECRET; // JWT 비밀키

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

// Redis 클라이언트 연결
redisClient.connect().catch((err) => {
    console.error("Redis 연결 실패:", err);
});

export default redisClient;

// 세션 저장 함수
export async function saveSession(uid: string, data: SessionData) {
    const key = `session:${uid}`;
    console.log(data, '세션 저장 유저 정보')
    await redisClient.set(key, JSON.stringify(data), { EX: 3600 }); // 1시간 만료
}

// 세션 가져오기 함수
export async function getSession(uid: string): Promise<SessionData | null> {
    const key = `session:${uid}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}

// 세션 삭제 함수
export async function deleteSession(uid: string) {
    const key = `session:${uid}`;
    await redisClient.del(key);
}

// 유저 인증 함수
export async function authenticateUser(token: string): Promise<boolean> {
    try {
        if (JWT_SECRET) {
            // Step 1: JWT 검증 및 uid 추출
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

            if (!decoded && typeof decoded !== 'object' && 'uid' in decoded && 'role' in decoded) {
                console.error('JWT 구조가 올바르지 않습니다.');
                return false;
            }

            const uid = decoded.uid as string;

            // Redis에서 세션 조회
            const sessionKey = `session:${uid}`;
            const userSession = await redisClient.get(sessionKey);

            if (!userSession) {
                console.error('Redis 세션 없음 또는 만료됨.');
                return false;
            }

            return true;
        }
        return false;
    } catch (error) {
        console.error('JWT 구조가 올바르지 않습니다.', error);
        return false;
    }
}