import sanitizeHtml from "sanitize-html";

function truncateBlocks(html: string, maxBlocks = 2): string {
    // 가상 컨테이너 생성
    const container = document.createElement('div');
    container.innerHTML = html;

    // 직계 자식 블록 노드 배열화
    const children = Array.from(container.children);
    const total = children.length;

    // maxBlocks 이후 블록 제거
    children.slice(maxBlocks).forEach(el => el.remove());

    if (total > maxBlocks) {
        const ellipsis = document.createElement('p');
        ellipsis.textContent = '…';
        // 기존 블록 스타일에 맞추어 span 또는 p로 변경 가능
        container.appendChild(ellipsis);
    }

    return container.innerHTML;
}

export const cleanHtml = (content: string, maxBlocks = 2) => {
    const filtered = sanitizeHtml(content, {
        allowedTags: ["h1", "p", "span", "div", "strong", "em", "a", "ul", "ol", "li", "br", "img", "pre", "code", "u"], // 허용할 태그
        allowedAttributes: {
            a: ["href", "target", "rel"], // 링크 속성만 허용
            img: ["src", "style"],
            span: ["style", "class",],
            div: ["style", "data-language", "class", "spellcheck"],
            li: ["data-list"],
            p: ["style"],
            strong: ["style"],
            u: ["style"]
        },
        allowedSchemes: ["http", "https"], // http, https 링크만 허용
        allowedSchemesByTag: {
            img: ["http", "https", "data:image/png", "data:image/jpeg", "data:image/webp"], // img 태그의 src 속성에서 http, https, data 허용
        },
        allowedStyles: {
            '*': {
                // "width"와 "height"만 허용
                'width': [/^\d+(?:px|%)$/],
                'height': [/^\d+(?:px|%)$/],
                'color': [/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, /^rgb\((\d{1,3},\s?){2}\d{1,3}\)$/],
                'background-color': [/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, /^rgb\((\d{1,3},\s?){2}\d{1,3}\)$/],
                'font-size': [/^\d+(\.\d+)?(px|em|rem|%)$/],
                'line-height': [/^\d+(\.\d+)?$/]
            }
        }
    });

    return truncateBlocks(filtered, maxBlocks)
};

export const SSRcleanHtml = (content: string) => {
    return sanitizeHtml(content, {
        allowedTags: ["h1", "p", "span", "div", "strong", "em", "a", "ul", "ol", "li", "br", "img", "pre", "code", "u"], // 허용할 태그
        allowedAttributes: {
            a: ["href", "target", "rel"], // 링크 속성만 허용
            img: ["src", "style"],
            span: ["style", "class",],
            div: ["style", "data-language", "class", "spellcheck"],
            li: ["data-list"],
            p: ["style"],
            strong: ["style"],
            u: ["style"]
        },
        allowedSchemes: ["http", "https"], // http, https 링크만 허용
        allowedSchemesByTag: {
            img: ["http", "https", "data"]
        },
        allowedStyles: {
            '*': {
                // "width"와 "height"만 허용
                'width': [/^\d+(?:px|%)$/],
                'height': [/^\d+(?:px|%)$/],
                'color': [/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, /^rgb\((\d{1,3},\s?){2}\d{1,3}\)$/],
                'background-color': [/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, /^rgb\((\d{1,3},\s?){2}\d{1,3}\)$/],
                'font-size': [/^\d+(\.\d+)?(px|em|rem|%)$/],
                'line-height': [/^\d+(\.\d+)?$/]
            }
        },
        transformTags: {
            'a': (tagName, attribs) => {
                // target이 _blank이면 rel noopener 추가
                if (attribs.target === '_blank') {
                    attribs.rel = (attribs.rel ? attribs.rel + ' ' : '') + 'noopener noreferrer';
                }
                return { tagName, attribs };
            },
            'img': (tagName, attribs) => {
                const src = attribs.src || '';
                // data:이면 안전한 MIME 유형만 허용
                if (src.startsWith('data:')) {
                    // 허용하는 data MIME만 통과 (png/jpeg/webp)
                    if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(src)) {
                        // 허용하지 않으면 빈 이미지 또는 제거
                        return { tagName: 'img', attribs: { src: '' } };
                    }
                }
                return { tagName, attribs };
            }
        }
    });
};