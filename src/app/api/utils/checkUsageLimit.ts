export const checkUsageLimit = async (userId: string) => {
    try {
        const response = await fetch('/api/firebaseLimit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId,
                credentials: "include",
            }
        });

        if (!response.ok) {
            const { error } = await response.json();
            if (response.status === 403) {
                throw new Error('사용량 제한을 초과했습니다. 더 이상 요청할 수 없습니다.');
            }
            throw new Error(error || 'Unknown error');
        }


        console.log('사용량 요청 확인', userId, response);
    } catch (error: any) {
        console.error('사용량 확인 중 에러 발생.' + error)
        throw error;
    }
};