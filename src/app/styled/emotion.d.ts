import '@emotion/react';

declare module '@emotion/react' {
    export interface Theme {
        colors: {
            background: string;
            text: string;
            primary: string;
            hoverBg: string;
            clickBg: string;
        };
        // 다른 커스텀 프로퍼티가 있으면 여기에…
    }
}
