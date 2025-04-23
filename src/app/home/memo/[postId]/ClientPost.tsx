/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";

import { checkUsageLimit } from "@/app/utils/checkUsageLimit";
import { loadingState, memoCommentCount, UsageLimitState, userData, userState } from "@/app/state/PostState";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function Memo({ commentLength }: { commentLength: number }) {
    const currentUser = useRecoilValue<userData | null>(userState)
    const setCommentLength = useSetRecoilState<number>(memoCommentCount)
    const setUsageLimit = useSetRecoilState<boolean>(UsageLimitState)
    const setLoading = useSetRecoilState<boolean>(loadingState);

    // state

    useEffect(() => {
        setCommentLength(commentLength);
    }, [commentLength])

    // 사용량 확인
    useEffect(() => {
        if (currentUser) {
            const checkLimit = async () => {
                try {
                    await checkUsageLimit(currentUser.uid as string);
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

    // Function

    return (
        <>
        </>
    );
}