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
function filterPosts(status) {
    console.log('필터링:', status);

    // 실제 구현: 서버에서 해당 상태의 공구 목록 가져오기
    // 여기서는 시뮬레이션
    if (status === 'all') {
        console.log('전체 공구 표시');
    } else if (status === 'waiting') {
        console.log('매칭 대기 중 공구 표시');
    } else if (status === 'success') {
        console.log('매칭 성공 공구 표시');
    } else if (status === 'closed') {
        console.log('종료된 공구 표시');
    }

    // TODO: 필터링된 결과를 UI에 업데이트
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
        const userId = localStorage.getItem('userId');

        if (!isLoggedIn || !userId) {
            // 로그인되지 않은 경우 - 로그인 페이지로 리다이렉트 또는 기본 UI 표시
            console.log('로그인되지 않음');
            // window.location.href = './login.html';
            return;
        }

        // 프로필 정보 가져오기
        // const userProfile = await window.apiService.getUserProfile(userId);

        // 프로필 정보 시뮬레이션
        const userProfile = {
            name: '윤영',
            rating: 5.0,
            avatar: null,
            stats: {
                total: 26,
                waiting: 5,
                success: 8,
                closed: 13
            }
        };

        // UI 업데이트
        updateProfileUI(userProfile);
    } catch (error) {
        console.error('프로필 정보 불러오기 에러:', error);
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
        const avatarElement = document.querySelector('.profile-avatar-large');
        if (avatarElement) {
            avatarElement.style.backgroundImage = `url('${profile.avatar}')`;
            avatarElement.style.backgroundSize = 'cover';
            avatarElement.style.backgroundPosition = 'center';
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
