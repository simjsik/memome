/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";

export const PostDetailWrap = styled.div`
position : absolute;
left : 420px;
width : 860px;
height : fit-content;
min-height : 100vh;
padding : 20px;
background : ${({ theme }) => theme.colors.background};
border-left : 1px solid ${({ theme }) => theme.colors.border};
border-right : 1px solid ${({ theme }) => theme.colors.border};

// 기본

.post_title_wrap{
    display : flex;
    justify-content: space-between;
    margin-top :12px;
    padding-bottom : 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
}

.ql-code-block-container{
    font-family: monospace;
    background: #1e1e1e;
    padding: 1rem;
    color: #fff;
    border-radius: 4px;
    font-size: 0.875rem;
}

.ql-editor{
    font-size : 1rem;
}

.post_category{
    font-size : 0.875rem;
    color: ${({ theme }) => theme.colors.text_tag};
}

.notice{
          width: fit-content;
          display: block;
          padding: 4px 6px;
          border: 1px solid #ffc6c9;
          background-color: #ffe3e4;
          color: #ff4e59;
          font-size: 0.875rem;
          line-height: normal;
          border-radius: 4px;
}

.post_title{
    font-size : 1.25rem;
    line-height : 32px;
    font-family : var(--font-pretendard-bold);
}

.user_id{
    display : flex;
}

.user_profile {
    width : 32px;
    height : 32px;
    margin-right : 8px;
    border-radius : 50%;
    background-size: cover;
    background-repeat: no-repeat;
}

.user_id p,
.user_id span,{
font-size : 0.75rem;
line-height : 32px;
}

.user_id>span{
    margin-left : 4px;
    font-family: var(--font-pretendard-light);
    color: ${({ theme }) => theme.colors.text_tag};
}

.post_content_wrap{
    margin-top : 40px;
    padding-bottom : 200px;
    height : fit-content;
}

img {
    max-width: 100%;
    object-fit : cover;
}

.post_menu_wrap{
    height : 32px;
    display : flex;
    justify-content : space-between;
}

.comment_toggle_btn{
    width : 60px;
    height : 32px;
    border : 1px solid ${({ theme }) => theme.colors.border};
    background : none;
}

.comment_dlt_btn{
    width: 24px;
    height : 24px;
    background : red;
}

    @media (max-width: 480px) {
        left: 0;
        width: 100%;
        height: calc(100% - 82px);
        min-height: auto;
        padding: 20px;
        overflow-y : scroll;

        .post_title_wrap{
            flex-direction: column;
        }

        .user_id{
            margin-top: 12px;
        }
    }

    @media (min-width: 481px) and (max-width: 767px) {
        left: 80px;
        width: calc(100% - 80px);
    }
        
    @media (min-width: 768px) and (max-width : 1920px) {
        width: clamp(calc(700px - 80px), calc(600px + (100vw - 1200px) * 0.3125), 860px);
        left : clamp(80px, calc(80px + (100vw - 1200px) * 0.53), 21.875vw);
    }

    @media (min-width: 1921px) {
        width: clamp(860px, calc(860px + (100vw - 1920px) * 0.21875), 1000px);
        
        .post_title_wrap{
            margin-top: 18px;
            padding-bottom: 16px;
        }
    }
    @media (min-width: 2560px) {
        border-left : 2px solid ${({ theme }) => theme.colors.border};
        border-right : 2px solid ${({ theme }) => theme.colors.border};
        width: clamp(1000px, calc(1000px + (100vw - 2560px) * 0.375), 1480px);
        padding : 40px;

        .post_title_wrap{
            margin-top: 32px;
            padding-bottom: 24px;
            border-bottom : 2px solid ${({ theme }) => theme.colors.border};
        }
    }
    @media (min-width: 3840px) {
        border-left : 3px solid ${({ theme }) => theme.colors.border};
        border-right : 3px solid ${({ theme }) => theme.colors.border};
        width: clamp(1480px, calc(1480px + (100vw - 3840px) * 0.375), 1960px);

        .post_title_wrap{
            margin-top: 48px;
            padding-bottom: 36px;
            border-bottom : 3px solid ${({ theme }) => theme.colors.border};
        }
    }
    @media (min-width: 5120px) {
        width: clamp(1960px, calc(1960px + (100vw - 5120px) * 0.375), 2440px);

        .post_title_wrap{
            margin-top: 56px;
            padding-bottom: 48px;
        }
    }
`