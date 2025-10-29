'use client'
import { useMemo } from 'react';

type CircularCharGaugeProps = {
    count: number;        // 현재 글자 수
    max?: number;         // 최대 글자 수 (기본 2500)
    size?: number;        // 뷰박스/렌더 크기 (px)
    stroke?: number;      // 선 두께
    trackColor?: string;  // 바탕 트랙 색
};

export function CircularCharGauge({
    count,
    max = 2500,
    size = 72,
    stroke = 8,
    trackColor = '#e5e7eb',
}: CircularCharGaugeProps) {
    // 반지름/둘레/경로 등 계산
    const { d, len, ratio, color } = useMemo(() => {
        const r = (size - stroke) / 2;              // stroke가 튀어나가지 않게 반지름 보정
        const cx = size / 2, cy = size / 2;

        // 12시에서 시작해 시계 방향으로 한 바퀴(두 개의 180도 arc)
        const pathD = [
            `M ${cx} ${cy - r}`,
            `A ${r} ${r} 0 1 1 ${cx} ${cy + r}`,  // 위→아래 (시계방향)
            `A ${r} ${r} 0 1 1 ${cx} ${cy - r}`,  // 아래→위 (시계방향)
        ].join(' ');

        const circumference = 2 * Math.PI * r;

        const clamped = Math.max(0, Math.min(1, count / max)); // 0~1
        const progColor =
            count > max ? '#ef4444' : clamped >= 0.9 ? '#f59e0b' : clamped >= 0.7 ? '#fbbf24' : '#10b981';

        return { d: pathD, len: circumference, ratio: clamped, color: progColor };
    }, [count, max, size, stroke]);

    const dashOffset = len * (1 - ratio); // 진행도에 따라 남은 길이

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`글자수: ${count}/${max}`}>
            {/* 바탕 트랙 */}
            <path
                d={d}
                fill="none"
                stroke={trackColor}
                strokeWidth={stroke}
                strokeLinecap="round"
            />
            {/* 진행 게이지 */}
            <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${len} ${len}`}   // 전체 길이만큼 dash 생성
                strokeDashoffset={dashOffset}       // 남은 길이를 오프셋으로 밀어 진행 표현
                style={{ transition: 'stroke-dashoffset 160ms ease' }}
            />
        </svg>
    );
}
