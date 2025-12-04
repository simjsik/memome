/** @jsxImportSource @emotion/react */ // 최상단에 배치
"use client";
import styled from "@emotion/styled";
import "quill/dist/quill.snow.css";


export const QuillStyle = styled.div<{ notice: boolean, public: boolean }>`
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

    .post_btn{
        position: absolute;
        z-index: 1;
        top: 24px;
        right: -63px;
    }

    .tag_sel{
        flex : 1 0 15%;
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
            background-color : ${({ theme }) => theme.colors.background};

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

    .public_btn{
        position: absolute;
        z-index: 1;
        top: 96px;
        right: -58px;
        background: ${({ theme }) => theme.colors.primary};
        width: 49px;
        height: 49px;
        margin-right: 10px;
        border: ${(props) => (!props.public ? `1px solid ${props.theme.colors.error}` : `1px solid ${props.theme.colors.border}`)};
        border-left:${({ theme }) => theme.colors.background};
        border-radius: 0px 8px 8px 0px;
        background: ${({ theme }) => theme.colors.background};
        cursor: pointer;

        p{
            position: absolute;
            left : 50%;
            bottom: 4px;
            text-align: center;
            transform: translateX(-50%);
            font-size: 0.75rem;
            color : ${(props) => (!props.public ? `${props.theme.colors.error}` : `${props.theme.colors.text_tag}`)};
            font-family : var(--font-pretendard-medium);
        }
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

    .ql-editor:empty::before{
        color: ${({ theme }) => theme.colors.text};
        font-style: normal;
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
export const MobileQuillStyle = styled.div<{ notice: boolean, public: boolean }>`
    width: 100%;
    height: 100dvh;

    .quill_wrap{
        position: relative;
        height : 100%;
        display: flex;
        flex-direction: column;
    }

    .posting_top{
        position: relative;
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: space-between;

        .notice_btn{
            width: 80px;
            height: 42px;
            position: relative;
            border: none;
            background: ${({ theme }) => theme.colors.background};
            cursor: pointer;
            text-align : center;

            p{
                font-size: 1rem;
                color : ${(props) => (props.notice ? `${props.theme.colors.error}` : `${props.theme.colors.text_tag}`)};
                font-family: var(--font-pretendard-medium);
                white-space: nowrap;
                text-align: center;
            }
        }

        .tag_sel{
            height: 42px;
            margin-top: 0;
            width: 100px;
            outline: none;
            border: none;
            border-radius: 4px;
            padding: 0px 10px;
        }

        .go_main_btn {
            width: 52px;
            height: 42px;
            position: static;
            border: none;
            background: transparent;
        }

        .public_btn{
            width: 42px;
            height: 42px;
            border: none;
            background: ${({ theme }) => theme.colors.background};
            padding: 6px;

            svg{
                width: 100%;
                height : 100%;
            }
        }

        .post_btn{
            border: none;
            background: ${({ theme }) => theme.colors.primary};
            color: #fff;
            width: 80px;
            height: 42px;
            position: static;
        }
    }

    .title_input_wrap{
        width: 100%;
        height: 42px;
        position: relative;
        padding: 0px 15px;
        outline: none;
        border-radius: 4px;
        border-top: 1px solid ${({ theme }) => theme.colors.border};

        .title_input{
            position: relative;
            width: 100%;
            height: 100%;
            outline: none;
            border: none;
            border-radius: 8px;
            caret-color: #999;
            z-index : 1;
            background-color : ${({ theme }) => theme.colors.background};

            &::selection {  
                color: transparent;  
                background-color:${({ theme }) => theme.colors.primary};
            }
        }

        .title_input_value{
            width: 80%;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            padding : 0px 15px

            p{
                width: fit-content;
            }
        }

        .title_limit{
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size : 0.75rem;
        }

        .title_error{
            color : ${({ theme }) => theme.colors.error};
            font-size : 12px;
        }
    }

    .posting_wrap{
        flex: 1;
        display: flex;
        flex-direction: column;

        .ql_content{
            position: relative;
            width: 100%;
            height: 100%;

            .quill {
                height: 100%;
                border-radius : 4px;
            }

            .ql-container{
                height: 100%;
            }  

            .ql-container.ql-snow{
                border : none;
            }
        }

        .custom_toolbar_wrap{
            position: absolute;
            width: 100%;
            bottom: 0px;
            left: 0;

            #custom_toolbar{
                position: relative;
                width: 100%;
                height: 48px;
                border-top: 1px solid ${({ theme }) => theme.colors.border};

                .ql_submit_wrap{
                    display: flex;
                }

                #toolbar{
                    border : none;
                    padding : 0;
                }
            }
        }
        .ql-toolbar.ql-snow{
            border : none;
        }
        .ql-snow.ql-toolbar button, .ql-snow .ql-toolbar button{
            background: none;
            border: none;
            cursor: pointer;
            display: block;
            float: none;
            height: 32px;
            padding: 8px;
            width: 32px;
            margin: 0 auto;
        }
    }

    .ql_style_wrap{
        position: relative;

        .swiper_right{
            position: absolute;
            right: 0;
            top: 0;
              background: linear-gradient(
                90deg,
                rgba(0, 0, 0, 0) 0% 50%,
                ${({ theme }) => theme.colors.background} 55% 100%
            );
            width: 35%;
            height: 100%;
            z-index : 1;

            .text_gauge{
                position: absolute;
                right: 0;
                width: 64px;
                min-height: 100%;
                line-height: 0;
                display: grid;
                align-items: center;
                justify-items: center;

                svg{
                    display: block;
                }
            }
        }
    }
    .swiper{
        width: 90%;
        margin-left: 0;

        .swiper-slide {
            flex: 0 0 auto;
            width: auto;
            height: 100%;
            position: relative;
            transition-property: transform;
            display: flex;
        }
    }
`