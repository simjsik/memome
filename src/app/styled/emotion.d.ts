// styled/emotion.d.ts
import '@emotion/react';

declare module '@emotion/react' {
    export interface Theme {
        colors: {
            background: string;
            text: string;
            primary: string;
            // 필요하면 추가…
        };
        // 다른 커스텀 프로퍼티가 있으면 여기에…
    }
}
