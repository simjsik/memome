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

    .user_post_top{
        display: flex;
        padding-top: 16px;

        .user_post_photo{
            min-width: 36px;
            height: 36px;
            margin-right: 8px;
            border: 2px solid ${({ theme }) => theme.colors.border};
            border-radius: 50%;
            background-size: cover;
            background-repeat: no-repeat;
        }
        
        .user_post_name{
            display: flex;
            line-height: 36px;
            font-size : 0.875rem;
            max-width: fit-content;
            font-family: var(--font-pretendard-bold);
        }

        p{
            margin-right: 4px;
            line-height : inherit;
        }
        
        span{
            display: block;
            font-size : 0.875rem;
            color: ${({ theme }) => theme.colors.text};
            font-family: var(--font-pretendard-light);
            line-height : inherit;
        }


        .post_more{
            position: relative;
            min-width: 36px;
            height: 36px;
            margin-left: auto;
            
            .post_drop_menu_btn{
            position : relative;
            width: 36px;
            height: 36px;
            border: none;
            border-radius : 50%;
            background-color: ${({ theme }) => theme.colors.background};
            cursor: pointer;

            div{
              position: absolute;
              top: 36px;
              width: 100px;
              box-shadow : 0px 0px 10px rgba(0,0,0,0.1);
            }

            li{
              width: 100%;
              height: 42px;
            }

            .post_dlt_btn{
              width: 100%;
              height: 42px;
              border: 1px solid ${({ theme }) => theme.colors.border};
              background: ${({ theme }) => theme.colors.background};
              border-radius: 8px;
              color : red;
            }
              
            button{
              cursor : pointer;
            }
        }
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
                background: ${({ theme }) => theme.colors.background};
                border: none;
                color: ${({ theme }) => theme.colors.error};
                cursor : pointer;
            }
        }
    }
    // user_post_top

    .user_post_title_wrap{
        margin-top: 10px;
        
        .user_post_tag,
        .user_notice_tag{
            font-size : 0.875rem;
            font-family: var(--font-pretendard-light);
        }

        .user_notice_tag{
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

        .user_post_title,
        .user_notice_title{
            margin-top: 8px;
            font-size: 0.9rem;
            font-family: var(--font-pretendard-bold);

            &:hover{
            text-decoration : underline;
            cursor : pointer;
            }
        }

        .user_notice_title{
            width: 100%;
            font-size: 0.9rem;
            margin-top: 8px;
            color: red;
        }
    }
    // user_post_title_wrap

    .user_post_content{
        max-width: 550px;
        height: fit-content;
        margin-top: 10px;
        overflow : hidden;

        img{
            display : none;
        }
        
        p{
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    // user_post_content

    .user_post_img{
        display: flex;
        width: 100%;
        height: 180px;

        >div{
            position: relative;
            width: 100%;
            height: 100%;
            margin-right : 4px;
            border-radius : 8px;
            background-size: cover;
            background-repeat: no-repeat;
            border : 1px solid ${({ theme }) => theme.colors.border};
        }
    }

    .post_pr_more{
        position: absolute;
        bottom: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
    }
    // user_post_img

    .user_post_bottom{
        display: flex;
        justify-content: space-between;

        .user_post_comment{
            display: flex;
        }

        .post_comment_btn{
            width: 32px;
            height: 32px;
            border : none;
            border-radius : 50%;
            background :${({ theme }) => theme.colors.background};
            cursor : pointer
        }

        .post_comment_icon{
            width: 20px;
            height: 20px;
            background-size : cover;
            background-repeat : no-repeat;
            background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449945/%EB%8C%93%EA%B8%80%EC%95%84%EC%9D%B4%EC%BD%98_xbunym.svg);
            margin : 4px 8px 4px 4px;
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