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

    .ais-InfiniteHits{
        margin-top: 40px;
        border-top: 1px solid #ededed;
        padding: 20px;
    }

    .
`