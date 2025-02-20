import * as dotenv from "dotenv";
dotenv.config();
import {createClient} from "redis";
import jwt, {JwtPayload} from "jsonwebtoken";

interface SessionData {
    name: string;
    photo: string;
    email: string,
    role: number;
    [key: string]: string | number;
}

const JWT_SECRET = process.env.JWT_SECRET; // JWT 비밀키

const redisClient = createClient({
    username: 'default',
    password: 'cK3USae7OkI80yxXbpu5XhtAXXbPQhIy',
    socket: {
        host: 'redis-14533.c253.us-central1-1.gce.redns.redis-cloud.com',
        port: 14533,
    },
});

redisClient.on('error', (err) => console.error("Redis 클라이언트 에러", err));

(async () => {
    try {
        await redisClient.connect();
        // 테스트용 코드; 실제 배포 시에는 테스트 코드는 제거
        await redisClient.set('foo', 'bar');
        const result = await redisClient.get('foo');
        console.log(result); // "bar"
    } catch (err) {
        console.error("Redis 연결 실패:", err);
    }
})();

export default redisClient;

/**
 * 세션 저장 함수
 *
 * @param {string} uid - 알림을 보낼 포스트의 ID
 * @param {SessionData} data - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<void>} - 알림 전송 작업의 완료 여부
 */
export async function saveSession(uid: string, data: SessionData) {
    const key = `session:${uid}`;
    await redisClient.set(key, JSON.stringify(data), {EX: 604800}); // 일주일 만료
}

/**
 * 세션 업데이트 함수
 *
 * @param {string} uid - 알림을 보낼 포스트의 ID
 * @param {SessionData} data - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<void>} - 알림 전송 작업의 완료 여부
 */
export async function updateSession(uid: string, data: SessionData) {
    const key = `session:${uid}`;
    await redisClient.set(
        key, JSON.stringify(data), {XX: true, KEEPTTL: true}
    );
}

/**
 * 게스트 세션 업데이트 함수
 *
 * @param {string} uid - 알림을 보낼 포스트의 ID
 * @param {SessionData} data - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<void>} - 알림 전송 작업의 완료 여부
 */
export async function saveGuestSession(uid: string, data: SessionData) {
    const key = `session:${uid}`;
    await redisClient.set(
        key, JSON.stringify(data), {EX: 3600 * 24}
    ); // 1시간 만료
}

/**
 * 세션 가져오기 함수
 *
 * @param {string} uid - 알림을 보낼 포스트의 ID
 * @param {SessionData} data - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<void>} - 알림 전송 작업의 완료 여부
 */
export async function getSession(uid: string): Promise<SessionData | null> {
    const key = `session:${uid}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}

/**
 * 세션 조회 함수
 *
 * @param {string} uid - 알림을 보낼 포스트의 ID
 * @param {SessionData} data - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<void>} - 알림 전송 작업의 완료 여부
 */
export async function sessionExists(uid: string): Promise<boolean> {
    const key = `session:${uid}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
}

/**
 * 세션 삭제 함수
 *
 * @param {string} uid - 알림을 보낼 포스트의 ID
 * @param {SessionData} data - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<void>} - 알림 전송 작업의 완료 여부
 */
export async function deleteSession(uid: string) {
    const key = `session:${uid}`;
    await redisClient.del(key);
}

/**
 * 유저 인증 함수
 *
 * @param {string} token - 알림을 보낼 포스트의 ID
 * @param {SessionData} data - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<boolean | string>} - 알림 전송 작업의 완료 여부
 */
export async function authenticateUser(
    token: string
): Promise<boolean | string> {
    try {
        if (JWT_SECRET) {
            // Step 1: JWT 검증 및 uid 추출
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

            if (
                !decoded &&
                 typeof decoded !== 'object' &&
                  'uid' in decoded &&
                  'role' in decoded
            ) {
                console.error('JWT 구조가 올바르지 않습니다.');
                return false;
            }

            const uid = decoded.uid as string;

            // Redis에서 세션 조회
            const sessionKey = `session:${uid}`;
            const userSession = await redisClient.get(sessionKey);

            if (!userSession) {
                console.error('Redis 세션 없음 또는 만료됨.');

                const response = await fetch("http://localhost:3000/api/utils/logoutDeleteToken", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    const errorDetails = await response.json();
                    throw new Error(`로그아웃 실패: ${errorDetails.message}`);
                }

                return false;
            }

            return uid;
        }
        return false;
    } catch (error) {
        console.error("JWT 구조가 올바르지 않습니다.", error);
        return false;
    }
}

/**
 * 토큰 JWT 변환 함수
 *
 * @param {string} uid - 알림을 보낼 포스트의 ID
 * @param {number} role - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<Void>} - 알림 전송 작업의 완료 여부
 */
export function generateJwt(uid: string, role: number): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign({uid: uid, role: role}, secret, {expiresIn: "1h"});
}
