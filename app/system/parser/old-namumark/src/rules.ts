const rules: string[] = [
    '### 분류 ',
    '### 리다이렉션 ',
    '### 틀 ',

    '$$틀$$',

    '```',
    '@[toc]',

    '//',

    '#',
    '##',
    '###',
    '####',
    '#####',
    '######',

    '[',
    '](',
    ')',

    "'''",
    "''",
    '**',
    '__',
    '~~',
    '--',
    '^^',
    ',,',
    '{{{#!folding',
    '{{{#!html',
    '{{{#!syntax ',
    '{{{#!frame',
    '{{{#!lua',
    '{{{#!for',
    '}}}',
    '<?lua',
    '<?lua=',
    '?>',
    '[[',
    '[[파일:',
    '[[분류:',
    '|',
    '=',
    '&',
    ']]',
    '[youtube(',
    '[kakaotv(',
    '[nicovideo(',
    '[vimeo(',
    '[navertv(',
    '[include(',
    '[age(',
    '[dday(',
    '[pagecount(',
    '[ruby(',
    '[math(',
    '[anchor(',
    ',',
    ')]',
    ')](', // 링크 문법 1 버그 수정
    ')]]', // 링크 문법 2 버그 수정
    '[date]',
    '[datetime]',
    '[목차]',
    '[tableofcontents]',
    '[각주]',
    '[footnote]',
    '[쓰레드]',
    '[threads]',
    '[br]',
    '[clearfix]',
    '[pagecount]',
    '[*',
    '[^',
    ' ',
    ']',
    '>',
    '<math>',
    '</math>',

    '||',
    '<-',
    '<:>',
    '<width=',
    '<height=',
    '<|',
    '<(>',
    '<)>',
    '<^|',
    '<v|',
    '<nopad>',
    '<tablewidth=',
    '<table width=',
    '<bgcolor=',
    '<#',
    '<colbgcolor=',
    '<rowbgcolor=',
    '<tablebgcolor=',
    '<table bgcolor=',
    '<color=',
    '<color',
    '<colcolor=',
    '<rowcolor=',
    '<tablecolor=',
    '<table color=',
    '<tablebordercolor=',
    '<table bordercolor=',
    '<tablealign=left>',
    '<table align=left>',
    '<tablealign=center>',
    '<table align=center>',
    '<tablealign=right>',
    '<table align=right>',

    '*',
    '1.',
    'a.',
    'A.',
    'i.',
    'I.',
    '#',

    '@',
];

rules.sort((a, b) => b.length - a.length);

export const textRules: {[str: string]: string} = {
    "'''": 'Bold',
    '**': 'Bold',
    "''": 'Italic',
    __: 'Underscore',
    '~~': 'Strikethrough',
    '--': 'Strikethrough',
    '^^': 'SuperScript',
    ',,': 'SubScript',
};
export const videos = ['[youtube(', '[kakaotv(', '[nicovideo(', '[vimeo(', '[navertv('];
export const lists = ['*', '1.', 'a.', 'A.', 'i.', 'I.'];

export default rules;
