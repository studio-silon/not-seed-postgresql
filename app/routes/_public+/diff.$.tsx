import {json, LoaderFunction, LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData, useParams} from '@remix-run/react';
import {diffLines} from 'diff';
import {Frame} from '~/components/frame';
import {Button} from '~/components/ui/button';
import {ArrowLeft} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Wiki} from '~/system/.server/wiki';

export async function loader({request, params}: LoaderFunctionArgs) {
    const [namespace, title] = Wiki.splitName(params['*'] || '');
    const url = new URL(request.url);
    const originalRever = Number(url.searchParams.get('original')) || 0;
    const modifiedRever = Number(url.searchParams.get('modified')) || 0;

    const original = await Wiki.getPageWithRever(namespace, title, originalRever);
    const modified = await Wiki.getPageWithRever(namespace, title, modifiedRever);

    if (!original || !modified) {
        throw new Response('One or both versions not found', {status: 404});
    }

    return json({
        original: original.version?.content || '',
        modified: modified.version?.content || '',
    });
}

export default function DiffPage() {
    const {original, modified} = useLoaderData<typeof loader>();
    const params = useParams();

    const diff = diffLines(original, modified);

    const originalLines: Array<{lineNumber: number; content: string}> = [];
    const modifiedLines: Array<{lineNumber: number; content: string}> = [];

    let originalLineNumber = 1;
    let modifiedLineNumber = 1;

    diff.forEach((part) => {
        const lines = part.value.split('\n');

        if (part.added) {
            lines.forEach((line) => {
                if (line.trim() !== '') {
                    modifiedLines.push({lineNumber: modifiedLineNumber++, content: `+ ${line}`});
                }
            });
        } else if (part.removed) {
            lines.forEach((line) => {
                if (line.trim() !== '') {
                    originalLines.push({lineNumber: originalLineNumber++, content: `- ${line}`});
                }
            });
        } else {
            lines.forEach((line) => {
                if (line.trim() !== '') {
                    originalLines.push({lineNumber: originalLineNumber++, content: `  ${line}`});
                    modifiedLines.push({lineNumber: modifiedLineNumber++, content: `  ${line}`});
                }
            });
        }
    });

    return (
        <Frame>
            <div className="flex flex-col p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">{params['*']}의 비교</h1>
                    <Link to={`/wiki/${params['*']}`}>
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                            <ArrowLeft className="h-4 w-4 m-auto" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 rounded-lg shadow-xs overflow-auto">
                    <div className="bg-red-50 p-4">
                        <h2 className="font-bold text-red-600 mb-2">Original</h2>
                        <pre>
                            {originalLines.map((line, index) => (
                                <div key={index} className="flex gap-2">
                                    <span className="text-gray-400">{line.lineNumber}</span>
                                    <code className={'whitespace-normal break-words overflow-hidden ' + (line.content.startsWith('-') ? 'text-red-600' : '')}>{line.content}</code>
                                </div>
                            ))}
                        </pre>
                    </div>
                    <div className="bg-green-50 p-4">
                        <h2 className="font-bold text-green-600 mb-2">Modified</h2>
                        <pre>
                            {modifiedLines.map((line, index) => (
                                <div key={index} className="flex gap-2">
                                    <span className="text-gray-400">{line.lineNumber}</span>
                                    <code className={'whitespace-normal break-words overflow-hidden ' + (line.content.startsWith('+') ? 'text-green-600' : '')}>
                                        {line.content}
                                    </code>
                                </div>
                            ))}
                        </pre>
                    </div>
                </div>
            </div>
        </Frame>
    );
}
