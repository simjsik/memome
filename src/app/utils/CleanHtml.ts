import sanitizeHtml from "sanitize-html";

export const cleanHtml = (content: string) => {
    return sanitizeHtml(content, {
        allowedTags: ["h2", "p", "span", "div", "strong", "em", "a", "ul", "ol", "li", "br", "img"], // 허용할 태그
        allowedAttributes: {
            a: ["href", "target", "rel"], // 링크 속성만 허용
            img: ["src", "style"],
            span: ["style", "class", "contenteditable"],
            div: ["style"],
            li: ["data-list"],
            p: ["style"],
            strong : ["style"]
        },
        allowedSchemes: ["http", "https"], // http, https 링크만 허용
        allowedSchemesByTag: {
            img: ["http", "https", "data"], // img 태그의 src 속성에서 http, https, data 허용
        },
        allowedStyles: {
            '*': {
                // "width"와 "height"만 허용
                'width': [/^\d+(?:px|%)$/],
                'height': [/^\d+(?:px|%)$/],
                'color': [/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, /^rgb\((\d{1,3},\s?){2}\d{1,3}\)$/],
                'background-color': [/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, /^rgb\((\d{1,3},\s?){2}\d{1,3}\)$/],
                'font-size': [/^\d+(?:px|em|rem|%)$/],
                'line-height': [/^\d+(\.\d+)?$/]
            }
        }
    });
};