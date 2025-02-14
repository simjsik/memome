import LoginBox from './LoginBox';

export const revalidate = 60; // 60초마다 페이지를 재생성(ISR)

export default function Login() {

  return (
    <LoginBox></LoginBox>
  );
}
