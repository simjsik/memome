import styled from "@emotion/styled";

export const PostDetailWrap = styled.div`
position : absolute;
left : 420px;
width : 860px;
padding : 40px;
background : #fff;
border-left : 1px solid #dedede;
border-right : 1px solid #dedede;

// 기본

.post_title_wrap{
display : flex;
justify-content: space-between;
margin-top :12px;
padding-bottom : 10px;
border-bottom: 1px solid #dedede
}

.post_category{
font-size : 16px;
font-family : var(--font-pretendard-light);
color: #acacac;
}

.post_title{
font-size : 18px;
line-height : 32px;
font-family : var(--font-pretendard-bold);
}
.user_id{
display : flex;
}
.user_profile {
width : 32px;
height : 32px;
margin-right : 8px;
border-radius : 50%;
background-size: cover;
background-repeat: no-repeat;
}

.user_id p{
font-size : 12px;
line-height : 32px;
}
.post_content_wrap{
margin-top : 40px;
padding-bottom : 200px;
}
img {
max-width: 780px;
object-fit : cover;
}

.post_menu_wrap{
height : 32px;
display : flex;
justify-content : space-between;
}
.comment_toggle_btn{
width : 60px;
height : 32px;
border : 1px solid #ededed;
background : none;
}

.comment_dlt_btn{
width: 24px;
height : 24px;
background : red;
}
`