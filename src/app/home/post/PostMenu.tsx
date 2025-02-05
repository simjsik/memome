/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { DidYouLogin, hasGuestState, loginToggleState, modalState, PostingState, storageLoadState, UsageLimitState, UsageLimitToggle, userState } from '../../state/PostState';
import { useRecoilState, useRecoilValue, useSetRecoilState, } from 'recoil';
import { useRouter } from 'next/navigation';
import { css } from '@emotion/react';
import Delta from 'quill-delta';
import QuillResizeImage from 'quill-resize-image';
// import 'quill/dist/quill.snow.css';
import ReactQuill, { Quill } from 'react-quill-new';
import styled from '@emotion/styled';

const QuillStyle = styled.div<{ notice: boolean }>`
position: relative;
width : 860px;
padding : 20px 0px 0px;
margin : 0 auto;

    // quill 에디터 랩
    .quill_wrap{
        width : 100%;
        height : 100%;
        padding: 10px;
        background : #fff;
        border : 1px solid #ededed;
        border-bottom : none;
        border-radius : 8px 8px 0px 0px;
        font-family : var(--font-pretendard-medium);
    }

    // 포스트 탑 태그, 제목
    .posting_top{
        position :relative;
        display: flex;
        width: 100%;
        height : 70px;
        padding-bottom: 20px;
        border-bottom : 1px solid #ededed;
        font-family : var(--font-pretendard-medium);
    }

    // 공지사항 토글
    .notice_btn{
        position : relative;
        width: 49px;
        height: 49px;
        margin-right: 10px;
        border: ${(props) => (props.notice ? '1px solid #fa5741' : '1px solid #ededed')};
        border-radius: 8px;
        background: #fff;
        cursor: pointer;

        p{
            position: absolute;
            left : 50%;
            bottom: 4px;
            text-align: center;
            transform: translateX(-50%);
            font-size: 10px;
            color : ${(props) => (props.notice ? '#fa5741' : '#bbb')};
            font-family : var(--font-pretendard-medium);
        }
    }

    .tag_sel{
        flex : 1 0 25%;
        margin-right : 10px;
        padding : 0px 12px;
        outline : none;
        border: 1px solid #ededed;
        border-radius : 8px;
    }

    .title_input_wrap{
        flex : 1 0 65%;
        padding : 0px 12px;
        font-size : 16px;
        outline : none;
        border: 1px solid #ededed;
        border-radius : 8px;

        .title_input{
            width : 100%;
            height : 100%;
            font-size : 16px;
            outline : none;
            border: none;
            border-radius : 8px;
            color : transparent;
            caret-color: #999;
            font-family : var(--font-pretendard-medium);

            &::selection {  
                color: transparent;  
                background-color:rgb(76, 131, 250);
            }
        }

        .title_input &.title_input:focus{
            outline : none;
        }

        .title_input_value{
            position: absolute;
            top: 0;
            display: flex;
            line-height: 49px;
        }

        .title_limit{
            position: absolute;
            right: 10px;
            line-height: 49px;
            font-size: 14px;
        }

        .title_error{
            font-size: 14px;
            color: #fa5741;
            margin-top : 2px;
            font-family : var(--font-pretendard-medium);
        }
    }
    .ql_content{
        position: relative;
        margin-bottom: 60px;

        span{
            position: absolute;
            right: 10px;
            bottom: 10px;
        }
    }
// 포스트 발행 버튼
    .post_btn{
        position: absolute;
        z-index: 1;
        top: 24px;
        right: -63px;
        width: 64px;
        height: 64px;
        border: 2px solid #1a5bf5;
        border-left: #fff;
        border-radius: 0px 8px 8px 0px;
        background: #0087ff;
        font-size: 16px;
        color: #fff;
        cursor: pointer;
        -webkit-writing-mode: vertical-rl;
        -ms-writing-mode: tb-rl;
        writing-mode: vertical-rl;
        font-family: 'var(--font-pretendard-medium)';
        text-align: center;
    }
    .go_main_btn{
        position: absolute;
        top: 24px;
        left: -63px;
        width: 64px;
        height: 64px;
        padding: 15px;
        border: 1px solid #ededed;
        border-right: #fff;
        background: #fff;
        border-radius: 8px 0px 0px 8px;
        cursor : pointer
    }
    // 에디터 박스
    .quill{
        width: 100%;
        margin: 0 auto;
        padding-bottom: 39px;
        border-bottom: 1px solid #ededed;
    }

    // 에디터 snow 스타일
    .ql-container.ql-snow{
        margin-top: 20px;
        border: none;
    }

    .ql-snow .ql-image,
    .ql-snow .ql-link{
        width : 42px;
        height : 42px;
        margin-left : 3px;
    }

    // 에디터 입력 칸
    .ql-editor{
        min-height: calc(100vh - 231px);
        overflow: visible;
        padding: 0px 20px;
    }



    // 커스텀 도구
    #custom_toolbar{
        position: absolute;
        z-index: 1;
        left: -63px;
        width: 64px;
        height: -webkit-fit-content;
        height: -moz-fit-content;
        height: fit-content;
        padding: 0px 8px;
        background: #fff;
        border: 1px solid #ededed;
        border-right: 1px solid #fff;
        border-radius: 8px 0px 0px 8px;
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
        background : #fff;
        border : none;
        font-family : var(--font-pretendard-medium);
        cursor : pointer;
    }

    .ql_lineheight_toggle,
    .ql_color_toggle,
    .ql_background_toggle,
    .ql_align_toggle{
        margin-top: 4px;
    }
        
    .ql_background_toggle{
        padding : 6px;

        svg{
            border: 1px solid;
            border-radius : 2px;
        }
    }

    .ql_align_toggle{
        padding :4px;
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
    color : #0087ff;
    }

    .setFont,
    .setLineheight {
    color : #0087ff;
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
        border: none;
        background: #fff;
        padding: 4px;
    }

    .setAlign line{
        stroke : #0087ff;
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
border: 1px solid #0087ff;
color : #0087ff;
font-family : var(--font-pretendard-bold);
}
.load_no_btn{
color: #bdbdbd;
}
`

