import { Theme } from '@emotion/react';

export const lightTheme: Theme = {
    colors: {
        background: '#fff',
        background_invisible: 'transparent',
        text: '#333333',
        primary: '#0070f3',
        hoverBg: '#f7f9fa',
        clickBg: '#f5f8fa',
    },
};

export const darkTheme: Theme = {
    colors: {
        background: '#121212',
        background_invisible: 'transparent',
        text: '#fff',
        primary: '#79b8ff',
        hoverBg: '#1a1a1a',
        clickBg: '#212121',
        // … 라이트 테마와 매칭되는 색상 추가
    },
};