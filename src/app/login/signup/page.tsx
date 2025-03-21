import SignUp from "./SignUp";

export const dynamic = "force-static"; // 정적 렌더링 설정

export const metadata = {
    title: "MEMOME :: 회원가입",
    description: "MEMOME 회원가입 후 다양한 메모 확인하기",
};

export default function Login() {

    return (
        <SignUp></SignUp>
    );
}
