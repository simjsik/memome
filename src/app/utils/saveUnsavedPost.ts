import { unsavedPostData } from "../state/PostState";

export const saveUnsavedPost = (postData: unsavedPostData) => {
    // 예를 들어, 전역 상태나 context를 통해 postTitle, posting, imageUrls, selectTag 등을 가져온다고 가정

    // 내용이 있다면
    if ((/\S/.test(postData.content) || /\S/.test(postData.title))) {
        const unsavedPost = {
            tag: postData.tag,
            title: postData.title,
            content: postData.content,
            date: new Date(),
            images: postData.images,
        };
        localStorage.setItem('unsavedPost', JSON.stringify(unsavedPost));
    }
};
