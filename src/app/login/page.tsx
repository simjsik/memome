import LoginBox from './LoginBox';
export const dynamic = "force-static"; // 정적 렌더링 설정

export const metadata = {
  title: "MEMOME :: 로그인",
  description: "MEMOME 로그인 후 다양한 메모 확인하기",
};

export default function Login() {

  return (
    <LoginBox></LoginBox>
  );
}
