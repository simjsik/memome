/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use clients';

import styled from "@emotion/styled";
import { DidYouLogin, loginToggleState, modalState, UsageLimitState, UsageLimitToggle, userData, userState } from "../state/PostState";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { signOut } from "firebase/auth";
import { auth } from "../DB/firebaseConfig";
import { useEffect, useRef, useState } from "react";

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
        font-size: 20px;
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
        background: #4cc9bf;
        color: #fff;
        font-family: var(--font-pretendard-medium);
        font-size: 14px;
        border-radius : 6px;
        cursor : pointer;
    }
`

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UsageLimit() {
    const [hasLogin, setHasLogin] = useRecoilState<boolean>(DidYouLogin)
    const [user, setUser] = useRecoilState<userData | null>(userState)
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const [limitToggle, setLimitToggle] = useRecoilState<boolean>(UsageLimitToggle)
    const [modal, setModal] = useRecoilState<boolean>(modalState);

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
            if (confirmed) {
                await signOut(auth);
                const response = await fetch("/api/utils/logoutDeleteToken", {
                    method: "POST",
                });

                if (response.ok) {
                    setUser(null); // 로그아웃 상태로 초기화
                    setHasLogin(false)
                } else {
                    alert("Failed to logout.");
                }
            }
        } catch (error) {
            console.error("Error during logout:", error);
            alert("An error occurred during logout.");
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