export const checkUsageLimit = async (userId: string) => {
    try {
        const LimitResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/limit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });
        if (LimitResponse.status === 403) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }


        console.log('사용량 요청 확인', userId);
    } catch (error) {
        console.error('사용량 확인 중 에러 발생.' + error)
        throw error;
    }
};