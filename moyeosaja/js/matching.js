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

        console.log('백엔드 API 응답:', post);

        // 백엔드 API 명세에 맞게 필드 매핑
        // API 응답 예시:
        // {
        //   "post_id": 2,
        //   "author": { "user_id": 1, "nickname": "...", "profile_image_url": "...", "rating_score": 4.5 },
        //   "post_type": "group",
        //   "title": "...",
        //   "description": "...",
        //   "main_image_url": "...",
        //   "total_price": 30000,
        //   "target_participants": 10,
        //   "per_person_price": 3000,
        //   "pickup_datetime": "2025-11-05T18:00:00",
        //   "end_date": "2025-11-06T23:59:59",
        //   "pickup_location_text": "강남역 5번 출구",
        //   "status": "recruiting"
        // }

        // 백엔드 응답 전체 구조 로깅 (디버깅용)
        console.log('🔍 백엔드 응답 전체 구조:', JSON.stringify(post, null, 2));

        // 이미지 URL 추출 (백엔드는 imageUrls 배열로 반환)
        let imageUrl = null;
        if (post.imageUrls && Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
            // imageUrls 배열에서 첫 번째 이미지 사용
            imageUrl = post.imageUrls[0];
            console.log('✅ imageUrls 배열에서 이미지 발견:', imageUrl.substring(0, 100) + '...');
        } else {
            // 기존 필드명들도 확인 (하위 호환성)
            imageUrl = post.main_image_url || post.mainImageUrl || post.image_url || post.imageUrl || post.image || post.mainImage || post.thumbnail || post.thumbnailUrl || null;
        }

        console.log('🔍 이미지 관련 필드 확인:', {
            imageUrls: post.imageUrls,
            imageUrls_length: post.imageUrls ? post.imageUrls.length : 0,
            main_image_url: post.main_image_url,
            mainImageUrl: post.mainImageUrl,
            image_url: post.image_url,
            imageUrl: post.imageUrl,
            최종_이미지_URL: imageUrl ? imageUrl.substring(0, 100) + '...' : null
        });

        const completePost = {
            // ID 매핑 (post_id 또는 id)
            id: post.post_id || post.id || postId,
            post_id: post.post_id || post.id || postId,

            // 기본 정보
            title: post.title || sessionStorage.getItem('selectedItemTitle') || '제목 없음',
            description: post.description || post.content || '설명이 없습니다.',
            post_type: post.post_type || post.postType || 'group',
            status: post.status || 'recruiting',

            // 이미지 (imageUrls 배열에서 첫 번째 이미지 사용)
            main_image_url: imageUrl,

            // 작성자 정보
            author: {
                user_id: post.author?.user_id || post.author?.id || null,
                nickname: post.author?.nickname || '익명',
                profile_image_url: post.author?.profile_image_url || null,
                rating_score: post.author?.rating_score || 0
            },

            // 참여 인원 (백엔드에서 제공하지 않으면 기본값 사용)
            target_participants: post.target_participants || post.targetParticipants || 4,
            current_participants: post.current_participants || post.currentParticipants || 0,

            // 날짜/시간 (백엔드에서 제공하지 않으면 기본값 사용)
            pickup_datetime: post.pickup_datetime || post.pickupDatetime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            end_date: post.end_date || post.endDate || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),

            // 장소 (백엔드에서 제공하지 않으면 기본값 사용)
            pickup_location_text: post.pickup_location_text || post.pickupLocationText || '장소 미정',

            // 가격 (백엔드에서 제공하지 않으면 기본값 사용)
            total_price: post.total_price || post.totalPrice || 0,
            per_person_price: post.per_person_price || post.perPersonPrice || 0
        };

        console.log('매핑된 게시글 정보:', completePost);

        // UI 업데이트
        updatePostDetails(completePost);
    } catch (error) {
        console.error('게시글 상세 정보 로드 실패:', error);

        // 에러 시 최소한의 정보로 UI 업데이트
        const fallbackPost = {
            id: postId,
            post_id: postId,
            title: sessionStorage.getItem('selectedItemTitle') || '제목 없음',
            description: '게시글 정보를 불러올 수 없습니다.',
            main_image_url: null,
            author: {
                user_id: null,
                nickname: '익명',
                profile_image_url: null,
                rating_score: 0
            },
            target_participants: 0,
            current_participants: 0,
            pickup_datetime: null,
            pickup_location_text: '정보 없음',
            total_price: 0,
            per_person_price: 0,
            post_type: 'group',
            status: 'recruiting'
        };

        updatePostDetails(fallbackPost);
    }
}

