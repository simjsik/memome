import '@emotion/react';

declare module '@emotion/react' {
    export interface Theme {
        colors: {
            background: string;
            background_invisible: string;
            text: string;
            text_tag : string;
            inverted_text : string;
            primary: string;
            hoverBg: string;
            clickBg: string;
            error: string;
            border: string;
            icon_off : string;
            icon_on : string;
        };
        // 다른 커스텀 프로퍼티가 있으면 여기에…
    }
}
