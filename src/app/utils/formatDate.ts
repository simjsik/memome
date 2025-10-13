type LiveTimestamp = { toDate(): Date };
type JsonTs = { seconds: number; nanoseconds?: number };
type AdminJsonTs = { _seconds: number; _nanoseconds?: number };

type TimestampInput = LiveTimestamp | JsonTs | AdminJsonTs | Date | string;

const isDate = (date: unknown): date is Date =>
    date instanceof Date ||
    (typeof date === 'object' && date !== null && Object.prototype.toString.call(date) === '[object Date]');


const isIsoString = (date: unknown): date is string =>
    typeof date === 'string' && !Number.isNaN(Date.parse(date));

const hasToDate = (date: unknown): date is LiveTimestamp =>
    typeof date === 'object' &&
    date !== null &&
    'toDate' in (date as Record<string, unknown>) &&
    typeof (date as { toDate: unknown }).toDate === 'function';

const isJsonTs = (date: unknown): date is JsonTs =>
    typeof date === 'object' &&
    date !== null &&
    typeof (date as Record<string, unknown>).seconds === 'number' &&
    (
        (date as Record<string, unknown>).nanoseconds === undefined ||
        typeof (date as Record<string, unknown>).nanoseconds === 'number'
    );

const isAdminJsonTs = (date: unknown): date is AdminJsonTs =>
    typeof date === 'object' &&
    date !== null &&
    typeof (date as Record<string, unknown>)._seconds === 'number' &&
    (
        (date as Record<string, unknown>)._nanoseconds === undefined ||
        typeof (date as Record<string, unknown>)._nanoseconds === 'number'
    );

const tsToDate = (date: TimestampInput): Date => {
    if (isDate(date)) return date;
    if (hasToDate(date)) return date.toDate();
    if (isJsonTs(date)) return new Date(date.seconds * 1000 + Math.floor((date.nanoseconds ?? 0) / 1e6));
    if (isAdminJsonTs(date)) return new Date(date._seconds * 1000 + Math.floor((date._nanoseconds ?? 0) / 1e6));
    if (isIsoString(date)) return new Date(date);
    return new Date(NaN);
};

export const formatDate = (createAt: TimestampInput): string => {
    const date = tsToDate(createAt);
    const time = date.getTime();
    if (Number.isNaN(time)) return '-';

    const diffMs = Date.now() - time;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 24) return `${Math.max(hours, 1)}시간 전`;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days < 7) return `${Math.max(days, 1)}일 전`;

    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};
