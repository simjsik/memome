'use client';
import { Global, css, useTheme } from '@emotion/react';

const GlobalStyles = () => {
    const theme = useTheme();

    return (
        <Global
            styles={css`
                html, body {
                    margin: 0;
                    padding: 0;
                    background-color: ${theme.colors.background};
                    color:            ${theme.colors.text};
                }
                    
                a, span, h2, h1, strong, p, u, i {
                    color: ${theme.colors.text};
                }             

                :root {
                --bg:      ${theme.colors.background};
                --text:    ${theme.colors.text};
                --tag:    ${theme.colors.text_tag};
                --primary: ${theme.colors.primary};
                --bd: ${theme.colors.border};
                
                /* 필요한 값 더 추가 */
              }
            `}
        />
    );
};

export default GlobalStyles;
