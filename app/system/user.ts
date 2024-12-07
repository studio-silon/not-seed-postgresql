import type {PermissionsType} from './.server/user';

export const permissions: Record<PermissionsType, string> = {
    admin: '관리자 권한',
    revoke_admin: '관리자 권한 취소 권한',
    update_thread_status: '스레드 상태 업데이트 권한',
    delete_thread: '스레드 삭제 권한',
    nsacl: 'ACL 관리 권한',
    group: '그룹 관리 권한',
    hide_thread_comment: '스레드 댓글 숨기기 권한',
    grant: '권한 부여 권한',
    update_thread: '스레드 업데이트 권한',
    aclgroup: '그룹 관리 권한',
    remove_rever: '리버전 제거 권한',
    batch_rever: '일괄 되돌리기 권한',
};
