/** @jsxImportSource @emotion/react */
'use client';

import styled from "@emotion/styled";

export const PostWrap = styled.div`
// 포스트 리스트 스타일 별 우측이 간소화
position : absolute;
left : 500px;
display : flex;
flex-wrap : wrap;
width:  600px;
padding : 0px;
background : #fff;
border-radius : 4px;
border : none;
border-left : 1px solid #ededed;
border-right : 1px solid #ededed;

    // 포스트 박스
    .post_box{
      position: relative;
      display : block;
      flex : 1 0 100%;
      background: #fff;
      padding : 20px;
      border-bottom : 1px solid #ededed;
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
            background-color: transparent;
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

      .user_profile{
        display:flex;
      }

      .user_photo{
        width : 36px;
        height : 36px;
        margin-right : 8px;
        border-radius: 50%;
        background-size : cover;
        background-repeat : no-repeat;
        border : 1px solid #ededed;
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
        font-size: 14px;
        line-height: 24px;
        color: #555;
      }
    
      // 포스트 제목
      .post_title{
        font-size: 16px;
        border-bottom: none;
        margin-top: 8px;
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
      font-size : 14px;
      line-height : 36px;
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
        border-radius : 4px;
        background : #fff;
        cursor : pointer
      }

      .post_comment_icon{
        width: 20px;
        height: 20px;
        background-image : url(https://res.cloudinary.com/dsi4qpkoa/image/upload/v1736449945/%EB%8C%93%EA%B8%80%EC%95%84%EC%9D%B4%EC%BD%98_xbunym.svg);
        margin : 4px 8px 4px 4px;
      }

      .post_comment{
        font-family : var(--font-pretendard-medium);
        font-size : 16px;
        color: #191919;
        margin-left : 0px;
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
      }
      .post_text p:nth-of-type(n+5){
        display : none
      }

      // 포스트 이미지 미리보기
      .post_pr_img_wrap{
        display: flex;
        height: 180px;
        justify-content: space-between;
      }

      .post_pr_img{
        width: 120px;
        height: 100%;
        border-radius : 8px;
        background-size: cover;
        background-repeat: no-repeat;
        border : 1px solid #ededed;
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
      border-right : 1px solid #ededed;
      border-left : 1px solid #ededed;

        button{
        display: block;
        width: 24px;
        margin-right : 4px;
        border: none;
        background: none;
        cursor:pointer;
        }

        button:last-child{
        margin : 0;
        }
      }

      // 공지사항 숨기기 버튼
      .hide_notice_wrap{

        label{
        display : flex;
        width : fit-content;
        }

        span {
        display: inline-block;
        width: 16px;
        height: 16px;
        margin: 16px 4px 0px;
        border: 1px solid #ccc; /* 기본 테두리 */
        border-radius: 2px; /* 테두리 둥글게 */
        background-color: white;
        position: relative;
        cursor:pointer;
        }

        input[type="checkbox"] {
        appearance: none;
        display: none; /* 화면에 표시되지 않도록 숨김 */
        }

        input[type="checkbox"]:checked + span {
          border-color: #ccc; /* 체크 시 테두리 색 */
          background-color: none; /* 체크 시 배경색 */
        }

        /* 체크 아이콘 추가 */
        input[type="checkbox"]:checked + span::before {
          content: "✔"; /* 체크 아이콘 (Unicode) */
          color: #ff0010;
          font-size: 12px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%); /* 중앙 정렬 */
        }
          
        .hide_text{
            line-height: 48px;
        }
      }
//----------------------------------------------------
`
export const NoticeWrap = styled.div`
    position: absolute;
    left: 500px;
    display: flex;
    flex-wrap: wrap;
    width: 600px;
    padding: 0px;
    background: #fff;
    border-radius: 4px;
    border: none;
    border-left: 1px solid #ededed;
    border-right: 1px solid #ededed;

    .post_box{
        width: 100%;
        border-bottom: 1px solid #ededed;
        padding: 20px;
    }

    .post_profile{
        display: flex;
    }

    .user_profile{
        width: 36px;
        height: 36px;
        margin-right: 8px;
        border-radius: 50%;
        border: 2px solid #ededed;
        background-size: cover;
        background-repeat: no-repeat;
    }

    .user_name,
    .user_uid,
    .post_date{
        font-size : 14px;
    }
    
    .user_name,
    .user_uid{
        line-height: 36px;
        margin-right: 4px;
    }
    .user_uid,
    .post_date{
        font-family : var(--font-pretendard-light);
        line-height: 36px;
    }

    .post_title_wrap{
        margin-top: 10px;
    }

    .post_tag{
        width: fit-content;
        display: block;
        padding: 4px 6px;
        border: 1px solid #ffc6c9;
        background-color: #ffe3e4;
        color: #ff4e59;
        font-size: 14px;
        font-family: '__PretendardBold_73a78b';
        border-radius: 4px;
    }

    .post_title{
        font-size: 16px;
        margin-top: 8px;
        font-family: '__PretendardMedium_979b24';
        color: red;
    }

    .post_bottom_wrap{
        margin-top: 16px;
        margin-left: -10px;
    }

    .post_content_wrap{
        padding: 0px 0px 10px 44px;

        .post_content{
            height: 80px;
            overflow: hidden;
            margin-top: 10px;
        }

        .post_pr_img_wrap{
            width: 100%;
            display: flex;
            height: 180px;
        }
    }

    .post_comment{
        display: flex;
        line-height: 32px;
    }

    .post_comment_icon_wrap{
        width: 32px;
        height: 32px;
        margin-right: 4px;
        padding: 6px;
        cursor: pointer;

        .post_comment_icon{
          width: 20px;
          height: 20px;
          background-size: cover;
          background-repeat: no-repeat;
        }
    }
`
export const TitleHeader = styled.div`
width: 100%;
background: #fff;

    .title_wrap{
      display: flex;
      justify-content: space-between;
    }   
    .notice_post {
    display:block;
    margin-left : 10px;
    flex: 1 0 100%;
    line-height : 48px;
    font-size: 20px;
    font-family: var(--font-pretendard-bold);
    }

    .all_post{
    display:block;
    margin-left : 10px;
    flex: 1 0 80%;
    line-height : 48px;
    font-size: 20px;
    font-family: var(--font-pretendard-bold);
    }

    .post_header{
    display:flex;
    margin-top: 20px;
    padding : 0px;
    line-height : 48px;
    border-top : 1px solid #dedede;
    border-bottom : 1px solid #dedede;

    .h_title,
    .h_user,
    .h_date{
    font-family: var(--font-pretendard-bold);
    font-size : 14px;
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
border-bottom: 1px solid #dedede;

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
color : #8e8e8e;
margin-right : 4px;
font-size: 14px;
font-family : var(--font-pretendard-light);
}
.post_title {
margin-right : 4px;
font-size : 14px;
}
& .post_title:hover{
text-decoration : underline;
cursor:pointer;
}
.post_comment{
color :red;
font-size : 14px;
}
.post_user{
flex: 0 0 20%;
display : block;
text-overflow: ellipsis;
overflow : hidden;
white-space : nowrap;
color : #828282;
font-family : var(--font-pretendard-light);
font-size : 14px;
}
.post_date{
flex: 0 0 16%;
font-size : 14px;
}

.bookmark_delete_btn{
width : 18px;
height : 18px;
margin-top: 10px;
background : red;
border: none;
}
`
export const PostCommentStyle = styled.div`
width: 100%;

.memo_comment_wrap{
border-bottom : 1px solid #ededed;
margin-top: 10px;
padding-bottom : 20px;
}
.user_profile{
position: relative;
display: flex;
}
.user_profile p{
line-height : 32px;
font-family : var(--font-pretendard-bold);
}
.user_photo{
width : 32px;
height: 32px;
margin-right : 8px;
background-size : cover;
background-repeat : no-repeat;
border-radius : 50%;
}

// 댓글
.memo_comment{
margin-top : 8px;
}
.reply_wrap{
margin-top : 8px;
}
.memo_reply{
margin-top : 4px;
}

.memo_reply_id{
display: block;
width: fit-content;
margin-top: 8px;
color: #0087ff;
background-color: #c8fffd;
}

.memo_comment_date{
font-size: 14px;
color: #777;
margin-top: 10px;
}

.comment_reply_btn{
width: 60px;
height: 32px;
border: 1px solid #ededed;
background: #fff;
margin: 8px 0px;
cursor : pointer;
}
.comment_delete_btn{
position: absolute;
right: 0;
width: 32px;
height: 32px;
background: #fff;
border: 1px solid #ededed;
border-radius: 4px;
cursor : pointer;
}

.comment_input{
outline: none;
    border: 1px solid #ededed;
    padding: 10px;
    }
`
export const PostCommentInputStyle = styled.div`
position : relative;
width: 100%;
height: 190px;
margin-top : 10px;
padding : 12px;
border : 1px solid #ededed;

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
font-size : 14px;
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
border  : 1px solid #ededed;
background : none;
cursor : pointer;
}
`
export const BookmarkWrap = styled.div`
    width: 600px;
    margin-left: 500px;
    border-left: 1px solid #dedede;
    border-right: 1px solid #dedede;
    background: #fff;

    .all_post{
        padding: 16px;
        border-bottom: 1px solid #ededed;
        text-align: center;
    }
`
export const NoMorePost = styled.div`
    width: 100%;
    height: 240px;
    padding: 40px;
    text-align: center;

    .no_more_icon{
      width: 108px;
      height: 108px;
      background-size: cover;
      background-repeat: no-repeat;
      margin: 0 auto;
    }

    p{
      font-size: 20px;
    }

    span{
      display : block;
      color: #999;
      font-size: 14px;
      margin-top : 4px;
    }
`
export const NewPostBtn = styled.button`
    position: fixed;
    left: 730px;
    top: 20px;
    z-index: 1;
    padding: 12px 10px;
    border-radius: 8px;
    border: none;
    background: #0087ff;
    color: #fff;
    font-family: '__PretendardBold_73a78b';
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`
export const MyAlarmWrap = styled.div`
    margin-top: 32px;

    .my_alarm{
      padding: 10px;
      border: 1px solid #ededed;
      border-radius: 8px;
    }

    h2{
      font-size: 14px;
    }

    .alarm_title{
      margin-top: 16px;
    }

    .alram_date{
      margin-top: 4px;
      font-size: 14px;
    }

    button{
      width: 100%;
      height: 32px;
      margin-top: 4px;
      border: none;
      background: #0087ff;
      border-radius: 4px;
      color: #fff;
      cursor : pointer;
    }
`