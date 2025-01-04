/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { PostingState, storageLoadState } from '../../state/PostState';
import { useRecoilState, } from 'recoil';
import { useRouter } from 'next/navigation';
import { css } from '@emotion/react';
import Delta from 'quill-delta';
import QuillResizeImage from 'quill-resize-image';
// import 'quill/dist/quill.snow.css';
import ReactQuill, { Quill } from 'react-quill-new';
import styled from '@emotion/styled';
import { auth, db } from '@/app/DB/firebaseConfig';

const QuillStyle = styled.div<{ notice: boolean }>`
position: relative;
width : 860px;
padding : 20px 0px;
margin : 0 auto;

// quill 에디터 랩
.quill_wrap{
width : 100%;
height : 100%;
padding: 10px;
background : #fff;
border : none;
border-radius : 8px;
box-shadow: 0px 0px 10px rgba(0,0,0,0.2);
}

// 포스트 탑 태그, 제목

.posting_top{
    position :relative;
    display: flex;
    width: 100%;
    height : 60px;
    padding-bottom: 10px;
    border-bottom : 1px solid #ededed;
}

// 공지사항 토글
.notice_btn{
width: 46px;
height: 46px;
margin-right: 10px;
border: none;
border-radius: 8px;
background: ${(props) => (props.notice ? '#eb2e21' : '#fff')};
box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
cursor: pointer;
}

.tag_sel{
flex : 1 0 25%;
margin-right : 10px;
padding : 0px 12px;
outline : none;
border: 1px solid #ededed;
}

.title_input{
flex : 1 0 65%;
padding : 0px 12px;
font-size : 16px;
outline : none;
border: 1px solid #ededed;
}



& .title_input:focus{
outline : none;
}

// 포스트 발행 버튼
.post_btn{
    position: absolute;
    z-index: 1;
    top: 820px;
    left: -72px;
    width: 64px;
    height: 32px;
    line-height: 32px;
    border: none;
    border-radius: 4px;
    background: #4cc9bf;
    font-size: 12px;
    color: #fff;
    cursor: pointer;
}

// 에디터 박스
.quill{
width : 100%;
margin : 0 auto;
}

// 에디터 snow 스타일
.ql-container.ql-snow{
margin-top : 20px;
border : none;
}

.ql-snow .ql-image,
.ql-snow .ql-link{
width : 42px;
height : 42px;
margin-left : 3px;
}

// 에디터 입력 칸
.ql-editor{
min-height: calc(100vh - 140px);
border-radius : 8px;
overflow: visible;
padding : 0px 20px 100px;
}



// 커스텀 도구
#custom_toolbar{
position: absolute;
z-index: 1;
left: -72px;
width: 64px;
height: fit-content;
padding: 0px 8px;
background: #fff;
border-radius: 8px;
box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

#toolbar span{
font-size : 12px;
}

// 삽입 도구
.ql_submit_wrap{
    padding-bottom: 10px;
    border-bottom: 1px solid #ededed;
}

.ql_link_wrap{
margin-top : 10px;
}

.ql-image svg,
.ql-link svg{
width: 100%;
}

.ql-image rect,
.ql-link path,
.ql-image circle,
.ql-link line{
stroke-width : 1px;
}

// 아래 도구
#toolbar-bottom{
display : block;
width: 100%;
padding: 10px 8px;
}

// 폰트 사이즈 , 줄 간격
.ql_size_wrap,
.ql_lineheight_wrap{
display : flex;
position : relative;
}

// 도구 버튼
.ql_size_toggle,
.ql_lineheight_toggle,
.ql_color_toggle,
.ql_background_toggle,
.ql_align_toggle{
min-width: 32px;
height: 32px;
background : red;
border : none;
}

.ql_lineheight_toggle,
.ql_color_toggle,
.ql_background_toggle,
.ql_align_toggle{
margin-top: 4px;
}


.ql_style_wrap{
padding : 0px 8px;
}

.ql_style_wrap button{
min-width : 32px;
height : 32px;
margin-top : 4px;
border : none;
padding : 6px;
}

.ql-snow .ql_style_wrap svg{
width : 20px;
height : 20px;
}

.ql_size_list,
.ql_lineheight_list{
position: absolute;
top: 0px;
left: 48px;
width: 80px;
padding: 8px 0px;
background: #fff;
border: 1px solid #ededed;
border-radius: 4px;
box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}
.ql_size_list{
    top: -60px;
}

.ql_size_item,
.ql_lineheight_item{
    width: 100%;
    height: 32px;
}

.ql_size_btn,
.ql_lineheight_btn{
    width: 100%;
    height: 100%;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    padding-left: 8px;
    color: #333;
}

    & .ql_size_btn:hover,
    & .ql_lineheight_btn:hover{
    color : #4cc9bf;
    }

    .setFont,
    .setLineheight {
    color : #4cc9df;
    }

.ql-lineheight{
margin-top : 4px;
}

.ql-color,
.ql-background,
.ql-align{
display : flex;
width : fit-content
}

.ql-color span,
.ql-background span{
display : none;
}

.ql_color_list,
.ql_background_list
{
    position: absolute;
    left: 50px;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    width: 176px;
    margin-top: 4px;
    margin-left: 14px;
    background: #fff;
    border: 1px solid #ededed;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
}

.ql-color .ql_color_pallete,
.ql-background .ql_background_pallete{
width : 100%;
height : 100%;
border : none;
}

.ql-color .ql_color_item,
.ql-background .ql_background_item{
width : 14px;
height : 14px;
margin-right: 2px
}

.ql-color .ql_color_item:nth-of-type(10n),
.ql-background .ql_background_item:nth-of-type(10n){
margin-right : 0px;
}
.ql-color .ql_color_item:nth-of-type(n+11),
.ql-background .ql_background_item:nth-of-type(n+11){
margin-top : 2px;
}

.ql_color_item:nth-of-type(1) .ql_color_pallete,
.ql_background_item:nth-of-type(1) .ql_background_pallete{
border : 2px solid #ededed;
vertical-align: top; 
}

.ql_color_pallete,
.ql_background_pallete,
.ql_align_btn
 {
cursor:pointer
}

.ql_image_wrap,
.ql_link_wrap{
width: 48px;
text-align : center;
}

.ql_align_list{
    position: absolute;
    left: 50px;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    width: 140px;
    margin-top: 4px;
    margin-left: 4px;
    background: #fff;
    border: 1px solid #ededed;
    border-radius: 4px;
    padding: 4px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
}

.ql_align_item{
display : block;
}

.ql_align_btn{
width : 32px;
height : 32px;
}

#toolbar {
    display: block;
    width: 100%;
    padding: 10px 0px 10px;
    border: none;
}



.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="10px"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before {
  content: "12px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before {
  content: "16px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before {
  content: "20px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before {
  content: "24px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="28px"]::before {
  content: "28px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="32px"]::before {
  content: "32px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="36px"]::before {
  content: "36px";
}
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="40px"]::before {
  content: "40px";
}

`
const LoadModal = css`
position:fixed;
top:0;
left:0;
right:0;
bottom:0;
z-index : 5;

.load_modal_bg{
width : 100%;
height: 100%;
background: rgba(255,255,255,0.8);
}

.load_btn_wrap{
position: absolute;
top: 50%;
left: 50%;
transform:translate(-50%,-50%);

width: 400px;
height: 220px;
padding: 20px;
background : #fff;
border : 1px solid #dedede;
border-radius : 8px;
box-shadow : 0px 0px 10px rgba(0,0,0,0.1);
text-align : center;
}

.load_btn_wrap p{
font-size : 24px;
}
.load_btn_wrap span{
display:block;
width:100%;
margin-top:20px;
font-size : 14px;
color : #606060;
}

.load_btn_wrap span:nth-of-type(2){
margin-top:8px;
}

.load_ok_btn,
.load_no_btn{
width : 140px;
height : 48px;
background :none;
border: 1px solid #dedede;
border-radius : 4px;
font-size : 16px;
margin-top:32px;
cursor:pointer;
}
.load_ok_btn{
margin-right : 10px;
border: 1px solid #4cc9bf;
color : #4cc9bf;
font-family : var(--font-pretendard-bold);
}
.load_no_btn{
color: #bdbdbd;
}
`