export default function PostMenu({ guestCookie }: { guestCookie: string }) {
    const router = useRouter();

    const quillRef = useRef<any>(null); // Quill 인스턴스 접근을 위한 ref 설정
    const tagRef = useRef<HTMLSelectElement>(null); // Quill 인스턴스 접근을 위한 ref 설정
    const styleToolRef = useRef<HTMLDivElement>(null); // Quill 인스턴스 접근을 위한 ref 설정
    const yourLogin = useRecoilValue(DidYouLogin)
    const setLoginToggle = useSetRecoilState<boolean>(loginToggleState)
    const setModal = useSetRecoilState<boolean>(modalState);
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const currentUser = useRecoilValue(userState)
    const hasGuest = useRecoilValue<boolean>(hasGuestState);

    const [postingComplete, setPostingComplete] = useState<boolean>(false);
    const [postTitle, setPostTitle] = useState<string>('');
    const [titleError, setTitleError] = useState<string>('');
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
    const [selectColor, setSelectedColor] = useState<string>('#191919');
    const [selectBgColor, setSelectedBgColor] = useState<string>('#ffffff');
    const [selectLineheight, setSelectedLineHeight] = useState<string>('1.5');
    const [selectAlign, setSelectedAlign] = useState<string>('left');
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

    useEffect(() => {
        if (hasGuest === true || guestCookie === 'true') {
            router.push('/home/main');
        }
        if (!yourLogin) {
            router.push('/login');
        }
    }, [hasGuest, yourLogin])

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
            setSelectedColor(color)
        }
    };

    const handleFontBgChange = (color: string) => {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (range) {
            const colorValue = color === '색상 없음' ? null : color
            editor.format('background', colorValue);
            setSelectedBgColor(color)
        }
    };

    const handleLineheightChange = (height: string | null) => {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (range && height) {
            editor.format('lineheight', height);
            setSelectedLineHeight(height);
        }
    };

    const handleAlignChange = (align: string) => {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (range) {
            if (align === 'left') {
                editor.format('align', false); // 기본값으로 설정
            } else {
                editor.format('align', align); // 다른 align 스타일 적용
            }
            setSelectedAlign(align);
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
    const content_limit_count = 2500; // 글자수 제한
    const content_limit_max = 2510; // 글자 입력 맥스
    const handlePostingEditor = (content: string) => {
        // 입력이 최대 길이 초과 시 차단
        if (content.length > content_limit_max) {
            return;
        }

        if (content.length > content_limit_count) {
            setTitleError('제목을 최대 20자 내외로 작성해주세요.');
        }

        setPosting(content);
    }

    // 포스팅 제목.
    const title_limit_count = 20; // 글자수 제한
    const title_limit_max = 30; // 글자 입력 맥스
    const handlePostingTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // 입력이 최대 길이 초과 시 차단
        if (value.length > title_limit_max) {
            return;
        }

        if (value.length > title_limit_count) {
            setTitleError('제목을 최대 20자 내외로 작성해주세요.');
        }

        setPostTitle(value);
    }

    // 포스팅 업로드
    const uploadThisPost = async () => {
        // 사용자 인증 확인
        if (!yourLogin || usageLimit) {
            if (usageLimit) {
                setLimitToggle(true);
                setModal(true);
            }
            if (!yourLogin) {
                setLoginToggle(true);
                setModal(true);
            }
            return;
        }

        if (postTitle && posting && currentUser) {
            try {
                const PostringResponse = await fetch('api/uploadPost', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include",
                    body: JSON.stringify({ imageUrls, postTitle, posting, selectTag, checkedNotice }),
                });
                if (!PostringResponse.ok) {
                    const errorDetails = await PostringResponse.json();
                    throw new Error(`포스트 업로드 실패: ${errorDetails.message}`);
                }

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
            const currentImageUrls = imgTags.map((img) => (img as HTMLImageElement).src);

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

        // 텍스트 커서 및 선택 범위 변경 시 도구에 반영
        const handleCursorChange = () => {
            const range = editor.getSelection(); // 현재 커서 범위
            if (range) {
                const currentFormats = editor.getFormat(range); // 커서 위치의 스타일 정보
                setSelectedFontSize(currentFormats.size || '14px'); // 폰트 크기
                setSelectedLineHeight(currentFormats.lineheight || '1'); // 줄 높이
                setSelectedColor(currentFormats.color || '#191919'); // 글자 색
                setSelectedBgColor(currentFormats.background || '#191919'); // 배경 색
                setSelectedAlign(currentFormats.align || 'left'); // 정렬
            }
        };

        // Quill 이벤트 등록
        editor.on('text-change', handleImageLimit);
        editor.on('selection-change', handleCursorChange);
        return () => {
            // 정리 작업
            editor.clipboard.matchers = [];
            editor.off('text-change', handleImageLimit);
            editor.off('selection-change', handleCursorChange);
        };
    }, [quillRef, storageLoad, imageUrls]);

    useEffect(() => {
        if (!postingComplete) {
            if (/\S/.test(posting) || /\S/.test(postTitle)) {
                const handleBeforeUnload = () => {
                    localStorage.setItem('unsavedPost', JSON.stringify({ tag: selectTag, title: postTitle, content: posting, date: new Date(), images: imageUrls }));
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

    useEffect(() => {
        // 페이지 로드 시 내용 불러오기 팝업
        const savedData = JSON.parse(localStorage.getItem('unsavedPost')!);
        setImageUrls([])
        if (savedData) {
            setPostDate(savedData.date)
        }
        if (savedData) setConfirmed(true);

        // 도구 외 클릭 시 닫기
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
        'align',
        'lineheight', // 줄간격 추가
    ];

    if (!quillLoaded) {
        return <div>Loading editor...</div>;
    }

    return (
        <>
            <QuillStyle notice={checkedNotice}>
                <div className='quill_wrap'>
                    <button className='go_main_btn' onClick={() => router.push('/home/main')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22.18 22.18">
                            <g id="Layer_2" data-name="Layer 2">
                                <polyline points="8.55 8.72 3.37 14.49 8.55 19.68" fill='none' strokeLinecap='round' stroke='#191919' strokeWidth={1} />
                                <path d="M3.37,14.49h8.27a8.54,8.54,0,0,0,4.18-1,5.45,5.45,0,0,0,3-5,5.48,5.48,0,0,0-3-5,8.63,8.63,0,0,0-4.23-1H9.51" fill='none' strokeLinecap='round' stroke='#191919' strokeWidth={1} />
                                <rect width="22.18" height="22.18" fill='none' />
                            </g>
                        </svg>
                    </button>
                    <div className='posting_top'>
                        <button className='notice_btn' onClick={HandleCheckedNotice}>
                            {checkedNotice ?
                                <>
                                    <svg width="32" height="32" viewBox="0 8 40 40">
                                        <g>
                                            <path className='notice_path_01' d="M29.55,26.26,28.36,25a1.14,1.14,0,0,1-.3-.77V19.26a8.29,8.29,0,0,0-7-8.32,8.09,8.09,0,0,0-9.14,8v5.23a1.14,1.14,0,0,1-.3.77l-1.19,1.31a1.72,1.72,0,0,0,1.26,2.87H28.29A1.72,1.72,0,0,0,29.55,26.26Z" fill="none" stroke='#fa5741' strokeWidth={'2'} />
                                            <path className='notice_path_02' d="M17.51,29.13a.34.34,0,0,0-.35.37,2.86,2.86,0,0,0,5.68,0,.34.34,0,0,0-.35-.37Z" fill="none" stroke='#fa5741' strokeWidth={'2'} />
                                            <circle cx="20" cy="9.15" r="1.15" fill="none" stroke='#fa5741' strokeWidth={'2'} />
                                            <rect width="32" height="32" fill="none" />
                                        </g>
                                    </svg>
                                    <p>공지</p>
                                </>
                                :
                                <>
                                    <svg width="32" height="32" viewBox="0 8 40 40">
                                        <g>
                                            <path className='notice_path_01' d="M29.55,26.26,28.36,25a1.14,1.14,0,0,1-.3-.77V19.26a8.29,8.29,0,0,0-7-8.32,8.09,8.09,0,0,0-9.14,8v5.23a1.14,1.14,0,0,1-.3.77l-1.19,1.31a1.72,1.72,0,0,0,1.26,2.87H28.29A1.72,1.72,0,0,0,29.55,26.26Z" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                            <path className='notice_path_02' d="M17.51,29.13a.34.34,0,0,0-.35.37,2.86,2.86,0,0,0,5.68,0,.34.34,0,0,0-.35-.37Z" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                            <circle cx="20" cy="9.15" r="1.15" fill="none" stroke='#ccc' strokeWidth={'2'} />
                                            <rect width="32" height="32" fill="none" />
                                        </g>
                                    </svg>
                                    <p>공지</p>
                                </>
                            }
                        </button>
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
                        <div className='title_input_wrap'>
                            <input className='title_input' type="text" placeholder='제목' value={postTitle} onChange={handlePostingTitle} />
                            <div className='title_input_value'>
                                <p>{postTitle.slice(0, title_limit_count)}</p>
                                <p style={{ color: '#fa5741' }}>{postTitle.slice(title_limit_count)}</p>
                            </div>
                            <span className='title_limit'>{postTitle.length} / 20</span>
                            {postTitle.length > 20 &&
                                <p className='title_error'>{titleError}</p>
                            }
                        </div>

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
                                <button className='ql-code-block'></button>
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
                                <button className='ql_size_toggle' onClick={() => toolToggleHandle('fontsize')}>
                                    {selectFontSize}
                                </button>
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
                                <button className='ql_lineheight_toggle' onClick={() => toolToggleHandle('lineheight')}>
                                    <svg viewBox="0 0 32 32">
                                        <g data-name="레이어 2">
                                            <rect width="32" height="32" fill='none' />
                                            <line x1="8" y1="8" x2="24" y2="8" fill='none' stroke='#191919' strokeWidth={1.5} />
                                            <line x1="8" y1="24" x2="24" y2="24" fill='none' stroke='#191919' strokeWidth={1.5} />
                                            <polyline points="14.21 12.55 16.25 10.4 18.4 12.55" fill='none' stroke='#191919' strokeWidth={1.5} />
                                            <line x1="16.25" y1="10.32" x2="16.25" y2="21.6" fill='none' stroke='#191919' strokeWidth={1.5} />
                                            <polyline points="18.35 19.45 16.31 21.6 14.15 19.45" fill='none' stroke='#191919' strokeWidth={1.5} />
                                        </g>
                                    </svg>
                                </button>
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
                                <button className='ql_color_toggle' onClick={() => toolToggleHandle('color')}>
                                    <svg viewBox="0 0 32 32">
                                        <g data-name="Layer 2">
                                            <rect width="32" height="32" fill='none' />
                                            <path xmlns="http://www.w3.org/2000/svg" d="M20.73,9h-13a.24.24,0,0,0-.25.23v2.88h.69a2.43,2.43,0,0,1,.43-1.09H13a.24.24,0,0,1,.25.22V23.7a.24.24,0,0,0,.25.23H15a.24.24,0,0,0,.25-.23V11.28a.25.25,0,0,1,.26-.22h4a2.19,2.19,0,0,1,.8,1.46H21V9.27A.24.24,0,0,0,20.73,9Z" fill='#191919' />                                            <rect x="19.74" y="19.43" width="4.5" height="4.5" rx="0.3" fill='#191919' />
                                        </g>
                                    </svg>
                                </button>
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
                                <button className='ql_background_toggle' onClick={() => toolToggleHandle('background')}>
                                    <svg viewBox="0 0 32 32">
                                        <g data-name="레이어 2">
                                            <g id="Layer_2" data-name="Layer 2">
                                                <rect width="32" height="32" fill='none' />
                                                <path d="M25.62,6H6.37A.35.35,0,0,0,6,6.31v3.86H7a3.2,3.2,0,0,1,.64-1.46h6.5a.34.34,0,0,1,.37.3V25.69a.35.35,0,0,0,.38.31h2.25a.35.35,0,0,0,.38-.31V9a.33.33,0,0,1,.37-.3h5.88a2.88,2.88,0,0,1,1.19,2h1V6.31A.35.35,0,0,0,25.62,6Z" fill='#191919' />                                            </g>
                                        </g>
                                    </svg>
                                </button>
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
                                <button className='ql_align_toggle' onClick={() => toolToggleHandle('align')}>
                                    {selectAlign === 'left' ?
                                        <svg viewBox="0 0 32 32">
                                            <g id="레이어_2" data-name="레이어 2">
                                                <line x1="6" y1="6.5" x2="26" y2="6.5" stroke='#191919' strokeWidth={1.5} />
                                                <line x1="6" y1="11.25" x2="18" y2="11.25" stroke='#191919' strokeWidth={1.5} />
                                                <line x1="6" y1="16" x2="26" y2="16" stroke='#191919' strokeWidth={1.5} />
                                                <line x1="6" y1="20.75" x2="18" y2="20.75" stroke='#191919' strokeWidth={1.5} />
                                                <line x1="6" y1="25.5" x2="26" y2="25.5" stroke='#191919' strokeWidth={1.5} />
                                                <rect width="32" height="32" fill='none' />
                                            </g>
                                        </svg>
                                        : selectAlign === 'center' ?
                                            <svg viewBox="0 0 32 32">
                                                <g id="Layer_2" data-name="Layer 2">
                                                    <line x1="6" y1="6.5" x2="26" y2="6.5" stroke='#191919' strokeWidth={1} />
                                                    <line x1="10" y1="11.25" x2="22" y2="11.25" stroke='#191919' strokeWidth={1} />
                                                    <line x1="6" y1="16" x2="26" y2="16" stroke='#191919' strokeWidth={1} />
                                                    <line x1="10" y1="20.75" x2="22" y2="20.75" stroke='#191919' strokeWidth={1} />
                                                    <line x1="6" y1="25.5" x2="26" y2="25.5" stroke='#191919' strokeWidth={1} />
                                                    <rect width="32" height="32" fill='none' />
                                                </g>
                                            </svg>
                                            : selectAlign === 'right' ?
                                                <svg viewBox="0 0 32 32">
                                                    <g id="Layer_2" data-name="Layer 2">
                                                        <line x1="6" y1="6.5" x2="26" y2="6.5" stroke='#191919' strokeWidth={1} />
                                                        <line x1="14" y1="11.25" x2="26" y2="11.25" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="16" x2="26" y2="16" stroke='#191919' strokeWidth={1} />
                                                        <line x1="14" y1="20.75" x2="26" y2="20.75" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="25.5" x2="26" y2="25.5" stroke='#191919' strokeWidth={1} />
                                                        <rect width="32" height="32" fill='none' />
                                                    </g>
                                                </svg>
                                                :
                                                <svg viewBox="0 0 32 32">
                                                    <g id="Layer_2" data-name="Layer 2">
                                                        <line x1="6" y1="6.5" x2="26" y2="6.5" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="11.25" x2="26" y2="11.25" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="16" x2="26" y2="16" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="20.75" x2="26" y2="20.75" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="25.5" x2="26" y2="25.5" stroke='#191919' strokeWidth={1} />
                                                        <rect width="32" height="32" fill='none' />
                                                    </g>
                                                </svg>
                                    }
                                </button>
                                {toolToggle === 'align' &&
                                    <ul className='ql_align_list'>
                                        <li className='ql_align_item'>
                                            <button
                                                className={selectAlign === 'left' ? 'ql_align_btn setAlign' : 'ql_align_btn'}
                                                data-align-value='left'
                                                onClick={() => { handleAlignChange('left') }}
                                            >
                                                <svg viewBox="0 0 32 32">
                                                    <g id="레이어_2" data-name="레이어 2">
                                                        <line x1="6" y1="6.5" x2="26" y2="6.5" stroke='#191919' strokeWidth={1.5} />
                                                        <line x1="6" y1="11.25" x2="18" y2="11.25" stroke='#191919' strokeWidth={1.5} />
                                                        <line x1="6" y1="16" x2="26" y2="16" stroke='#191919' strokeWidth={1.5} />
                                                        <line x1="6" y1="20.75" x2="18" y2="20.75" stroke='#191919' strokeWidth={1.5} />
                                                        <line x1="6" y1="25.5" x2="26" y2="25.5" stroke='#191919' strokeWidth={1.5} />
                                                        <rect width="32" height="32" fill='none' />
                                                    </g>
                                                </svg>
                                            </button>
                                        </li>
                                        <li className='ql_align_item'>
                                            <button
                                                className={selectAlign === 'center' ? 'ql_align_btn setAlign' : 'ql_align_btn'}
                                                data-align-value='center'
                                                onClick={() => { handleAlignChange('center') }}
                                            >
                                                <svg viewBox="0 0 32 32">
                                                    <g id="Layer_2" data-name="Layer 2">
                                                        <line x1="6" y1="6.5" x2="26" y2="6.5" stroke='#191919' strokeWidth={1} />
                                                        <line x1="10" y1="11.25" x2="22" y2="11.25" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="16" x2="26" y2="16" stroke='#191919' strokeWidth={1} />
                                                        <line x1="10" y1="20.75" x2="22" y2="20.75" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="25.5" x2="26" y2="25.5" stroke='#191919' strokeWidth={1} />
                                                        <rect width="32" height="32" fill='none' />
                                                    </g>
                                                </svg>
                                            </button>
                                        </li>
                                        <li className='ql_align_item'>
                                            <button
                                                className={selectAlign === 'right' ? 'ql_align_btn setAlign' : 'ql_align_btn'}
                                                data-align-value='right'
                                                onClick={() => { handleAlignChange('right') }}
                                            >
                                                <svg viewBox="0 0 32 32">
                                                    <g id="Layer_2" data-name="Layer 2">
                                                        <line x1="6" y1="6.5" x2="26" y2="6.5" stroke='#191919' strokeWidth={1} />
                                                        <line x1="14" y1="11.25" x2="26" y2="11.25" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="16" x2="26" y2="16" stroke='#191919' strokeWidth={1} />
                                                        <line x1="14" y1="20.75" x2="26" y2="20.75" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="25.5" x2="26" y2="25.5" stroke='#191919' strokeWidth={1} />
                                                        <rect width="32" height="32" fill='none' />
                                                    </g>
                                                </svg>
                                            </button>
                                        </li>
                                        <li className='ql_align_item'>
                                            <button
                                                className={selectAlign === 'justify' ? 'ql_align_btn setAlign' : 'ql_align_btn'}
                                                data-align-value='justify'
                                                onClick={() => { handleAlignChange('justify') }}
                                            >
                                                <svg viewBox="0 0 32 32">
                                                    <g id="Layer_2" data-name="Layer 2">
                                                        <line x1="6" y1="6.5" x2="26" y2="6.5" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="11.25" x2="26" y2="11.25" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="16" x2="26" y2="16" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="20.75" x2="26" y2="20.75" stroke='#191919' strokeWidth={1} />
                                                        <line x1="6" y1="25.5" x2="26" y2="25.5" stroke='#191919' strokeWidth={1} />
                                                        <rect width="32" height="32" fill='none' />
                                                    </g>
                                                </svg>
                                            </button>
                                        </li>
                                    </ul>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='ql_content'>
                        <ReactQuill ref={quillRef} formats={formats} value={posting} onChange={handlePostingEditor} modules={SetModules} />
                        <span>{posting.length}/{content_limit_count}</span>
                    </div>
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