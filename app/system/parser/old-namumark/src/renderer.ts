import {Node} from './parser';

import parse from './index';

import DOMPurify from 'isomorphic-dompurify';
import hljs from 'highlight.js';

export function UrlEncoding(url: string) {
    return encodeURI(url).replace(/\?/gm, '%3F').replace(/&/gm, '%25').replace(/#/gm, '%23');
}

type findPageFn = (name: string) => Promise<{content: string} | null> | null;
type findImageFn = (name: string, rever?: number) => Promise<{url: string; width: number; height: number} | null> | null;
type getThreadsFn = (name: string) => Promise<string[]>;
type getURLFn = (type: 'link' | 'image', name: string) => string;
type pageCountFn = (name: string) => Promise<number>;

export class Renderer {
    public name: string = '';

    public findPage: findPageFn = () => null;
    public findImage: findImageFn = () => null;
    public getThreads: getThreadsFn = async () => [];
    public getURL: getURLFn = (type: 'link' | 'image', name: string) => (type === 'link' ? '/wiki/' : '') + name;
    public pageCount: pageCountFn = async () => 0;

    public categories: string[] = [];
    public backlinks: {type: 'link' | 'image' | 'category' | 'include' | 'redirect'; name: string}[] = [];

    public footnoteIds: string[] = [];
    public footnotes: {id: string; name: string; content: string}[] = [];
    public headers: {name: string; closed: boolean; id: string; size: number; count: string}[] = [];
    public headerCounters: number[] = [0, 0, 0, 0, 0, 0];

    public param: {[str: string]: string} | null = null;

    public depth: number = 0;

    public newLines: number = 0;

    public maxHeaderLevel: number = 0;

    constructor(findPage?: findPageFn, findImage?: findImageFn, getThreads?: getThreadsFn, getURL?: getURLFn, pageCount?: pageCountFn) {
        if (findPage) this.findPage = findPage;
        if (findImage) this.findImage = findImage;
        if (getThreads) this.getThreads = getThreads;
        if (getURL) this.getURL = getURL;
        if (pageCount) this.pageCount = pageCount;
    }

    private error(error: string) {
        return `<span class="wiki-error">${error}</span>`;
    }

    private removeHTML(str: string): string {
        return str.replace(/(<([^>]+)>)/gi, '');
    }

    private disableQuot(str: string): string {
        return str.replace(/"/, '&quot;');
    }

    private disableTag(str: string): string {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    private fixParamBug(str: string): string {
        return str
            .replace(/@([^=@]*?)=([^@]*?)@/g, (match: string, name: string, value: string) => this.param![name] || value)
            .replace(/@([^@]*?)@/g, (match: string, name: string) => this.param![name] || '');
    }

    private autoPx(str: string): string {
        if (isNaN(+str[str.length - 1])) return str;

        return str + 'px';
    }

    private getColor(colorString: string, isDark: boolean) {
        if (!colorString) return null;
        const colors = colorString.split(',');
        return isDark ? (colors.length > 1 ? colors[1].trim() : colors[0].trim()) : colors[0].trim();
    }

    private async getHTML(nodes: Node[]) {
        return (await Promise.all(nodes.map((node: Node) => this.walk(node)))).join('');
    }

    private async walk(node: Node): Promise<string> {
        if (node.type !== 'Literal') this.newLines = 0;

        switch (node.type) {
            case 'Literal': {
                if (node.value === '\n') {
                    if (this.newLines++ > 0) {
                        this.newLines = 0;

                        return '<br />';
                    }

                    return '\n';
                }

                return this.disableTag(node.value);
            }

            case 'Heading': {
                const name = await this.getHTML(node.items);

                const depth = node.depth + 1 - this.maxHeaderLevel;

                this.headerCounters[depth - 1]++;
                for (let i = depth; i < 6; i++) this.headerCounters[i] = 0;
                const counts = [];
                for (let i = 0; i < depth; i++) counts.push(this.headerCounters[i]);

                const id = node.value ? UrlEncoding(node.value) : counts.join('.');

                this.headers.push({
                    name: this.removeHTML(name),
                    closed: !node.folding,
                    id,
                    size: depth,
                    count: id + '.',
                });

                return `<h${depth} id="s-${id}" class="wiki-heading${node.folding ? ' wiki-close-heading' : ''}"><a href="#toc">${counts.join('.')}.</a> ${name}</h${depth}>`;
            }

            case 'Block': {
                return `<div class="wiki-block" style="${this.fixParamBug(this.disableQuot(node.style))}">${await this.getHTML(node.items)}</div>`;
            }

            case 'Html': {
                return this.fixParamBug(node.value);
            }

            case 'For': {
                return '';
            }

            case 'Class': {
                return `<div class="wiki-class ${this.fixParamBug(this.disableQuot(node.style))}">${await this.getHTML(node.items)}</div>`;
            }

            case 'Folding': {
                return `<details class="wiki-folding"><summary>${await this.getHTML(node.names)}</summary>${await this.getHTML(node.items)}</details>`;
            }

            case 'Syntax': {
                let hignlightd: string;

                if (node.name.trim() !== '')
                    try {
                        hignlightd = hljs.highlight(node.value, {language: node.name.trim()}).value;
                    } catch (err) {
                        hignlightd = hljs.highlightAuto(node.value).value;
                    }
                else hignlightd = this.disableTag(node.value);

                return `<pre class="wiki-code">${hignlightd}</pre>`;
            }

            case 'Color': {
                return `<span style="color: ${this.disableQuot(node.color.split(',')[0])}">${await this.getHTML(node.items)}</span>`;
            }

            case 'Size': {
                return `<span class="wiki-size ${node.size > 0 ? 'size-up-' + node.size : 'size-down-' + Math.abs(node.size)}">${await this.getHTML(node.items)}</span>`;
            }

            case 'HorizontalLine': {
                return '<hr />';
            }

            case 'HyperLink': {
                const externalLink = node.link.startsWith('https://') || node.link.startsWith('http://');

                if (!externalLink) this.backlinks.push({type: 'link', name: node.link.split('#')[0]});

                const notExist = !(externalLink ? null : await this.findPage(node.link.split('#')[0]));

                return `<a href="${this.disableQuot(externalLink ? decodeURI(node.link).replace(/\r/, '').replace(/\n/, '') : this.getURL('link', node.link))}" class="wiki-link${
                    externalLink ? ' external-link' : notExist ? ' not-exist' : ''
                }">${await this.getHTML(node.items)}</a>`;
            }

            case 'Category': {
                this.backlinks.push({type: 'category', name: '분류:' + node.link});
                this.categories.push(node.link);

                return '';
            }

            case 'Image': {
                this.backlinks.push({type: 'image', name: '파일:' + node.link});

                const image = await this.findImage(node.link, +node.param['rever']);

                if (!image) {
                    return `<a href="${this.disableQuot(this.getURL('link', node.link))}" class="wiki-link not-exist">${node.link}</a>`;
                }

                return `<img src="${this.getURL('image', image.url)}" style="${this.disableQuot(
                    (node.param['align'] ? 'text-align: ' + node.param['align'] : '') +
                        ';' +
                        (node.param['bgcolor'] ? 'background-color: ' + node.param['bgcolor'] : '') +
                        ';' +
                        (node.param['border-radius'] ? 'border-radius: ' + node.param['bgcolor'] : '') +
                        ';' +
                        (node.param['rendering'] ? 'image-rendering: ' + node.param['bgcolor'] : '') +
                        ';',
                )}" width="${node.param['width'] ? this.disableQuot(node.param['width']) : image.width}" height="${
                    node.param['height'] ? this.disableQuot(node.param['height']) : image.height
                }" />`;
            }

            case 'Bold': {
                return `<b>${await this.getHTML(node.items)}</b>`;
            }

            case 'Italic': {
                return `<i>${await this.getHTML(node.items)}</i>`;
            }

            case 'Underscore': {
                return `<u>${await this.getHTML(node.items)}</u>`;
            }

            case 'Strikethrough': {
                return `<del>${await this.getHTML(node.items)}</del>`;
            }

            case 'SuperScript': {
                return `<sup>${await this.getHTML(node.items)}</sup>`;
            }

            case 'SubScript': {
                return `<sub>${await this.getHTML(node.items)}</sub>`;
            }

            case 'Video': {
                switch (node.name) {
                    case 'youtube':
                        return `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(node.code)}${
                            node.param['start'] ? '?start=' + encodeURIComponent(node.param['start']) : ''
                        }${node.param['end'] ? (node.param['start'] ? '&' : '?') + 'end=' + encodeURIComponent(node.param['end']) : ''}"${
                            node.param['width'] ? ' width="' + this.disableQuot(this.autoPx(node.param['width'])) + '"' : ''
                        }${node.param['height'] ? ' width="' + this.disableQuot(this.autoPx(node.param['height'])) + '"' : ''} frameborder="0" allowfullscreen loading="lazy"></iframe>`;

                    case 'kakaotv':
                        return `<iframe src="https//tv.kakao.com/embed/player/cliplink/${encodeURIComponent(node.code)}"${
                            node.param['width'] ? ' width="' + this.disableQuot(this.autoPx(node.param['width'])) + '"' : ''
                        }${node.param['height'] ? ' width="' + this.disableQuot(this.autoPx(node.param['height'])) + '"' : ''} frameborder="0" allowfullscreen loading="lazy"></iframe>`;

                    case 'nicovideo':
                        return `<iframe src="https//embed.nicovideo.jp/watch/sm${encodeURIComponent(node.code)}"${
                            node.param['width'] ? ' width="' + this.disableQuot(this.autoPx(node.param['width'])) + '"' : ''
                        }${node.param['height'] ? ' width="' + this.disableQuot(this.autoPx(node.param['height'])) + '"' : ''} frameborder="0" allowfullscreen loading="lazy"></iframe>`;

                    case 'vimeo':
                        return `<iframe src="https//player.vimeo.com/video/${encodeURIComponent(node.code)}"${
                            node.param['width'] ? ' width="' + this.disableQuot(this.autoPx(node.param['width'])) + '"' : ''
                        }${node.param['height'] ? ' width="' + this.disableQuot(this.autoPx(node.param['height'])) + '"' : ''} frameborder="0" allowfullscreen loading="lazy"></iframe>`;

                    case 'navertv':
                        return `<iframe src="https//tv.naver.com/embed/${encodeURIComponent(node.code)}"${
                            node.param['width'] ? ' width="' + this.disableQuot(this.autoPx(node.param['width'])) + '"' : ''
                        }${node.param['height'] ? ' width="' + this.disableQuot(this.autoPx(node.param['height'])) + '"' : ''} frameborder="0" allowfullscreen loading="lazy"></iframe>`;

                    default:
                        return '';
                }
            }

            case 'FootNote': {
                let name = node.name;
                let id = node.name;

                if (!name) {
                    for (name = '1'; this.footnoteIds.includes(name); name = String(+name + 1));

                    id = name;
                } else {
                    let i;

                    for (i = 0; this.footnoteIds.includes(node.name + (i === 0 ? '' : '_' + i)); i++);

                    id = node.name + (i === 0 ? '' : '_' + i);
                }

                this.footnoteIds.push(name);

                this.footnotes.push({
                    id,
                    name,
                    content: await this.getHTML(node.items),
                });

                return `<sup id="fn-${encodeURIComponent(id)}"><a href="#rfn-${encodeURIComponent(id)}">[${name}]</a></sup>`;
            }

            case 'BlockQuote': {
                return `<blockquote class="wiki-quote">${await this.getHTML(node.items)}</blockquote>`;
            }

            case 'Indent': {
                return `<div class="wiki-indent">${await this.getHTML(node.items)}</div>`;
            }

            case 'Include': {
                try {
                    if (this.depth > 9) return '';

                    const name = node.name.trim();

                    this.backlinks.push({type: 'include', name});

                    const page = await this.findPage(name);

                    if (!page) return this.error(`'${name}' 문서가 없습니다.`);

                    const ast = parse(page.content);
                    const frame: Node[] = [];

                    ast.forEach((node) => {
                        if (node.type === 'Frame') frame.push(...node.items);
                    });

                    if (frame.length < 1) frame.push(...ast);

                    const renderer = new Renderer(this.findPage, this.findImage, this.getThreads, this.getURL, this.pageCount);

                    const data = await renderer.run(name, frame, node.param, this.depth + 1);

                    return data.value;
                } catch (err) {
                    console.error(err);

                    return this.error(`error`);
                }
            }

            case 'Param': {
                if (!this.param) return await this.getHTML(node.items);

                return this.param[node.name] || (await this.getHTML(node.items));
            }

            case 'Age': {
                return `Age: <time datetime="${this.disableQuot(node.date)}" />(birthday)`;
            }

            case 'Dday': {
                return `Dday: <time datetime="${this.disableQuot(node.date)}" />(start time)`;
            }

            case 'PageCount': {
                return String(await this.pageCount(node.name));
            }

            case 'Ruby': {
                return `<ruby>${await this.getHTML(node.names)}<rp>(</rp><rt>${
                    node.param['color'] ? '<span style="color: ' + this.disableQuot(node.param['color']) + '">' + (node.param['ruby'] || '') + '</span>' : node.param['ruby'] || ''
                }</rt><rp>)</rp></ruby>`;
            }

            case 'Math': {
                return `<katex data-latex="${this.disableQuot(node.value)}">${this.disableTag(node.value)}</katex>`;
            }

            case 'DateTime': {
                return `<time datetime="${new Date().getTime()}" />`;
            }

            case 'TableOfContents': {
                return '<section class="wiki-toc" />';
            }

            case 'TableOfFootnotes': {
                this.footnotes.sort((a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0));
                const footnotes = this.footnotes;

                this.footnotes = [];

                return (
                    '<section class="wiki-footnotes"><ol class="footnotes-list">' +
                    footnotes
                        .map(
                            (footnote) =>
                                `<li class="footnote-ltem" id="rfn-${encodeURIComponent(footnote.id)}"><a href="#fn-${encodeURIComponent(footnote.id)}">[${
                                    footnote.name
                                }]</a> <span>${footnote.content}</span></li>`,
                        )
                        .join('') +
                    '</ol></section>'
                );
            }

            case 'Threads': {
                return (
                    '<ul class="wiki-list">' +
                    (await this.getThreads(this.name))
                        .map((item) => {
                            return `<li>${item}</li>`;
                        })
                        .join('') +
                    '</ul>'
                );
            }

            case 'ClearFix': {
                return '<div style="clear: both" />';
            }

            case 'Table': {
                const columnStyles: {[key: string]: {bg?: string; color?: string}} = {};
                const darkColumnStyles: {[key: string]: {bg?: string; color?: string}} = {};

                node.items.forEach((row) => {
                    row.items.forEach((cell, colIndex) => {
                        if (cell.param['colbgcolor']) {
                            const colbgcolor = this.getColor(cell.param['colbgcolor'], false);
                            if (colbgcolor && !columnStyles[colIndex]?.bg) {
                                if (!columnStyles[colIndex]) columnStyles[colIndex] = {};

                                columnStyles[colIndex].bg = colbgcolor;
                            }

                            const darkColbgcolor = this.getColor(cell.param['colbgcolor'], true);
                            if (darkColbgcolor && !darkColumnStyles[colIndex]?.bg) {
                                if (!darkColumnStyles[colIndex]) darkColumnStyles[colIndex] = {};

                                darkColumnStyles[colIndex].bg = darkColbgcolor;
                            }
                        }
                        if (cell.param['colcolor']) {
                            const colcolor = this.getColor(cell.param['colcolor'], false);
                            if (colcolor && !columnStyles[colIndex]?.color) {
                                if (!columnStyles[colIndex]) columnStyles[colIndex] = {};

                                columnStyles[colIndex].color = colcolor;
                            }

                            const darkColcolor = this.getColor(cell.param['colcolor'], true);
                            if (darkColcolor && !darkColumnStyles[colIndex]?.bg) {
                                if (!darkColumnStyles[colIndex]) darkColumnStyles[colIndex] = {};

                                darkColumnStyles[colIndex].color = darkColcolor;
                            }
                        }
                    });
                });

                return (
                    `<table class="wiki-table" style="${this.disableQuot(
                        (node.param['width'] ? 'width: ' + this.autoPx(node.param['width']) + ';' : '') +
                            (node.param['bgcolor'] ? 'background-color: ' + this.getColor(node.param['bgcolor'], false) + ';' : '') +
                            (node.param['color'] ? 'color: ' + this.getColor(node.param['color'], false) + ';' : '') +
                            (node.param['bordercolor'] ? 'border-color: ' + this.getColor(node.param['bordercolor'], false) + ';' : '') +
                            (node.param['align'] ? 'float: ' + node.param['align'] + ';' : ''),
                    )}" dark-style="${this.disableQuot(
                        (node.param['bgcolor'] ? 'background-color: ' + this.getColor(node.param['bgcolor'], true) + ';' : '') +
                            (node.param['color'] ? 'color: ' + this.getColor(node.param['color'], true) + ';' : '') +
                            (node.param['bordercolor'] ? 'border-color: ' + this.getColor(node.param['bordercolor'], true) + ';' : ''),
                    )}">` +
                    (node.names.length > 0 ? `<caption>${await this.getHTML(node.names)}</caption>` : '') +
                    '<tbody>' +
                    (
                        await Promise.all(
                            node.items.map(
                                async (row, rowIndex) =>
                                    `<tr style="${this.disableQuot(
                                        (row.param['bgcolor'] ? 'background-color: ' + this.getColor(row.param['bgcolor'], false) + ';' : '') +
                                            (row.param['color'] ? 'color: ' + this.getColor(row.param['color'], false) + ';' : ''),
                                    )}" dark-style="${this.disableQuot(
                                        (row.param['bgcolor'] ? 'background-color: ' + this.getColor(row.param['bgcolor'], true) + ';' : '') +
                                            (row.param['color'] ? 'color: ' + this.getColor(row.param['color'], true) + ';' : ''),
                                    )}">` +
                                    (
                                        await Promise.all(
                                            row.items.map(
                                                async (cell, colIndex) =>
                                                    `<td ${cell.param['colspan'] ? 'colspan="' + this.disableQuot(cell.param['colspan']) + '" ' : ''}${
                                                        cell.param['rowspan'] ? 'rowspan="' + this.disableQuot(cell.param['rowspan']) + '" ' : ''
                                                    }style="${this.disableQuot(
                                                        (cell.param['vertical-align'] ? 'vertical-align: ' + cell.param['vertical-align'] + ';' : '') +
                                                            (cell.param['width'] ? 'width: ' + this.autoPx(cell.param['width']) + ';' : '') +
                                                            (cell.param['height'] ? 'height: ' + this.autoPx(cell.param['height']) + ';' : '') +
                                                            (cell.param['align'] ? 'text-align: ' + cell.param['align'] + ';' : 'text-align: center;') +
                                                            (cell.param['nopad'] ? 'padding: 0;' : '') +
                                                            (cell.param['bgcolor'] ? 'background-color: ' + this.getColor(cell.param['bgcolor'], false) + ';' : '') +
                                                            (columnStyles[colIndex]?.bg ? 'background-color: ' + columnStyles[colIndex].bg + ';' : '') +
                                                            (columnStyles[colIndex]?.color ? 'color: ' + columnStyles[colIndex].color + ';' : '') +
                                                            (cell.param['color'] ? 'color: ' + this.getColor(cell.param['color'], false) + ';' : ''),
                                                    )}" dark-style="${this.disableQuot(
                                                        (cell.param['bgcolor'] ? 'background-color: ' + this.getColor(cell.param['bgcolor'], true) + ';' : '') +
                                                            (darkColumnStyles[colIndex]?.bg ? 'background-color: ' + darkColumnStyles[colIndex].bg + ';' : '') +
                                                            (darkColumnStyles[colIndex]?.color ? 'color: ' + darkColumnStyles[colIndex].color + ';' : '') +
                                                            (cell.param['color'] ? 'color: ' + this.getColor(cell.param['color'], true) + ';' : ''),
                                                    )}">` +
                                                    (await this.getHTML(cell.items)) +
                                                    '</td>',
                                            ),
                                        )
                                    ).join('') +
                                    '</tr>',
                            ),
                        )
                    ).join('') +
                    '</tbody></table>'
                );
            }

            case 'List': {
                return (
                    '<ul class="wiki-list">' +
                    (
                        await Promise.all(
                            node.items.map(async (item) => {
                                if (item.type === 'ListItem') {
                                    return `<li class="${
                                        item.name === '1.'
                                            ? 'wiki-list-decimal'
                                            : item.name === 'a.'
                                              ? 'wiki-list-alpha'
                                              : item.name === 'A.'
                                                ? 'wiki-list-upper-alpha'
                                                : item.name === 'i.'
                                                  ? 'wiki-list-roman'
                                                  : item.name === 'I.'
                                                    ? 'wiki-list-upper-roman'
                                                    : ''
                                    }">${await this.getHTML(item.items)}</li>`;
                                }

                                return await this.walk.bind(this)(item);
                            }),
                        )
                    ).join('') +
                    '</ul>'
                );
            }

            case 'Frame': {
                return '';
            }

            case 'Lua': {
                return `<span class="wiki-error">지원 중단됨</span>`;
            }

            default: {
                return '';
            }
        }
    }

    private getMaxHeaderLevel(node: Node) {
        if (node.type === 'Heading') {
            if (this.maxHeaderLevel > node.depth) this.maxHeaderLevel = node.depth;
        }
    }

    public async run(name: string, nodes: Node[], param: {[str: string]: string} | null = null, depth: number = 0) {
        this.name = name;
        this.categories = [];
        this.backlinks = [];
        this.param = param;
        this.depth = depth;
        this.newLines = 0;

        this.footnoteIds = [];
        this.footnotes = [];

        this.headers = [];
        this.headerCounters = [0, 0, 0, 0, 0, 0];

        this.maxHeaderLevel = 6;

        nodes.forEach(this.getMaxHeaderLevel.bind(this));

        let html = await this.getHTML(nodes);

        if (this.footnotes.length > 0) {
            html += await this.walk(new Node('TableOfFootnotes', {}));
        }

        html = html.replace(
            /<section class="wiki-toc" \/>/g,
            '<section class="wiki-toc" id="toc"><h3>목차</h3>' +
                this.headers
                    .map((header) => `<div class="wiki-toc-item wiki-toc-indent-${header.size}"><a href="#s-${header.id}">${header.count}</a> ${header.name}</div>`)
                    .join('') +
                '</section>',
        );

        html = html.replace(/\n\n/g, '<br />');

        html = DOMPurify.sanitize(html);

        return {value: html, backlinks: this.backlinks, categories: this.categories};
    }
}