export default function PostMenu() {
    const router = useRouter();

    const quillRef = useRef<any>(null); // Quill 인스턴스 접근을 위한 ref 설정
    const tagRef = useRef<HTMLSelectElement>(null); // Quill 인스턴스 접근을 위한 ref 설정
    const styleToolRef = useRef<HTMLDivElement>(null); // Quill 인스턴스 접근을 위한 ref 설정

    const [postingComplete, setPostingComplete] = useState<boolean>(false);
    const [postTitle, setPostTitle] = useState<string>('');
    const [storageLoad, setStorageLoad] = useRecoilState<boolean>(storageLoadState);
    const [posting, setPosting] = useRecoilState<string>(PostingState);
    const [postDate, setPostDate] = useState<string>('');
    const [confirmed, setConfirmed] = useState<boolean>(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [selectTag, setSelectedTag] = useState<string>('기타');
    const [checkedNotice, setCheckedNotice] = useState<boolean>(false);

    // tool toggle state
    const [toolToggle, setToolToggle] = useState<string>('');
    const [selectFontSize, setSelectedFontSize] = useState<string>('14px');
    const [selectLineheight, setSelectedLineheight] = useState<string>('1.5');

    //  State

    const colorPallete = {
        color: [
            '#191919', '#999999', '#ffcdc0', '#ffe3c8', '#fff8b2', '#e3fdc8', '#c2f4db', '#bdfbfa', '#b0f1ff', '#9bdfff',
            '#ffffff', '#777777', '#ffad98', '#ffd1a4', '#fff593', '#badf98', '#3fcc9c', '#15d0ca', '#28e1ff', '#5bc7ff',
            '#f7f7f7', '#555555', '#ff5f45', '#ffa94f', '#ffef34', '#98d36c', '#00b976', '#00bfb5', '#00cdff', '#0095e9',
            '#e2e2e2', '#333333', '#eb2e21', '#f5881b', '#f7d111', '#bffa0f', '#0ffa65', '#009d91', '#00b3f2', '#0078cb',
        ],
        background: [
            '#ffffff', '#999999', '#ffcdc0', '#ffe3c8', '#fff8b2', '#e3fdc8', '#c2f4db', '#bdfbfa', '#b0f1ff', '#9bdfff',
            '#f2f2f2', '#777777', '#ffad98', '#ffd1a4', '#fff593', '#badf98', '#3fcc9c', '#15d0ca', '#28e1ff', '#5bc7ff',
            '#f7f7f7', '#555555', '#ff5f45', '#ffa94f', '#ffef34', '#98d36c', '#00b976', '#00bfb5', '#00cdff', '#0095e9',
            '#e2e2e2', '#333333', '#eb2e21', '#f5881b', '#f7d111', '#bffa0f', '#0ffa65', '#009d91', '#00b3f2', '#0078cb',
        ]
    }

    const fontsize = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px']
    const lineheight = ['1', '1.5', '2', '2.5', '3', '4', '5']
    const [quillLoaded, setQuillLoaded] = useState(false);

    // quill 모듈 로드
    useEffect(() => {
        if (typeof window === "undefined") return;

        const loadQuill = async () => {
            try {
                // Lineheight 모듈
                let Block = Quill.import("blots/block") as any;

                class LineHeightBlot extends Block {
                    static create(value: any) {
                        let node = super.create();
                        node.style.lineHeight = value;
                        return node;
                    }

                    static formats(node: any) {
                        return node.style.lineHeight || null;
                    }
                }

                LineHeightBlot.blotName = "lineheight";
                LineHeightBlot.tagName = "div"; // 블록 요소
                Quill.register(LineHeightBlot);

                // Font Size 설정
                const fontSize = Quill.import('attributors/style/size') as any;
                fontSize.whitelist = fontsize;
                Quill.register(fontSize, true);

                // Image Resize 모듈 등록

                // Quill.register('modules/ImageResize', ImageResize);
                Quill.register("modules/ImageResize", QuillResizeImage);



                setQuillLoaded(true); // Quill 로드 완료 상태 업데이트
            } catch (error) {
                console.error('Quill 로드 중 에러 발생:', error);
            }
        };

        loadQuill();
    }, []);

    const handleFontSizeChange = (size: string | null) => {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(); // 현재 선택된 영역
        if (range && size) {
            editor.format('size', size); // 선택 영역에 폰트 크기 적용
            setSelectedFontSize(size); // 상태 업데이트
        }
    };

    const handleFontColorChange = (color: string) => {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (range) {
            const colorValue = color === '색상 없음' ? null : color
            editor.format('color', colorValue);
        }
    };

    const handleFontBgChange = (color: string) => {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (range) {
            const colorValue = color === '색상 없음' ? null : color
            editor.format('background', colorValue);
        }
    };

    const handleLineheightChange = (height: string | null) => {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (range && height) {
            editor.format('lineheight', height);
            setSelectedLineheight(height);
        }
    };

    const HandleCheckedNotice = () => {
        setCheckedNotice((prev) => !prev);

        if (!checkedNotice) {
            setSelectedTag('공지사항')
        } else {
            setSelectedTag('기타')
        }
    }

    const toolToggleHandle = (tool: string) => {
        if (tool === toolToggle) {
            return setToolToggle('')
        }
        setToolToggle(tool)
    }

    // 포스트 내용 입력 시 해당 스테이트에 저장
    const handlePostingEditor = (content: string) => {
        setPosting(content)
    }

    // 포스팅 제목.
    const handlePostingTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPostTitle(e.target.value);
    }

    // Cloudinary에 이미지 업로드 요청
    const uploadImgCdn = async (image: string) => {
        const response = await fetch('/api/uploadToCloudinary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image }),
        });

        if (!response.ok) {
            throw new Error('image upload failed')
        }

        const data = await response.json();
        if (data.url) {
            return data.url;
        } else {
            throw new Error('Image upload failed');
        }
    };

    const uploadContentImgCdn = async (content: string, uploadedImageUrls: Map<string, string>) => {
        const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
        let updatedContent = content;
        let match;

        // img 태그 추출
        while ((match = imgTagRegex.exec(content)) !== null) {
            const originalUrl = match[1];

            // 이미 업로드된 이미지인지 확인
            if (uploadedImageUrls.has(originalUrl)) {
                // 이미 업로드된 이미지 URL로 교체
                updatedContent = updatedContent.replace(originalUrl, uploadedImageUrls.get(originalUrl)!);
                continue;
            }

            // Cloudinary에 이미지 업로드
            const response = await fetch('/api/uploadToCloudinary', {
                method: 'PHOTO',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: originalUrl }),
            });

            if (!response.ok) {
                console.error('콘텐츠 이미지 업로드 실패', originalUrl);
                continue;
            }

            const data = await response.json();

            // Cloudinary URL이 있다면 content의 이미지 URL 교체 및 URL 캐싱
            if (data.url) {
                uploadedImageUrls.set(originalUrl, data.url);
                updatedContent = updatedContent.replace(originalUrl, data.url);
            }
        }

        return updatedContent;
    };

    // 포스팅 업로드
    const uploadThisPost = async () => {
        // 사용자 인증 확인
        if (!auth.currentUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (imageUrls.length > MAX_IMG_COUNT) {
            alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 업로드 가능합니다.`)
            return;
        }

        if (postTitle && posting) {
            try {
                // 업로드된 이미지 URL을 추적하기 위한 Map 생성
                const uploadedImageUrls = new Map<string, string>();

                // imageUrls 최적화 및 업로드
                const optImageUrls = await Promise.all(
                    imageUrls.map(async (image) => {
                        const cloudinaryUrl = await uploadImgCdn(image);
                        uploadedImageUrls.set(image, cloudinaryUrl); // 업로드된 URL을 Map에 저장
                        return cloudinaryUrl;
                    })
                );

                // content 내 이미지 URL을 최적화된 URL로 교체
                const optContentUrls = await uploadContentImgCdn(posting, uploadedImageUrls);

                // firebase 업로드
                await addDoc(collection(db, 'posts'), {
                    tag: selectTag,
                    title: postTitle,
                    userId: auth.currentUser.uid, // uid로 사용자 ID 사용
                    content: optContentUrls,
                    images: optImageUrls,
                    createAt: Timestamp.now(),
                    commentCount: 0,
                    notice: checkedNotice,
                });
                console.log(imageUrls, optImageUrls)

                alert('포스팅 완료');
                setPostingComplete(true);
                localStorage.removeItem('unsavedPost');
                router.back();
            } catch (error) {
                alert('포스팅에 실패하였습니다: ' + error);
            }
        } else if (postTitle === '') {
            alert('제목을 입력해주세요.');
        } else if (posting === '') {
            alert('본문을 작성해주세요.');
        }
    }

    const formatDate = (createAt: any) => {
        if (createAt?.toDate) {
            return createAt.toDate().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\. /g, '.');
        } else if (createAt?.seconds) {
            return new Date(createAt.seconds * 1000).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\. /g, '.');
        } else {
            const date = new Date(createAt);

            const format = date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })

            return format;
        }
    }

    // 이미지 최대 크기
    const MAX_IMG_SIZE = 2 * 1024 * 1024;
    // 이미지 최대 수
    const MAX_IMG_COUNT = 4;
    // 이미지 삽입 시 이미지 배열 관리
    const imageHandler = async (url: string) => { // Quill 이미지 입력 시 imagesUrls 상태에 추가.
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => { // 이미지 업로드 시 크기, 수 제한
            const file = input.files?.[0];

            if (!file) return;

            const currentImages = quillRef.current?.getEditor().root.querySelectorAll('img');
            console.log(currentImages)
            if (currentImages && currentImages.length > MAX_IMG_COUNT) {
                alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 업로드 가능합니다.`);
                return;
            }
            if (file.size > MAX_IMG_SIZE) {
                alert("이미지 크기는 최대 2MB까지 허용됩니다.");
                return;
            }

            if (!imageUrls.includes(url)) {
                setImageUrls([...imageUrls, url]);
            }

            // 이미지 URL 생성하여 Quill 에디터에 삽입
            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;
                const editor = quillRef.current?.getEditor();
                const range = editor?.getSelection();
                editor?.insertEmbed(range.index, 'image', imageUrl);

                // imageUrls 상태에 URL 추가
                setImageUrls((prev) => [...prev, imageUrl]);
            };
            reader.readAsDataURL(file);
        };
    }

    // 포스트 내용 로드
    const handleLoadPost = (loaded: boolean) => {
        const savedData = JSON.parse(localStorage.getItem('unsavedPost')!);
        if (loaded) {
            setPostTitle(savedData.title);
            setPosting(savedData.content);
            if (savedData.image) {
                setImageUrls(savedData.image);
            }
            setStorageLoad(false); // 로드 후 제한
        } else {
            setPostTitle('');
            setPosting('');
            setImageUrls([])
            setStorageLoad(false); // 로드 후 제한
        }
        localStorage.removeItem('unsavedPost');
        setConfirmed(false)
    }

    // 이미지 붙여넣기, 이미지 최대 수 제한 로직
    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        // 이미지 붙여넣기 차단 및 제한 처리
        editor.clipboard.addMatcher('IMG', (node: any, delta: any) => {
            if (storageLoad) return delta;

            const imgTags = Array.from(editor.root.querySelectorAll('img'));
            const currentImageCount = imgTags.length;

            // 붙여넣기된 이미지 무조건 차단
            if (node.tagName === 'IMG') {
                alert('이미지 붙여넣기는 허용되지 않습니다.');
                return new Delta(); // 빈 Delta 반환 (붙여넣기 차단)
            }

            // 이미지 개수 초과 제한
            if (currentImageCount >= MAX_IMG_COUNT) {
                alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 추가할 수 있습니다.`);
                return new Delta(); // 빈 Delta 반환 (추가 제한)
            }

            // 기본 동작 유지
            return delta;
        });

        // 텍스트 변경 이벤트: 이미지 개수 실시간 확인
        const handleImageLimit = () => {
            if (storageLoad) return;

            const imgTags = Array.from(editor.root.querySelectorAll('img'));
            const currentImageUrls = imgTags.map((img: HTMLImageElement) => img.src);

            // 이미지 개수 초과 시 초과 이미지를 삭제
            if (currentImageUrls.length > MAX_IMG_COUNT) {
                const excessImages = currentImageUrls.slice(MAX_IMG_COUNT);
                excessImages.forEach((src) => {
                    const img = editor.root.querySelector(`img[src="${src}"]`);
                    img?.remove();
                });

                alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 업로드 가능합니다.`);
            }

            setImageUrls(currentImageUrls.slice(0, MAX_IMG_COUNT)); // 상태 업데이트
        };

        // Quill 이벤트 등록
        editor.on('text-change', handleImageLimit);

        return () => {
            // 정리 작업
            editor.clipboard.matchers = [];
            editor.off('text-change', handleImageLimit);
        };
    }, [quillRef, imageUrls, setImageUrls, storageLoad]);

    useEffect(() => {
        if (!postingComplete) {
            if (/\S/.test(posting) || /\S/.test(postTitle)) {
                const handleBeforeUnload = () => {
                    const loadConfirmed = confirm('입력하신 내용이 있습니다. 저장하시겠습니까?')
                    if (loadConfirmed) {
                        localStorage.setItem('unsavedPost', JSON.stringify({ tag: selectTag, title: postTitle, content: posting, date: new Date(), images: imageUrls }));
                    } else {
                        setPostTitle('');
                        setPosting('');
                        setImageUrls([])
                        localStorage.removeItem('unsavedPost');
                    }
                }
                window.addEventListener('beforeunload', handleBeforeUnload);
                // 새로고침.

                const preventGoBack = () => {
                    handleBeforeUnload();
                    router.push('/')
                };
                window.history.pushState(null, "", window.location.pathname);
                window.addEventListener("popstate", preventGoBack);
                // 뒤로가기, 및 페이지 이동

                return () => {
                    window.removeEventListener('beforeunload', handleBeforeUnload);
                    window.removeEventListener('popstate', preventGoBack);
                }
            }
        }
    }, [postTitle, posting])

    // 페이지 로드 시 내용 불러오기 팝업
    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('unsavedPost')!);
        setImageUrls([])
        if (savedData) {
            setPostDate(savedData.date)
        }
        if (savedData) setConfirmed(true);
    }, [])

    // 도구 외 클릭 시 닫기
    useEffect(() => {
        const clickOutside = (event: MouseEvent) => {
            if (styleToolRef.current && !styleToolRef.current.contains(event.target as Node)) {
                setToolToggle('');
            }
        }

        document.addEventListener('mousedown', clickOutside);

        return () => {
            document.removeEventListener('mousedown', clickOutside);
        }
    }, [])
    // Function
    const SetModules = useMemo(
        () =>
        ({

            toolbar: {
                container: "#toolbar",
                handlers: {
                    image: imageHandler, // 이미지 핸들러
                    size: (value: string) => handleFontSizeChange(value),
                    color: (value: string) => handleFontColorChange(value),
                    lineheight: (value: string) => handleLineheightChange(value),
                },
            },
            ImageResize: {
                modules: ['Resize', 'DisplaySize', 'Toolbar'], // 이미지 리사이즈 옵션
                handleStyles: {
                    backgroundColor: 'black',
                    border: 'red',
                    color: 'white',
                    // other camelCase styles for size display
                }
            },
        }),
        []
    );

    // 사용 포맷 설정
    const formats = [
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'code-block',
        'link',
        'image',
        'header',
        'list',
        'script',
        'indent',
        'direction',
        'size',
        'color',
        'background',
        'align',
        'font',
        'lineheight', // 줄간격 추가
    ];

    if (!quillLoaded) {
        return <div>Loading editor...</div>;
    }

    return (
        <>
            <QuillStyle notice={checkedNotice}>
                <div className='quill_wrap'>
                    <div className='posting_top'>
                        <button className='notice_btn' onClick={HandleCheckedNotice}></button>
                        {checkedNotice ?
                            <select ref={tagRef} className='tag_sel' defaultValue={'공지사항'}>
                                <option value="공지사항">공지사항</option>
                            </select>
                            :
                            <select ref={tagRef} className='tag_sel' defaultValue={'기타'}>
                                <option value="기타">기타</option>
                                <option value="잡담">잡담</option>
                                <option value="공부">공부</option>
                                <option value="일상">일상</option>
                            </select>
                        }

                        <input className='title_input' type="text" placeholder='제목' value={postTitle} onChange={handlePostingTitle} />
                    </div>
                    {/* <!-- Quill Custom Toolbar --> */}
                    <div id="custom_toolbar">
                        <div id='toolbar'>
                            {/* <!-- Links and Images --> */}
                            <div className='ql_submit_wrap'>
                                <div className='ql_image_wrap'>
                                    <button className="ql-image"></button>
                                    <span>이미지</span>
                                </div>
                                <div className='ql_link_wrap'>
                                    <button className="ql-link"></button>
                                    <span>링크</span>
                                </div>
                            </div>
                            {/* <!-- Indent --> */}
                            <div className='ql_style_wrap'>
                                <button className="ql-indent" value="+1"></button>
                                <button className="ql-indent" value="-1"></button>

                                {/* <!-- Header -->  */}
                                <button className="ql-header" value="1"></button>

                                {/* <!-- Formatting --> */}
                                <button className="ql-bold"></button>
                                <button className="ql-italic"></button>
                                <button className="ql-underline"></button>
                                <button className="ql-strike"></button>

                                {/* <!-- Subscript / Superscript --> */}
                                <button className="ql-script" value="sub"></button>
                                <button className="ql-script" value="super"></button>

                                {/* <!-- Clean --> */}
                                <button className="ql-clean"></button>
                            </div>
                        </div>

                        <div id='toolbar-bottom' ref={styleToolRef}>
                            {/* <!-- Font Size --> */}
                            <div className='ql_size_wrap'>
                                <button className='ql_size_toggle' onClick={() => toolToggleHandle('fontsize')}></button>
                                {toolToggle === 'fontsize' &&
                                    <ul className='ql_size_list'>
                                        {fontsize.map((size, ftIndex) => (
                                            <li className='ql_size_item' key={ftIndex}>
                                                <button data-size-select={size} type='button' className={selectFontSize === size ? 'ql_size_btn setFont' : 'ql_size_btn'}
                                                    onClick={(e) => {
                                                        const dataSize = (e.currentTarget as HTMLElement).getAttribute('data-size-select')
                                                        handleFontSizeChange(dataSize)
                                                    }
                                                    }>
                                                    {size}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>

                            {/* <!-- Line Height --> */}
                            <div className='ql_lineheight_wrap'>
                                <button className='ql_lineheight_toggle' onClick={() => toolToggleHandle('lineheight')}></button>
                                {toolToggle === 'lineheight' &&
                                    <ul className='ql_lineheight_list'>
                                        {lineheight.map((height, lhIndex) => (
                                            <li className='ql_lineheight_item' key={lhIndex}>
                                                <button data-lineheight-select={height} type='button' className={selectLineheight === height ? 'ql_lineheight_btn setLineheight' : 'ql_lineheight_btn'}
                                                    onClick={(e) => {
                                                        const dataHeight = (e.currentTarget as HTMLElement).getAttribute('data-lineheight-select')
                                                        handleLineheightChange(dataHeight)
                                                    }
                                                    }>
                                                    {height}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>

                            {/* <!-- Font Color --> */}
                            <div className='ql-color' >
                                <button className='ql_color_toggle' onClick={() => toolToggleHandle('color')}></button>
                                {toolToggle === 'color' &&
                                    <ul className='ql_color_list'>
                                        {colorPallete.color.map((color, clIndex) => (
                                            <li className='ql_color_item' key={clIndex}>
                                                <button css={css`background-color : ${color};`} type='button' className='ql_color_pallete ql_color_none' data-color-select={color}
                                                    onClick={(e) => {
                                                        const dataColor = (e.currentTarget as HTMLElement).getAttribute('data-color-select');
                                                        handleFontColorChange(dataColor || '색상 없음')
                                                    }}>
                                                    {color === '#191919' ?
                                                        <span className='ql_color_behind'>색상 없음</span>
                                                        :
                                                        <span className='ql_color_behind'>{color}</span>
                                                    }
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            </div>

                            {/* <!-- Background Color --> */}
                            <div className="ql-background">
                                <button className='ql_color_toggle' onClick={() => toolToggleHandle('background')}></button>
                                {toolToggle === 'background' &&
                                    <ul className='ql_background_list'>
                                        {colorPallete.background.map((bgColor, bgIndex) => (
                                            <li className='ql_background_item' key={bgIndex}>
                                                <button css={css`background-color : ${bgColor};`} type='button' className='ql_background_pallete ql_background_none' data-color-select={bgColor}
                                                    onClick={(e) => {
                                                        const color = (e.currentTarget as HTMLElement).getAttribute('data-color-select');
                                                        handleFontBgChange(color || '색상 없음')
                                                    }}>
                                                    {bgColor === '#ffffff' ?
                                                        <span className='ql_color_behind'>색상 없음</span>
                                                        :
                                                        <span className='ql_color_behind'>{bgColor}</span>
                                                    }
                                                </button>
                                            </li>
                                        ))}

                                    </ul>
                                }
                            </div>

                            {/* <!-- Text Align --> */}
                            <div className="ql-align">
                                <button className='ql_color_toggle' onClick={() => toolToggleHandle('align')}></button>
                                {toolToggle === 'align' &&
                                    <ul className='ql_align_list'>
                                        <li className='ql_align_item'>
                                            <button className='ql_align_btn' data-align-value="left"></button>
                                        </li>
                                        <li className='ql_align_item'>
                                            <button className='ql_align_btn' data-align-value="center"></button>
                                        </li>
                                        <li className='ql_align_item'>
                                            <button className='ql_align_btn' data-align-value="right"></button>
                                        </li>
                                        <li className='ql_align_item'>
                                            <button className='ql_align_btn' data-align-value="justify"></button>
                                        </li>
                                    </ul>
                                }
                            </div>
                        </div>
                    </div>
                    <ReactQuill ref={quillRef} formats={formats} value={posting} onChange={handlePostingEditor} modules={SetModules} />
                    <button className='post_btn' onClick={uploadThisPost}>발행</button>
                </div>
            </QuillStyle>
            {
                confirmed &&
                <div css={LoadModal}>
                    <div className='load_modal_bg'></div>
                    <div className='load_btn_wrap'>
                        <p>작성 중인 내용이 있습니다.</p>
                        <span>{formatDate(postDate)}에 작성 중이던 내용이 있습니다.</span>
                        <span>이어서 작성하시겠습니까?</span>
                        <button className='load_ok_btn' onClick={() => handleLoadPost(true)}>확인</button>
                        <button className='load_no_btn' onClick={() => handleLoadPost(false)}>취소</button>
                    </div>
                </div>
            }
        </>
    )
} 