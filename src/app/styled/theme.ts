import { Theme } from '@emotion/react';

export const lightTheme: Theme = {
    colors: {
        background: '#fff',
        background_invisible: 'transparent',
        text: '#333333',
        text_tag: '#555',
        primary: '#0087ff',
        hoverBg: '#f7f9fa',
        clickBg: '#f5f8fa',
        error: '#fa5741',
        border: '#ededed',
    },
};

export const darkTheme: Theme = {
    colors: {
        background: '#121212',
        background_invisible: 'transparent',
        text: '#fff',
        text_tag: '#fff',
        primary: '#0087ff',
        hoverBg: '#1a1a1a',
        clickBg: '#212121',
        error: '#fa5741',
        border: '#303030',
        // … 라이트 테마와 매칭되는 색상 추가
    },
};