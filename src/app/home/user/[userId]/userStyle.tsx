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
        padding: 20px;
        background-color: #ffffff00;
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

                .image_list_icon{
                    position: absolute;
                    bottom: 6px;
                    right: 6px;
                    background: red;
                    width: 28px;
                    height: 28px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                }
            }

            .image_post_img:nth-of-type(n+2){
                display:none;
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
        background: #fff;
    }
    // memo_tab & image_tab

    .user_post_top{
        display: flex;
        padding-top: 16px;

        .user_post_photo{
            min-width: 36px;
            height: 36px;
            margin-right: 10px;
            border: 2px solid #ededed;
            border-radius: 50%;
            background-size: cover;
            background-repeat: no-repeat;
        }
        
        .user_post_name{
            display: -webkit-box;
            display: -webkit-flex;
            display: -ms-flexbox;
            display: flex;
            -webkit-flex: 0 0 86.5%;
            -ms-flex: 0 0 86.5%;
            flex: 0 0 86.5%;
            line-height: 36px;
            font-size : 14px;
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
            min-width: 36px;
            height: 36px;

            .post_drop_menu_btn{
            position : relative;
            width: 36px;
            height: 36px;
            border: none;
            border-radius : 50%;
            background-color: #fff;
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
              border: 1px solid #ededed;
              background: #fff;
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
        margin-top: 10px;
        
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
        display: flex;
        width: 100%;
        height: 180px;
        padding: 0px 0px 0px 52px;

        div{
            width: 120px;
            height: 100%;
            background-size: cover;
            background-repeat: no-repeat;
            border-radius: 8px;
            border: 1px solid #ededed;
            margin-right: 12px;
        }
    }
    // user_post_img

    .user_post_bottom{
        display: flex;
        padding: 36px 0px 0px 52px;
        justify-content: space-between;

        .user_post_comment{
            display: flex;
        }
        .post_comment_btn{
            width: 32px;
            height: 32px;
            border : none;
            border-radius : 50%;
            background : #fff;
            cursor : pointer
        }
        .user_post_comment_icon{
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
`