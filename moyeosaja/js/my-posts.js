/**
 * 내 공구글 페이지
 * 사용자가 작성한 게시글 목록 조회
 */

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadMyPosts();
});

/**
 * 내 공구글 목록 로드 (백엔드 API 연동)
 */
async function loadMyPosts() {
    try {
        // 로그인 확인
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = './login.html';
            return;
        }

        // 현재 사용자 정보 가져오기 (500 에러 시 fallback)
        let userInfo;
        let currentUserId;
        
        try {
            userInfo = await window.apiService.getMyInfo();
            currentUserId = userInfo.user_id;
        } catch (error) {
            // 500 에러 시 localStorage에서 userId 사용 (fallback)
            if (error.message && error.message.includes('500')) {
                console.warn('⚠️ getMyInfo 500 에러 - localStorage에서 userId 사용 (fallback)');
                currentUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
                if (!currentUserId) {
                    throw new Error('사용자 정보를 가져올 수 없습니다.');
                }
                currentUserId = parseInt(currentUserId);
            } else {
                throw error; // 다른 에러는 재발생
            }
        }

        if (!currentUserId) {
            throw new Error('사용자 정보를 가져올 수 없습니다.');
        }

        console.log('내 공구글 로드 시작... (userId:', currentUserId, ')');

        // 로딩 상태 표시
        const postsList = document.querySelector('.my-posts-list');
        if (postsList) {
            postsList.innerHTML = '<div class="loading">로딩 중...</div>';
        }

        // 백엔드 API 호출
        // TODO: 백엔드에 GET /api/users/me/posts 엔드포인트가 추가되면 사용
        // const response = await window.apiService.getMyPosts();
        
        // 현재는 모든 게시글을 가져와서 필터링
        const response = await window.apiService.getPosts({
            page: 1,
            limit: 100 // 모든 게시글 가져오기
        });

        console.log('게시글 목록 로드 성공:', response);

        // 내가 작성한 게시글만 필터링
        const myPosts = response.posts?.filter(post => post.author_id === currentUserId) || [];

        console.log('내 공구글 필터링 결과:', myPosts);

        // UI 업데이트
        if (postsList) {
            if (myPosts.length > 0) {
                renderMyPosts(myPosts);
            } else {
                postsList.innerHTML = '<div class="empty-message">작성한 공구글이 없습니다.</div>';
            }
        }
    } catch (error) {
        console.error('내 공구글 로드 오류:', error);
        const postsList = document.querySelector('.my-posts-list');
        if (postsList) {
            postsList.innerHTML = '<div class="error-message">공구글을 불러올 수 없습니다.</div>';
        }
        
        // 인증 에러 시 로그인 페이지로 이동
        if (error.message && error.message.includes('인증')) {
            window.location.href = './login.html';
        }
    }
}

/**
 * 내 공구글 목록 렌더링
 * @param {Array} posts - 게시글 배열
 */
function renderMyPosts(posts) {
    const postsList = document.querySelector('.my-posts-list');
    if (!postsList) return;

    if (!posts || posts.length === 0) {
        postsList.innerHTML = '<div class="empty-message">작성한 공구글이 없습니다.</div>';
        return;
    }

    // 최신순 정렬 (created_at 기준)
    const sortedPosts = [...posts].sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA; // 최신순
    });

    postsList.innerHTML = sortedPosts.map((post, index) => {
        const currentCount = post.current_participants || 0;
        const targetCount = post.target_participants || 0;

        return `
            <div class="my-post-item" data-post-id="${post.post_id}">
                <div class="post-content" style="flex: 1; cursor: pointer;">
                    <h3 class="post-title">${escapeHtml(post.title || '제목 없음')}</h3>
                    <p class="post-description">${escapeHtml(post.description || post.pickup_location_text || '')}</p>
                </div>
                <div class="post-actions">
                    <span class="post-count">${currentCount}/${targetCount}</span>
                    <button class="btn-edit-post" data-post-id="${post.post_id}" title="수정">✏️</button>
                    <button class="btn-delete-post" data-post-id="${post.post_id}" title="삭제">🗑️</button>
                </div>
            </div>
            ${index < sortedPosts.length - 1 ? '<div class="divider"></div>' : ''}
        `;
    }).join('');

    // 게시글 클릭 이벤트 추가 (상세 페이지로 이동)
    postsList.querySelectorAll('.post-content').forEach(content => {
        content.addEventListener('click', (e) => {
            // 버튼 클릭은 제외
            if (e.target.closest('.btn-edit-post, .btn-delete-post')) {
                return;
            }
            
            const item = content.closest('.my-post-item');
            const postId = item?.getAttribute('data-post-id');
            if (postId) {
                sessionStorage.setItem('selectedPostId', postId);
                window.location.href = './matching.html';
            }
        });
    });

    // 수정 버튼 이벤트
    postsList.querySelectorAll('.btn-edit-post').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const postId = btn.getAttribute('data-post-id');
            if (postId) {
                // TODO: 게시글 수정 페이지로 이동 (수정 페이지가 있으면)
                // window.location.href = `./create-post-edit.html?postId=${postId}`;
                alert('게시글 수정 기능은 준비 중입니다.');
                console.log('게시글 수정:', postId);
            }
        });
    });

    // 삭제 버튼 이벤트
    postsList.querySelectorAll('.btn-delete-post').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const postId = btn.getAttribute('data-post-id');
            if (postId) {
                if (confirm('정말 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
                    await deletePost(postId);
                }
            }
        });
    });
}

/**
 * 게시글 삭제
 * @param {string} postId - 게시글 ID
 */
async function deletePost(postId) {
    try {
        console.log('게시글 삭제 시도:', postId);

        // 백엔드 API 호출
        await window.apiService.deletePost(postId);

        console.log('게시글 삭제 성공');

        // 성공 메시지
        if (window.toast) {
            window.toast.success('게시글이 삭제되었습니다.');
        } else {
            alert('게시글이 삭제되었습니다.');
        }

        // 목록 새로고침
        await loadMyPosts();
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        if (window.toast) {
            window.toast.error(error.message || '게시글 삭제에 실패했습니다.');
        } else {
            alert(error.message || '게시글 삭제에 실패했습니다.');
        }
    }
}

/**
 * HTML 이스케이프 (XSS 방지)
 * @param {string} text - 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
