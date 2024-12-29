import {useEffect} from 'react';
import type {LinksFunction, LoaderFunctionArgs} from '@remix-run/node';
import {defer} from '@remix-run/node';
import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData} from '@remix-run/react';

import {toast} from 'sonner';

import {Toaster} from '~/components/ui/sonner';

import {Site} from './system/.server/site';
import {prisma} from './db.server';

import './tailwind.css';

import {getCookie, setCookie} from '~/utils/cookies.server';
import {commitSession,getSession} from '~/utils/sessions.server';

export const links: LinksFunction = () => [
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    },
];

function FindUser(userId: number) {
    return prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            permissions: true,
            siteInfo: {
                select: {
                    id: true,
                },
            },
        },
    });
}

export async function loader({request}: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    const cookie = await getCookie(request);

    const toast = cookie.toast;

    if (cookie.toast) delete cookie.toast;

    let user: Awaited<ReturnType<typeof FindUser>> | null = null;

    if (session.has('userId')) {
        user = await FindUser(session.get('userId')!);

        if (!user) {
            session.unset('userId');

            return new Response('Unauthorized', {
                status: 401,
                headers: {
                    'Set-Cookie': await commitSession(session),
                },
            });
        }
    }

    return defer(
        {
            user,
            site: await Site.getInfoForUser(),
            toast,
        },
        {
            headers: {
                'Set-Cookie': await setCookie(cookie),
            },
        },
    );
}

export function Layout({children}: {children: React.ReactNode}) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    const data = useLoaderData<typeof loader>();

    useEffect(() => {
        if (data.toast) {
            toast(data.toast.message, {});
        }
    }, [data.toast]);

    return (
        <>
            <Toaster />
            <Outlet />
        </>
    );
}
