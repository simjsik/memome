import dotenv from "dotenv";
dotenv.config();
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  onDocumentCreated,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore";
import * as functions from 'firebase-functions/v1';
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { onRequest } from "firebase-functions/v2/https";
import refreshTokenRouter from "./routes/refreshToken";
import loginRouter from "./routes/loginApi";
import logoutRouter from "./routes/logoutApi";
import saveUserRouter from "./routes/saveUserApi";
import updateProfileRouter from "./routes/updateProfile";
import uploadPostRouter from "./routes/post/uploadPost";
import deletePostRouter from "./routes/post/deletePost";
import createCustomTokenRouter from "./routes/createCustomToken";
import fetchPostRouter from "./routes/post/mainPost";
import fetchNoticeRouter from "./routes/post/noticePost";
import fetchBookmarkRouter from "./routes/post/bookmarkPost";
import { adminDb } from "./DB/firebaseAdminConfig";
import { UserRecord } from "firebase-admin/auth";
import { PostData } from "./routes/post/utils/postType";

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL;

/**
 * 공지사항 포스트일 경우에만 웹소켓 알림을 전송하는 함수
 *
 * @param {string} postId - 알림을 보낼 포스트의 ID
 * @param {any} postData - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<void>} - 알림 전송 작업의 완료 여부
 */
async function sendNotice(postId: string, postData: PostData) {
  try {
    const response = await fetch(`${SOCKET_SERVER_URL}/notice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId,
        title: postData.title,
        message: "새로운 공지사항이 등록되었습니다.",
      }),
    });

    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.statusText}`);
    }
    console.log("공지 알림 전송 완료");
  } catch (error) {
    console.error("공지 알림 전송 실패:", error);
  }
}

export const setHasUpdateCommentFlag = onDocumentCreated(
  "posts/{postId}/comments/{commentId}",
  async (event) => {
    const postId = event.params.postId; // 포스트 ID
    try {
      const postRef = await adminDb.collection("posts").doc(postId);
      await postRef.update({
        commentCount: FieldValue.increment(1),
      });
    } catch (error) {
      console.error("업데이트 중 오류 발생:", error);
    }
  }
);

export const setHasDeleteCommentFlag = onDocumentDeleted(
  "posts/{postId}/comments/{commentId}",
  async (event) => {
    const commentData = event.data?.data();
    const postId = event.params.postId; // 포스트 ID
    const commentReplyCount = commentData?.replyCount; // 댓글 작성자 ID
    try {
      const postRef = await adminDb.collection("posts").doc(postId);
      await postRef.update({
        commentCount: FieldValue.increment((-1) - (commentReplyCount)),
      });
    } catch (error) {
      console.error("업데이트 중 오류 발생:", error);
    }
  }
);

export const setHasUpdateReplyFlag = onDocumentCreated(
  "posts/{postId}/comments/{commentId}/reply/{replyId}",
  async (event) => {
    const replyData = event.data?.data();
    const postId = event.params.postId; // 포스트 ID
    const commentId = replyData?.parentId; // 댓글 ID
    try {
      const postRef = await adminDb.collection("posts").doc(postId);
      const commentRef = postRef.collection("comments").doc(commentId);
      await postRef.update({
        commentCount: FieldValue.increment(1),
      });
      await commentRef.update({
        replyCount: FieldValue.increment(1),
      });
    } catch (error) {
      console.error(
        `댓글(reply) 트리거 실패 (postId: ${postId}, commentId: ${commentId}):`,
        error
      );
    }
  }
);

export const setHasDeleteReplyFlag = onDocumentDeleted(
  "posts/{postId}/comments/{commentId}/reply/{replyId}",
  async (event) => {
    const replyData = event.data?.data();
    const postId = event.params.postId; // 포스트 ID
    const commentId = replyData?.parentId; // 댓글 ID
    try {
      const postRef = await adminDb.collection("posts").doc(postId);
      const commentRef = postRef.collection("comments").doc(commentId);
      await postRef.update({
        commentCount: FieldValue.increment(-1),
      });
      await commentRef.update({
        replyCount: FieldValue.increment(-1),
      });
    } catch (error) {
      console.error(
        `댓글(reply) 트리거 실패 (postId: ${postId}, commentId: ${commentId}):`,
        error
      );
    }
  }
);

export const setHasUpdateFlag = onDocumentCreated("posts/{postId}", async (event) => {
  const db = getFirestore();
  const newPost = event.data;
  if (!newPost) {
    console.log("새 포스트가 없음");
    return;
  }

  const postId = event.params.postId;
  if (!postId) {
    console.error("포스트 ID가 제공되지 않았습니다.");
    return;
  }

  const postData = newPost.data();
  const authorUser = postData.userId;

  if (postData.notice) {
    await sendNotice(postId, postData as PostData);
    try {
      const batch = db.batch();

      const userSnap = await db.collection("users").get();

      userSnap.docs.forEach((userDoc) => {
        if (userDoc.id !== authorUser) {
          const upRef = db.collection(`users/${userDoc.id}/noticeList`).doc();
          batch.set(
            upRef,
            {
              noticeType: "새 공지사항",
              noticeText: postData.title,
              updatedAt: postData.createAt,
            },
            { merge: true }
          );
        }
      });

      const guestSnap = await db.collection("guests").get();

      guestSnap.docs.forEach((userDoc) => {
        if (userDoc.id !== authorUser) {
          const upRef =
            db.collection(`guests/${userDoc.id}/noticeList`).doc();
          batch.set(
            upRef,
            {
              noticeType: "새 공지사항",
              noticeText: postData.title,
              updatedAt: postData.createAt,
            },
            { merge: true }
          );
        }
      });

      await batch.commit();
    } catch (error) {
      console.error("업데이트 중 오류 발생:", error);
    }
  }
}
);

export const setGoogleUser = functions.auth.user().onCreate(async (user: UserRecord) => {
  if (!user.providerData.some((p) => p.providerId === 'google.com')) return;

  const { uid, displayName, email, photoURL } = user;
  const userRef = adminDb.collection('users').doc(uid);
  const userSnap = await userRef.get();

  // 필드가 없을 때만 생성
  if (!userSnap.exists) {
    await userRef.set({
      displayName: displayName || '',
      email: email || '',
      photoURL: photoURL || '',
    });
  }
});

const corsOptions = {
  origin: ["https://memome-delta.vercel.app", "http://localhost:3000"], // 명시적 출처 지정 (개발용)
  credentials: true, // 쿠키/인증 헤더 허용
  allowedHeaders:
    [
      'Content-Type',
      'Authorization',
      'Project-Host',
    ], // 커스텀 헤더 추가
  methods: ['GET', 'POST'], // 허용 메서드
};

// Express 앱 초기화
const app = express();
app.use(cors(corsOptions)); // CORS 허용
app.options('*', cors(corsOptions)); // 모든 OPTIONS 요청에 대해 CORS 헤더 적용
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  try {
    const target = process.env.TARGET || 'World';
    res.status(200).send(`Hello ${target}!\n`);
  } catch (error) {
    res.status(500).send(`Hello ${error}!\n`);
  }
});

app.use('/', refreshTokenRouter);

app.use('/', loginRouter);
app.use('/', logoutRouter);
app.use('/', saveUserRouter);
app.use('/', createCustomTokenRouter);

app.use('/', updateProfileRouter);
app.use('/', uploadPostRouter);
app.use('/', deletePostRouter);

app.use('/', fetchPostRouter);
app.use('/', fetchNoticeRouter);
app.use('/', fetchBookmarkRouter);

// Firebase Functions로 배포
export const ApiRouter = onRequest(app);
