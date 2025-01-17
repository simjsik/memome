import DefaultMain from './DefaultMain';
import { userData } from './state/PostState';

export default async function Login() {
  const checkLoginStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/utils/autoLoginToken", {
        method: "GET",
        // credentials: "include" 제거: 서버 컴포넌트에서는 필요 없음.
      });
      console.log(response.ok)
      if (response.ok) {
        // 비동기 데이터 처리 시 Promise로 남겨질 걸 생각해 await 사용.
        const data = await response.json();
        const { user } = data;

        return {
          user: {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            uid: user.uid,
          } as userData,
          hasLogin: true,
        };
      } else {
        return { user: null, hasLogin: false };
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      return { user: null, hasLogin: false };
    }
  };

  // 비동기 데이터 처리
  const userData = await checkLoginStatus();

  return (
    <>
      <DefaultMain user={userData.user} hasLogin={userData.hasLogin} />
    </>
  );
}
