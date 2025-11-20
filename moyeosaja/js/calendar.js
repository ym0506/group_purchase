/**
 * 캘린더 페이지
 * 공구 일정 관리 및 표시
 */

document.addEventListener('DOMContentLoaded', () => {
    updateStatusTime();
    initCalendar();
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
 * 캘린더 초기화
 */
function initCalendar() {
    const calendarDays = document.querySelectorAll('.calendar-day');

    // 페이지 로드 시 전체 매칭 내역 로드
    loadAllSchedules();

    calendarDays.forEach(day => {
        if (day.textContent.trim()) {
            day.addEventListener('click', function () {
                // 이전 active 제거
                calendarDays.forEach(d => d.classList.remove('active'));

                // 현재 날짜를 active로 설정
                this.classList.add('active');

                // 해당 날짜의 일정 로드
                const selectedDate = this.textContent;
                const dayNumber = parseInt(selectedDate);
                
                if (!isNaN(dayNumber)) {
                    const currentYear = new Date().getFullYear();
                    const currentMonth = new Date().getMonth(); // 0-based (0 = January)
                    const selectedDateObj = new Date(currentYear, currentMonth, dayNumber);
                    
                    console.log(`선택된 날짜: ${selectedDateObj.toLocaleDateString('ko-KR')}`);
                    loadSchedulesForDate(selectedDateObj);
                }
            });
        }
    });
}

/**
 * 전체 일정 로드 (초기화 시)
 */
async function loadAllSchedules() {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            // 로그인하지 않은 경우 기본 UI 유지
            return;
        }

        // 사용자가 참여한 모든 매칭 내역 가져오기
        const response = await window.apiService.getMyMatching();
        
        if (response.matching && response.matching.length > 0) {
            // 날짜별로 일정 그룹화
            groupSchedulesByDate(response.matching);
        }
    } catch (error) {
        console.error('일정 로드 오류:', error);
    }
}

/**
 * 날짜별로 일정 그룹화
 * @param {Array} schedules - 일정 배열
 */
function groupSchedulesByDate(schedules) {
    const schedulesByDate = {};
    
    schedules.forEach(schedule => {
        if (schedule.pickup_datetime) {
            const date = new Date(schedule.pickup_datetime);
            const dateKey = date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (!schedulesByDate[dateKey]) {
                schedulesByDate[dateKey] = [];
            }
            schedulesByDate[dateKey].push(schedule);
        }
    });

    // 캘린더에 일정 표시 (점 표시 등)
    markCalendarDates(schedulesByDate);
}

/**
 * 캘린더 날짜에 일정 마커 표시
 * @param {Object} schedulesByDate - 날짜별 일정 객체
 */
function markCalendarDates(schedulesByDate) {
    const calendarDays = document.querySelectorAll('.calendar-day');
    
    calendarDays.forEach(day => {
        const dayNumber = day.textContent.trim();
        if (dayNumber && !isNaN(parseInt(dayNumber))) {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const dayDate = new Date(currentYear, currentMonth, parseInt(dayNumber));
            const dateKey = dayDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (schedulesByDate[dateKey]) {
                // 일정이 있는 날짜에 마커 추가
                day.classList.add('has-schedule');
                const marker = document.createElement('span');
                marker.className = 'schedule-marker';
                marker.textContent = schedulesByDate[dateKey].length;
                day.appendChild(marker);
            }
        }
    });
}

/**
 * 선택한 날짜의 일정 로드
 * @param {Date} selectedDate - 선택된 날짜
 */
async function loadSchedulesForDate(selectedDate) {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            const scheduleList = document.querySelector('.schedule-list');
            if (scheduleList) {
                scheduleList.innerHTML = '<div class="empty-message">로그인이 필요합니다.</div>';
            }
            return;
        }

        // 사용자가 참여한 모든 매칭 내역 가져오기
        const response = await window.apiService.getMyMatching();
        
        if (!response.matching || response.matching.length === 0) {
            renderSchedules([], selectedDate);
            return;
        }

        // 선택한 날짜의 일정 필터링
        const selectedDateStr = selectedDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const schedulesForDate = response.matching.filter(schedule => {
            if (!schedule.pickup_datetime) return false;
            const scheduleDate = new Date(schedule.pickup_datetime);
            const scheduleDateStr = scheduleDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return scheduleDateStr === selectedDateStr;
        });

        renderSchedules(schedulesForDate, selectedDate);
    } catch (error) {
        console.error('일정 로드 오류:', error);
        const scheduleList = document.querySelector('.schedule-list');
        if (scheduleList) {
            scheduleList.innerHTML = '<div class="error-message">일정을 불러올 수 없습니다.</div>';
        }
    }
}

