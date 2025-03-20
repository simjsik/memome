/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { checkUsageLimit } from "@/app/utils/checkUsageLimit";
import { Comment, loadingState, memoCommentCount, memoCommentState, UsageLimitState, userData, userState } from "@/app/state/PostState";
import { HomeBtn } from "@/app/styled/RouterComponents";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

interface ClientPostProps {
    comment: Comment[];
}

export default function Memo({ comment }: ClientPostProps) {
    const router = useRouter();
    const setCommentList = useSetRecoilState<Comment[]>(memoCommentState)
    const setCommentCount = useSetRecoilState<number>(memoCommentCount)
    const currentUser = useRecoilValue<userData | null>(userState)
    const setUsageLimit = useSetRecoilState<boolean>(UsageLimitState)
    const setLoading = useSetRecoilState<boolean>(loadingState);

    // state

    // 사용량 확인
    useEffect(() => {
        if (currentUser) {
            const checkLimit = async () => {
                try {
                    await checkUsageLimit(currentUser.uid);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        if (err.message.includes('사용량 제한')) {
                            setUsageLimit(true);
                        } else {
                            console.log('사용량을 불러오는 중 에러가 발생했습니다.');
                        }
                    }
                }
            }
            checkLimit();
        } else {
            console.log('제한 안함')
        }

        setLoading(false)
    }, [])

    useEffect(() => {
        if (comment) {
            setCommentList(comment);
            setCommentCount(comment.length);
        }
        setLoading(false); // 초기 로딩 해제
    }, [comment]);

    const handleHomeBtn = () => {
        router.push('/home/main')
    }

    // Function

    return (
        <>
            <HomeBtn onClick={handleHomeBtn} />
        </>
    );
}