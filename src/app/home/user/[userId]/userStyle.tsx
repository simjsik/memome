/** @jsxImportSource @emotion/react */
"use client";

import styled from "@emotion/styled"

export const UserPostWrap = styled.div`
    margin-top: 16px;
    
    .user_tab_wrap{
        display: flex;
        width: 100%;
        height: 42px;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    }
    // user_tab_wrap

    .user_post_list_wrap{
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
        padding: 20px;
        background-color: ${({ theme }) => theme.colors.background_invisible};
        cursor:pointer;

        .user_post_content_wrap{
            padding: 10px 0px 20px 44px;
        }
    }
    // user_post_list_wrap

    .user_image_post_wrap{
        display: flex;
        flex-wrap: wrap;

        .user_image_wrap{
            position: relative;
            flex: 0 0 calc(100% / 3);
            aspect-ratio: 1 / 1.3;
            background-size: cover;
            background-repeat: no-repeat;

            .image_post_img{
                background-size: cover;
                background-repeat: no-repeat;
                width: 100%;
                height : 100%;
            }

            .image_list_icon{
                position: absolute;
                top: 6px;
                right: 6px;
                width: 28px;
                height: 28px;
            }

            &:hover{
                cursor:pointer;
            }
        }

        .user_image_wrap:nth-of-type(3n){
            margin-right :0px;
        }
        .user_image_wrap:nth-of-type(n + 4){
            margin-top : 4px
        }
    }
    // user_image_post_wrap

    .memo_tab,
    .image_tab{
        flex: 0 0 50%;
        border: none;
        background: ${({ theme }) => theme.colors.background};
        font-size : 0.75rem;
    }
    // memo_tab & image_tab


    @media (min-width: 1921px) {
        .user_tab_wrap {
            height: 52px;
            border-bottom: 1px solid ${({ theme }) => theme.colors.border};
        }
    }

    @media (min-width: 2560px) {
        .user_tab_wrap {
            height: 60px;
            border-bottom: 2px solid ${({ theme }) => theme.colors.border};
        }
    }

    @media (min-width: 3840px) {
        .user_tab_wrap {
            height: 64px;
            border-bottom: 3px solid ${({ theme }) => theme.colors.border};
        }
    }
        
    @media (min-width: 5120px) {
        .user_tab_wrap {
            height: 68px;
        }
    }
`