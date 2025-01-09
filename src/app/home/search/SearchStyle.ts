/** @jsxImportSource @emotion/react */
"use client";

import styled from "@emotion/styled";

export const SearchBoxWrap = styled.div` 
    position: relative;
    width: 650px;
    margin-left: 500px;
    border-left: 1px solid #ededed;
    border-right: 1px solid #ededed;
    background: #fff;

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
        border-radius: 30px;
        border: 1px solid #ededed;
        padding: 0px 10px 0px 46px;
    }

    .ais_result_wrap{
        border-top: 1px solid #ededed;
        padding: 20px 20px 30px;
    }

    .ais_profile_wrap{
        display: flex;
        line-height: 42px;
    }

    .ais_user_photo{
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 2px solid #ededed;
        margin-right: 8px;
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

        .comment_icon{
            width: 36px;
            height: 36px;
            background: red;
            margin-right: 4px;
        }

        .ais_comment_count{
            font-size: 14px;
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