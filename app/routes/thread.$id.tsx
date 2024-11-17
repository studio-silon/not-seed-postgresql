import {json, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, useNavigate, Form, useSubmit, useNavigation} from '@remix-run/react';
import {Wiki} from '@/system/wiki';
import {Button} from '~/stories/Button';
import {ArrowLeft, Lock, Send, Unlock, X} from 'lucide-react';
import {useState, useEffect, useRef} from 'react';
import {getUserData, getUser} from '~/utils/sessions.server';
import {Frame} from '~/components/Frame';
import metaTitle from '~/utils/meta';
import {Textarea} from '~/stories/Textarea';
import {User} from '~/system/.server/user';
import {Acl} from '~/system/.server/acl';

export const meta = metaTitle<typeof loader>((data) => (data.thread ? data.thread.title : ''));

export async function loader({request, params}: LoaderFunctionArgs & {params: {id: string}}) {
    const thread = await Wiki.getDiscussion(+params['id']);
    const user = await getUser(request);
    const userData = await getUserData(request);

    if (!thread) {
        throw new Response('Not Found', {status: 404});
    }

    if (!(await Acl.isAllowed(thread.wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    return json({
        thread,
        canUpdateState: await User.checkPermission('update_thread_status', user),
    });
}

export async function action({request}: {request: Request}) {
    const formData = await request.formData();
    const action = formData.get('action');
    const user = await getUser(request);
    const userData = await getUserData(request);
    const wikiId = parseInt(formData.get('wikiId') as string);

    const wiki = await Wiki.getPageById(wikiId);

    if (!wiki) {
        throw new Response('Not Found', {status: 404});
    }

    if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'read'))) {
        throw new Response('Forbidden', {status: 403});
    }

    switch (action) {
        case 'comment': {
            if (wiki && !(await Acl.isAllowed(wiki, user, userData, 'comment_create'))) {
                throw new Response('Forbidden', {status: 403});
            }
            const discussionId = parseInt(formData.get('discussionId') as string);
            const content = formData.get('content') as string;
            const type = parseInt(formData.get('type') as string);
            await Wiki.addComment(discussionId, content, type, userData);
            break;
        }
        case 'status': {
            if (!(await User.checkPermission('update_thread_status', user))) {
                throw new Response('Forbidden', {status: 403});
            }
            const discussionId = parseInt(formData.get('discussionId') as string);
            const status = parseInt(formData.get('status') as string) as 0 | 1;
            await Wiki.updateDiscussionStatus(discussionId, status);
            break;
        }
        default:
            throw new Error('Invalid action');
    }

    return null;
}

export default function DiscussionRoute() {
    const {thread, canUpdateState} = useLoaderData<typeof loader>();
    const [newComment, setNewComment] = useState('');
    const commentInputRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const submit = useSubmit();
    const navigate = useNavigate();
    const navigation = useNavigation();

    const formatDate = (date: string | Date) =>
        new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        await submit(formData, {method: 'post'});
        setNewComment('');
    };

    useEffect(() => {
        if (navigation.state === 'loading' && commentInputRef.current) {
            commentInputRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [navigation.state]);

    return (
        <Frame>
            <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between my-auto gap-2">
                    <div className="flex flex-1 mb-2 sm:mb-0">
                        <h1 className="text-2xl font-bold text-gray-800 flex-1">{thread.title}</h1>
                        <Button variant="ghost" onClick={() => navigate(-1)} className="p-0 size-8 hover:bg-gray-100 text-gray-600">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        {canUpdateState && (
                            <Form method="post" className="ml-2">
                                <input type="hidden" name="action" value="status" />
                                <input type="hidden" name="wikiId" value={thread.wiki.id} />
                                <input type="hidden" name="discussionId" value={thread.id} />
                                <input type="hidden" name="status" value={thread.status ? '0' : '1'} />
                                <Button type="submit" variant="ghost" className="size-8 p-0">
                                    {thread.status === 0 ? <Lock className="h-4 w-4 m-auto" /> : <Unlock className="h-4 w-4 m-auto" />}
                                </Button>
                            </Form>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-4 max-w-full overflow-hidden">
                {thread.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 w-fit max-w-full break-words">
                        <div className="flex justify-between items-center mb-2 gap-4">
                            <span className="font-medium text-gray-700">{comment.user?.username || comment.ipAddress}</span>
                            <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <div className="prose prose-sm max-w-full text-gray-600 break-words">{comment.content}</div>
                    </div>
                ))}
            </div>

            <Form ref={formRef} method="post" onSubmit={handleSubmitComment} className="flex gap-2 w-full">
                <input type="hidden" name="action" value="comment" />
                <input type="hidden" name="wikiId" value={thread.wiki.id} />
                <input type="hidden" name="discussionId" value={thread.id} />
                <input type="hidden" name="type" value="0" />
                <div className="flex-1">
                    <Textarea
                        ref={commentInputRef}
                        name="content"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] focus:ring-2 focus:ring-blue-500"
                        placeholder="댓글을 입력하세요..."
                    />
                </div>
                <Button type="submit" className="self-end">
                    <Send className="h-4 w-4" />
                </Button>
            </Form>
        </Frame>
    );
}
