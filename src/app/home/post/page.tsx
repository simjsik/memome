import { cookies } from 'next/headers';
import PostMenu from './PostMenu'
export default function Post() {
    const cookieStore = cookies();

    const guestCookie = cookieStore.get('hasGuest')?.value as string;
    return (
        <PostMenu guestCookie={guestCookie} />
    )
}