/**
 * 일정 렌더링
 * @param {Array} schedules - 일정 배열
 * @param {Date} selectedDate - 선택된 날짜
 */
function renderSchedules(schedules, selectedDate) {
    const scheduleList = document.querySelector('.schedule-list');
    if (!scheduleList) return;

    if (!schedules || schedules.length === 0) {
        const dateStr = selectedDate.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric'
        });
        scheduleList.innerHTML = `<div class="empty-message">${dateStr}에는 일정이 없습니다.</div>`;
        return;
    }

    scheduleList.innerHTML = schedules.map(schedule => {
        const pickupTime = schedule.pickup_datetime
            ? new Date(schedule.pickup_datetime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '시간 정보 없음';

        const perPersonPrice = schedule.per_person_price 
            || Math.floor((schedule.total_price || 0) / (schedule.target_participants || 1));

        return `
            <div class="schedule-item" data-post-id="${schedule.post_id}">
                <div class="schedule-content">
                    <div class="schedule-title">${schedule.title || '제목 없음'}</div>
                    <div class="schedule-detail">
                        <span class="detail-label">수령장소</span>
                        <span class="detail-value">${schedule.pickup_location_text || '-'}</span>
                    </div>
                    <div class="schedule-detail">
                        <span class="detail-label">시간</span>
                        <span class="detail-value">${pickupTime}</span>
                    </div>
                    <div class="schedule-detail">
                        <span class="detail-label">인당 금액</span>
                        <span class="detail-value">${perPersonPrice.toLocaleString()}원</span>
                    </div>
                </div>
                <div class="schedule-participants">
                    <div class="participant-count">${schedule.current_participants || 0}/${schedule.target_participants || 0}</div>
                    <div class="participant-avatars">
                        ${Array(schedule.current_participants || 0).fill(0).map(() => '<div class="participant-avatar"></div>').join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 클릭 이벤트 추가
    scheduleList.querySelectorAll('.schedule-item').forEach(item => {
        item.addEventListener('click', () => {
            const postId = item.getAttribute('data-post-id');
            if (postId) {
                sessionStorage.setItem('selectedPostId', postId);
                window.location.href = './matching.html';
            }
        });
    });
}

/**
 * 백엔드 연동을 위한 미래 확장 구조
 * 
 * async function loadSchedulesForDate(date) {
 *     try {
 *         const response = await fetch(`/api/schedules?date=${date}`);
 *         const data = await response.json();
 *         
 *         if (data.success) {
 *             renderSchedules(data.schedules);
 *         }
 *     } catch (error) {
 *         console.error('일정 로드 오류:', error);
 *     }
 * }
 * 
 * function renderSchedules(schedules) {
 *     const scheduleList = document.querySelector('.schedule-list');
 *     
 *     scheduleList.innerHTML = schedules.map(schedule => `
 *         <div class="schedule-item">
 *             <div class="schedule-content">
 *                 <div class="schedule-title">${schedule.title}</div>
 *                 <div class="schedule-detail">
 *                     <span class="detail-label">수령장소</span>
 *                     <span class="detail-value">${schedule.location || '-'}</span>
 *                 </div>
 *                 <div class="schedule-detail">
 *                     <span class="detail-label">시간</span>
 *                     <span class="detail-value">${schedule.time}</span>
 *                 </div>
 *                 <div class="schedule-detail">
 *                     <span class="detail-label">N/1 금액</span>
 *                     <span class="detail-value">${schedule.price.toLocaleString()}원</span>
 *                 </div>
 *             </div>
 *             <div class="schedule-participants">
 *                 <div class="participant-count">${schedule.current}/${schedule.total}</div>
 *                 <div class="participant-avatars">
 *                     ${schedule.participants.map(() => '<div class="participant-avatar"></div>').join('')}
 *                 </div>
 *             </div>
 *         </div>
 *     `).join('');
 * }
 */

