import React, {useState} from 'react';
import {LoaderFunction, LoaderFunctionArgs, json} from '@remix-run/node';
import {useLoaderData, useFetcher, Link} from '@remix-run/react';
import {prisma} from '~/db.server';
import {getUser} from '~/utils/sessions.server';
import {Frame} from '~/components/frame';
import {Button} from '~/components/ui/button';
import {JoinName} from '~/utils/wiki';

export async function loader({request}: LoaderFunctionArgs) {
    const user = await getUser(request);
    if (!user) {
        throw new Response('Unauthorized', {status: 401});
    }

    const stars = await prisma.star.findMany({
        where: {
            userId: user.id,
        },
        include: {
            wiki: {
                select: {
                    namespace: true,
                    title: true,
                    updatedAt: true,
                },
            },
        },
        orderBy: {
            wiki: {
                updatedAt: 'desc',
            },
        },
    });

    return json({stars});
}

export async function action({request}: LoaderFunctionArgs) {
    const user = await getUser(request);
    if (!user) {
        throw new Response('Unauthorized', {status: 401});
    }

    const formData = await request.formData();
    const wikiId = Number(formData.get('wikiId'));
    const action = formData.get('action');

    if (action === 'toggleStar') {
        const existingStar = await prisma.star.findFirst({
            where: {wikiId, userId: user.id},
        });

        if (existingStar) {
            await prisma.star.delete({where: {id: existingStar.id}});
        } else {
            await prisma.star.create({
                data: {wikiId, userId: user.id},
            });
        }

        return json({success: true});
    }

    if (action === 'removeSelectedStars') {
        const starIds = formData.getAll('starIds').map(Number);

        await prisma.star.deleteMany({
            where: {
                id: {in: starIds},
                userId: user.id,
            },
        });

        return json({success: true});
    }

    return json({success: false});
}

export default function MyStarsPage() {
    const {stars} = useLoaderData<typeof loader>();
    const [selectedStars, setSelectedStars] = useState<number[]>([]);
    const starFetcher = useFetcher();

    const handleSelectStar = (starId: number) => {
        setSelectedStars((prev) => (prev.includes(starId) ? prev.filter((id) => id !== starId) : [...prev, starId]));
    };

    const handleRemoveSelectedStars = () => {
        const formData = new FormData();
        formData.append('action', 'removeSelectedStars');
        selectedStars.forEach((starId) => {
            formData.append('starIds', starId.toString());
        });

        starFetcher.submit(formData, {method: 'POST'});

        setSelectedStars([]);
    };

    return (
        <Frame>
            <div className="flex flex-col">
                <div className="bg-background rounded-lg shadow-xs mb-6 p-4">
                    <h1 className="text-2xl font-bold">내 문서함</h1>
                    {stars.length === 0 && <p className="text-gray-500 mt-4">내 문서함이 비어있습니다.</p>}
                </div>

                {stars.length > 0 && (
                    <div className="bg-background rounded-lg shadow-xs">
                        {selectedStars.length > 0 && (
                            <div className="p-4 bg-gray-50 flex justify-between items-center">
                                <span className="text-gray-700">{selectedStars.length}개의 문서 선택됨</span>
                                <Button variant="destructive" onClick={handleRemoveSelectedStars}>
                                    선택한 관심 문서 삭제
                                </Button>
                            </div>
                        )}

                        {stars.map((star) => (
                            <div
                                key={star.id}
                                className={`
                                    border-b border-border p-4 hover:bg-muted flex items-center
                                    ${selectedStars.includes(star.id) ? 'bg-blue-50' : ''}
                                `}
                                onClick={() => handleSelectStar(star.id)}
                            >
                                <input type="checkbox" className="mr-4" checked={selectedStars.includes(star.id)} onKeyDown={() => handleSelectStar(star.id)} />
                                <Link to={`/wiki/${JoinName(star.wiki.namespace, star.wiki.title)}`} className="font-medium text-blue-600 hover:underline">
                                    {JoinName(star.wiki.namespace, star.wiki.title)}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Frame>
    );
}
