/**
 * 마이페이지 JavaScript (백엔드 API 연동)
 */

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

/**
 * 내 정보 조회 및 UI 업데이트 (백엔드 API 연동)
 */
async function loadMyInfo() {
    try {
        console.log('내 정보 조회 시작...');

        // 백엔드 API 호출
        const userInfo = await window.apiService.getMyInfo();

        console.log('내 정보 조회 성공:', userInfo);

        // UI 업데이트
        updateUserProfile(userInfo);
    } catch (error) {
        console.error('내 정보 조회 실패:', error);

        // 에러 처리: 로그인 페이지로 이동
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            alert('로그인이 필요합니다.');
            window.location.href = './login.html';
        }
    }
}

/**
 * 사용자 프로필 UI 업데이트
 */
function updateUserProfile(userInfo) {
    // 프로필 이름
    const profileNameElement = document.querySelector('.profile-name');
    if (profileNameElement && userInfo.nickname) {
        profileNameElement.textContent = `${userInfo.nickname}님`;
    }

    // 프로필 이미지 (추후 구현)
    // const profileAvatarElement = document.querySelector('.profile-avatar');
    // if (profileAvatarElement && userInfo.profile_image_url) {
    //     profileAvatarElement.style.backgroundImage = `url(${userInfo.profile_image_url})`;
    // }

    console.log('프로필 업데이트 완료:', userInfo.nickname);
}

/**
 * 매칭 성공 내역 조회 (거래 완료 내역)
 */
async function loadMatchingSuccess() {
    try {
        console.log('거래 완료 내역 조회 시작...');

        // 백엔드 API 호출
        const response = await window.apiService.getMyTransactions();

        console.log('거래 완료 내역 조회 성공:', response);

        // UI 업데이트
        if (response.transactions && response.transactions.length > 0) {
            renderMatchingSuccess(response.transactions);
        } else {
            // 내역이 없을 경우
            const successItemsContainer = document.querySelector('.success-items');
            if (successItemsContainer) {
                successItemsContainer.innerHTML = '<p style="text-align: center; color: #9e9e9e; padding: 20px;">아직 완료된 공구가 없습니다.</p>';
            }
        }
    } catch (error) {
        console.error('거래 완료 내역 조회 실패:', error);
    }
}

/**
 * 매칭 성공 내역 렌더링
 */
function renderMatchingSuccess(transactions) {
    const successItemsContainer = document.querySelector('.success-items');
    if (!successItemsContainer) return;

    // 기존 내용 지우기 (기본 예시 제거)
    successItemsContainer.innerHTML = '';

    // 각 거래 내역을 아이템으로 렌더링
    transactions.forEach(transaction => {
        const itemElement = createSuccessItemElement(transaction);
        successItemsContainer.appendChild(itemElement);
    });
}

/**
 * 매칭 성공 아이템 HTML 요소 생성
 */
function createSuccessItemElement(transaction) {
    const item = document.createElement('div');
    item.className = 'success-item';
    item.style.cursor = 'pointer';

    // 날짜 포맷팅
    const pickupDate = new Date(transaction.pickup_datetime);
    const dateStr = `${pickupDate.getMonth() + 1}/${pickupDate.getDate()}`;
    const timeStr = pickupDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    item.innerHTML = `
        <div class="item-info">
            <span class="item-name">${transaction.title}</span>
            <div class="participants">
                <span class="participant-count">완료</span>
                <div class="participant-avatars">
                    <!-- 추후 참여자 아바타 추가 -->
                </div>
            </div>
        </div>
        <div class="item-details">
            <span class="item-location">${transaction.pickup_location_text || '장소 정보 없음'}</span>
            <span class="item-date">${dateStr} ${timeStr}</span>
        </div>
    `;

    // 클릭 이벤트
    item.addEventListener('click', () => {
        sessionStorage.setItem('selectedPostId', transaction.post_id);
        window.location.href = './matching.html';
    });

    return item;
}

/**
 * 매칭 대기 내역 조회
 */
async function loadMatchingWaiting() {
    try {
        console.log('매칭 대기 내역 조회 시작...');

        // 백엔드 API 호출
        const response = await window.apiService.getMyMatching();

        console.log('매칭 대기 내역 조회 성공:', response);

        // 대기 중인 공구 개수 표시 등 (UI 확장 가능)
        if (response.waiting_list && response.waiting_list.length > 0) {
            console.log(`대기 중인 공구: ${response.waiting_list.length}개`);
        }
    } catch (error) {
        console.error('매칭 대기 내역 조회 실패:', error);
    }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();

    // 백엔드 API 연동: 내 정보 및 매칭 내역 로드
    loadMyInfo();
    loadMatchingSuccess();
    loadMatchingWaiting();

    // 전체보기 링크
    const viewAllLink = document.querySelector('.view-all-link');
    if (viewAllLink) {
        viewAllLink.addEventListener('click', (event) => {
            event.preventDefault();
            alert('전체보기 페이지로 이동합니다.');
            // 여기에 실제 전체보기 페이지 이동 로직 구현
        });
    }

    // 아이콘 메뉴 아이템
    const iconMenuItems = document.querySelectorAll('.icon-menu-item');
    iconMenuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const text = item.querySelector('span').textContent;
            alert(`${text} 페이지로 이동합니다.`);
            // 여기에 실제 페이지 이동 로직 구현
        });
    });

    // 링크 메뉴 아이템
    const linkMenuItems = document.querySelectorAll('.link-menu-item');
    linkMenuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            alert(`${item.textContent} 페이지로 이동합니다.`);
            // 여기에 실제 페이지 이동 로직 구현
        });
    });

    // 매칭 성공 아이템
    const successItems = document.querySelectorAll('.success-item');
    successItems.forEach(item => {
        item.addEventListener('click', () => {
            const itemName = item.querySelector('.item-name').textContent;
            alert(`${itemName} 상세 정보를 확인합니다.`);
            // 여기에 실제 상세 정보 페이지 이동 로직 구현
        });
    });
});

