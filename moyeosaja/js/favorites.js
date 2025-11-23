/**
 * 관심있어요 페이지 (백엔드 API 연동)
 * 사용자가 관심을 표시한 공구 목록 관리
 */

document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    loadFavorites(); // 백엔드에서 관심 목록 로드
});

/**
 * 상태바 시간 업데이트
 */
function updateStatusTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const statusTimeElement = document.querySelector('.status-time');
    if (statusTimeElement) {
        statusTimeElement.textContent = timeString;
    }
}

/**
 * 아이템 클릭 시 매칭 페이지로 이동
 */
function initItemClicks() {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        item.addEventListener('click', function () {
            const itemId = this.getAttribute('data-item-id');
            const itemTitle = this.querySelector('.item-title').textContent;
            const itemProduct = this.getAttribute('data-product');

            // 선택된 아이템 정보를 sessionStorage에 저장
            sessionStorage.setItem('selectedItemId', itemId);
            sessionStorage.setItem('selectedItemTitle', itemTitle);
            sessionStorage.setItem('selectedItemProduct', itemProduct);

            // 매칭 상세 페이지로 이동
            window.location.href = './matching.html';
        });
    });
}

/**
 * 관심 목록 로드 (백엔드 API 연동)
 */
async function loadFavorites() {
    try {
        console.log('관심 목록 로드 시작...');

        // 백엔드 API 호출
        const response = await window.apiService.getMyWishlist();

        console.log('관심 목록 로드 성공:', response);

        // UI 업데이트
        if (response.wishlist && response.wishlist.length > 0) {
            renderFavorites(response.wishlist);
        } else {
            // 관심 목록이 비어있을 경우
            const itemsListContainer = document.querySelector('.items-list');
            if (itemsListContainer) {
                itemsListContainer.innerHTML = '<p style="text-align: center; color: #9e9e9e; padding: 40px;">아직 관심있는 공구가 없습니다.</p>';
            }
        }
    } catch (error) {
        console.error('관심 목록 로드 오류:', error);

        // 에러 시 로그인 확인
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            alert('로그인이 필요합니다.');
            window.location.href = './login.html';
        }
    }
}

/**
 * 관심 목록 렌더링
 */
function renderFavorites(favorites) {
    const itemsListContainer = document.querySelector('.items-list');
    if (!itemsListContainer) return;

    // 기존 내용 지우기
    itemsListContainer.innerHTML = '';

    // 각 관심 아이템 렌더링
    favorites.forEach((favorite, index) => {
        const itemElement = createFavoriteItemElement(favorite);
        itemsListContainer.appendChild(itemElement);

        // 구분선 추가 (마지막 아이템 제외)
        if (index < favorites.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'item-divider';
            itemsListContainer.appendChild(divider);
        }
    });
}

/**
 * 관심 아이템 HTML 요소 생성
 */
function createFavoriteItemElement(favorite) {
    const item = document.createElement('div');
    item.className = 'item';
    item.setAttribute('data-item-id', favorite.post_id);
    item.setAttribute('data-product', favorite.title);
    item.style.cursor = 'pointer';

    // 이미지 URL을 실제 이미지로 표시
    const imageStyle = favorite.main_image_url 
        ? `background-image: url('${favorite.main_image_url}'); background-size: cover; background-position: center;`
        : '';
    
    item.innerHTML = `
        <div class="item-avatar" style="${imageStyle}"></div>
        <div class="item-content">
            <div class="item-title">${favorite.title || '제목 없음'}</div>
            <div class="item-description">${favorite.description || favorite.pickup_location_text || ''}</div>
        </div>
        <button class="btn-remove-favorite" data-post-id="${favorite.post_id}" title="관심 제거">❌</button>
    `;

    // 클릭 이벤트: 상세 페이지로 이동
    item.addEventListener('click', (e) => {
        // 삭제 버튼 클릭 시에는 이동하지 않음
        if (e.target.classList.contains('btn-remove-favorite')) {
            return;
        }

        sessionStorage.setItem('selectedPostId', favorite.post_id);
        sessionStorage.setItem('selectedItemTitle', favorite.title);
        window.location.href = './matching.html';
    });

    // 삭제 버튼 이벤트
    const removeBtn = item.querySelector('.btn-remove-favorite');
    removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

        const confirmed = window.confirmDialog 
            ? await window.confirmDialog.show('관심 목록에서 삭제하시겠습니까?', '관심 제거')
            : confirm('관심 목록에서 삭제하시겠습니까?');
        if (confirmed) {
            await removeFavorite(favorite.post_id, item);
        }
    });

    return item;
}

/**
 * 관심 목록에서 제거 (백엔드 API 연동)
 */
async function removeFavorite(postId, itemElement) {
    try {
        console.log('관심 제거 시도:', postId);

        // 백엔드 API 호출
        await window.apiService.removeFromWishlist(postId);

        console.log('관심 제거 성공');

        // UI에서 아이템 제거 (애니메이션 포함)
        itemElement.style.opacity = '0';
        itemElement.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            const nextSibling = itemElement.nextElementSibling;
            if (nextSibling && nextSibling.classList.contains('item-divider')) {
                nextSibling.remove();
            }
            itemElement.remove();

            // 목록이 비었는지 확인
            const remainingItems = document.querySelectorAll('.item');
            if (remainingItems.length === 0) {
                const itemsListContainer = document.querySelector('.items-list');
                if (itemsListContainer) {
                    itemsListContainer.innerHTML = '<p style="text-align: center; color: #9e9e9e; padding: 40px;">아직 관심있는 공구가 없습니다.</p>';
                }
            }
        }, 300);
    } catch (error) {
        console.error('관심 제거 오류:', error);
        alert('관심 제거에 실패했습니다.');
    }
}

