/** @jsxImportSource @emotion/react */
"use client";

import styled from "@emotion/styled";

export const SearchBoxWrap = styled.div` 
    position: relative;
    width: 100%;
    min-height: 100vh;

    .ais-SearchBox{
        padding: 20px;
    }

    .ais-SearchBox-form{
        position: relative;
        width: 100%;
        height: 42px;

        .ais-SearchBox-submit{
            width: 42px;
            height: 42px;
            position: absolute;
            left: 0;
            border: none;
            background: none;

            svg{
                width: 24px;
                height: 16px;
            }
        }
            
        .ais-SearchBox-reset{
            position: absolute;
            top: 7px;
            right: 10px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 50%;
            background-color : #272D2D;

            svg {
                    fill: #fff;
                    stroke: #fff;
            }
        }
    }

    .ais-SearchBox-input{
        width: 100%;
        height: 100%;
        border-radius: 8px;
        border: 1px solid #ededed;
        padding: 0px 10px 0px 46px;

        &:focus {
        outline : 1px solid #191919;
        }
    }

    .ais_result_wrap{
        border-top: 1px solid #ededed;
        padding: 20px 20px 30px;
    }

    .ais_profile_wrap{
        display: flex;
        line-height: 36px;
    }

    .ais_user_photo{
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid #ededed;
        margin-right: 8px;
        background-size : cover;
        background-repeat : no-repeat;
    }

    .ais_user_name{
        margin-right : 4px;
    }
    .ais_user_name:hover{
        text-decoration : underline;
    }
    .ais_user_uid{
        font-family : var(--font-pretendard-light);
        font-size : 14px;
    }

    .ais_post_content_wrap{
        padding: 0px 0px 0px 52px;
        margin-top: 10px;

        img{
            display:none;
        }

        .ais_post_content{
            height: 80px;
            overflow: hidden;
            margin-top: 10px;
        }

        .ais_post_image_wrap{
            display: flex;
        }

        .ais_post_images{
            width: 120px;
            height: 180px;
            border-radius: 8px;
            background-size: cover;
            background-repeat: no-repeat;
        }
    }

    .ais_post_tag{
        font-size: 14px;
        font-family: var(--font-pretendard-light);
    }

    .ais_post_title{
        font-size: 16px;
        margin-top: 8px;
    }

    .ais_post_comment_wrap{
        display: flex;
        margin-top: 16px;
        line-height: 36px;
        justify-content: space-between;

      .post_comment_btn{
        width: 32px;
        height: 32px;
        border : none;
        border-radius : 50%;
        background : #ffffff00;
        padding: 6px;
        cursor : pointer;
    }
        
      .post_comment_icon{
        width: 100%;
        height: 100%;
        background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449945/%EB%8C%93%EA%B8%80%EC%95%84%EC%9D%B4%EC%BD%98_xbunym.svg);
      }

        .post_comment{
            font-family : var(--font-pretendard-medium);
            font-size : 14px;
            color: #191919;
            margin-left : 0px;
            display : flex;
            line-height : 32px;
        }
    }

    .ais-InfiniteHits-loadPrevious{
        display : none;
    }

    .ais-InfiniteHits-loadMore{
        width: 100%;
        height: 52px;
        border: none;
        border-top: 1px solid #ededed;
        background: #fff;
        cursor:pointer
    }
`