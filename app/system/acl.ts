import type {AclType} from '@/system/acl';

export const acls: Record<AclType, string> = {
    read: '읽기',
    edit: '편집',
    move: '이동',
    delete: '삭제',
    thread_create: '스레드 생성',
    comment_create: '댓글 생성',
    acl: 'ACL 관리',
};
