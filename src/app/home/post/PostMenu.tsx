/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import { ChangeEvent, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminState, ImageUrls, ImageUrlsState, loadingState, PostContentState, PostTagState, PostTitleState, storageLoadState, UsageLimitState, UsageLimitToggle, userState } from '../../state/PostState';
import { useRecoilState, useRecoilValue, useSetRecoilState, } from 'recoil';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { css, useTheme } from '@emotion/react';
import QuillResizeImage from 'quill-resize-image';
import ReactQuill, { Quill } from 'react-quill-new';
import Block from 'quill/blots/block';
import styled from '@emotion/styled';
import { StyleAttributor } from 'parchment';
import { saveUnsavedPost } from '@/app/utils/saveUnsavedPost';
import { btnVariants } from '@/app/styled/motionVariant';
import { MoonLoader } from 'react-spinners';
import { useAddNewPost } from './hook/useNewPostMutation';
import { formatDate } from '@/app/utils/formatDate';
import { useImageInputs } from './hook/useImageInputs';
import { useImageGuard } from './hook/useImageGuard';

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
        background : ${({ theme }) => theme.colors.background};
        border : 1px solid ${({ theme }) => theme.colors.border};
        border-bottom : none;
        border-radius : 8px 8px 0px 0px;
        font-family : var(--font-pretendard-medium);

        &>p{
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: 0.875rem;
            color: rgb(153, 153, 153);
            font-family: var(--font-pretendard-light);
        }
    }

    // 포스트 탑 태그, 제목
    .posting_top{
        position :relative;
        display: flex;
        width: 100%;
        height : 70px;
        padding-bottom: 20px;
        border-bottom : 1px solid ${({ theme }) => theme.colors.border};
        font-family : var(--font-pretendard-medium);
    }

    // 공지사항 토글
    .notice_btn{
        position : relative;
        width: 49px;
        height: 49px;
        margin-right: 10px;
        border: ${(props) => (props.notice ? `1px solid ${props.theme.colors.error}` : `1px solid ${props.theme.colors.border}`)};
        border-radius: 8px;
        background: ${({ theme }) => theme.colors.background};
        cursor: pointer;

        p{
            position: absolute;
            left : 50%;
            bottom: 4px;
            text-align: center;
            transform: translateX(-50%);
            font-size: 0.75rem;
            color : ${(props) => (props.notice ? `${props.theme.colors.error}` : `${props.theme.colors.text_tag}`)};
            font-family : var(--font-pretendard-medium);
        }
    }

    .tag_sel{
        flex : 1 0 25%;
        margin-right : 10px;
        padding : 0px 12px;
        outline : none;
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-radius : 8px;
    }

    .title_input_wrap{
        flex : 1 0 65%;
        padding : 0px 12px;
        font-size : 1rem;
        outline : none;
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-radius : 8px;

        .title_input{
            width : 100%;
            height : 100%;
            font-size : 1rem;
            outline : none;
            border: none;
            border-radius : 8px;
            color : transparent;
            caret-color: #999;
            font-family : var(--font-pretendard-medium);

            &::selection {  
                color: transparent;  
                background-color:${({ theme }) => theme.colors.primary};
            }
        }

        .title_input &.title_input:focus{
            outline : none;
        }

        .title_input_value{
            position: absolute;
            top: 0;
            display: flex;

            p{
                line-height : 3rem;
            }
        }

        .title_limit{
            position: absolute;
            right: 10px;
            line-height: 49px;
            font-size: 0.875rem;
            color : #999;
        }

        .title_error{
            font-size: 0.875rem;
            color: ${({ theme }) => theme.colors.error};
            margin-top : 2px;
            font-family : var(--font-pretendard-medium);
        }
    }
    .ql_content{
        position: relative;
        margin-bottom: 60px;

        .posting_limit{
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
        border-left:${({ theme }) => theme.colors.background};
        border-radius: 0px 8px 8px 0px;
        background: ${({ theme }) => theme.colors.primary};
        font-size: 1rem;
        color: #fff;
        cursor: pointer;
        font-family: var(--font-pretendard-medium);
        text-align: center;
    }
    .go_main_btn{
        position: absolute;
        top: 24px;
        left: -63px;
        width: 64px;
        height: 64px;
        padding: 6px;
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-right: ${({ theme }) => theme.colors.background};
        background: ${({ theme }) => theme.colors.background};
        border-radius: 8px 0px 0px 8px;

        div{
            background-color: ${({ theme }) => theme.colors.background};
            width: 50px;
            height: 50px;
            border-radius: 4px;
            cursor : pointer;
        }
        
        path,
        polyline{
            transition-duration : 0.3s
        }
        
        &:hover path,
        &:hover polyline{
            stroke : ${({ theme }) => theme.colors.primary};
        }
    }
    // 에디터 박스
    .quill{
        width: 100%;
        margin: 0 auto;
        padding-bottom: 39px;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};

        .ql-container{
            margin-top: 20px;
            border: none;
        }
    }

    .ql-snow .ql-image,
    .ql-snow .ql-link{
        width : 42px;
        height : 42px;
        margin-left : 3px;
        background-color : ${({ theme }) => theme.colors.background};
        border-radius : 4px;
    }

    // 에디터 입력 칸
    .ql-editor{
        min-height: calc(100vh - 231px);
        overflow: visible;
        padding: 0px 20px;
        font-size : 1rem;
    }

    .ql-tooltip{
        z-index : 1;
    }
    // 커스텀 도구
    .custom_toolbar_wrap{
        position: absolute;
        z-index: 1;
        left: -63px;
        width: 64px;
        height: calc(100% - 101px);
    }

    #custom_toolbar{
        position: sticky;
        top : 20px;
        width: 100%;
        height: fit-content;
        padding: 0px 8px;
        background: ${({ theme }) => theme.colors.background};
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-right: 1px solid ${({ theme }) => theme.colors.background};
        border-radius: 8px 0px 0px 8px;
    }

    #toolbar span{
    font-size : 0.75rem;
    }

    // 삽입 도구
    .ql_submit_wrap{
        padding-bottom: 10px;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};

        >button{
            padding: 6px;
        }
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
        background : ${({ theme }) => theme.colors.background};
        border : none;
        border-radius : 2px;
        font-family : var(--font-pretendard-medium);
        cursor : pointer;

        rect,
        line,
        polyline,
        path,{
            transition-duration : 0.1s;
        }
    }

    .ql_lineheight_toggle,
    .ql_color_toggle,
    .ql_background_toggle,
    .ql_align_toggle{
        margin-top: 4px;
    }

    .ql_lineheight_toggle,
    .ql_align_toggle{
        margin-top: 4px;

        &:hover line,
        &:hover polyline,
        &:hover path{
            stroke : ${({ theme }) => theme.colors.primary};
        }
    }

    .ql_color_toggle{
        &:hover line,
        &:hover polyline,
        &:hover path{
            fill : ${({ theme }) => theme.colors.primary};
        }
    }

        
    .ql_background_toggle{
        padding : 6px;

        svg{
            border: 1px solid ${({ theme }) => theme.colors.border};
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
        background-color : ${({ theme }) => theme.colors.background};
        margin-top : 4px;
        border : none;
        border-radius : 2px;
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
        background: ${({ theme }) => theme.colors.background};
        border: 1px solid ${({ theme }) => theme.colors.border};
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
        color: ${({ theme }) => theme.colors.text};
    }

    & .ql_size_btn:hover,
    & .ql_lineheight_btn:hover{
    color : ${({ theme }) => theme.colors.primary};
    }

    .setFont,
    .setLineheight {
    color : ${({ theme }) => theme.colors.primary};
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
        background: ${({ theme }) => theme.colors.background};
        border: 1px solid ${({ theme }) => theme.colors.border};
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
        border : 2px solid ${({ theme }) => theme.colors.border};
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
        background: ${({ theme }) => theme.colors.background};
        border: 1px solid ${({ theme }) => theme.colors.border};
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
        background: ${({ theme }) => theme.colors.background};
        transition-duration : 0.1s;

        &:hover line{
          stroke: ${({ theme }) => theme.colors.primary};
        }
    }

    .setAlign line{
        stroke : ${({ theme }) => theme.colors.primary};
    }

    #toolbar {
        display: block;
        width: 100%;
        padding: 10px 0px 10px;
        border: none;

        rect,
        path,
        line,
        polyline{
            transition-duration : .3s;
        }
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


    @media (max-width: 1200px) {
        position: relative;
        left: 80px;
        width: calc(100% - 80px);
        padding: 0;
        margin: 0;

        .quill_wrap{
            width: calc(100% - 84px);
            height: 100%;
            padding: 10px;
        }

        .posting_top {
            position: relative;
            width: 100%;
            height: fit-content;
            flex-direction: row;
            flex-wrap: wrap;

            .tag_sel {
                height: 49px;
                flex: 1 0 100%;
                max-width: calc(100% - 60px);
                padding: 0px 12px;
                margin-right: 0px;
            }

            .title_input_wrap {
                position: relative;
                flex: 1 0 100%;
                margin-top: 10px;
                height: fit-content;
                
                .title_input{
                    height : 49px;
                }
            }

            .title_error {
                margin-bottom: 10px;
            }
        }

        .quill_wrap>p {
            bottom: 10px;
            right: 96px;
        }

        .post_btn {
            right: 20px;
        }
    }
`
const LoadModal = styled.div`
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
        background : ${({ theme }) => theme.colors.background};
        border : 1px solid ${({ theme }) => theme.colors.border};
        border-radius : 8px;
        box-shadow : 0px 0px 10px rgba(0,0,0,0.1);
        text-align : center;
    }

    .load_btn_wrap p{
        font-size : 1.5rem;
    }

    .load_btn_wrap span{
        display:block;
        width:100%;
        margin-top:20px;
        font-size : 0.875rem;
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
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-radius : 4px;
        font-size : 1rem;
        margin-top:32px;
        cursor:pointer;
    }

    .load_ok_btn{
        margin-right : 10px;
        border: 1px solid ${({ theme }) => theme.colors.primary};
        color : ${({ theme }) => theme.colors.primary};
        font-family : var(--font-pretendard-bold);
    }

    .load_no_btn{
        color: ${({ theme }) => theme.colors.text};
    }
