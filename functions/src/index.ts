import express from 'express';
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
initializeApp(); // Firebase Admin 초기화
import setCsrfToken from './route/setCsrfToken';
import autoLogin from './route/autoLoginApi';
import login from './route/loginApi';
import logout from './route/logoutApi';
import saveUser from './route/saveUserApi';
import updateProfile from './route/updateProfile';
import authToken from './route/validateAuthToken';
import firebaseLimit from './route/firebaseLimit';

const app = express();
app.use(express.json());

const SOCKET_SERVER_URL = "https://relieved-florence-meloudy-61e63699.koyeb.app";

app.use('/csrf', setCsrfToken);
app.use('/autologin', autoLogin);
app.use('/login', login);
app.use('/logout', logout);
app.use('/saveuser', saveUser);
app.use('/updateprofile', updateProfile);
app.use('/validate', authToken);
app.use('/limit', firebaseLimit);

/**
 * 공지사항 포스트일 경우에만 웹소켓 알림을 전송하는 함수
 *
 * @param {string} postId - 알림을 보낼 포스트의 ID
 * @param {any} postData - 포스트 데이터 (title, notice 등 포함)
 * @return {Promise<void>} - 알림 전송 작업의 완료 여부
 */
async function sendNotice(postId: string, postData: any) {
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
    const db = getFirestore();
    try {
      const userSnap = await db.collection("users").get();
      const upPromises = userSnap.docs.map(async (userDoc) => {
        const upRef = db.doc(`users/${userDoc.id}/status/commentUpdates`);
        await upRef.set(
          {
            hasUpdate: true,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      });
      // 모든 업데이트 작업이 완료될 때까지 기다림
      await Promise.all(upPromises);
      console.log("모든 유저의 문서가 업데이트되었습니다.");
    } catch (error) {
      console.error("업데이트 중 오류 발생:", error);
    }
  }
);

export const setHasUpdateFlag = onDocumentCreated(
  "posts/{postId}",
  async (event) => {
    console.log("onDocumentCreated 트리거 호출됨");

    const db = getFirestore();
    const newPost = event.data;
    if (!newPost) {
      console.log("새 포스트가 없음");
      return;
    }

    console.log("onDocumentCreated 실행 중");

    const postId = event.params.postId;
    if (!postId) {
      console.error("postId가 제공되지 않았습니다.");
      return;
    }

    const postData = newPost.data();
    console.log("새 포스트 데이터:", postData);
    if (postData.notice) {
      await sendNotice(postId, postData);
      try {
        const userSnap = await db.collection("users").get();
        const batch = db.batch();
        userSnap.docs.forEach((userDoc) => {
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
        });
        await batch.commit();
        console.log("모든 유저의 알림이 업데이트되었습니다.");
      } catch (error) {
        console.error("업데이트 중 오류 발생:", error);
      }
    } else {
      try {
        const userSnap = await db.collection("users").get();
        const batch = db.batch();
        userSnap.docs.forEach((userDoc) => {
          const upRef = db.doc(`users/${userDoc.id}/status/postUpdates`);
          batch.set(
            upRef,
            {
              hasUpdate: true,
              updatedAt: new Date(),
            },
            { merge: true }
          );
        });
        await batch.commit();
        console.log("모든 유저의 문서가 업데이트되었습니다.");
      } catch (error) {
        console.error("업데이트 중 오류 발생:", error);
      }
    }
  }
);

