import {Form, Link} from '@remix-run/react';
import {Button} from '~/stories/Button';
import {UserIcon, NotebookPen, Clock8, MessageSquare, Wrench, Search, Menu, X, Mail, ChevronUpIcon, ChevronDownIcon, LucideProps, Shuffle, Users2Icon, Frown} from 'lucide-react';
import {Dropdown} from '~/stories/Dropdown';
import {Popover} from '~/stories/Popover';
import {Input} from '~/stories/Input';
import React, {ForwardRefExoticComponent, RefAttributes, useState} from 'react';
import {useRouteLoaderData} from '@remix-run/react';
import type {loader as RootLoader} from '../root';

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <header className="h-14 bg-white/5 backdrop-blur border-b border-secondary-300/20 flex items-center px-4 sticky top-0 z-50">
                <div className="max-w-7xl w-full mx-auto flex items-center">
                    <div className="flex items-center">
                        <Button variant="ghost" className="mr-2 size-8 p-0 lg:hidden" onClick={toggleMenu}>
                            <Menu strokeWidth={1.5} className="size-4 m-auto" />
                        </Button>
                        <Link to="/">
                            <h1 className="text-xl font-semibold text-brand">{root?.site?.title}</h1>
                        </Link>
                    </div>

                    <div className="hidden lg:flex ml-6 items-center gap-2">
                        {items.map(
                            (item, index) =>
                                (root?.user?.siteInfo || !item.trigger || (item.trigger && item.trigger(root?.user?.permissions || []))) &&
                                (item.dropdown ? (
                                    <Dropdown key={index}>
                                        <Dropdown.Trigger asChild>
                                            <Button variant="ghost" className="size-8 p-0">
                                                <item.icon strokeWidth={1.5} className="size-4 m-auto" />
                                            </Button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" className="w-[200px]">
                                            {item.dropdown.map(
                                                (subItem, subIndex) =>
                                                    (root?.user?.siteInfo || !subItem.trigger || (subItem.trigger && subItem.trigger(root?.user?.permissions || []))) && (
                                                        <Link to={subItem.link || '#'} key={index}>
                                                            <Dropdown.Item key={subIndex} className="flex items-center gap-2">
                                                                <subItem.icon className="size-4" />
                                                                {subItem.name}
                                                            </Dropdown.Item>
                                                        </Link>
                                                    ),
                                            )}
                                        </Dropdown.Content>
                                    </Dropdown>
                                ) : (
                                    <Link to={item.link || '#'} key={index}>
                                        <Button variant="ghost" className="size-8 p-0">
                                            <item.icon strokeWidth={1.5} className="size-4 m-auto" />
                                        </Button>
                                    </Link>
                                )),
                        )}
                    </div>

                    <div className="hidden lg:flex items-center ml-auto mr-2">
                        <Form method="GET" action="/search">
                            <Input name="keyword" placeholder="Search..." size="md" leftIcon={<Search size={16} />} className="w-64" />
                        </Form>
                    </div>

                    <div className="ml-auto lg:ml-0 flex items-center gap-2">
                        <Dropdown>
                            <Dropdown.Trigger asChild>
                                <Button variant="ghost" className="size-8 p-0">
                                    <UserIcon strokeWidth={1.5} className="size-4 m-auto" />
                                </Button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right" className="w-[200px]">
                                <Dropdown.Text>{root?.user ? root?.user.username : 'Please login'}</Dropdown.Text>
                                {root?.user ? (
                                    <>
                                        <Link to={'/editUser'}>
                                            <Dropdown.Item>회원 정보 수정</Dropdown.Item>
                                        </Link>
                                        <Link to={'/myStars'}>
                                            <Dropdown.Item>내 문서함</Dropdown.Item>
                                        </Link>
                                        <Link to={'/contribution/user/' + encodeURI(root?.user.username)}>
                                            <Dropdown.Item>내 기여내역</Dropdown.Item>
                                        </Link>
                                        <Link to={'/logout'}>
                                            <Dropdown.Item>Logout</Dropdown.Item>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to={'/login'}>
                                            <Dropdown.Item>Login</Dropdown.Item>
                                        </Link>
                                        <Link to={'/signup'}>
                                            <Dropdown.Item>Sign up</Dropdown.Item>
                                        </Link>
                                    </>
                                )}
                            </Dropdown.Content>
                        </Dropdown>

                        {/*<Popover>
                            <Popover.Trigger>
                                <Button variant="ghost" className="size-8 p-0">
                                    <BellIcon strokeWidth={1.5} className="size-4 m-auto" />
                                </Button>
                            </Popover.Trigger>

                            <Popover.Content align="end" className="w-[50px] lg:w-[100px] p-0">
                                <Popover.Header>Updates</Popover.Header>
                                <div className="p-4">
                                    <p className="text-sm text-gray-600">Articles you follow have been updated.</p>
                                </div>
                            </Popover.Content>
                        </Popover>*/}
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-white/5 backdrop-blur z-40 p-4">
                    <div className="flex justify-end items-center mb-4">
                        <Button variant="ghost" className="size-8 p-0" onClick={toggleMenu}>
                            <X strokeWidth={1.5} className="size-4 m-auto" />
                        </Button>
                    </div>
                    <Form method="GET" action="/search">
                        <Input name="keyword" placeholder="Search..." size="md" leftIcon={<Search size={16} />} className="w-full mb-4" />
                    </Form>

                    <div className="space-y-2">
                        {items.map(
                            (item, index) =>
                                (root?.user?.siteInfo || !item.trigger || (item.trigger && item.trigger(root?.user?.permissions || []))) && (
                                    <div key={index} className="flex flex-col">
                                        <Link to={item.link || '#'} key={index}>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start flex items-center"
                                                onClick={() => setOpenDropdownIndex(openDropdownIndex === index ? null : index)}
                                            >
                                                <item.icon className="size-4 mr-2" />
                                                {item.name}
                                                {item.dropdown && <span className="ml-auto">{openDropdownIndex === index ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>}
                                            </Button>
                                        </Link>

                                        {item.dropdown && openDropdownIndex === index && (
                                            <div className="ml-6 mt-2 space-y-1 transition-all">
                                                {item.dropdown.map(
                                                    (subItem, subIndex) =>
                                                        (root?.user?.siteInfo || !subItem.trigger || (subItem.trigger && subItem.trigger(root?.user?.permissions || []))) && (
                                                            <Link to={subItem.link || '#'} key={subIndex}>
                                                                <Button variant="ghost" className="w-full justify-start flex items-center text-sm pl-6">
                                                                    <subItem.icon className="size-4 mr-2" />
                                                                    {subItem.name}
                                                                </Button>
                                                            </Link>
                                                        ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ),
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
