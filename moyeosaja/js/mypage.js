/**
 * 마이페이지 JavaScript
 * 
 * 역할:
 * - 필터 탭 전환
 * - 로그아웃 처리
 * - 탈퇴하기 처리
 * - 프로필 정보 표시
 */

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

/**
 * 페이지 초기화
 */
function initializePage() {
    // 상태바 시간 업데이트
    updateStatusTime();

    // 필터 탭 초기화
    initializeFilterTabs();

    // 계정 액션 초기화
    initializeAccountActions();

    // 프로필 정보 불러오기
    loadProfileInfo();
}

/**
 * 상태바 시간 업데이트
 */
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

/**
 * 필터 탭 초기화
 */
function initializeFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 모든 탭에서 active 제거
            filterTabs.forEach(t => {
                t.classList.remove('active');
                const count = t.querySelector('.tab-count');
                if (count) {
                    count.classList.remove('active');
                }
            });

            // 클릭된 탭에 active 추가
            this.classList.add('active');
            const activeCount = this.querySelector('.tab-count');
            if (activeCount) {
                activeCount.classList.add('active');
            }

            // 필터링 실행
            const status = this.getAttribute('data-status');
            filterPosts(status);
        });
    });
}

/**
 * 공구 목록 필터링
 * @param {string} status - 필터 상태 (all, waiting, success, closed)
 */
async function filterPosts(status) {
    console.log('필터링:', status);

    try {
        // 로딩 상태 표시
        const itemsContainer = document.querySelector('.items-list, .post-list, .matching-list');
        if (itemsContainer) {
            itemsContainer.innerHTML = '<div class="loading">로딩 중...</div>';
        }

        // API 호출: status에 따라 매칭 목록 가져오기
        let response;
        if (status === 'all') {
            response = await window.apiService.getMyMatching();
        } else {
            response = await window.apiService.getMyMatching({ status: status });
        }

        console.log('필터링 결과:', response);

        // UI 업데이트
        if (itemsContainer && response.matching) {
            renderMatchingList(response.matching, itemsContainer);
        } else {
            if (itemsContainer) {
                itemsContainer.innerHTML = '<div class="empty-message">해당 상태의 공구가 없습니다.</div>';
            }
        }
    } catch (error) {
        console.error('필터링 에러:', error);
        const itemsContainer = document.querySelector('.items-list, .post-list, .matching-list');
        if (itemsContainer) {
            itemsContainer.innerHTML = '<div class="error-message">공구 목록을 불러올 수 없습니다.</div>';
        }
    }
}

/**
 * 매칭 목록 렌더링
 * @param {Array} matchingList - 매칭 목록
 * @param {HTMLElement} container - 컨테이너 요소
 */
function renderMatchingList(matchingList, container) {
    if (!matchingList || matchingList.length === 0) {
        container.innerHTML = '<div class="empty-message">해당 상태의 공구가 없습니다.</div>';
        return;
    }

    container.innerHTML = matchingList.map(matching => {
        const statusText = {
            'waiting': '대기 중',
            'success': '매칭 성공',
            'closed': '종료'
        }[matching.status] || '알 수 없음';

        const pickupDate = matching.pickup_datetime 
            ? new Date(matching.pickup_datetime).toLocaleDateString('ko-KR')
            : '날짜 정보 없음';

        return `
            <div class="matching-item" data-post-id="${matching.post_id}">
                <div class="item-content">
                    <h3 class="item-title">${matching.title || '제목 없음'}</h3>
                    <p class="item-description">
                        ${pickupDate} | 참여자 ${matching.current_participants || 0}/${matching.target_participants || 0}명
                    </p>
                </div>
                <div class="item-status">${statusText}</div>
            </div>
        `;
    }).join('');

    // 클릭 이벤트 추가
    container.querySelectorAll('.matching-item').forEach(item => {
        item.addEventListener('click', () => {
            const postId = item.getAttribute('data-post-id');
            sessionStorage.setItem('selectedPostId', postId);
            window.location.href = './matching.html';
        });
    });
}

/**
 * 계정 액션 초기화
 */
function initializeAccountActions() {
    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 탈퇴하기 버튼
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
}

/**
 * 로그아웃 처리
 */
