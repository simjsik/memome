/** @jsxImportSource @emotion/react */ // 최상단에 배치
'use clients';

import styled from "@emotion/styled";

export const UsageWrap = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background: rgba(0, 0, 0, 0.7);

    .usage_box{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-60%, -60%);
        width: 400px;
        height: 170px;
        padding: 20px;
        border-radius: 8px;
        background: #fff;
        text-align: center;
    }

    p {
        font-size: 20px;
        font-family: var(--font-pretendard-bold);
    }

    span{
        display: block;
        margin-top: 10px;
        color: #777;
    }
    .usage_btn_wrap{
        margin-top: 32px;
        display: flex;
        justify-content: space-evenly;
    }
    button:nth-of-type(1){
        flex: 0 0 30%;
        height: 42px;
        border: 1px solid #ededed;
        background: #fff;
        border-radius : 6px;
    }

    button:nth-of-type(2){
        flex: 0 0 40%;
        height: 42px;
        border: none;
        background: #4cc9bf;
        color: #fff;
        font-family: var(--font-pretendard-medium);
        font-size: 14px;
        border-radius : 6px;
    }
`
export default function UsageLimit() {

    // Function
    return (
        <UsageWrap>
            <div className="usage_box">
                <p>일일 제공 사용량이 초과되었습니다.</p>
                <span>초기화 까지 남은 시간 : ㅋ</span>
                <div className="usage_btn_wrap">
                    <button>로그아웃</button>
                    <button>현 상태로 둘러보기</button>
                </div>
            </div>
        </UsageWrap>
    )
}