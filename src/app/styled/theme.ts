import { Theme } from '@emotion/react';

export const lightTheme: Theme = {
    colors: {
        background: '#fff',
        text: '#333333',
        primary: '#0070f3',
        // … 필요한 색상 추가
    },
};

export const darkTheme: Theme = {
    colors: {
        background: 'blue',
        text: '#f0f0f0',
        primary: '#79b8ff',
        // … 라이트 테마와 매칭되는 색상 추가
    },
};