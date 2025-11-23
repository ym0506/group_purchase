/**
 * 공구친구 매칭하기 페이지 JavaScript
 */

// 선택된 아이템 정보 불러오기
/**
 * 선택된 게시글 상세 정보 로드 (백엔드 API 연동)
 */
async function loadSelectedItemInfo() {
    const postId = sessionStorage.getItem('selectedPostId');

    if (!postId) {
        console.warn('선택된 게시글이 없습니다.');
        return;
    }

    try {
        console.log('게시글 상세 정보 로드:', postId);

        // 백엔드 API 호출
        const post = await window.apiService.getPostDetail(postId);

        console.log('게시글 상세 정보:', post);

        // UI 업데이트
        updatePostDetails(post);
    } catch (error) {
        console.error('게시글 상세 정보 로드 실패:', error);

        // 에러 시 sessionStorage에서 fallback 데이터 사용
        const itemTitle = sessionStorage.getItem('selectedItemTitle');
        if (itemTitle) {
            const productNameElement = document.querySelector('.product-name');
            if (productNameElement) {
                productNameElement.textContent = itemTitle;
            }
        }
    }
}

/**
 * 게시글 상세 정보로 UI 업데이트
 */
function updatePostDetails(post) {
    // 제품명
    const productNameElement = document.querySelector('.product-name');
    if (productNameElement) {
        productNameElement.textContent = post.title;
    }

    // 작성자 정보
    const authorNameElement = document.querySelector('.author-name');
    if (authorNameElement && post.author) {
        authorNameElement.textContent = post.author.nickname;
    }

    // 설명
    const descriptionElement = document.querySelector('.product-description');
    if (descriptionElement) {
        descriptionElement.textContent = post.description || '설명이 없습니다.';
    }

    // 가격 정보
    const priceValueElements = document.querySelectorAll('.price-value');
    if (priceValueElements.length >= 2) {
        priceValueElements[0].textContent = `${post.total_price?.toLocaleString()}원`;
        priceValueElements[1].textContent = `${post.per_person_price?.toLocaleString()}원`;
    }

    // 인원 정보
    const infoRows = document.querySelectorAll('.info-row');
    if (infoRows.length >= 3) {
        const targetElement = infoRows[1].querySelector('.info-value');
        const currentElement = infoRows[2].querySelector('.info-value');

        if (targetElement) {
            targetElement.textContent = `${post.target_participants}명`;
        }
        if (currentElement) {
            currentElement.textContent = `${post.current_participants}명`;
        }
    }

    // 픽업 장소 및 시간
    const pickupLocationElement = document.querySelector('.pickup-location .info-value');
    const pickupTimeElement = document.querySelector('.pickup-time .info-value');

    if (pickupLocationElement) {
        pickupLocationElement.textContent = post.pickup_location_text || '정보 없음';
    }
    if (pickupTimeElement && post.pickup_datetime) {
        const pickupDate = new Date(post.pickup_datetime);
        pickupTimeElement.textContent = pickupDate.toLocaleString('ko-KR');
    }

    // 모집 종료일
    const endDateElement = document.querySelector('.end-date .info-value');
    if (endDateElement && post.end_date) {
        const endDate = new Date(post.end_date);
        endDateElement.textContent = endDate.toLocaleString('ko-KR');
    }
}

// 상태바 시간 업데이트
function updateStatusTime() {
    const timeElement = document.querySelector('.status-time');
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;

        setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;
        }, 60000);
    }
}

