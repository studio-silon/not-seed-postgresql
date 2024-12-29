import {ForwardRefExoticComponent, RefAttributes, useState} from 'react';
import {Form, Link} from '@remix-run/react';
import {useRouteLoaderData} from '@remix-run/react';

import {ArrowDown01, ArrowRight,ArrowUp10, Clock8, FilterX, Frown, LucideProps, MessageSquare, NotebookPen, Search, Shuffle, UserIcon, Users2Icon, Wrench} from 'lucide-react';

import type {loader as RootLoader} from '../root';

import {Button} from './ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from './ui/dropdown-menu';
import {Input} from './ui/input';

import {useIsMobile} from '~/hooks/use-mobile';
import {switchTheme} from '~/utils/switch-theme';

interface NavItemProps {
    name: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
    link?: string;
    trigger?: (
        permissions: {
            type: string;
        }[],
    ) => boolean;
    dropdown?: NavItemProps[];
}

const items: NavItemProps[] = [
    {name: '최근 변경', icon: Clock8, link: '/recentChanges'},
    {name: '최근 토론', icon: MessageSquare, link: '/recentDiscuss'},
    {
        name: '도구',
        icon: Wrench,
        dropdown: [
            {name: '작성이 필요한 문서', icon: NotebookPen, link: '/neededPages'},
            {name: '고립된 문서', icon: Frown, link: '/orphanedPages'},
            {name: '분류가 되지 않은 문서', icon: FilterX, link: '/uncategorizedPages'},
            {name: '내용이 짧은 문서', icon: ArrowDown01, link: '/shortestPages'},
            {name: '내용이 긴 문서', icon: ArrowUp10, link: '/longestPages'},
            {name: '임의 문서', icon: Shuffle, link: '/random'},
            {name: '권한 로그', icon: UserIcon, link: '/permissionHistory'},
            {
                name: '[ADMIN] 위키 설정',
                icon: Wrench,
                trigger: (permissions) => {
                    const names = permissions.map((permission) => permission.type);

                    return names.includes('admin');
                },
                link: '/setting',
            },
            {
                name: '[ADMIN] 그룹 관리',
                icon: Users2Icon,
                trigger: (permissions) => {
                    const names = permissions.map((permission) => permission.type);

                    return names.includes('admin');
                },
                link: '/group',
            },
            {
                name: '[ADMIN] 일괄 되돌리기',
                icon: Wrench,
                trigger: (permissions) => {
                    const names = permissions.map((permission) => permission.type);

                    return names.includes('batch_rever');
                },
                link: '/batchRevert',
            },
            {
                name: '[ADMIN] 권한 관리',
                icon: Wrench,
                trigger: (permissions) => {
                    const names = permissions.map((permission) => permission.type);

                    return names.includes('admin') || names.includes('grant');
                },
                link: '/permission',
            },
        ],
    },
];

export function Navbar() {
    const root = useRouteLoaderData<typeof RootLoader>('root');
    const isMobile = useIsMobile();

    return (
        <nav className="flex w-full bg-primary items-center px-4 py-2 gap-2 flex-col md:flex-row">
            <div className="flex items-center gap-4 md:mx-auto text-primary-foreground w-full md:w-auto">
                <Link to={'/wiki/' + root?.site?.frontPage}>
                    <span className="text-lg">{root?.site?.title}</span>{' '}
                </Link>
                <div className="flex items-center gap-2">
                    {items.map(
                        (item, index) =>
                            (root?.user?.siteInfo || !item.trigger || (item.trigger && item.trigger(root?.user?.permissions || []))) &&
                            (item.dropdown ? (
                                <DropdownMenu key={index}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="text-base" size={isMobile ? 'icon' : 'default'}>
                                            <item.icon strokeWidth={2} className="m-auto md:mx-0 md:me-1" size={22} />
                                            <span className="hidden md:flex"> {item.name}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {item.dropdown.map(
                                            (subItem, subIndex) =>
                                                (root?.user?.siteInfo || !subItem.trigger || (subItem.trigger && subItem.trigger(root?.user?.permissions || []))) && (
                                                    <Link to={subItem.link || '#'} key={index}>
                                                        <DropdownMenuItem key={subIndex} className="flex items-center gap-2">
                                                            <subItem.icon className="size-4" />
                                                            {subItem.name}
                                                        </DropdownMenuItem>
                                                    </Link>
                                                ),
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to={item.link || '#'} key={index}>
                                    <Button variant="ghost" className="text-base" size={isMobile ? 'icon' : 'default'}>
                                        <item.icon strokeWidth={2} className="m-auto md:mx-0 md:me-1" size={22} />
                                        <span className="hidden md:flex"> {item.name}</span>
                                    </Button>
                                </Link>
                            )),
                    )}
                </div>
            </div>

            <Form className="flex items-center gap-2 ms-auto w-full md:w-auto">
                <Button variant="secondary" size="icon">
                    <Shuffle />
                </Button>
                <Form method="GET" action="/search" className="relative flex-1">
                    <Input name="keyword" className="w-full md:w-48 bg-secondary" placeholder="여기에서 검색" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground gap-2 flex">
                        <Search size={16} className="cursor-pointer" />
                        <ArrowRight size={16} className="cursor-pointer" />
                    </div>
                </Form>
            </Form>

            <div className="flex items-center gap-2 ms-2 me-auto text-primary-foreground absolute md:relative top-2 right-2 md:top-0 md:right-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <UserIcon strokeWidth={1.5} size={22} />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuItem>{root?.user ? root?.user.username : 'Please login'}</DropdownMenuItem>
                        {root?.user ? (
                            <>
                                <Link to={'/editUser'}>
                                    <DropdownMenuItem>회원 정보 수정</DropdownMenuItem>
                                </Link>
                                <Link to={'/myStars'}>
                                    <DropdownMenuItem>내 문서함</DropdownMenuItem>
                                </Link>
                                <Link to={'/contribution/user/' + encodeURI(root?.user.username)}>
                                    <DropdownMenuItem>내 기여내역</DropdownMenuItem>
                                </Link>
                                <Link to={'/logout'}>
                                    <DropdownMenuItem>Logout</DropdownMenuItem>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to={'/login'}>
                                    <DropdownMenuItem>Login</DropdownMenuItem>
                                </Link>
                                <Link to={'/signup'}>
                                    <DropdownMenuItem>Sign up</DropdownMenuItem>
                                </Link>
                            </>
                        )}
                        <DropdownMenuItem onClick={() => switchTheme()}>테마 바꾸기</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}
