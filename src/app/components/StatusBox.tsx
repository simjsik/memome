import styled from '@emotion/styled';
import Logout from './Logout';
import MemoStatus from './status/MemoStatus';
import { useParams, usePathname, } from 'next/navigation';
import UserProfile from './status/UserProfile';
import { PostData } from '../state/PostState';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../DB/firebaseConfig';


const PostListWrap = styled.div`
position : fixed;
top: 40px;
right : 160px;
width : 400px;
height: calc(100vh - 80px);
padding : 0px 20px;
border : 1px solid #dedede;
border-radius : 8px;
background : #fff;

.list_top{
position: relative;
display : flex;
justify-content: space-between;
width: 100%;
height: 100%;
padding: 10px 0px 96px;
}

.list_toggle {
width : 48px;
height : 48px;
border : none;
background : gray;
border-radius : 4px;
cursor : pointer;
}
`
export default function StatusBox() {
    const path = usePathname();
    const params = useParams<{ postId: any }>();
    const postId = params?.postId

    const currentUser = auth.currentUser

    const getMyPostList = async () => {
        if (!currentUser) return;

        const user = currentUser.uid
        const postQuery = query(collection(db, 'posts'), where('userId', '==', user))

        const postSnapshot = await getDocs(postQuery)

        const commentSnapshot: PostData[] = await Promise.all(
            postSnapshot.docs.map(async (doc) => {
                const postData = { id: doc.id, ...doc.data() } as PostData;

                // 댓글 개수 가져오기
                const commentRef = query(collection(db, 'posts', doc.id, 'comments'), where('userId', '==', user));
                const commentSnapshot = await getDocs(commentRef);
                postData.commentCount = commentSnapshot.size;

                return postData;
            }))
        console.log(commentSnapshot)
    }


    // Function

    return (
        <PostListWrap >
            {
                <UserProfile></UserProfile >
            }
            <div className='list_top'>
                {
                    path === `/home/memo/${params?.postId}` && <MemoStatus post={postId} />
                }
            </div>
            <Logout></Logout>
        </PostListWrap>
    )
}