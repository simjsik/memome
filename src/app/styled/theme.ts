import { Theme } from '@emotion/react';

export const lightTheme: Theme = {
    colors: {
        background: '#fff',
        background_invisible: '#ffffff00',
        text: '#333333',
        inverted_text: '#fff',
        text_tag: '#555',
        primary: '#0087ff',
        hoverBg: '#f7f9fa',
        clickBg: '#f5f8fa',
        error: '#fa5741',
        border: '#ededed',
        icon_off: '#ccc',
        icon_on: '#050505',
        blur: 'rgb(255,255,255,0.6)'
    },
};

export const darkTheme: Theme = {
    colors: {
        background: '#121212',
        background_invisible: '#ffffff00',
        text: '#fff',
        inverted_text: '#333',
        text_tag: '#fff',
        primary: '#0087ff',
        hoverBg: '#1a1a1a',
        clickBg: '#212121',
        error: '#fa5741',
        border: '#303030',
        icon_off: '#fff',
        icon_on: '#fff',
        blur: 'rgb(0,0,0,0.6)'
    },
};