// 매칭 완료 모달 생성
function createMatchingModal() {
    const modal = document.createElement('div');
    modal.className = 'matching-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-icon">🎉</div>
            <h2 class="modal-title">매칭 신청 완료!</h2>
            <p class="modal-message">
                매칭이 완료되면<br>
                알림으로 바로 알려드릴게요!
            </p>
            <div class="modal-info">
                <div class="info-item">
                    <span class="info-icon">⏱️</span>
                    <span class="info-text">평균 매칭 시간: <strong>15분</strong></span>
                </div>
                <div class="info-item">
                    <span class="info-icon">👥</span>
                    <span class="info-text">현재 참여자: <strong>3/4명</strong></span>
                </div>
            </div>
            <button class="modal-btn-primary" onclick="closeMatchingModal()">확인</button>
            <button class="modal-btn-secondary" onclick="goToHome()">홈으로 가기</button>
        </div>
    `;
    document.body.appendChild(modal);

    // 애니메이션을 위한 약간의 지연
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 매칭 모달 닫기
function closeMatchingModal() {
    const modal = document.querySelector('.matching-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 홈으로 이동
function goToHome() {
    window.location.href = './home.html';
}

// 진행률 애니메이션
function animateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const currentCount = document.querySelector('.count-current');
    const emptyAvatar = document.querySelector('.participant-avatar.empty');

    if (progressFill && currentCount && emptyAvatar) {
        // 진행률 업데이트
        progressFill.style.width = '100%';
        currentCount.textContent = '4';

        // 빈 아바타를 채워진 아바타로 변경
        setTimeout(() => {
            emptyAvatar.classList.remove('empty');
            emptyAvatar.classList.add('filled');
            emptyAvatar.innerHTML = '';
            emptyAvatar.setAttribute('data-user', '4');

            // 축하 효과
            createConfetti();
        }, 500);
    }
}

// 간단한 축하 효과 (컨페티)
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff6348'];
    const confettiCount = 30;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();

    // 선택된 아이템 정보 불러오기
    loadSelectedItemInfo();

    // 댓글 기능 초기화
    initComments();

    // 매칭하기 버튼 (백엔드 API 연동)
    const matchBtn = document.querySelector('.btn-match');
    if (matchBtn) {
        matchBtn.addEventListener('click', async () => {
            const postId = sessionStorage.getItem('selectedPostId');

            if (!postId) {
                alert('선택된 게시글이 없습니다.');
                return;
            }

            // 버튼 로딩 상태
            matchBtn.disabled = true;
            matchBtn.textContent = '매칭 중...';

            try {
                // 백엔드 API 호출: 공구 참여 신청
                const response = await window.apiService.participateInPost(postId);

                console.log('매칭 성공:', response);

                // 성공 처리
                matchBtn.textContent = '매칭하기';
                animateProgress();

                // 모달 표시
                setTimeout(() => {
                    createMatchingModal();
                }, 1000);
            } catch (error) {
                console.error('매칭 실패:', error);
                alert(error.message || '매칭 신청에 실패했습니다.');
                matchBtn.disabled = false;
                matchBtn.textContent = '매칭하기';
            }
        });
    }

    // 대화방 참여하기 버튼
    const chatBtn = document.querySelector('.btn-chat');
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            // 실제로는 채팅 페이지로 이동
            alert('💬 대화방으로 이동합니다!\n\n참여자들과 소통해보세요.');
            // window.location.href = './chat.html';
        });
    }

    // 비슷한 공구 아이템 클릭
    const similarItems = document.querySelectorAll('.similar-item');
    similarItems.forEach(item => {
        item.addEventListener('click', () => {
            alert('다른 공구 상세 페이지로 이동합니다.');
            // window.location.href = './matching.html?id=...';
        });
    });
});

/**
 * 댓글 기능 초기화
 */
function initComments() {
    const postId = sessionStorage.getItem('selectedPostId');
    if (!postId) {
        console.warn('게시글 ID가 없어 댓글을 불러올 수 없습니다.');
        return;
    }

    // 댓글 목록 로드
    loadComments(postId);

    // 댓글 작성 버튼 이벤트
    const commentSubmitBtn = document.getElementById('btnCommentSubmit');
    const commentInput = document.getElementById('commentInput');

    if (commentSubmitBtn && commentInput) {
        commentSubmitBtn.addEventListener('click', async () => {
            const content = commentInput.value.trim();
            if (!content) {
                if (window.toast) {
                    window.toast.error('댓글을 입력해주세요.');
                } else {
                    alert('댓글을 입력해주세요.');
                }
                return;
            }

            await submitComment(postId, content);
            commentInput.value = '';
        });

        // Enter 키로 댓글 작성 (Shift+Enter는 줄바꿈)
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commentSubmitBtn.click();
            }
        });
    }
}

/**
 * 댓글 목록 로드
 * @param {string} postId - 게시글 ID
 */
async function loadComments(postId) {
    try {
        const commentsContainer = document.getElementById('commentsList');
        if (!commentsContainer) return;

        commentsContainer.innerHTML = '<div class="loading-comments">댓글을 불러오는 중...</div>';

        // 백엔드 API 호출
        const response = await window.apiService.getComments(postId);

        console.log('댓글 목록 로드 성공:', response);

        // 댓글 목록 렌더링
        if (response.comments && response.comments.length > 0) {
            renderComments(response.comments);
        } else {
            commentsContainer.innerHTML = '<div class="empty-comments">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</div>';
        }
    } catch (error) {
        console.error('댓글 목록 로드 실패:', error);
        const commentsContainer = document.getElementById('commentsList');
        if (commentsContainer) {
            commentsContainer.innerHTML = '<div class="error-comments">댓글을 불러올 수 없습니다.</div>';
        }
    }
}

/**
 * 댓글 목록 렌더링
 * @param {Array} comments - 댓글 배열
 */
function renderComments(comments) {
    const commentsContainer = document.getElementById('commentsList');
    if (!commentsContainer) return;

    const currentUserId = localStorage.getItem('user_id') || sessionStorage.getItem('userId');

    commentsContainer.innerHTML = comments.map(comment => {
        const isOwnComment = comment.user_id === parseInt(currentUserId);
        const deleteButton = isOwnComment 
            ? `<button class="btn-delete-comment" data-comment-id="${comment.comment_id}">삭제</button>`
            : '';

        return `
            <div class="comment-item" data-comment-id="${comment.comment_id}">
                <div class="comment-header">
                    <span class="comment-author">${comment.nickname || '익명'}</span>
                    <span class="comment-date">${formatCommentDate(comment.created_at)}</span>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
                ${deleteButton}
            </div>
        `;
    }).join('');

    // 삭제 버튼 이벤트 추가
    commentsContainer.querySelectorAll('.btn-delete-comment').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const commentId = btn.getAttribute('data-comment-id');
            const confirmed = window.confirmDialog 
                ? await window.confirmDialog.show('댓글을 삭제하시겠습니까?', '댓글 삭제')
                : confirm('댓글을 삭제하시겠습니까?');
            if (confirmed) {
                await deleteComment(commentId);
            }
        });
    });
}

/**
 * 댓글 작성
 * @param {string} postId - 게시글 ID
 * @param {string} content - 댓글 내용
 */
async function submitComment(postId, content) {
    try {
        const commentSubmitBtn = document.getElementById('btnCommentSubmit');
        if (commentSubmitBtn) {
            commentSubmitBtn.disabled = true;
            commentSubmitBtn.textContent = '등록 중...';
        }

        // 백엔드 API 호출
        const response = await window.apiService.createComment(postId, content);

        console.log('댓글 작성 성공:', response);

        // 댓글 목록 새로고침
        await loadComments(postId);

        if (window.toast) {
            window.toast.success('댓글이 작성되었습니다.');
        }
    } catch (error) {
        console.error('댓글 작성 실패:', error);
        if (window.toast) {
            window.toast.error(error.message || '댓글 작성에 실패했습니다.');
        } else {
            alert(error.message || '댓글 작성에 실패했습니다.');
        }
    } finally {
        const commentSubmitBtn = document.getElementById('btnCommentSubmit');
        if (commentSubmitBtn) {
            commentSubmitBtn.disabled = false;
            commentSubmitBtn.textContent = '등록';
        }
    }
}

/**
 * 댓글 삭제
 * @param {string} commentId - 댓글 ID
 */
async function deleteComment(commentId) {
    try {
        // 백엔드 API 호출
        await window.apiService.deleteComment(commentId);

        console.log('댓글 삭제 성공');

        // 댓글 목록 새로고침
        const postId = sessionStorage.getItem('selectedPostId');
        if (postId) {
            await loadComments(postId);
        }

        if (window.toast) {
            window.toast.success('댓글이 삭제되었습니다.');
        }
    } catch (error) {
        console.error('댓글 삭제 실패:', error);
        if (window.toast) {
            window.toast.error(error.message || '댓글 삭제에 실패했습니다.');
        } else {
            alert(error.message || '댓글 삭제에 실패했습니다.');
        }
    }
}

/**
 * 댓글 날짜 포맷팅
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷된 날짜
 */
function formatCommentDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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

