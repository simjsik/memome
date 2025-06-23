export const checkUsageLimit = async (userId: string) => {
    try {
        const LimitResponse = await fetch(`/api/limit`, {
            method: 'POST',
            headers: { "Content-Type": "application/json", 'Project-Host': window.location.origin },
            credentials: "include",
            body: JSON.stringify({ userId }),
        });
        if (LimitResponse.status === 400) {
            throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 403) {
            throw new Error('데이터를 요청할 수 없습니다.');
        }
        if (LimitResponse.status === 404) {
            throw new Error('사용량 확인 요청 실패');
        }
    } catch (error) {
        console.error('사용량 확인 중 에러 발생.' + error)
        throw error;
    }
};