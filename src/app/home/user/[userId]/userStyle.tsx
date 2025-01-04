/** @jsxImportSource @emotion/react */
"use client";

import styled from "@emotion/styled"

export const UserPostWrap = styled.div`
    margin-top: 16px;
    
    .user_tab_wrap{
        display: flex;
        width: 100%;
        height: 42px;
        border-bottom: 1px solid #ededed;
    }
    // user_tab_wrap

    .user_post_list_wrap{
        border-bottom: 1px solid #ededed;
        padding-bottom: 20px;
    }
    // user_post_list_wrap

    .memo_tab,
    .image_tab{
        flex: 0 0 50%;
        border: none;
        background: #fff;
    }
    // memo_tab & image_tab

    .user_post_top{
        display: flex;
        padding-top: 16px;

        .user_post_photo{
            width: 42px;
            height: 42px;
            margin-right: 10px;
            border: 2px solid #ededed;
            border-radius: 50%;
            background-size: cover;
            background-repeat: no-repeat;
        }
        
        .user_post_name{
            display: flex;
            flex: 0 0 86.5%;
            line-height: 48px;
            font-family: var(--font-pretendard-bold);
        }

        p{
            margin-right: 4px;
        }
        
        span{
            display: block;
            font-size: 14px;
            color: #272D2D;
            font-family: var(--font-pretendard-light);
        }

        .post_more{
            position: relative;
            width: 36px;
            height: 36px;
            margin-top: 6px;
        }

        .post_more_btn{
            width: 100%;
            height: 100%;
            background: red;
            border: none;
        }

        .post_more_list{
            position: absolute;
            width: 100px;
            height: 36px;
            box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
            top: -36px;
            border-radius: 8px;
            overflow: hidden;

            .post_delete_btn{
                width: 100%;
                height: 100%;
                background: #fff;
                border: none;
                color: #dd1717;
                cursor : pointer;
            }
        }
    }
    // user_post_top

    .user_post_title_wrap{
        padding-left: 52px;

        .user_post_tag{
            font-size: 14px;
            font-family: var(--font-pretendard-light);
        }

        .user_post_title{
            margin-top: 4px;
            font-size: 18px;

            &:hover{
            text-decoration : underline;
            cursor : pointer;
            }
        }
    }
    // user_post_title_wrap

    .user_post_content{
        max-width: 550px;
        height: 80px;
        margin-top: 10px;
        padding-left: 52px;
        overflow : hidden;

        img{
        display : none;
        }
    }
    // user_post_content

    .user_post_img{
        width: 100%;
        height: 180px;
        padding-left : 52px;

        div{
            width: 130px;
            height: 100%;
            background-size: cover;
            background-repeat: no-repeat;
            border-radius : 8px;
        }
    }
    // user_post_img

    .user_post_bottom{
        display: flex;
        padding: 36px 36px 0px 52px;
        justify-content: space-between;

        .user_post_comment{
            display: flex;
        }

        .user_post_comment_icon{
            width: 32px;
            height: 32px;
            background: red;
            margin-right: 4px;
            cursor: pointer;
        }

        p{
            line-height: 32px;
        }

        .user_post_bookmark{
            width: 32px;
            height: 32px;
            margin-right: 4px;
            border : none;
            background: red;
            cursor: pointer;
        }
    }
    //user_post_bottom
`