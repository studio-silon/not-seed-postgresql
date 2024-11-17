export function urlEncoding(url: string) {
    return encodeURI(url).replace(/\?/gm, '%3F').replace(/&/gm, '%25').replace(/#/gm, '%23');
}