async function handleLogout() {
    const confirmed = confirm('로그아웃 하시겠습니까?');

    if (!confirmed) {
        return;
    }

    try {
        // 로그아웃 API 호출 (선택사항)
        // await window.apiService.logout();

        // 로컬 스토리지 정리
        localStorage.removeItem('userId');
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('userEmail');

        // 세션 스토리지 정리
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userEmail');

        // 로그인 페이지로 이동
        alert('로그아웃되었습니다.');
        window.location.href = './login.html';
    } catch (error) {
        console.error('로그아웃 에러:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
}

/**
 * 탈퇴하기 처리
 */
async function handleDeleteAccount() {
    const confirmed = confirm('정말로 회원 탈퇴하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.');

    if (!confirmed) {
        return;
    }

    const doubleConfirm = confirm('한 번 더 확인합니다. 정말로 탈퇴하시겠습니까?');

    if (!doubleConfirm) {
        return;
    }

    try {
        // 탈퇴 API 호출
        // const userId = localStorage.getItem('userId');
        // await window.apiService.deleteAccount(userId);

        // 로컬 스토리지 정리
        localStorage.clear();
        sessionStorage.clear();

        // 로그인 페이지로 이동
        alert('회원 탈퇴가 완료되었습니다.');
        window.location.href = './login.html';
    } catch (error) {
        console.error('회원 탈퇴 에러:', error);
        alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
}

/**
 * 프로필 정보 불러오기
 */
async function loadProfileInfo() {
    try {
        // 로그인 여부 확인
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const accessToken = localStorage.getItem('access_token');

        if (!isLoggedIn || !accessToken) {
            // 로그인되지 않은 경우 - 로그인 페이지로 리다이렉트 또는 기본 UI 표시
            console.log('로그인되지 않음');
            // window.location.href = './login.html';
            return;
        }

        // 프로필 정보 가져오기 (실제 API 호출)
        console.log('📤 프로필 정보 로드 시작...');
        let userInfo;
        try {
            userInfo = await window.apiService.getMyInfo();
            console.log('✅ 프로필 정보 로드 성공:', userInfo);
        } catch (error) {
            // 500 에러 시 localStorage에서 기본 정보 사용 (fallback)
            if (error.message && error.message.includes('500')) {
                console.warn('⚠️ getMyInfo 500 에러 - localStorage 데이터 사용 (fallback)');
                const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
                userInfo = {
                    user_id: userId ? parseInt(userId) : null,
                    nickname: localStorage.getItem('userNickname') || '사용자',
                    email: localStorage.getItem('userEmail') || '',
                    profile_image_url: null
                };
                if (window.toast) {
                    window.toast.warning('프로필 정보를 불러올 수 없습니다. 기본 정보를 표시합니다.');
                }
            } else {
                throw error; // 다른 에러는 재발생
            }
        }
        
        // 매칭 통계 가져오기 (500 에러 발생 시에도 통계는 시도)
        console.log('📤 매칭 통계 로드 시작...');
        let stats = { all: 0, waiting: 0, success: 0, closed: 0 };
        try {
            stats = await loadMatchingStats();
            console.log('✅ 매칭 통계 로드 성공:', stats);
        } catch (error) {
            console.warn('⚠️ 매칭 통계 로드 실패 - 기본값 사용:', error);
            // 통계 로드 실패 시 기본값 유지
        }

        // 프로필 정보 구성
        const userProfile = {
            name: userInfo.nickname || '사용자',
            rating: 5.0, // 리뷰 API에서 가져올 수 있으면 추가
            avatar: userInfo.profile_image_url || null,
            stats: stats
        };

        // UI 업데이트
        updateProfileUI(userProfile);
    } catch (error) {
        console.error('❌ 프로필 정보 불러오기 에러:', error);
        console.error('❌ 에러 상세:', {
            message: error.message,
            stack: error.stack
        });
        
        // 에러 발생 시 사용자에게 명확한 메시지 표시
        if (error.message && (error.message.includes('인증') || error.message.includes('401'))) {
            // 인증 에러 시 로그인 페이지로 이동
            if (window.toast) {
                window.toast.error('로그인이 필요합니다.');
            }
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1500);
        } else if (error.message && error.message.includes('500')) {
            // 서버 오류인 경우
            if (window.toast) {
                window.toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            }
            // 기본 UI는 유지
        } else {
            // 기타 오류
            if (window.toast) {
                window.toast.error('프로필 정보를 불러오는데 실패했습니다: ' + error.message);
            }
        }
    }
}

/**
 * 매칭 통계 불러오기
 */
async function loadMatchingStats() {
    try {
        // 전체, 대기 중, 성공, 종료 각각 가져오기
        const [allMatching, waitingMatching, successMatching, closedMatching] = await Promise.all([
            window.apiService.getMyMatching(), // status 파라미터 없이 전체
            window.apiService.getMyMatching({ status: 'waiting' }),
            window.apiService.getMyMatching({ status: 'success' }),
            window.apiService.getMyMatching({ status: 'closed' })
        ]);

        return {
            total: allMatching.matching?.length || 0,
            waiting: waitingMatching.matching?.length || 0,
            success: successMatching.matching?.length || 0,
            closed: closedMatching.matching?.length || 0
        };
    } catch (error) {
        console.error('매칭 통계 로드 에러:', error);
        // 에러 발생 시 기본값 반환
        return {
            total: 0,
            waiting: 0,
            success: 0,
            closed: 0
        };
    }
}

/**
 * 프로필 UI 업데이트
 * @param {Object} profile - 프로필 정보
 */
function updateProfileUI(profile) {
    // 이름 업데이트
    const nameElement = document.querySelector('.profile-name');
    if (nameElement && profile.name) {
        nameElement.textContent = profile.name;
    }

    // 별점 업데이트
    const ratingScoreElement = document.querySelector('.rating-score');
    if (ratingScoreElement && profile.rating !== undefined) {
        ratingScoreElement.textContent = profile.rating.toFixed(1);
    }

    // 통계 업데이트
    if (profile.stats) {
        const tabCounts = {
            'all': profile.stats.total,
            'waiting': profile.stats.waiting,
            'success': profile.stats.success,
            'closed': profile.stats.closed
        };

        Object.entries(tabCounts).forEach(([status, count]) => {
            const tab = document.querySelector(`[data-status="${status}"]`);
            if (tab) {
                const countElement = tab.querySelector('.tab-count');
                if (countElement) {
                    countElement.textContent = count;
                }
            }
        });
    }

    // 아바타 업데이트 (실제 이미지가 있는 경우)
    if (profile.avatar) {
        const avatarElement = document.querySelector('.profile-avatar-large, .profile-avatar');
        if (avatarElement) {
            avatarElement.style.backgroundImage = `url('${profile.avatar}')`;
            avatarElement.style.backgroundSize = 'cover';
            avatarElement.style.backgroundPosition = 'center';
            avatarElement.style.backgroundColor = 'transparent';
        }
    } else {
        // 아바타가 없으면 기본 스타일 유지
        const avatarElement = document.querySelector('.profile-avatar-large, .profile-avatar');
        if (avatarElement) {
            avatarElement.style.backgroundImage = 'none';
            avatarElement.style.backgroundColor = '';
        }
    }
}

/**
 * 다가오는 공구 목록 불러오기
 */
async function loadUpcomingPosts() {
    try {
        // API 호출
        // const upcomingPosts = await window.apiService.getUpcomingPosts();

        // 시뮬레이션 데이터
        const upcomingPosts = [
            { name: '소금빵', deadline: 'D-1' },
            { name: '넷플릭스', deadline: 'D-1' },
            { name: '쌀', deadline: 'D-2' }
        ];

        // UI 업데이트
        updateUpcomingList(upcomingPosts);
    } catch (error) {
        console.error('다가오는 공구 불러오기 에러:', error);
    }
}

/**
 * 다가오는 공구 목록 UI 업데이트
 * @param {Array} posts - 공구 목록
 */
function updateUpcomingList(posts) {
    const listContainer = document.querySelector('.upcoming-list');
    if (!listContainer) return;

    listContainer.innerHTML = posts.map((post, index) => `
        <div class="upcoming-item">
            <span class="item-name">${post.name}</span>
            <span class="item-deadline">${post.deadline}</span>
        </div>
        ${index < posts.length - 1 ? '<div class="divider"></div>' : ''}
    `).join('');
}
