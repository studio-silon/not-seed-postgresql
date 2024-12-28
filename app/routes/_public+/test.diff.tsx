import {diffLines} from 'diff';
import {useState} from 'react';
import {Frame} from '~/components/frame';
import {Textarea} from '~/components/ui/textarea';

export default function DiffPage() {
    const [original, setOriginal] = useState('');
    const [modified, setModified] = useState('');

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
                    <h1 className="text-2xl font-bold">테스트:비교</h1>
                </div>

                <label htmlFor="original" className="block mb-2 text-sm font-medium text-gray-900">
                    Original
                </label>
                <Textarea
                    id="original"
                    rows={4}
                    className="block w-full h-52"
                    placeholder="Write your original text here..."
                    value={original}
                    onChange={(e) => setOriginal(e.target.value)}
                />

                <label htmlFor="modified" className="block mt-4 mb-2 text-sm font-medium text-gray-900">
                    Modified
                </label>
                <Textarea
                    id="modified"
                    rows={4}
                    className="block w-full h-52"
                    placeholder="Write your modified text here..."
                    value={modified}
                    onChange={(e) => setModified(e.target.value)}
                />

                <label htmlFor="diff" className="block mt-4 mb-2 text-sm font-medium text-gray-900">
                    Prompt
                </label>
                <pre id="diff" className="block p-2 bg-gray-100 rounded w-full break-words whitespace-pre-line">
                    {diff
                        .map((part) => (part.added && part.value.split('\n').map((v) => '+ ' + v)) || (part.removed && part.value.split('\n').map((v) => '- ' + v)))
                        .filter((data) => data !== false)
                        .flat()
                        .join('\n')}
                </pre>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 rounded-lg shadow-xs overflow-auto">
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
