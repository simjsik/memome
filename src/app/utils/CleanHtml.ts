import sanitizeHtml from "sanitize-html";

function truncateBlocks(html: string, maxBlocks = 2): string {
    const container = document.createElement('div');
    container.innerHTML = html;

    const children = Array.from(container.children);
    const total = children.length;

    children.slice(maxBlocks).forEach(el => el.remove());

    if (total > maxBlocks) {
        const ellipsis = document.createElement('p');
        ellipsis.textContent = '…';
        container.appendChild(ellipsis);
    }

    return container.innerHTML;
}

export const cleanHtml = (content: string, maxBlocks = 2) => {
    const filtered = sanitizeHtml(content, {
        allowedTags: ["h1", "p", "span", "div", "strong", "em", "a", "ul", "ol", "li", "br", "img", "pre", "code", "u"],
        allowedAttributes: {
            a: ["href", "target", "rel"],
            img: ["src", "style"],
            span: ["style", "class",],
            div: ["style", "data-language", "class", "spellcheck"],
            li: ["data-list"],
            p: ["style"],
            strong: ["style"],
            u: ["style"]
        },
        allowedSchemes: ["http", "https"],
        allowedSchemesByTag: {
            img: ["http", "https", "data:image/png", "data:image/jpeg", "data:image/webp"],
        },
        allowedStyles: {
            '*': {
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
                const href = attribs.href || '';
                if (!/^https?:\/\//i.test(href)) {
                    delete attribs.href;
                }
                if (attribs.target === '_blank') {
                    attribs.rel = (attribs.rel ? attribs.rel + ' ' : '') + 'noopener noreferrer';
                }
                return { tagName, attribs };
            },
            'img': (tagName, attribs) => {
                const src = attribs.src || '';
                if (src.startsWith('data:')) {
                    if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(src)) {
                        return { tagName: 'img', attribs: { src: '' } };
                    }
                }
                return { tagName, attribs };
            }
        }
    });

    return truncateBlocks(filtered, maxBlocks)
};

export const SSRcleanHtml = (content: string) => {
    return sanitizeHtml(content, {
        allowedTags: ["h1", "p", "span", "div", "strong", "em", "a", "ul", "ol", "li", "br", "img", "pre", "code", "u"],
        allowedAttributes: {
            a: ["href", "target", "rel"],
            img: ["src", "style"],
            span: ["style", "class",],
            div: ["style", "data-language", "class", "spellcheck"],
            li: ["data-list"],
            p: ["style"],
            strong: ["style"],
            u: ["style"]
        },
        allowedSchemes: ["http", "https"],
        allowedSchemesByTag: {
            img: ["http", "https", "data"]
        },
        allowedStyles: {
            '*': {
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
                const href = attribs.href || '';
                if (!/^https?:\/\//i.test(href)) {
                    delete attribs.href;
                }
                if (attribs.target === '_blank') {
                    attribs.rel = (attribs.rel ? attribs.rel + ' ' : '') + 'noopener noreferrer';
                }
                return { tagName, attribs };
            },
            'img': (tagName, attribs) => {
                const src = attribs.src || '';
                if (src.startsWith('data:')) {
                    if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(src)) {
                        return { tagName: 'img', attribs: { src: '' } };
                    }
                }
                return { tagName, attribs };
            }
        }
    });
};