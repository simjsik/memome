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
            position: absolute;
            left: 0;
            border: none;
            background: none;
            width: 42px;
            height: 42px;
            padding: 14px;

            svg{
                width: 100%;
                height: 100%;
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
            background-color : ${({ theme }) => theme.colors.text};

            svg {
                fill: ${({ theme }) => theme.colors.inverted_text};
                stroke: ${({ theme }) => theme.colors.inverted_text};
            }
        }
    }

    .ais-SearchBox-input{
        width: 100%;
        height: 100%;
        border-radius: 8px;
        border: 1px solid ${({ theme }) => theme.colors.border};
        padding: 0px 10px 0px 46px;
        font-size : 0.75em;

        &:focus {
        outline : 1px solid ${({ theme }) => theme.colors.text};
        }
    }

    .ais_result_wrap{
        border-top: 1px solid ${({ theme }) => theme.colors.border};
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
        border: 2px solid ${({ theme }) => theme.colors.border};
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
        font-weight : 400;
        font-size : 0.875rem;
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
        font-size: 0.875rem;
        font-weight : 400;
    }

    .ais_post_title{
        font-size: 1rem;
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
        background : ${({ theme }) => theme.colors.background_invisible};
        padding: 6px;
        cursor : pointer;
    }
        
      .post_comment_icon{
        width: 100%;
        height: 100%;
        background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449945/%EB%8C%93%EA%B8%80%EC%95%84%EC%9D%B4%EC%BD%98_xbunym.svg);
      }

        .post_comment{
            font-size : 0.875rem;
            color: ${({ theme }) => theme.colors.text};
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
        border-top: 1px solid ${({ theme }) => theme.colors.border};
        background: ${({ theme }) => theme.colors.background};
        cursor:pointer
    }

    .ais-SearchBox-loadingIndicator{
        display : none;
    }
        
    @media (min-width: 2560px) {
        .ais-SearchBox-form{
            height: 56px;

            .ais-SearchBox-input{
                padding: 0px 10px 0px 56px;
                border: 2px solid ${({ theme }) => theme.colors.border};
            }

            .ais-SearchBox-submit{
                width: 56px;
                height: 56px;
                padding: 18px;
            }
                
            .ais-SearchBox-reset{
                top: 10px;
                right: 10px;
                width: 36px;
                height: 36px;
                
                .ais-SearchBox-resetIcon{
                    width : 12px;
                    height : 12px;
                }
            }
        }
    }

    @media (min-width: 3840px) {
        .ais-SearchBox-form{
            height: 76px;

            .ais-SearchBox-input{
                padding: 0px 10px 0px 86px;
                border: 3px solid ${({ theme }) => theme.colors.border};
            }

            .ais-SearchBox-submit{
                width: 76px;
                height: 76px;
                padding: 24px;
            }
                    
            .ais-SearchBox-reset{
                top: 13px;
                right: 13px;
                width: 48px;
                height: 48px;

                .ais-SearchBox-resetIcon{
                    width : 14px;
                    height : 14px;
                }
            }
        }
    }

    @media (min-width: 5120px) {
        .ais-SearchBox-form{
            height: 92px;

            .ais-SearchBox-input{
                padding: 0px 10px 0px 92px;
                border: 3px solid ${({ theme }) => theme.colors.border};
            }

            .ais-SearchBox-submit{
                width: 92px;
                height: 92px;
                padding: 28px;
            }
                    
            .ais-SearchBox-reset{
                top: 15px;
                right: 15px;
                width: 62px;
                height: 62px;

                .ais-SearchBox-resetIcon{
                    width : 20px;
                    height : 20px;
                }
            }
        }
    }
`