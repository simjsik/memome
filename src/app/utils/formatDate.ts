import { Timestamp } from "firebase/firestore";

export const formatDate = (createAt: Timestamp | Date | string | number): string => {
    const date: Date =
        createAt instanceof Timestamp
            ? createAt.toDate()
            : new Date(createAt);

    const now = new Date();
    const befMs = now.getTime() - date.getTime();
    console.log('now:', now, 'date:', date);
    console.log('befMs (ms):', befMs);

    const befHour = befMs / (1000 * 60 * 60);
    console.log('befHour (hrs):', befHour);

    const befDay = befMs / (1000 * 60 * 24);

    if (befHour < 24) {
        // 0시간 방지
        const hours = Math.max(befHour, 1);
        return `${hours}시간 전`;
    }

    if (befDay < 7) {
        const days = Math.max(befDay, 1);
        return `${days}일 전`;
    }

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
}