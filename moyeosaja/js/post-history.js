/**
 * 공구 내역 페이지
 * 사용자가 참여한 공구 내역 조회
 */

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    initFilterTabs();
    // 기본으로 전체 내역 로드
    loadPostHistory('all');
});

/**
 * 필터 탭 초기화
 */
function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab, .history-filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // 모든 탭에서 active 제거
            filterTabs.forEach(t => t.classList.remove('active'));
            // 클릭된 탭에 active 추가
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            console.log('Filter changed to:', filter);

            // 필터에 따른 데이터 로드
            if (filter) {
                loadPostHistory(filter);
            }
        });
    });
}

/**
 * 공구 내역 로드
 * @param {string} filter - 필터 타입 ('all', 'waiting', 'success', 'closed')
 */
async function loadPostHistory(filter) {
    try {
        // 로그인 확인
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = './login.html';
            return;
        }

        // 로딩 상태 표시
        const itemsContainer = document.querySelector('.items-list, .post-list, .history-list');
        if (itemsContainer) {
            itemsContainer.innerHTML = '<div class="loading">로딩 중...</div>';
        }

        // API 호출: status에 따라 매칭 내역 가져오기
        let response;
        if (filter === 'all') {
            // 전체는 매칭 내역, 거래 내역, 취소 내역을 모두 가져오기
            const [matchingResponse, transactionsResponse, cancellationsResponse] = await Promise.all([
                window.apiService.getMyMatching(),
                window.apiService.getMyTransactions().catch(() => ({ transactions: [] })),
                window.apiService.getMyCancellations().catch(() => ({ cancellations: [] }))
            ]);
            
            // 매칭 내역과 거래 내역 합치기
            const allItems = [
                ...(matchingResponse.matching || []).map(item => ({ ...item, type: 'matching' })),
                ...(transactionsResponse.transactions || transactionsResponse.matching || []).map(item => ({ ...item, type: 'transaction', status: 'completed' })),
                ...(cancellationsResponse.cancellations || cancellationsResponse.matching || []).map(item => ({ ...item, type: 'cancellation', status: 'cancelled' }))
            ];
            response = { matching: allItems };
        } else if (filter === 'success' || filter === 'completed') {
            // 거래 완료 내역만 가져오기
            const transactionsResponse = await window.apiService.getMyTransactions().catch(() => ({ transactions: [] }));
            const items = (transactionsResponse.transactions || transactionsResponse.matching || []).map(item => ({
                ...item,
                type: 'transaction',
                status: 'completed'
            }));
            response = { matching: items };
        } else if (filter === 'cancelled') {
            // 취소 내역만 가져오기
            const cancellationsResponse = await window.apiService.getMyCancellations().catch(() => ({ cancellations: [] }));
            const items = (cancellationsResponse.cancellations || cancellationsResponse.matching || []).map(item => ({
                ...item,
                type: 'cancellation',
                status: 'cancelled'
            }));
            response = { matching: items };
        } else {
            // 상태별 필터링 (waiting, closed 등)
            response = await window.apiService.getMyMatching({ status: filter });
        }

        console.log('공구 내역 로드 성공:', response);

        // UI 업데이트
        if (itemsContainer) {
            if (response.matching && response.matching.length > 0) {
                renderHistoryList(response.matching, itemsContainer);
            } else {
                itemsContainer.innerHTML = '<div class="empty-message">해당 상태의 공구 내역이 없습니다.</div>';
            }
        }
    } catch (error) {
        console.error('공구 내역 로드 에러:', error);
        const itemsContainer = document.querySelector('.items-list, .post-list, .history-list');
        if (itemsContainer) {
            itemsContainer.innerHTML = '<div class="error-message">공구 내역을 불러올 수 없습니다.</div>';
        }
        
        // 인증 에러 시 로그인 페이지로 이동
        if (error.message && error.message.includes('인증')) {
            window.location.href = './login.html';
        }
    }
}

/**
 * 내역 목록 렌더링
 * @param {Array} historyList - 내역 목록
 * @param {HTMLElement} container - 컨테이너 요소
 */
function renderHistoryList(historyList, container) {
    if (!historyList || historyList.length === 0) {
        container.innerHTML = '<div class="empty-message">공구 내역이 없습니다.</div>';
        return;
    }

    container.innerHTML = historyList.map(item => {
        const statusText = {
            'waiting': '대기 중',
            'success': '매칭 성공',
            'closed': '종료',
            'completed': '거래 완료',
            'cancelled': '취소됨'
        }[item.status] || (item.type === 'transaction' ? '거래 완료' : item.type === 'cancellation' ? '취소됨' : '알 수 없음');

        const statusClass = {
            'waiting': 'status-waiting',
            'success': 'status-success',
            'closed': 'status-closed',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        }[item.status] || (item.type === 'transaction' ? 'status-completed' : item.type === 'cancellation' ? 'status-cancelled' : '');

        const pickupDate = item.pickup_datetime 
            ? new Date(item.pickup_datetime).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : '날짜 정보 없음';

        const createdDate = item.created_at
            ? new Date(item.created_at).toLocaleDateString('ko-KR')
            : '';

        return `
            <div class="history-item ${statusClass}" data-post-id="${item.post_id}">
                <div class="item-content">
                    <h3 class="item-title">${item.title || '제목 없음'}</h3>
                    <p class="item-description">
                        ${pickupDate}
                    </p>
                    <p class="item-meta">
                        참여자 ${item.current_participants || 0}/${item.target_participants || 0}명
                        ${createdDate ? ` | 작성일: ${createdDate}` : ''}
                    </p>
                </div>
                <div class="item-status ${statusClass}">${statusText}</div>
            </div>
        `;
    }).join('');

    // 클릭 이벤트 추가
    container.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const postId = item.getAttribute('data-post-id');
            if (postId) {
                sessionStorage.setItem('selectedPostId', postId);
                window.location.href = './matching.html';
            }
    });
});
}


