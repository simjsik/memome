/** @jsxImportSource @emotion/react */
'use client';

import styled from "@emotion/styled";

export const PostWrap = styled.div<{ postStyle: boolean }>`
// 포스트 리스트 스타일 별 우측이 목록별로
position : absolute;
left : ${(props) => (props.postStyle ? '500px' : '420px')};
top : ${(props) => (props.postStyle ? '40px' : '0px')};
display : flex;
flex-wrap : wrap;
width: ${(props) => (props.postStyle ? '700px' : '860px')};
padding :${(props) => (props.postStyle ? '0px' : '10px 20px')};
border-radius : 4px;
border : none;
border-left : ${(props) => (props.postStyle ? 'none' : '1px solid #ededed')};
border-right : ${(props) => (props.postStyle ? 'none' : '1px solid #ededed')};
background :${(props) => (props.postStyle ? 'none' : '#fff')};

    // 포스트 박스
    .post_box{
    position: relative;
    display : ${(props) => (props.postStyle ? 'block' : 'flex')};
    justify-content: space-between;
    flex : 1 0 100%;
    min-height :${(props) => (props.postStyle ? '360px' : '36px')};
    margin-bottom : ${(props) => (props.postStyle ? '20px' : '0px')};
    padding: ${(props) => (props.postStyle ? '20px' : '0')};
    border-radius : ${(props) => (props.postStyle ? '8px' : '4px')};;
    border-bottom : 1px solid #ededed;
    line-height :   ${(props) => (props.postStyle ? '10px' : 'auto')};
    background: #fff;
    box-shadow : ${(props) => (props.postStyle ? '0px 0px 10px rgba(0,0,0,0.1)' : 'none')};
    }

    .notice {
    background : rgba(255, 78, 90, 0.05);
        
      .post_tag,
      .post_title{
        color : #ff4e59;
      }

      .post_tag{
      margin-right : 4px;
      }

    }

      .post_box:last-child{
      margin-bottom : 40px;
      }
      .post_box:nth-of-type(odd){
        // margin-right : 20px;
      }

      // 포스트 제목
      .post_title_wrap,
      .post_right_wrap{
      display: flex;
      }

      .post_title_wrap{
      flex: 0 0 60%;
      flex-wrap:${(props) => (props.postStyle ? 'wrap' : 'nowrap')};
      margin-top : ${(props) => (props.postStyle ? '8px' : '0px')};
      padding-left : ${(props) => (props.postStyle ? '0px' : '20px')};
      padding-bottom : ${(props) => (props.postStyle ? '10px' : '0px')};
      border-bottom : ${(props) => (props.postStyle ? '1px solid #ededed' : 'none')};
      }

      .post_right_wrap{
      display:flex;
      flex: 0 0 40%;
      }

      // 포스트 태그
      .post_tag{
      width : ${(props) => (props.postStyle ? '100%' : 'auto')};
      margin-right : 4px;
      font-size : 14px;
      line-height : ${(props) => (props.postStyle ? '24px' : '36px')};
      color : #555;
      }
    
      // 포스트 제목
      .post_title{
      font-size : ${(props) => (props.postStyle ? '20px' : '14px')};
      font-family : var(--font-pretendard-light);
      line-height : 36px;
      border-bottom : none;
      }

      // 포스트 내용
      .post_content_wrap{
        margin-top : 20px;
        min-height: 120px;
      }

      // 유저 이름, 포스트 날짜, 포스트 댓글
      .user_id,
      .post_date,
      .post_coment {
      font-size : 14px;
      line-height : 36px;
      }

      .user_id,
      .post_date{
      flex : ${(props) => (props.postStyle ? '0 0 auto' : '0 0 50%')};
      }

      .user_id{
      margin-right : ${(props) => (props.postStyle ? '4px' : '0')};
      }

      .post_bottom_wrap{
      display: flex;
      border-top: 1px solid #ededed;
      margin-top: 20px;
      padding-top: 10px;
      }

      .post_comment_icon{
      width: 32px;
      height: 32px;
      background: red;
      margin-right : 4px
      }

      .post_comment{

      font-family : ${(props) => (props.postStyle ? 'var(--font-pretendard-medium)' : 'var(--font-pretendard-bold)')};
      font-size : ${(props) => (props.postStyle ? '16px' : '14px')};
      color: ${(props) => (props.postStyle ? '#191919' : 'red')};
      margin-left : ${(props) => (props.postStyle ? '0px' : '4px')};
      display : ${(props) => (props.postStyle ? 'flex' : 'block')};
      line-height : 36px;
      }

      & .user_id:hover,
      .post_title:hover{

      text-decoration : underline;
      cursor: pointer;
      }

      // 포스트 프로필 박스
      .post_profile{

      display:flex;
      }

      .user_profile{

      width : 32px;
      height : 32px;
      margin-right : 4px;
      border-radius: 50%;
      background: red;
      }

       // 포스트 이미지 있을 때 표시
      .post_img_icon{

      width : 16px;
      height : 16px;
      margin : 11px 4px 0px;
      background : red;
      }

      // 포스트 이미지 감추기
      .post_text img{

      display : none;
      }

      // 포스트 내용
      .post_text{

        max-height: 300px;
        overflow: hidden;
        max-width: 580px;
      }

      .post_text p{

      line-height : 36px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      }

      .post_text p:nth-of-type(n+3){

      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      }

      .post_text p:nth-of-type(n+5){

        display : none
      }

      // 포스트 이미지 미리보기
    
      .post_pr_img_wrap{

          display:flex
      }

      .post_pr_img{

      max-width : 300px;
      flex : 1 0 24%;
      min-height: 120px;
      margin-right : 8px;
      background-size : cover;
      border-radius : 4px;
      box-shadow : 0px 0px 10px rgba(0,0,0,0.1)
      }

      .post_pr_img:last-child{

      margin-right : 0;
      }

      // 포스트 Swiper Style

      .swiper{

      width: 100%;
      margin: 0;
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
background :red;
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
color: #4cc9bf;
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
background : red;
border-radius : 50%;
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
