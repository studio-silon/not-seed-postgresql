import {createCookie} from '@remix-run/node';

export const Cookie = createCookie('Setting', {
    maxAge: 604_800,
});

export async function getCookie(request: Request) {
    const cookieHeader = request.headers.get('Cookie');
    const cookie = (await Cookie.parse(cookieHeader)) || {};

    return cookie;
}

export async function setCookie(cookie: object) {
    return await Cookie.serialize(cookie);
}
