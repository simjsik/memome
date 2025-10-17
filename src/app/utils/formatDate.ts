export const formatDate = (ms?: number | null): string => {
  if (!Number.isFinite(ms ?? NaN)) return '-';

  const diffMs = Date.now() - (ms as number);
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${Math.max(hours, 1)}시간 전`;

  const days = Math.floor(diffMs / 86_400_000);
  if (days < 7) return `${Math.max(days, 1)}일 전`;

  return new Date(ms as number).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};