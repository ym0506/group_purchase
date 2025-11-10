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

    calendarDays.forEach(day => {
        if (day.textContent.trim()) {
            day.addEventListener('click', function () {
                // 이전 active 제거
                calendarDays.forEach(d => d.classList.remove('active'));

                // 현재 날짜를 active로 설정
                this.classList.add('active');

                // 해당 날짜의 일정 로드 (실제로는 API 호출)
                const selectedDate = this.textContent;
                console.log(`선택된 날짜: 10월 ${selectedDate}일`);

                // TODO: 선택한 날짜의 일정을 API에서 가져와서 표시
                // loadSchedulesForDate(selectedDate);
            });
        }
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

