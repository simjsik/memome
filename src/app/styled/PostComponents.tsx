/** @jsxImportSource @emotion/react */
'use client';

import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const PostWrap = styled.div`
// 포스트 리스트 스타일 별 우측이 간소화
position : absolute;
left : clamp(80px, calc(80px + (100vw - 768px) * 0.5), 25%);
display : flex;
flex-wrap : wrap;
width: 600px;
height: fit-content;
min-height: 100%;
padding : 0px;
background : ${({ theme }) => theme.colors.background};
border-radius : 4px;
border : none;
border-left : 1px solid ${({ theme }) => theme.colors.border};
border-right : 1px solid ${({ theme }) => theme.colors.border};
align-content: flex-start;

    // 포스트 박스
    .post_box{
      width : 100%;
      position: relative;
      display : block;
      flex : 1 0 100%;
      background: ${({ theme }) => theme.colors.background};
      padding : 20px;
      border-bottom : 1px solid ${({ theme }) => theme.colors.border};
      cursor : pointer;
    }

    // 포스트 프로필 박스
    .post_profile_wrap{
        display:flex;
        justify-content: space-between;

        .post_drop_menu_btn{
            position : relative;
            width: 36px;
            height: 36px;
            border: none;
            border-radius : 50px;
            background-color:${({ theme }) => theme.colors.background_invisible};
            cursor: pointer;

            div{
              position: absolute;
              top: 36px;
              width: 100px;
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
              color : ${({ theme }) => theme.colors.error};
            }
              
            button{
              cursor : pointer;
            }
        }
    }
      .post_dropdown_wrap{
        height : 36px;
      }

      .user_profile{
        display:flex;
      }

      .user_photo{
        width : 36px;
        min-width: 36px;
        height : 36px;
        min-height : 36px;
        margin-right : 8px;
        border-radius: 50%;
        background-size : cover;
        background-repeat : no-repeat;
        border : 1px solid ${({ theme }) => theme.colors.border};
      }
      
    // 포스트 제목
    .post_title_wrap,
    .post_right_wrap{
      display: flex;
    }

    .post_title_wrap{
      flex: 0 0 60%;
      flex-wrap: wrap;
      padding-left: 0px;
      padding-bottom: 10px;
    }

    .post_right_wrap{
      display:flex;
      flex: 0 0 40%;
    }

      // 포스트 태그
      .post_tag{
        width: 100%;
        margin-right: 4px;
        font-size: 0.875rem;
        line-height: 24px;
        color: ${({ theme }) => theme.colors.text_tag};
      }
    
      // 포스트 제목
      .post_title{
        font-size: 0.9rem;
        border-bottom: none;
        margin-top: 8px;
      }

      .notice_tag{
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

      .notice_title{
        width: 100%;
        font-size: 0.9rem;
        margin-top: 8px;
        color: red;
      }

      // 포스트 내용
      .post_content_wrap{
        padding: 10px 0px 20px 44px;
      }

      // 유저 이름, 포스트 날짜, 포스트 댓글
      .user_name,
      .user_uid,
      .post_date,
      .post_comment {
        font-size : 0.875rem;
        line-height : 36px;
      }

      .post_comment p{
        line-height : 2rem;
      }

      .user_name{
        font-family : var(--font-pretendard-bold);
        min-width : fit-content;
      }

      .user_uid,
      .post_date{
        flex : 0 0 auto;
        font-family : var(--font-pretendard-light);
      }

      .user_name,
      .user_uid{
        margin-right : 4px;
      }

      .user_name:hover{
          text-decoration : underline;
      }

      .post_bottom_wrap{
        display: flex;
        margin-top: 20px;
        margin-left: -6px;
        padding-top: 10px;
        justify-content: space-between;
      }

      .post_comment_btn{
        width: 32px;
        height: 32px;
        border : none;
        border-radius : 50%;
        background : ${({ theme }) => theme.colors.background_invisible};
        padding: 6px;
        cursor : pointer
      }

      .post_comment_icon{
        width: 100%;
        height: 100%;
        background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449945/%EB%8C%93%EA%B8%80%EC%95%84%EC%9D%B4%EC%BD%98_xbunym.svg);
      }

      .post_comment{
        font-family : var(--font-pretendard-medium);
        font-size : 1rem;
        color: ${({ theme }) => theme.colors.text};
        margin-left : 2px;
        display : flex;
        line-height : 32px;
      }

      & .user_id:hover,
      .post_title:hover{
        text-decoration : underline;
        cursor: pointer;
      }

       // 포스트 이미지 있을 때 표시
      .post_img_icon{
        width : 16px;
        height : 16px;
        margin : 11px 4px 0px;
        background-size : cover;
        background-repeat : no-repeat;
      }

      // 포스트 이미지 감추기
      .post_text img{
        display : none;
      }

      // 포스트 내용
      .post_text{
        height: 80px;
        overflow: hidden;

        p{
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      // 포스트 이미지 미리보기
      .post_pr_img_wrap{
        display: flex;
        height: 180px;
        justify-content: flex-start;
      }

      .post_pr_img{
        position : relative;
        width: 100%;
        height: 100%;
        margin-right : 4px;
        border-radius : 8px;
        background-size: cover;
        background-repeat: no-repeat;
        border : 1px solid ${({ theme }) => theme.colors.border};

        .post_pr_more{
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
        }
      }

      .post_pr_img:last-child{
        margin-right : 0;
      }

      // 포스트 Swiper Style

      .swiper{
      width: 100%;
      margin: 0;
      z-index: 0;
      }

      .swiper-pagination{
      display : none;
      }

      // 페이지네이션
      .pagination_btn_wrap{
      position: relative;
      display: flex;
      justify-content: space-evenly;
      width: fit-content;
      height: 24px;
      margin: 0 auto;
      border-right : 1px solid ${({ theme }) => theme.colors.border};
      border-left : 1px solid ${({ theme }) => theme.colors.border};

        button{
        display: block;
        width: 24px;
        margin-right : 4px;
        border: none;
        background: ${({ theme }) => theme.colors.background_invisible};
        cursor:pointer;
        }

        button:last-child{
        margin : 0;
        }
      }

    .all_post{
        width : 100%;
        height: 60px;
        line-height: 60px;
        padding: 0px 16px;
        border-bottom: 1px solid ${({ theme }) => theme.colors.border};
        text-align: center;
    }

    .retry_post_btn{
      width: fit-content;
      margin: 0 auto;
      margin-top : 10px;
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      background: ${({ theme }) => theme.colors.primary};
      color: #fff;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      font-size : 0.875rem;
    }
//----------------------------------------------------
  @media (max-width: 480px) {
    overflow-y: scroll;
    left: 0px;
    width: 100%;
    height: calc(100% - 82px);
    max-width: none;
    min-height: auto;

    .post_drop_menu_btn{
            position : relative;
            width: 36px;
            height: 36px;
            border: none;
            border-radius : 50px;
            background-color: ${({ theme }) => theme.colors.background};
            cursor: pointer;

            div{
              position: absolute;
              top: 36px;
              right: 0;
              width: 100px;
            }
    }
  }

  @media (min-width : 481px) and (max-width: 768px) {
    left: 80px;
    width: calc(100% - 80px);
    max-width: 600px;
  }

  @media (min-width: 1200px) and (max-width : 1920px) {
    left : clamp(80px, calc(80px + (100vw - 1200px) * 0.53), 50vw);
  }

  @media (min-width: 1921px) {
    border-right : 2px solid ${({ theme }) => theme.colors.border};
    border-left : 2px solid ${({ theme }) => theme.colors.border};
    width: clamp(600px, calc(600px + (100vw - 1920px) * 0.3125), 800px);
    
    .post_pr_img_wrap{
      height: clamp(180px, calc(180px + (100vw - 1920px) * 0.3125), 380px);
    }

    .post_tag{
      line-height: 36px;
    }

    .post_dropdown_wrap{
      width : 42px;
      height : 42px;
    }

    .post_profile_wrap .post_drop_menu_btn{
      width : 42px;
      height : 42px;
    }

    .post_text{
      height: 100px;
    }

    .user_photo {
      width: 42px;
      height: 42px;
    }

    .user_name,
    .user_uid,
    .post_date{
       line-height : 1rem;
    }

    .post_content_wrap{
        padding: 0px 0px 10px 50px;
    }
    
    .post_comment{
        line-height: clamp(32px, calc(32px + (100vw - 1921px) * 0.0125195618153365), 40px);
    }
  
    .post_comment_btn{
        width: clamp(32px, calc(32px + (100vw - 1921px) * 0.0125195618153365), 40px);
        height: clamp(32px, calc(32px + (100vw - 1921px) * 0.0125195618153365), 40px);
    }

    .all_post{
        height: 68px;
        line-height: 68px;
        padding: 0px 20px;
        border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    }
  }

  @media (min-width: 2560px) {
    width: clamp(800px, calc(800px + (100vw - 2560px) * 0.3125), 1200px);
    
    .post_box{
      padding: 24px;
    }

    .post_pr_img_wrap{
      height: clamp(380px, calc(380px + (100vw - 2560px) * 0.3125), 780px);
    }
    
    .post_tag{
      line-height: 52px;
    }

    .post_dropdown_wrap{
      width : 52px;
      height : 52px;
    }

    .post_profile_wrap .post_drop_menu_btn{
      width : 52px;
      height : 52px;
    }

    .post_text{
      height: 120px;
    }

    .user_photo {
      width: 52px;
      height: 52px;
      margin-right: 12px;
    }

    .user_name,
    .user_uid,
    .post_date{
      line-height : 52px;
    }

    .user_name,
    .user_uid{
      margin-right: 6px;
    }

    .post_content_wrap{
      padding: 0px 0px 12px 62px;
    }

    .post_comment{
      line-height: clamp(40px, calc(40px + (100vw - 2560px) * 0.0125), 56px);
    }
  
    .post_comment_btn{
      width: clamp(40px, calc(40px + (100vw - 2560px) * 0.0125), 56px);
      height: clamp(40px, calc(40px + (100vw - 2560px) * 0.0125), 56px);
    }

    .all_post{
        height: 84px;
        line-height: 84px;
        padding: 0px 24px;
    }
  }

  @media (min-width: 3840px) {
    border-right : 3px solid ${({ theme }) => theme.colors.border};
    border-left : 3px solid ${({ theme }) => theme.colors.border};
    width: clamp(1200px, calc(1200px + (100vw - 3840px) * 0.3125), 1600px);

    .post_box{
      padding: 32px;
      border-bottom: 3px solid ${({ theme }) => theme.colors.border};
    }
    .post_pr_img_wrap{
      height: clamp(780px, calc(780px + (100vw - 3840px) * 0.3125), 1000px);
    }
    
    .post_tag{
      line-height: 64px;
    }

    .post_dropdown_wrap{
      width : 68px;
      height : 68px;
    }

    .post_profile_wrap .post_drop_menu_btn{
      width : 68px;
      height : 68px;
    }

    .post_text{
      height: 160px;
    }

    .user_photo {
      width: 68px;
      height: 68px;
      margin-right: 16px;
    }

    .user_name,
    .user_uid,
    .post_date{
     line-height : 68px;
    }

    .user_name,
    .user_uid{
      margin-right: 8px;
    }

    .post_content_wrap{
      padding: 0px 0px 16px 80px;
    }

    .post_comment{
      line-height: clamp(56px, calc(56px + (100vw - 3840px) * 0.0125), 72px);
    }
  
    .post_comment_btn{
      width: clamp(56px, calc(56px + (100vw - 3840px) * 0.0125), 72px);
      height: clamp(56px, calc(56px + (100vw - 3840px) * 0.0125), 72px);
    }

    .all_post{
      height: 100px;
      line-height: 100px;
      padding: 0px 28px;
    }
  }

  @media (min-width: 5120px) {
    post_box{
      padding: 40px;
    }

    .user_photo {
      width: 84px;
      height: 84px;
      margin-right: 20px;
    }

    .post_dropdown_wrap{
      width : 84px;
      height : 84px;
    }

    .post_profile_wrap .post_drop_menu_btn{
      width : 84px;
      height : 84px;
    }

    .user_name,
    .user_uid,
    .post_date{
      line-height : 84px;
    }

    .user_name,
    .user_uid{
      margin-right: 10px;
    }

    .post_content_wrap{
      padding: 0px 0px 20px 106px;
    }

    .post_text{
      height: 220px;
    }

    .post_comment{
      line-height: clamp(72px, calc(72px + (100vw - 5120px) * 0.0125), 88px);
    }
  
    .post_comment_btn{
      width: clamp(72px, calc(72px + (100vw - 5120px) * 0.0125), 88px);
      height: clamp(72px, calc(72px + (100vw - 5120px) * 0.0125), 88px);
    }
  }
`
export const TitleHeader = styled.div`
width: 100%;
background: ${({ theme }) => theme.colors.background};

    .title_wrap{
      display: flex;
      justify-content: space-between;
    }   

    .notice_post {
      display:block;
      margin-left : 10px;
      flex: 1 0 100%;
      line-height : 48px;
      font-size: 1.25rem;
      font-family: var(--font-pretendard-bold);
    }

    .all_post{
      display:block;
      margin-left : 10px;
      flex: 1 0 80%;
      line-height : 48px;
      font-size: 1.25rem;
      font-family: var(--font-pretendard-bold);
    }

    .post_header{
    display:flex;
    margin-top: 20px;
    padding : 0px;
    line-height : 48px;
    border-top : 1px solid ${({ theme }) => theme.colors.border};
    border-bottom : 1px solid ${({ theme }) => theme.colors.border};

    .h_title,
    .h_user,
    .h_date{
    font-family: var(--font-pretendard-bold);
    font-size : 0.875rem;
    }

    .h_title{
    flex : 0 0 60%;
    text-align : center;
    }
    .h_user,
    .h_date{
    flex : 0 0 20%;
    }

    }
    
`
export const PostListStyle = styled.div`
display : flex;
width : 100%;
line-height : 40px;
border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  .bookmark_title_wrap{
    flex: 0 0 60%;
    display : flex;
  }

  .bookmark_sel_btn{
    width : 15px;
    height : 15px;
    margin: 13px 12px 0px 6px;
  }

  .post_tag{
    color : ${({ theme }) => theme.colors.text_tag};
    margin-right : 4px;
    font-size: 0.875rem;
    font-family : var(--font-pretendard-light);
  }

  .post_title {
    margin-right : 4px;
    font-size : 0.875rem;
  }

  & .post_title:hover{
    text-decoration : underline;
    cursor:pointer;
  }

  .post_comment{
    font-size : 0.875rem;
  }

  .post_user{
    flex: 0 0 20%;
    display : block;
    text-overflow: ellipsis;
    overflow : hidden;
    white-space : nowrap;
    color : ${({ theme }) => theme.colors.text_tag};
    font-family : var(--font-pretendard-light);
    font-size : 0.875rem;
  }

  .post_date{
    flex: 0 0 16%;
    font-size : 0.875rem;
  }

  .bookmark_delete_btn{
    width : 18px;
    height : 18px;
    margin-top: 10px;
    background : ${({ theme }) => theme.colors.error};
    border: none;
  }
`
export const PostCommentStyle = styled.div`
width: 100%;

  .memo_comment_wrap{
    border-bottom : 1px solid${({ theme }) => theme.colors.border};
    margin-top: 10px;
    padding: 0px 0px 20px 40px;
  }
  .user_profile{
    position: relative;
    left: -40px;
    display: flex;
  }

  .user_profile p{
    line-height : 32px;
  }

  .memo_comment_user{
    font-size : 0.875rem;
    font-family : var(--font-pretendard-bold);
  }

  .memo_comment_uid {
    font-family: var(--font-pretendard-light);
    font-size: 0.875rem;
    margin-left: 4px;
  }

  .user_photo,
  .reply_user_photo{
    width : 32px;
    height: 32px;
    margin-right : 8px;
    background-size : cover;
    background-repeat : no-repeat;
    border-radius : 50%;
  }

  .reply_user_photo{
    width : 24px;
    height: 24px;
  }

  // 댓글
  .memo_comment{
    margin-top : 8px;
  }

  .reply_toggle_btn,
  .reply_more_btn{
      font-family: var(--font-pretendard-medium);
      color: ${({ theme }) => theme.colors.primary};
      cursor : pointer;
      border: none;
      background: none;
  }

  .reply_toggle_btn{
      font-size: 0.875rem;
      margin-left: 12px;
  }

  .reply_more_btn{
      width: calc(100% - 16px);
      height: 42px;
      font-size: 1rem;
  }
  .reply_wrap{
    margin-top : 8px;
    padding-left : 32px;
    
    .user_profile{
      left : -32px;
    }

    .memo_comment_user,
    .memo_comment_uid{
      line-height: 24px;
    }
  }

  .memo_reply{
    margin-top : 4px;
    font-size : 0.875rem;
  }

  .memo_reply_uid{
    display: block;
    width: fit-content;
    margin-top: 8px;
    font-size : 0.875rem;
    color: ${({ theme }) => theme.colors.primary};
    background-color: #c8fffd;
  }

  .memo_comment_date{
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text_tag};
    margin-top: 10px;
  }

  .comment_reply_btn{
    width: 60px;
    height: 32px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: #fff;
    margin: 8px 0px;
    cursor : pointer;
  }

  .comment_delete_btn{
    position: absolute;
    right: -20px;
    width: 32px;
    height: 32px;
    padding : 4px;
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    cursor : pointer;

    .comment_delete_icon{
      width: 100%;
      height: 100%;
    }
  }

  .comment_input{
    outline: none;
    border: none;
    padding: 10px;
    font-family: var(--font-pretendard-medium);
  }

  .reply_input_wrap{
  position: relative;

  .comment_upload_btn{
    width : 68px;
    height : 48px;
    border  : 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.background};
    cursor : pointer;
  }

  .comment_input{
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
    min-width : calc(100% - 20px);
    max-height : 220px;
    min-height : 56px;
    outline: none;
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 10px;
    font-family: var(--font-pretendard-medium);
  }
}

@media (max-width : 480px){
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100% - 100px);
    overflow-y: scroll;
}
`
export const PostCommentInputStyle = styled.div`
position : relative;
width: 100%;
height: 190px;
margin-top : 10px;
padding : 12px;
border : 1px solid ${({ theme }) => theme.colors.border};

// 로그인 유저 프로필 박스
.login_user_profile{
display:flex;
}

// 로그인 유저 프로필
.login_user_photo{
width : 24px;
height : 24px;
margin-right : 4px;
border-radius : 50%;
background-repeat : no-repeat;
background-size : cover;
}

// 로그인 유저 아이디
.login_user_id{
font-size : 0.875rem;
line-height : 24px;
}

  .comment_input{
    max-width: 100%;
    min-width: 100%;
    max-height: 68px;
    min-height: 68px;
    margin-top: 4px;
    padding: 8px 4px;
    border-radius: 4px;
    border: none;
  }

  .comment_upload_btn{
    position : absolute;
    right : 10px;
    bottom : 10px;
    width : 68px;
    height : 48px;
    margin-top : 10px;
    border  : 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.background_invisible};
    cursor : pointer;
  }
`
export const BookmarkWrap = styled.div`
    width: 600px;
    margin-left: 500px;
    border-left: 1px solid ${({ theme }) => theme.colors.border};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
`
export const NoMorePost = styled.div`
    width: 100%;
    height: 240px;
    padding: 40px;
    text-align: center;

    .no_more_icon{
      width: 160px;
      height: 108px;
      background-size: cover;
      background-repeat: no-repeat;
      margin: 0 auto;
    }

    p{
      font-size: 1.25rem;
    }

    span{
      display : block;
      color: ${({ theme }) => theme.colors.text_tag};
      font-size: 0.875rem;
      margin-top : 4px;
    }
`
export const NewPostBtn = styled(motion.button)`
    position: fixed;
    left: 730px;
    top: 20px;
    z-index: 1;
    padding: 12px 10px;
    border-radius: 8px;
    border: none;
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;

    .retry_post_btn{
      position: static;
    }
`
export const MyAlarmWrap = styled.div`
    margin-top: 32px;
    .swiper-wrapper{
      display : flex;
    }
    .my_alarm{
      width: 120px;
      padding: 10px;
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: 8px;
    }

    h2{
      font-size: 0.875rem;
    }

    .alarm_title{
      margin-top: 16px;
    }

    .alram_date{
      margin-top: 4px;
      font-size: 0.875rem;
    }

    button{
      width: 100%;
      height: 32px;
      margin-top: 4px;
      border: none;
      background: ${({ theme }) => theme.colors.primary};
      border-radius: 4px;
      color: #fff;
      cursor : pointer;
    }
`