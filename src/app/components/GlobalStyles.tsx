'use client';
import { Global, css, useTheme } from '@emotion/react';

const GlobalStyles = () => {
    const theme = useTheme();
    console.log(theme, '테마');
    return (
        <Global
            styles={css`
        html, body {
          margin: 0;
          padding: 0;
          background-color: ${theme.colors.background};
          color:            ${theme.colors.text};
          transition: background-color 0.3s, color 0.3s;
        }
        a {
          color: ${theme.colors.primary};
        }
        /* 그 외 전역 스타일 */
      `}
        />
    );
};

export default GlobalStyles;