`

export default function PostMenu() {
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const prevPathname = useRef<string>(pathname) as MutableRefObject<string>;

    const quillRef = useRef<ReactQuill | null>(null);
    const tagRef = useRef<HTMLSelectElement>(null);
    const styleToolRef = useRef<HTMLDivElement>(null);
    const isAdmin = useRecoilValue(adminState)
    const setLimitToggle = useSetRecoilState<boolean>(UsageLimitToggle)
    const usageLimit = useRecoilValue<boolean>(UsageLimitState)
    const currentUser = useRecoilValue(userState)
    const [storageLoad, setStorageLoad] = useRecoilState<boolean>(storageLoadState);

    const [postingComplete, setPostingComplete] = useState<boolean>(false);
    const [postTitle, setPostTitle] = useRecoilState<string | null>(PostTitleState);
    const [posting, setPosting] = useRecoilState<string | null>(PostContentState);
    const [selectTag, setSelectedTag] = useRecoilState<string>(PostTagState);
    const [titleError, setTitleError] = useState<string>('');
    const [postDate, setPostDate] = useState<string>('');
    const [confirmed, setConfirmed] = useState<boolean>(false);
    const [checkedNotice, setCheckedNotice] = useState<boolean>(false);
    const setLoading = useSetRecoilState<boolean>(loadingState);
    const [uploadLoading, setUploadLoading] = useState<boolean>(false);
    //  State
    const [toolToggle, setToolToggle] = useState<string>('');
    const [selectFontSize, setSelectedFontSize] = useState<string>('16px');
    const [selectColor, setSelectedColor] = useState<string>('#191919');
    const [selectBgColor, setSelectedBgColor] = useState<string>('#ffffff');
    const [selectLineheight, setSelectedLineHeight] = useState<string>('1.5');
    const [selectAlign, setSelectedAlign] = useState<string>('left');

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

    const fontsize = ['0.625rem', '0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', '1.375rem']
    const fontSizeOptions = [
        { value: '0.625rem', label: '10px' },
        { value: '0.75rem', label: '12px' },
        { value: '0.875rem', label: '14px' },
        { value: '1rem', label: '16px' },
        { value: '1.125rem', label: '18px' },
        { value: '1.25rem', label: '20px' },
        { value: '1.375rem', label: '22px' },
    ];
    const lineheight = ['1rem', '1.5rem', '2rem', '2.5rem', '3rem', '4rem', '5rem']
    const [quillLoaded, setQuillLoaded] = useState(false);
    // tool toggle state

    // quill 모듈 로드
    useEffect(() => {
        const loadQuill = async () => {
            try {

                // Lineheight 모듈
                class LineHeightBlot extends Block {
                    static blotName = "lineheight";
                    static tagName = "div";
                    static scope = Quill.import('parchment').Scope.BLOCK;

                    static create(value: string): HTMLElement {
                        const node = super.create(value);
                        node.style.lineHeight = value;
                        return node;
                    }

                    static formats(node: HTMLElement): string | null {
                        return node.style.lineHeight || null;
                    }
                }

                LineHeightBlot.blotName = "lineheight";
                LineHeightBlot.tagName = "div"; // 블록 요소

                Quill.register(LineHeightBlot);

                // Font Size 설정
                const fontSize = Quill.import('attributors/style/size') as StyleAttributor;
                fontSize.whitelist = fontsize;
                Quill.register(fontSize, true);

                // Image Resize 모듈 등록
                Quill.register("modules/ImageResize", QuillResizeImage);

                setQuillLoaded(true); // Quill 로드 완료 상태 업데이트
            } catch (error) {
                console.error('Quill 로드 중 에러 발생:', error);
            }
        };
        loadQuill();

        setLoading(false);
    }, []);

    // 폰트 사이즈 모듈
    const handleFontSizeChange = (size: string | null, label: string | null) => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection(); // 현재 선택된 영역
            if (range && size && label) {
                editor.format('size', size); // 선택 영역에 폰트 크기 적용
                setSelectedFontSize(label); // 상태 업데이트
            }
        }
    };

    // 폰트 컬러 모듈
    const handleFontColorChange = (color: string) => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection();
            if (range) {
                const colorValue = color === '색상 없음' ? null : color
                editor.format('color', colorValue);
                setSelectedColor(color)
            }
        }
    };

    // 폰트 배경색 모듈
    const handleFontBgChange = (color: string) => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection();
            if (range) {
                const colorValue = color === '색상 없음' ? null : color
                editor.format('background', colorValue);
                setSelectedBgColor(color)
            }
        }
    };

    // 줄 간격 모듈
    const handleLineheightChange = (height: string | null) => {
        if (quillRef.current) {
            if (quillRef.current) {
                const editor = quillRef.current.getEditor();
                const range = editor.getSelection();
                if (range && height) {
                    editor.format('lineheight', height);
                    setSelectedLineHeight(height);
                }
            }
        }
    };

    // 글 정렬 모듈
    const handleAlignChange = (align: string) => {
        if (quillRef.current) {
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
        }
    };

    // 공지사항 글로 작성
    const handleCheckedNotice = () => {
        if (!isAdmin) return;

        if (!checkedNotice) {
            setSelectedTag('공지사항');
            setCheckedNotice(true);
        } else {
            setSelectedTag('기타');
            setCheckedNotice(false);
        }
    }

    const handleSelectTag = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedTag(e.target.value);
    }

    // 도구 토글
    const toolToggleHandle = (tool: string) => {
        if (tool === toolToggle) {
            return setToolToggle('')
        }
        setToolToggle(tool)
    }

    // 글자 수 계산을 위한 텍스트 추출 함수
    const extractPlainText = (html: string): string => {
        // DOMParser를 사용하여 HTML을 파싱합니다.
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // 문서의 body에서 텍스트 내용만 추출합니다.
        return doc.body.textContent || '';
    }

    const postingText = useMemo(() => extractPlainText(posting as string), [posting]);

    // 글 작성 중 떠나면 저장
    const handleLeavePosting = () => {
        if (posting) {
            const unsavedPost = {
                tag: selectTag,
                title: postTitle as string,
                content: posting as string,
                date: new Date(),
                images: imageUrls
            }

            saveUnsavedPost(unsavedPost)
        }
        router.push('/home/main');
    }

    // 포스트 내용 입력 시 해당 스테이트에 저장
    const handlePostingEditor = (content: string) => {
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

    const { mutate: fetchUpdateNewPost } = useAddNewPost(checkedNotice);
    const [imageUrls, setImageUrls] = useRecoilState<ImageUrls[]>(ImageUrlsState);

    // 포스팅 업로드
    const uploadPost = async () => {
        if (uploadLoading) return;
        if (usageLimit) return setLimitToggle(true);

        const MAX_IMG_COUNT = 4;
        const title_limit_count = 20;
        const content_limit_count = 2500;

        if (currentUser) {
            if (!postTitle) return alert('제목을 입력해주세요.');

            if (!posting) return alert('본문을 작성해주세요.');

            if (imageUrls.length > MAX_IMG_COUNT) {
                alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 업로드 가능합니다.`);
                return;
            };
            if (postTitle.length > title_limit_count) {
                alert(`제목을 20자 이내로 작성해 주세요.`);
                return;
            };
            if (postingText.length > content_limit_count) {
                alert(`최대 2500자의 내용만 작성 가능합니다.`);
                return;
            };

            try {
                setUploadLoading(true);

                const csrf = document.cookie.split('; ').find(c => c?.startsWith('csrfToken='))?.split('=')[1];
                const csrfValue = csrf ? decodeURIComponent(csrf) : '';

                const post = ({
                    userId: currentUser.uid as string,
                    displayName: currentUser.name,
                    photoUrl: currentUser.photo,
                    title: postTitle,
                    content: posting,
                    tag: selectTag,
                    notice: checkedNotice,
                    imageUrls: imageUrls.length > 0 ? imageUrls : null,
                })

                const PostResponse = await fetch(`/api/posting`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Project-Host': window.location.origin,
                        'x-csrf-token': csrfValue
                    },
                    body: JSON.stringify(post),
                    credentials: "include",
                });

                if (!PostResponse.ok) {
                    throw new Error(`포스트 업로드 실패 : ${PostResponse.status}`);
                }

                const postData = await PostResponse.json();

                if (postData) {
                    // 서버에서 업데이트 정보를 받으면 호출
                    if (fetchUpdateNewPost && postData.post) {
                        await fetchUpdateNewPost(postData.post);
                    }
                }

                setPostingComplete(true);
                router.push('/home/main');
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("포스트 업로드 실패 : ", error.message);
                    alert('포스트 업로드에 실패했습니다. 다시 시도해주세요');
                } else {
                    console.error("알 수 없는 에러 유형 : ", error);
                    alert('포스트 업로드에 실패했습니다. 다시 시도해주세요');
                }
            } finally {
                setUploadLoading(false)
            }
        }
    }

    // 이미지 최대 크기
    const MAX_IMG_SIZE = 5 * 1024 * 1024;
    // 이미지 최대 수
    const MAX_IMG_COUNT = 4;

    const alertedRef = useRef(false);

    // 공통 이미지 처리 함수
    const processImageFile = useCallback(async (file: File) => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const editorRoot = editor.root;
        const currentImages = Array.from(editorRoot.querySelectorAll('img'));

        // 이미지 수 제한
        if (currentImages.length >= MAX_IMG_COUNT) {
            alert(`최대 ${MAX_IMG_COUNT}개의 이미지만 업로드 가능합니다.`);
            alertedRef.current = true;
            return;
        }
        // 이미지 크기 제한
        if (file.size > MAX_IMG_SIZE) {
            alert("이미지 크기는 최대 5MB까지 허용됩니다.");
            return;
        }

        // 이미지 URL 생성하여 Quill 에디터에 삽입
        const readDataUrl = (file: File): Promise<string> =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(new Error('이미지 읽기 실패'));
                reader.readAsDataURL(file);
            });

        let imageUrl: string;

        try {
            imageUrl = await readDataUrl(file);
        } catch (error) {
            console.error('리더 에러', error);
            alert('이미지 입력에 실패했습니다. 다시 시도해주세요.');
            throw error; // 상위에서 처리하도록 예외를 던짐(선택)
        }

        // 커서 위치 없으면 맨끝에 추가
        const range = editor.getSelection();
        const insertIndex = (range && typeof range.index === 'number') ? range.index : editor.getLength();
        editor.insertEmbed(insertIndex, 'image', imageUrl);

        const currentSrcsAfterInsert = Array.from(editorRoot.querySelectorAll('img')).map(i => (i as HTMLImageElement).src);
        setImageUrls((prev) => {
            const prevMap = new Map<string, ImageUrls>();
            for (const imgs of prev) {
                if (imgs.localSrc) prevMap.set(imgs.localSrc, imgs);
            }

            const merged: ImageUrls[] = currentSrcsAfterInsert.map(src => {
                // 기존 재사용
                const existing = prevMap.get(src);
                if (existing) return existing;
                // 없으면 localSrc만 채운 객체 생성
                return { localSrc: src };
            });

            return merged;
        })

        if (currentSrcsAfterInsert.length < MAX_IMG_COUNT) {
            alertedRef.current = false;
        }

        return;
    }, [setImageUrls, alertedRef]);

    // 이미지 삽입 시 이미지 배열 관리
    const imageHandler = useCallback(async () => { // Quill 도구로 이미지 입력 시
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const input = document.createElement('input');

        input.type = 'file';
        input.accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
        input.multiple = true;

        input.click();

        input.onchange = async () => {
            try {
                const files = Array.from(input.files ?? []);
                input.value = '';

                // 현재 이미지 검사
                const editor = quillRef.current?.getEditor();
                const editorRoot = editor?.root;
                const currentCount = editorRoot ? editorRoot.querySelectorAll('img').length : imageUrls.length;
                const available = Math.max(0, MAX_IMG_COUNT - currentCount);

                if (available <= 0) {
                    alert(`이미지는 최대 ${MAX_IMG_COUNT}개까지 등록할 수 있습니다.`);
                    return;
                }

                // 처리 가능한 수만 입력 허용
                const toProcess = files.slice(0, available);
                if (files.length > available) {
                    alert(`${files.length - available}개의 파일은 최대 이미지 수(${MAX_IMG_COUNT})를 초과하여 제외됩니다.`);
                }

                const validFiles: File[] = [];
                const skippedReasons: string[] = [];
                toProcess.forEach((file) => {
                    // 타입 검사
                    if (!file.type || !file.type.startsWith('image/')) {
                        skippedReasons.push(`${file.name}: 지원되지 않는 파일 타입`);
                        return;
                    }

                    // 크기 검사
                    if (file.size > MAX_IMG_SIZE) {
                        skippedReasons.push(`${file.name}: 파일 크기 초과 (${Math.round(file.size / 1024)} KB)`);
                        return;
                    }

                    validFiles.push(file);
                });

                if (skippedReasons.length > 0) {
                    alert(`허용되지 않는 이미지 파일이 있습니다. :\n- ${skippedReasons.join('\n- ')}`);
                }

                if (validFiles.length === 0) return;

                const concurrency = 1; // 상황에 따라 1~3 권장
                const results: Array<{ file: File; ok: boolean; error?: unknown }> = [];

                let idx = 0;
                const worker = async () => {
                    while (true) {
                        const i = idx++;
                        if (i >= validFiles.length) break;
                        const file = validFiles[i];
                        try {
                            // processImageFile는 이미 내부에서 DOM 동기화 및 상태 갱신을 수행함
                            await processImageFile(file);
                            results.push({ file, ok: true });
                        } catch (err) {
                            console.error('processImageFile error', err);
                            results.push({ file, ok: false, error: err });
                        }
                    }
                };

                // 시작
                const workers = Array.from({ length: Math.min(concurrency, validFiles.length) }).map(() => worker());
                await Promise.all(workers);

                // 요약 결과 처리
                const failed = results.filter(r => !r.ok);
                if (failed.length > 0) {
                    alert(`${failed.length}개의 이미지 처리에 실패했습니다. 다시 시도해 주세요.`);
                } else {
                }
            } finally {
                input.onchange = null;
            }
        };
    }, [processImageFile, quillRef, MAX_IMG_COUNT, MAX_IMG_SIZE]);

    useImageInputs({
        ref: quillRef,
        quillLoaded,
        storageLoad,
        alertedRef,
        processImageFile,
        MAX_IMG_COUNT,
        MAX_IMG_SIZE,
    });

    useImageGuard({
        ref: quillRef,
        quillLoaded,
        storageLoad,
        setImageUrls,
        alertedRef,
        MAX_IMG_COUNT,
        MAX_IMG_SIZE,
    });

    // 도구 반영
    const remToPxMap: Record<string, string> = {
        '0.625rem': '10px',
        '0.75rem': '12px',
        '0.875rem': '14px',
        '1rem': '16px',
        '1.125rem': '18px',
        '1.25rem': '20px',
        '1.375rem': '22px',
    };
    useEffect(() => {
        if (!quillLoaded) return;
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        // 텍스트 커서 및 선택 범위 변경 시 도구에 반영
        const handleCursorChange = () => {
            const range = editor.getSelection(); // 현재 커서 범위

            if (range) {
                const currentFormats = editor.getFormat(range);

                const fontSizeRem = currentFormats.size as string;
                const fontSizePx = remToPxMap[fontSizeRem] || '16px';

                setSelectedFontSize(fontSizePx); // 폰트 크기
                setSelectedLineHeight(currentFormats.lineheight as string || '1'); // 줄 높이
                setSelectedColor(currentFormats.color as string || '#191919'); // 글자 색
                setSelectedBgColor(currentFormats.background as string || '#191919'); // 배경 색
                setSelectedAlign(currentFormats.align as string || 'left'); // 정렬
            }
        };

        // Quill 이벤트 등록
        editor.on('selection-change', handleCursorChange);
        return () => {
            editor.off('selection-change', handleCursorChange);
        };
    }, [quillRef, quillLoaded]);

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
    };

    useEffect(() => {
        if (!postingComplete) {
            if (/\S/.test(posting as string) || /\S/.test(postTitle as string)) {

                const handleBeforeUnload = () => {
                    if (postingText.length > 0) {
                        const unsavedPost = {
                            tag: selectTag,
                            title: postTitle as string,
                            content: posting as string,
                            date: new Date(),
                            images: imageUrls
                        }

                        saveUnsavedPost(unsavedPost)
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
    }, [postTitle, posting]);

    useEffect(() => {
        return () => {
            // 언마운트 시 실행할 코드 (예: 리소스 정리)
            if (prevPathname.current !== pathname) {

                // 경로가 변경되면 unsavedPost 저장 (포스팅 작성 중 내용이 있을 때만 저장)
                if (postingText.length > 0) {
                    const unsavedPost = {
                        tag: selectTag,
                        title: postTitle as string,
                        content: posting as string,
                        date: new Date(),
                        images: imageUrls
                    }

                    saveUnsavedPost(unsavedPost)
                }
            }
        };
    }, [pathname, selectTag, postTitle, posting, imageUrls]);

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
    }, []);

    // Function
    const SetModules = useMemo(
        () =>
        ({

            toolbar: {
                container: "#toolbar",
                handlers: {
                    image: imageHandler, // 이미지 핸들러
                    size: (value: string, label: string) => handleFontSizeChange(value, label),
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
                    <button className='go_main_btn' onClick={handleLeavePosting}>
                        <motion.div
                            variants={btnVariants(theme)}
                            whileHover="otherHover"
                            whileTap="otherClick">
                            <svg viewBox="-5 -5 32 32">
                                <g>
                                    <polyline points="8.55 8.72 3.37 14.49 8.55 19.68" fill='none' strokeLinecap='round' css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                    <path d="M3.37,14.49h8.27a8.54,8.54,0,0,0,4.18-1,5.45,5.45,0,0,0,3-5,5.48,5.48,0,0,0-3-5,8.63,8.63,0,0,0-4.23-1H9.51" css={css`stroke : ${theme.colors.icon_on}`} fill='none' strokeLinecap='round' strokeWidth={1.5} />
                                    <rect width="22.18" height="22.18" fill='none' />
                                </g>
                            </svg>
                        </motion.div>
                    </button>
                    <div className='posting_top'>
                        {isAdmin &&
                            <motion.button
                                variants={btnVariants(theme)}
                                whileHover={checkedNotice ? "NtcHover" : "NtcOffHover"}
                                whileTap={checkedNotice ? "NtcClick" : "NtcOffClick"}
                                className='notice_btn' onClick={handleCheckedNotice}>
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
                                                <path className='notice_path_02' d="M17.51,29.13a.34.34,0,0,0-.35.37,2.86,2.86,0,0,0,5.68,0,.34.34,0,0,0-.35-.37Z" fill="none" css={css`stroke : ${theme.colors.icon_off}`} strokeWidth={'2'} />
                                                <circle cx="20" cy="9.15" r="1.15" fill="none" css={css`stroke : ${theme.colors.icon_off}`} strokeWidth={'2'} />
                                                <rect width="32" height="32" fill="none" />
                                            </g>
                                        </svg>
                                        <p>공지</p>
                                    </>
                                }
                            </motion.button>
                        }
                        {checkedNotice ?
                            <select ref={tagRef} className='tag_sel' defaultValue={'공지사항'}>
                                <option value="공지사항">공지사항</option>
                            </select>
                            :
                            <select ref={tagRef} className='tag_sel' defaultValue={'기타'} onChange={(e) => handleSelectTag(e)}>
                                <option value="기타">기타</option>
                                <option value="잡담">잡담</option>
                                <option value="공부">공부</option>
                                <option value="일상">일상</option>
                            </select>
                        }
                        <div className='title_input_wrap'>
                            <input className='title_input' type="text" placeholder='제목' value={postTitle as string} onChange={handlePostingTitle} />
                            <div className='title_input_value'>
                                <p>{postTitle?.slice(0, title_limit_count)}</p>
                                <p css={css`color: ${theme.colors.error}`}>{postTitle?.slice(title_limit_count)}</p>
                            </div>
                            <span className='title_limit'>{postTitle?.length} / 20</span>
                            {postTitle && postTitle?.length > 20 &&
                                <p className='title_error'>{titleError}</p>
                            }
                        </div>

                    </div>
                    {/* <!-- Quill Custom Toolbar --> */}
                    <div className='custom_toolbar_wrap'>
                        <div id="custom_toolbar">
                            <div id='toolbar'>
                                {/* <!-- Links and Images --> */}
                                <div className='ql_submit_wrap'>
                                    <div className='ql_image_wrap'>
                                        <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-image"></motion.button>
                                        <span>이미지</span>
                                    </div>
                                    <div className='ql_link_wrap'>
                                        <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-link"></motion.button>
                                        <span>링크</span>
                                    </div>
                                </div>
                                {/* <!-- Indent --> */}
                                <div className='ql_style_wrap'>
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-indent" value="+1"></motion.button>
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-indent" value="-1"></motion.button>

                                    {/* <!-- Header -->  */}
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-header" value="1"></motion.button>

                                    {/* <!-- Formatting --> */}
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-bold"></motion.button>
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-italic"></motion.button>
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-underline"></motion.button>
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-strike"></motion.button>
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className='ql-code-block'></motion.button>
                                    {/* <!-- Subscript / Superscript --> */}
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-script" value="sub"></motion.button>
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-script" value="super"></motion.button>

                                    {/* <!-- Clean --> */}
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className="ql-clean"></motion.button>
                                </div>
                            </div>

                            <div id='toolbar-bottom' ref={styleToolRef}>
                                {/* <!-- Font Size --> */}
                                <div className='ql_size_wrap'>
                                    <motion.button
                                        variants={btnVariants(theme)}
                                        whileHover={{
                                            color: '#0087ff'
                                        }}
                                        className='ql_size_toggle' onClick={() => toolToggleHandle('fontsize')}>
                                        {selectFontSize}
                                    </motion.button>
                                    {toolToggle === 'fontsize' &&
                                        <ul className='ql_size_list'>
                                            {fontSizeOptions.map((size, ftIndex) => (
                                                <li className='ql_size_item' key={ftIndex}>
                                                    <button data-size-select={size.value} data-label-select={size.label} type='button' className='ql_size_btn'
                                                        onClick={(e) => {
                                                            const dataSize = (e.currentTarget as HTMLElement).getAttribute('data-size-select')
                                                            const datalabel = (e.currentTarget as HTMLElement).getAttribute('data-label-select')
                                                            handleFontSizeChange(dataSize, datalabel)
                                                        }
                                                        }>
                                                        {size.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    }
                                </div>

                                {/* <!-- Line Height --> */}
                                <div className='ql_lineheight_wrap'>
                                    <motion.button
                                        variants={btnVariants(theme)}
                                        whileHover="otherHover" className='ql_lineheight_toggle' onClick={() => toolToggleHandle('lineheight')}>
                                        <svg viewBox="0 0 32 32">
                                            <g>
                                                <rect width="32" height="32" fill='none' />
                                                <line x1="8" y1="8" x2="24" y2="8" fill='none' css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                <line x1="8" y1="24" x2="24" y2="24" fill='none' css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                <polyline points="14.21 12.55 16.25 10.4 18.4 12.55" fill='none' css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                <line x1="16.25" y1="10.32" x2="16.25" y2="21.6" fill='none' css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                <polyline points="18.35 19.45 16.31 21.6 14.15 19.45" fill='none' css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                            </g>
                                        </svg>
                                    </motion.button>
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
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className='ql_color_toggle' onClick={() => toolToggleHandle('color')}>
                                        <svg viewBox="0 0 32 32">
                                            <g >
                                                <rect width="32" height="32" fill='none' />
                                                <path d="M20.73,9h-13a.24.24,0,0,0-.25.23v2.88h.69a2.43,2.43,0,0,1,.43-1.09H13a.24.24,0,0,1,.25.22V23.7a.24.24,0,0,0,.25.23H15a.24.24,0,0,0,.25-.23V11.28a.25.25,0,0,1,.26-.22h4a2.19,2.19,0,0,1,.8,1.46H21V9.27A.24.24,0,0,0,20.73,9Z" css={css`fill : ${theme.colors.icon_on}`} />
                                                <rect x="19.74" y="19.43" width="4.5" height="4.5" rx="0.3" fill={selectColor} />
                                            </g>
                                        </svg>
                                    </motion.button>
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
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className='ql_background_toggle' onClick={() => toolToggleHandle('background')}>
                                        <svg viewBox="0 0 32 32">
                                            <g>
                                                <rect width="32" height="32" fill='none' />
                                                <path d="M25.62,6H6.37A.35.35,0,0,0,6,6.31v3.86H7a3.2,3.2,0,0,1,.64-1.46h6.5a.34.34,0,0,1,.37.3V25.69a.35.35,0,0,0,.38.31h2.25a.35.35,0,0,0,.38-.31V9a.33.33,0,0,1,.37-.3h5.88a2.88,2.88,0,0,1,1.19,2h1V6.31A.35.35,0,0,0,25.62,6Z" fill={selectBgColor} />
                                            </g>
                                        </svg>
                                    </motion.button>
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
                                    <motion.button variants={btnVariants(theme)} whileHover="otherHover" className='ql_align_toggle' onClick={() => toolToggleHandle('align')}>
                                        {selectAlign === 'left' ?
                                            <svg viewBox="0 0 32 32">
                                                <g>
                                                    <line x1="6" y1="6.5" x2="26" y2="6.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                    <line x1="6" y1="11.25" x2="18" y2="11.25" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                    <line x1="6" y1="16" x2="26" y2="16" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                    <line x1="6" y1="20.75" x2="18" y2="20.75" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                    <line x1="6" y1="25.5" x2="26" y2="25.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                    <rect width="32" height="32" fill='none' />
                                                </g>
                                            </svg>
                                            : selectAlign === 'center' ?
                                                <svg viewBox="0 0 32 32">
                                                    <g>
                                                        <line x1="6" y1="6.5" x2="26" y2="6.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                        <line x1="10" y1="11.25" x2="22" y2="11.25" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                        <line x1="6" y1="16" x2="26" y2="16" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                        <line x1="10" y1="20.75" x2="22" y2="20.75" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                        <line x1="6" y1="25.5" x2="26" y2="25.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                        <rect width="32" height="32" fill='none' />
                                                    </g>
                                                </svg>
                                                : selectAlign === 'right' ?
                                                    <svg viewBox="0 0 32 32">
                                                        <g>
                                                            <line x1="6" y1="6.5" x2="26" y2="6.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="14" y1="11.25" x2="26" y2="11.25" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="16" x2="26" y2="16" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="14" y1="20.75" x2="26" y2="20.75" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="25.5" x2="26" y2="25.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <rect width="32" height="32" fill='none' />
                                                        </g>
                                                    </svg>
                                                    :
                                                    <svg viewBox="0 0 32 32">
                                                        <g>
                                                            <line x1="6" y1="6.5" x2="26" y2="6.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="11.25" x2="26" y2="11.25" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="16" x2="26" y2="16" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="20.75" x2="26" y2="20.75" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="25.5" x2="26" y2="25.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <rect width="32" height="32" fill='none' />
                                                        </g>
                                                    </svg>
                                        }
                                    </motion.button>
                                    {toolToggle === 'align' &&
                                        <ul className='ql_align_list'>
                                            <li className='ql_align_item'>
                                                <motion.button
                                                    variants={btnVariants(theme)}
                                                    whileHover="otherHover"
                                                    whileTap="otherClick"
                                                    className={selectAlign === 'left' ? 'ql_align_btn setAlign' : 'ql_align_btn'}
                                                    data-align-value='left'
                                                    onClick={() => { handleAlignChange('left') }}
                                                >
                                                    <svg viewBox="0 0 32 32">
                                                        <g>
                                                            <line x1="6" y1="6.5" x2="26" y2="6.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                            <line x1="6" y1="11.25" x2="18" y2="11.25" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                            <line x1="6" y1="16" x2="26" y2="16" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                            <line x1="6" y1="20.75" x2="18" y2="20.75" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                            <line x1="6" y1="25.5" x2="26" y2="25.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1.5} />
                                                            <rect width="32" height="32" fill='none' />
                                                        </g>
                                                    </svg>
                                                </motion.button>
                                            </li>
                                            <li className='ql_align_item'>
                                                <motion.button
                                                    variants={btnVariants(theme)}
                                                    whileHover="otherHover"
                                                    whileTap="otherClick"
                                                    className={selectAlign === 'center' ? 'ql_align_btn setAlign' : 'ql_align_btn'}
                                                    data-align-value='center'
                                                    onClick={() => { handleAlignChange('center') }}
                                                >
                                                    <svg viewBox="0 0 32 32">
                                                        <g>
                                                            <line x1="6" y1="6.5" x2="26" y2="6.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="10" y1="11.25" x2="22" y2="11.25" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="16" x2="26" y2="16" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="10" y1="20.75" x2="22" y2="20.75" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="25.5" x2="26" y2="25.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <rect width="32" height="32" fill='none' />
                                                        </g>
                                                    </svg>
                                                </motion.button>
                                            </li>
                                            <li className='ql_align_item'>
                                                <motion.button
                                                    variants={btnVariants(theme)}
                                                    whileHover="otherHover"
                                                    whileTap="otherClick"
                                                    className={selectAlign === 'right' ? 'ql_align_btn setAlign' : 'ql_align_btn'}
                                                    data-align-value='right'
                                                    onClick={() => { handleAlignChange('right') }}
                                                >
                                                    <svg viewBox="0 0 32 32">
                                                        <g>
                                                            <line x1="6" y1="6.5" x2="26" y2="6.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="14" y1="11.25" x2="26" y2="11.25" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="16" x2="26" y2="16" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="14" y1="20.75" x2="26" y2="20.75" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="25.5" x2="26" y2="25.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <rect width="32" height="32" fill='none' />
                                                        </g>
                                                    </svg>
                                                </motion.button>
                                            </li>
                                            <li className='ql_align_item'>
                                                <motion.button
                                                    variants={btnVariants(theme)}
                                                    whileHover="otherHover"
                                                    whileTap="otherClick"
                                                    className={selectAlign === 'justify' ? 'ql_align_btn setAlign' : 'ql_align_btn'}
                                                    data-align-value='justify'
                                                    onClick={() => { handleAlignChange('justify') }}
                                                >
                                                    <svg viewBox="0 0 32 32">
                                                        <g>
                                                            <line x1="6" y1="6.5" x2="26" y2="6.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="11.25" x2="26" y2="11.25" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="16" x2="26" y2="16" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="20.75" x2="26" y2="20.75" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <line x1="6" y1="25.5" x2="26" y2="25.5" css={css`stroke : ${theme.colors.icon_on}`} strokeWidth={1} />
                                                            <rect width="32" height="32" fill='none' />
                                                        </g>
                                                    </svg>
                                                </motion.button>
                                            </li>
                                        </ul>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='ql_content'>
                        <ReactQuill ref={quillRef} formats={formats} value={posting as string} onChange={handlePostingEditor} modules={SetModules} />
                    </div>
                    <p>{postingText.length}/ 2500</p>

                    {uploadLoading ? <button className='post_btn'><MoonLoader color="#0087ff" size={8} /></button> : <motion.button variants={btnVariants(theme)} whileHover="loginHover" className='post_btn' onClick={uploadPost}>발행</motion.button>}
                </div >
            </QuillStyle >
            {
                confirmed &&
                <LoadModal>
                    <div className='load_modal_bg'></div>
                    <div className='load_btn_wrap'>
                        <p>작성 중인 내용이 있습니다.</p>
                        <span><time>{formatDate(postDate)}</time>에 작성 중이던 내용이 있습니다.</span>
                        <span>이어서 작성하시겠습니까?</span>
                        <button className='load_ok_btn' onClick={() => handleLoadPost(true)}>확인</button>
                        <button className='load_no_btn' onClick={() => handleLoadPost(false)}>취소</button>
                    </div>
                </LoadModal>
            }
        </>
    )
} 