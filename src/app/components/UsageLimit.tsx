/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import styled from "@emotion/styled";
import { bookMarkState, DidYouLogin, modalState, PostData, UsageLimitState, UsageLimitToggle, userBookMarkState, userData, userState } from "../state/PostState";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { signOut } from "firebase/auth";
import { auth } from "../DB/firebaseConfig";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const UsageWrap = styled.div<{ Limit: boolean }>`
    display : ${(props) => (props.Limit ? 'block' : 'none')};
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background: rgba(0, 0, 0, 0.7);

    .usage_box{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-60%, -60%);
        width: 400px;
        height: 170px;
        padding: 20px;
        border-radius: 8px;
        background: #fff;
        text-align: center;
    }

    p {
        font-size: 1.25rem;
        font-family: var(--font-pretendard-bold);
    }

    span{
        display: block;
        margin-top: 10px;
        color: #777;
    }
    .usage_btn_wrap{
        margin-top: 32px;
        display: flex;
        justify-content: space-evenly;
    }
    button:nth-of-type(1){
        flex: 0 0 30%;
        height: 42px;
        border: 1px solid #ededed;
        background: #fff;
        border-radius : 6px;
        cursor : pointer;
    }

    button:nth-of-type(2){
        flex: 0 0 40%;
        height: 42px;
        border: none;
        background: #0087ff;
        color: #fff;
        font-family: var(--font-pretendard-medium);
        font-size: 0.875rem;
        border-radius : 6px;
        cursor : pointer;
    }
`

export default function UsageLimit() {
    const setHasLogin = useSetRecoilState<boolean>(DidYouLogin)
    const [user, setUser] = useRecoilState<userData>(userState)
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const [limitToggle, setLimitToggle] = useRecoilState<boolean>(UsageLimitToggle)
    const setModal = useSetRecoilState<boolean>(modalState);
    const setCurrentBookmark = useSetRecoilState<string[]>(bookMarkState)
    const setUserCurrentBookmark = useSetRecoilState<PostData[]>(userBookMarkState)

    const router = useRouter();

    useEffect(() => {
        if (usageLimit) {
            setLimitToggle(true);
            setModal(true); // 모달이 열릴 때 modal 상태 true로 설정

        } else {
            setLimitToggle(false);
            setModal(false); // 모달이 닫힐 때 modal 상태 false로 설정
        }
    }, [usageLimit, setLimitToggle])

    const handleLogout = async () => {
        try {
            const confirmed = confirm('로그아웃 하시겠습니까?')
            if (confirmed && user) {
                const response = await fetch(`/api/logout`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error('로그아웃 실패 :', errorData.message)
                }

                await signOut(auth);

                setUser({
                    name: null,
                    email: null,
                    photo: 'https://res.cloudinary.com/dsi4qpkoa/image/upload/v1746004773/%EA%B8%B0%EB%B3%B8%ED%94%84%EB%A1%9C%ED%95%84_juhrq3.svg',
                    uid: null, // uid는 빈 문자열로 초기화
                }); // 로그아웃 상태로 초기화
                setCurrentBookmark([])
                setUserCurrentBookmark([])
                setHasLogin(false)
                setLimitToggle(false)

                router.push('/login');
            }
        } catch (error) {
            console.error("로그아웃 에러:", error);
            alert("로그아웃 시도 중 에러가 발생했습니다..");
        }
    }

    const handleUsageBox = async () => {
        setLimitToggle(false);
    }

    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const nextDay = new Date();
            nextDay.setDate(now.getDate() + 1);
            nextDay.setHours(17, 0, 0, 0); // 다음날 오후 5시 설정

            const difference: number = nextDay.getTime() - now.getTime();

            if (difference > 0) {
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
            } else {
                setTimeLeft('타이머가 종료되었습니다.');
            }
        };

        // 타이머를 1초마다 업데이트
        const timer = setInterval(calculateTimeLeft, 1000);

        // 컴포넌트 언마운트 시 타이머 정리
        return () => clearInterval(timer);
    }, []);

    // Function
    return (
        <>
            {usageLimit &&
                < UsageWrap Limit={limitToggle} >
                    <div className="usage_box">
                        <p>일일 제공 사용량이 초과되었습니다.</p>
                        <span>초기화 까지 남은 시간 : {timeLeft}</span>
                        <div className="usage_btn_wrap">
                            <button onClick={handleLogout}>로그아웃</button>
                            <button onClick={handleUsageBox}>현 상태로 둘러보기</button>
                        </div>
                    </div>
                </UsageWrap >
            }
        </>
    )
}