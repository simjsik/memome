import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {onDocumentCreated} from "firebase-functions/v2/firestore";

initializeApp(); // Firebase Admin 초기화

export const setHasUpdateFlag = onDocumentCreated(
  "posts/{postId}",
  async (event) => {
    const updatesRef = getFirestore().doc("status/updates");
    await updatesRef.set(
      {
        hasUpdate: true,
        updatedAt: new Date(),
      },
      {merge: true}
    );
  }
);