/**
 * 게시글 상세 정보로 UI 업데이트
 */
function updatePostDetails(post) {
    console.log('게시글 상세 정보 업데이트:', post);
    console.log('이미지 URL:', post.main_image_url);

    // 제품 이미지 표시
    const productImageElement = document.querySelector('.product-image');
    if (productImageElement) {
        if (post.main_image_url) {
            // 이미지 URL이 있는 경우
            const imageUrl = post.main_image_url;
            console.log('이미지 URL 설정:', imageUrl.substring(0, 100) + '...');

            // base64 이미지인 경우와 일반 URL인 경우 모두 처리
            productImageElement.style.backgroundImage = `url('${imageUrl}')`;
            productImageElement.style.backgroundSize = 'cover';
            productImageElement.style.backgroundPosition = 'center';
            productImageElement.style.backgroundRepeat = 'no-repeat';
            productImageElement.style.backgroundColor = 'transparent';

            // 이미지 로드 확인
            const testImg = new Image();
            testImg.onload = () => {
                console.log('✅ 이미지 로드 성공');
            };
            testImg.onerror = () => {
                console.error('❌ 이미지 로드 실패:', imageUrl.substring(0, 100));
                productImageElement.style.backgroundImage = 'none';
                productImageElement.style.backgroundColor = '#f0f0f0';
            };
            testImg.src = imageUrl;
        } else {
            // 이미지가 없는 경우 기본 배경색 또는 기본 이미지
            console.warn('⚠️ 이미지 URL이 없습니다');
            productImageElement.style.backgroundImage = 'none';
            productImageElement.style.backgroundColor = '#f0f0f0';
        }
    } else {
        console.error('❌ .product-image 요소를 찾을 수 없습니다');
    }

    // 제품명
    const productNameElement = document.querySelector('.product-name');
    if (productNameElement) {
        productNameElement.textContent = post.title || '제목 없음';
    }

    // 작성자 정보
    const authorNameElement = document.querySelector('.author-name');
    if (authorNameElement && post.author) {
        authorNameElement.textContent = post.author.nickname || '익명';
    }

    // 작성자 아바타
    const authorAvatarElement = document.querySelector('.author-avatar');
    if (authorAvatarElement && post.author?.profile_image_url) {
        authorAvatarElement.style.backgroundImage = `url('${post.author.profile_image_url}')`;
        authorAvatarElement.style.backgroundSize = 'cover';
        authorAvatarElement.style.backgroundPosition = 'center';
    }

    // 설명
    const descriptionElement = document.querySelector('.product-description');
    if (descriptionElement) {
        descriptionElement.textContent = post.description || '설명이 없습니다.';
    }

    // 진행률 업데이트
    const currentCountElement = document.querySelector('.count-current');
    const totalCountElement = document.querySelector('.count-total');
    const progressTextElement = document.querySelector('.progress-text');
    const progressFillElement = document.querySelector('.progress-fill');

    if (currentCountElement) {
        currentCountElement.textContent = post.current_participants || 0;
    }
    if (totalCountElement) {
        totalCountElement.textContent = `/${post.target_participants || 0}`;
    }

    // 진행률 계산 및 메시지 업데이트
    if (progressTextElement && progressFillElement) {
        const current = post.current_participants || 0;
        const target = post.target_participants || 4;
        const percentage = target > 0 ? (current / target) * 100 : 0;

        // 진행률 바 업데이트
        progressFillElement.style.width = `${percentage}%`;

        // 진행률에 따른 메시지
        if (percentage >= 100) {
            progressTextElement.textContent = '🎉 모집 완료!';
        } else if (percentage >= 75) {
            progressTextElement.textContent = '거의 다 왔어요!';
        } else if (percentage >= 50) {
            progressTextElement.textContent = '절반 이상 모였어요!';
        } else if (percentage >= 25) {
            progressTextElement.textContent = '모집 중입니다';
        } else {
            progressTextElement.textContent = '참여자를 기다리고 있어요';
        }

        // 참여자 아바타 업데이트
        const participantAvatars = document.querySelectorAll('.participant-avatar');
        if (participantAvatars.length > 0) {
            participantAvatars.forEach((avatar, index) => {
                if (index < current) {
                    // 참여 중인 슬롯
                    avatar.classList.remove('empty');
                    avatar.classList.add('filled');
                    avatar.innerHTML = ''; // ? 제거
                } else {
                    // 빈 슬롯
                    avatar.classList.remove('filled');
                    avatar.classList.add('empty');
                    avatar.innerHTML = '<span class="empty-text">?</span>';
                }
            });
        }
    }

    // 공구 정보 섹션 업데이트 (HTML 순서대로)
    const infoRows = document.querySelectorAll('.purchase-info .info-row');
    if (infoRows.length >= 5) {
        // 0: 공구 명
        const titleValue = infoRows[0].querySelector('.info-value');
        if (titleValue) {
            titleValue.textContent = post.title || '제목 없음';
        }

        // 1: 수량
        const quantityValue = infoRows[1].querySelector('.info-value');
        if (quantityValue) {
            quantityValue.textContent = post.target_participants || '미정';
        }

        // 2: 날짜
        const dateValue = infoRows[2].querySelector('.info-value');
        if (dateValue) {
            if (post.pickup_datetime) {
                const pickupDate = new Date(post.pickup_datetime);
                dateValue.textContent = pickupDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
            } else {
                dateValue.textContent = '날짜 미정';
            }
        }

        // 3: 시간
        const timeValue = infoRows[3].querySelector('.info-value');
        if (timeValue) {
            if (post.pickup_datetime) {
                const pickupDate = new Date(post.pickup_datetime);
                timeValue.textContent = pickupDate.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
            } else {
                timeValue.textContent = '시간 미정';
            }
        }

        // 4: 수령장소
        const locationValue = infoRows[4].querySelector('.info-value');
        if (locationValue) {
            locationValue.textContent = post.pickup_location_text || '장소 미정';
        }
    }

    // 가격 정보
    const priceValueElements = document.querySelectorAll('.price-value');
    if (priceValueElements.length >= 2) {
        // 총 금액
        if (priceValueElements[0]) {
            const totalPrice = post.total_price || (post.per_person_price * post.target_participants);
            priceValueElements[0].textContent = `${totalPrice?.toLocaleString() || 0}원`;
        }
        // N/1 금액 (1인당)
        if (priceValueElements[1]) {
            const amountElement = priceValueElements[1].querySelector('.amount');
            if (amountElement) {
                amountElement.textContent = `${post.per_person_price?.toLocaleString() || 0}원`;
            } else {
                // .amount가 없으면 전체 텍스트 업데이트
                const perPersonPrice = post.per_person_price || (post.total_price / post.target_participants);
                priceValueElements[1].innerHTML = `<span class="per-person">1인당</span> <span class="amount">${perPersonPrice?.toLocaleString() || 0}원</span>`;
            }
        }
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

    // 모달 컨테이너 스타일 직접 적용 (다른 CSS와의 충돌 방지)
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 10000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        margin: 0 !important;
        padding: 0 !important;
    `;

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content" style="position: relative !important; background: white !important; border-radius: 24px !important; padding: 32px 24px !important; max-width: 360px !important; width: 90% !important; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important; transform: translateY(30px); transition: transform 0.3s ease; text-align: center !important; margin: auto !important; left: auto !important; right: auto !important; top: auto !important; bottom: auto !important;">
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
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.transform = 'translateY(0)';
        }
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

    // 관심있어요 버튼 초기화
    initWishlistButton();

    // 매칭하기 버튼 (2단계 모달 플로우)
    const matchBtn = document.querySelector('.btn-match');
    if (matchBtn) {
        matchBtn.addEventListener('click', async () => {
            // 로그인 상태 확인
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                if (window.toast) {
                    window.toast.warning('로그인이 필요한 서비스입니다.');
                } else {
                    alert('로그인이 필요한 서비스입니다.');
                }

                // 로그인 페이지로 이동 여부 확인
                const shouldRedirect = window.confirmDialog
                    ? await window.confirmDialog.show('로그인 페이지로 이동하시겠습니까?', '로그인 필요')
                    : confirm('로그인 페이지로 이동하시겠습니까?');

                if (shouldRedirect) {
                    // 현재 페이지를 저장하여 로그인 후 돌아올 수 있도록
                    sessionStorage.setItem('returnUrl', window.location.href);
                    window.location.href = './login.html';
                }
                return;
            }

            const postId = sessionStorage.getItem('selectedPostId');

            if (!postId) {
                if (window.toast) {
                    window.toast.error('선택된 게시글이 없습니다.');
                } else {
                    alert('선택된 게시글이 없습니다.');
                }
                return;
            }

            // 1단계 모달 표시: 매칭 신청 확인
            showMatchingStep1Modal(postId);
        });
    }

    // 대화방 참여하기 버튼
    const chatBtn = document.querySelector('.btn-chat');
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            // 실제로는 채팅 페이지로 이동
            if (window.toast) {
                window.toast.info('💬 대화방으로 이동합니다!\n\n참여자들과 소통해보세요.');
            } else {
                alert('💬 대화방으로 이동합니다!\n\n참여자들과 소통해보세요.');
            }
            // window.location.href = './chat.html';
        });
    }

    // 비슷한 공구 아이템 클릭
    const similarItems = document.querySelectorAll('.similar-item');
    similarItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.toast) {
                window.toast.info('다른 공구 상세 페이지로 이동합니다.');
            } else {
                alert('다른 공구 상세 페이지로 이동합니다.');
            }
            // window.location.href = './matching.html?id=...';
        });
    });
});

/**
 * 관심있어요 버튼 초기화
 */
function initWishlistButton() {
    const wishlistBtn = document.getElementById('btnWishlistDetail');
    if (!wishlistBtn) return;

    const postId = sessionStorage.getItem('selectedPostId');
    if (!postId) return;

    // 관심 상태 확인 (관심 목록에서 확인)
    checkWishlistStatus(postId, wishlistBtn);

    // 클릭 이벤트
    wishlistBtn.addEventListener('click', async () => {
        await toggleWishlistDetail(postId, wishlistBtn);
    });

    // 호버 효과
    wishlistBtn.addEventListener('mouseenter', () => {
        wishlistBtn.style.transform = 'scale(1.1)';
    });
    wishlistBtn.addEventListener('mouseleave', () => {
        wishlistBtn.style.transform = 'scale(1)';
    });
}

/**
 * 관심 상태 확인
 */
async function checkWishlistStatus(postId, buttonElement) {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return; // 비로그인 상태면 체크 안함

        // 관심 목록 조회
        const response = await window.apiService.getMyWishlist();
        if (response.wishlist && response.wishlist.length > 0) {
            const isWishlisted = response.wishlist.some(item =>
                String(item.post_id) === String(postId)
            );
            if (isWishlisted) {
                buttonElement.textContent = '❤️';
                buttonElement.style.borderColor = '#ff6b6b';
            }
        }
    } catch (error) {
        console.error('관심 상태 확인 실패:', error);
        // 에러는 무시 (비로그인 등)
    }
}

/**
 * 관심목록 토글 (상세 페이지)
 */
async function toggleWishlistDetail(postId, buttonElement) {
    try {
        // 로그인 확인
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            if (window.toast) {
                window.toast.warning('로그인이 필요한 서비스입니다.');
            } else {
                alert('로그인이 필요한 서비스입니다.');
            }
            window.location.href = './login.html';
            return;
        }

        // 현재 상태 확인
        const currentIcon = buttonElement.textContent.trim();
        const isCurrentlyWishlisted = currentIcon === '❤️';

        // 버튼 비활성화 (중복 클릭 방지)
        buttonElement.disabled = true;

        if (isCurrentlyWishlisted) {
            // 관심목록에서 제거
            await window.apiService.removeFromWishlist(postId);
            buttonElement.textContent = '🤍';
            buttonElement.style.borderColor = '#e0e0e0';
            if (window.toast) {
                window.toast.success('관심목록에서 제거되었습니다.');
            }
        } else {
            // 관심목록에 추가
            await window.apiService.addToWishlist(postId);
            buttonElement.textContent = '❤️';
            buttonElement.style.borderColor = '#ff6b6b';
            if (window.toast) {
                window.toast.success('관심목록에 추가되었습니다.');
            }

            // 애니메이션 효과
            buttonElement.style.transform = 'scale(1.3)';
            setTimeout(() => {
                buttonElement.style.transform = 'scale(1)';
            }, 200);
        }
    } catch (error) {
        console.error('관심목록 토글 실패:', error);
        if (window.toast) {
            window.toast.error('관심목록 처리에 실패했습니다.');
        } else {
            alert('관심목록 처리에 실패했습니다.');
        }
    } finally {
        // 버튼 다시 활성화
        if (buttonElement) {
            buttonElement.disabled = false;
        }
    }
}

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
        // 타입 불일치 방지를 위해 == 사용
        const isOwnComment = comment.user_id == currentUserId;
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


/**
 * 매칭 신청 1단계 모달: 확인 및 정보 입력
 */
async function showMatchingStep1Modal(postId) {
    const modal = document.createElement('div');
    modal.className = 'matching-step-modal';

    // 게시글 정보 가져오기 (UI에서 또는 API에서)
    let postTitle = document.querySelector('.product-name')?.textContent || '공구';
    let postDescription = document.querySelector('.product-description')?.textContent || '';
    let postDate = '';

    // 날짜 정보 가져오기
    const dateElement = document.querySelector('.purchase-info .info-row:nth-child(3) .info-value');
    if (dateElement) {
        postDate = dateElement.textContent.trim();
    }

    // API에서 상세 정보 가져오기 (선택적)
    try {
        const post = await window.apiService.getPostDetail(postId);
        if (post) {
            postTitle = post.title || postTitle;
            postDescription = post.description || postDescription;
            if (post.pickup_datetime) {
                const pickupDate = new Date(post.pickup_datetime);
                postDate = pickupDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
            }
        }
    } catch (error) {
        console.warn('게시글 상세 정보를 가져오지 못했습니다. UI 정보를 사용합니다.', error);
    }

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">×</button>
            <div class="modal-icon envelope-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#4A90E2"/>
                </svg>
                <div class="notification-dot"></div>
            </div>
            <h2 class="modal-title">매칭을 신청할까요?</h2>
            <p class="modal-subtitle">공구 정보를 정확히 확인해주세요!</p>
            
            <div class="modal-info-section">
                <div class="modal-product-name">${escapeHtml(postTitle)}</div>
                <div class="modal-product-description">${escapeHtml(postDescription)}</div>
                ${postDate ? `<div class="modal-product-date">${escapeHtml(postDate)}</div>` : ''}
            </div>
            
            <button class="modal-button modal-button-primary" id="confirmMatching">
                매칭하기
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // 애니메이션을 위한 약간의 지연
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // 닫기 버튼
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // 매칭하기 버튼
    const confirmBtn = modal.querySelector('#confirmMatching');
    confirmBtn.addEventListener('click', async () => {
        // 로딩 상태
        confirmBtn.disabled = true;
        confirmBtn.textContent = '매칭 중...';

        try {
            // 백엔드 API 호출: 공구 참여 신청
            const response = await window.apiService.participateInPost(postId, {});

            console.log('매칭 성공:', response);

            // 1단계 모달 닫기
            closeModal();

            // 진행률 애니메이션
            animateProgress();

            // 2단계 모달 표시
            setTimeout(() => {
                showMatchingStep2Modal(postTitle, postDescription, postDate);
            }, 500);

        } catch (error) {
            console.error('매칭 실패:', error);
            if (window.toast) {
                window.toast.error(error.message || '매칭 신청에 실패했습니다.');
            } else {
                alert(error.message || '매칭 신청에 실패했습니다.');
            }
            confirmBtn.disabled = false;
            confirmBtn.textContent = '매칭하기';
        }
    });
}

/**
 * 매칭 신청 2단계 모달: 완료 메시지
 */
function showMatchingStep2Modal(postTitle = '', postDescription = '', postDate = '') {
    const modal = document.createElement('div');
    modal.className = 'matching-step-modal';

    // 기본값 설정
    if (!postTitle) {
        postTitle = document.querySelector('.product-name')?.textContent || '공구';
    }
    if (!postDescription) {
        postDescription = document.querySelector('.product-description')?.textContent || '';
    }
    if (!postDate) {
        const dateElement = document.querySelector('.purchase-info .info-row:nth-child(3) .info-value');
        if (dateElement) {
            postDate = dateElement.textContent.trim();
        }
    }

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-icon success">
                <div class="checkmark-circle">
                    <div class="checkmark-icon">✓</div>
                </div>
            </div>
            <h2 class="modal-title">매칭 신청이 완료됐어요!</h2>
            <p class="modal-subtitle">'마이'에서 공구 내역을 확인할 수 있어요.</p>
            
            <div class="modal-info-section">
                <div class="modal-product-name">${escapeHtml(postTitle)}</div>
                <div class="modal-product-description">${escapeHtml(postDescription)}</div>
                ${postDate ? `<div class="modal-product-date">${escapeHtml(postDate)}</div>` : ''}
            </div>
            
            <button class="modal-button modal-button-primary" id="closeSuccess">
                닫기
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // 애니메이션을 위한 약간의 지연
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // 닫기 버튼
    const closeBtn = modal.querySelector('#closeSuccess');
    const overlay = modal.querySelector('.modal-overlay');

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            // 페이지 새로고침하여 업데이트된 참여 인원 표시
            location.reload();
        }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
}
