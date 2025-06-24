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
                }
                div{
                    background-color: ${theme.colors.background};
                }
                a, span, h2, h1, strong, p, u, i {
                    color: ${theme.colors.text};
                }
            `}
        />
    );
};

export default GlobalStyles;
