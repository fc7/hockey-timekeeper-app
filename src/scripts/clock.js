function startClock() {
    let currentPeriod = 1; // Track current period (1, 2, 3, 'OT')
    let timer = 0;
    let interval = null;
    let periodDuration = 20; // default in minutes
    let overtimeDuration = 0;

    // Score variables
    let score1 = 0;
    let score2 = 0;

    let team1Penalties = [];
    let team2Penalties = [];
    const maxPenalties = 5;

    const minutesInput = document.getElementById('clock-minutes');
    const secondsInput = document.getElementById('clock-seconds');
    const periodDisplay = document.getElementById('periodDisplay');
    const periodDurationSelect = document.getElementById('periodDuration');
    const overtimeDurationSelect = document.getElementById('overtimeDuration');
    const remainingTimeDiv = document.getElementById('remainingTime');
    const advancePeriodButton = document.getElementById('advancePeriodButton');

    function getPeriodEnd(period) {
        if (period === 'OT') return 3 * periodDuration * 60 + overtimeDuration * 60;
        return period * periodDuration * 60;
    }

    function setClockInputsEnabled(enabled) {
        minutesInput.disabled = !enabled;
        secondsInput.disabled = !enabled;
    }

    function startTimer() {
        if (interval) return;
        setClockInputsEnabled(false);
        interval = setInterval(() => {
            timer++;
            updateDisplay();
            tickPenalties();

            let periodEnd = getPeriodEnd(currentPeriod === 'OT' ? 'OT' : currentPeriod);
            if (timer >= periodEnd) {
                timer = periodEnd;
                updateDisplay();
                stopTimer();

                // Only show "Advance Period" button after period 3 if scores are tied
                if (currentPeriod === 3 && score1 !== score2) {
                    advancePeriodButton.style.display = 'none';
                } else {
                    advancePeriodButton.style.display = 'inline-block';
                }

                const horn = new Audio('assets/hockey-horn.mp3');
                horn.play();
            }
        }, 1000);
    }

    function stopTimer() {
        if (interval) {
            clearInterval(interval);
            interval = null;
            setClockInputsEnabled(true);
        }
    }

    advancePeriodButton.addEventListener('click', () => {
        if (currentPeriod === 1) currentPeriod = 2;
        else if (currentPeriod === 2) currentPeriod = 3;
        else if (currentPeriod === 3 && overtimeDuration > 0) currentPeriod = 'OT';
        // Set timer to start of next period
        timer = currentPeriod === 'OT'
            ? 3 * periodDuration * 60
            : (currentPeriod - 1) * periodDuration * 60;
        advancePeriodButton.style.display = 'none';
        updateDisplay();
    });

    function updatePeriodDisplay() {
        periodDisplay.textContent = currentPeriod === 'OT' ? 'OT' : `Period ${currentPeriod}`;
    }
    
    function forcePeriodDisplay() {
        currentPeriod = Math.ceil(timer / (periodDuration*60));
        if (timer > 3*periodDuration*60 && overtimeDuration > 0) {
            currentPeriod = 'OT'
        }
        updatePeriodDisplay()
    }

    function updateRemainingTime() {
        let periodEnd = getPeriodEnd(currentPeriod === 'OT' ? 'OT' : currentPeriod);
        let remaining = periodEnd - timer;
        if (remaining < 0) remaining = 0;
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        remainingTimeDiv.textContent = `⏱️ ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    function updateDisplay() {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        if (minutesInput) minutesInput.value = String(minutes).padStart(2, '0');
        if (secondsInput) secondsInput.value = String(seconds).padStart(2, '0');
        updatePeriodDisplay();
        updateRemainingTime();
    }

    function updateScores() {
        const score1Value = document.getElementById('score1Value');
        const score2Value = document.getElementById('score2Value');
        if (score1Value) score1Value.textContent = score1;
        if (score2Value) score2Value.textContent = score2;
    }

    function getPenaltyElement(penalty, idx, teamNumber) {
        const div = document.createElement('div');
        div.className = 'penalty-entry';
        div.innerHTML = `
            <input type="text" class="penalty-player" value="${penalty.player}" data-team="${teamNumber}" data-idx="${idx}" />
            <span class="penalty-time" data-team="${teamNumber}" data-idx="${idx}">${formatTime(penalty.duration)}</span>
            <span class="penalty-remaining">${formatTime(penalty.remaining)}</span>
            <button class="remove-penalty" data-team="${teamNumber}" data-idx="${idx}">&times;</button>
        `;
        return div
    }

    function renderPenalties() {
        const team1List = document.getElementById('team1PenaltiesList');
        const team2List = document.getElementById('team2PenaltiesList');
        team1List.innerHTML = '';
        team2List.innerHTML = '';

        team1Penalties.forEach((penalty, idx) => {
            team1List.appendChild(getPenaltyElement(penalty, idx, 1));
        });

        team2Penalties.forEach((penalty, idx) => {
            team2List.appendChild(getPenaltyElement(penalty, idx, 2));
        });
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}`;
    }

    const penaltyModal = document.getElementById('penaltyModal');
    const penaltyDurationSelect = document.getElementById('penaltyDurationSelect');
    const penaltyMinutesInput = document.getElementById('penaltyMinutesInput');
    const penaltySecondsInput = document.getElementById('penaltySecondsInput');
    const penaltyPlayerInput = document.getElementById('penaltyPlayerInput');
    const penaltyModalOk = document.getElementById('penaltyModalOk');
    const penaltyModalCancel = document.getElementById('penaltyModalCancel');

    let penaltyModalTeam = null; // 1 or 2

    function showPenaltyModal(team) {
        penaltyModalTeam = team;
        penaltyDurationSelect.value = "120";
        penaltyMinutesInput.value = "2";
        penaltySecondsInput.value = "00";
        penaltyPlayerInput.value = "";
        penaltyModal.style.display = "flex";
        penaltyMinutesInput.max = penaltyDurationSelect.value / 60;
        penaltyPlayerInput.style.borderColor = "";
        penaltyModalOk.disabled = true;
    }

    function hidePenaltyModal() {
        penaltyModal.style.display = "none";
        penaltyModalTeam = null;
    }

    // Update max minutes when duration changes
    penaltyDurationSelect.addEventListener('change', () => {
        penaltyMinutesInput.max = penaltyDurationSelect.value / 60;
        penaltyMinutesInput.value = penaltyMinutesInput.max;
        penaltySecondsInput.value = "00";
        // if (parseInt(penaltyMinutesInput.value, 10) == 2 || parseInt(penaltyMinutesInput.value, 10) > penaltyMinutesInput.max) {
        //     penaltyMinutesInput.value = penaltyMinutesInput.max;
        // }
    });

    // Add penalty buttons
    document.getElementById('addPenaltyTeam1').onclick = () => {
        if (interval) return;
        if (team1Penalties.length < maxPenalties) showPenaltyModal(1);
    };
    document.getElementById('addPenaltyTeam2').onclick = () => {
        if (interval) return;
        if (team2Penalties.length < maxPenalties) showPenaltyModal(2);
    };

    function validatePenaltyPlayerInput() {
        const val = penaltyPlayerInput.value.trim();
        const num = Number(val);
        const valid = val !== "" && Number.isInteger(num) && num >= 1 && num <= 99;
        penaltyModalOk.disabled = !valid;
        penaltyPlayerInput.style.borderColor = valid ? "" : "red";
        return valid;
    }

    // Validate on input
    penaltyPlayerInput.addEventListener('input', validatePenaltyPlayerInput);

    penaltyModalOk.onclick = () => {
        if (!validatePenaltyPlayerInput()) {
            penaltyPlayerInput.style.borderColor = "red";
            penaltyPlayerInput.focus();
            return;
        }
        const duration = parseInt(penaltyDurationSelect.value, 10);
        let min = parseInt(penaltyMinutesInput.value, 10);
        let sec = parseInt(penaltySecondsInput.value, 10);
        if (isNaN(min) || min < 0) min = 0;
        if (isNaN(sec) || sec < 0) sec = 0;
        if (sec > 59) sec = 59;
        let remaining = min * 60 + sec;
        if (remaining > duration) remaining = duration;
        if (remaining < 0) remaining = 0;
        const player = penaltyPlayerInput.value;

        const penaltyObj = {
            player: player,
            duration: duration,
            remaining: remaining
        };

        if (penaltyModalTeam === 1) {
            team1Penalties.push(penaltyObj);
        } else if (penaltyModalTeam === 2) {
            team2Penalties.push(penaltyObj);
        }
        hidePenaltyModal();
        renderPenalties();
    };

    penaltyModalCancel.onclick = () => {
        hidePenaltyModal();
    };

    // Handle edits and removal
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('penalty-player')) {
            const team = e.target.dataset.team;
            const idx = e.target.dataset.idx;
            if (team === '1') {
                team1Penalties[idx].player = e.target.value;
            } else {
                team2Penalties[idx].player = e.target.value;
            }
        }
        if (e.target.classList.contains('penalty-time')) {
            const team = e.target.dataset.team;
            const idx = e.target.dataset.idx;
            const val = parseInt(e.target.value, 10);
            if (team === '1') {
                team1Penalties[idx].duration = val;
                team1Penalties[idx].remaining = val;
            } else {
                team2Penalties[idx].duration = val;
                team2Penalties[idx].remaining = val;
            }
            renderPenalties();
        }
    });
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-penalty')) {
            const team = e.target.dataset.team;
            const idx = e.target.dataset.idx;
            if (team === '1') team1Penalties.splice(idx, 1);
            else team2Penalties.splice(idx, 1);
            renderPenalties();
        }
    });

    // Decrement penalty timers when main clock is running
    function tickPenalties() {
        team1Penalties.forEach((penalty, idx) => {
            if (penalty.remaining > 0) penalty.remaining--;
        });
        team2Penalties.forEach((penalty, idx) => {
            if (penalty.remaining > 0) penalty.remaining--;
        });
        // Remove expired penalties
        team1Penalties = team1Penalties.filter(p => p.remaining > 0);
        team2Penalties = team2Penalties.filter(p => p.remaining > 0);
        renderPenalties();
    }

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.key === ' ') {
            event.preventDefault();
            if (interval) {
                stopTimer();
                interval = null;
            } else {
                startTimer();
            }
        }
    });

    // document.addEventListener('keydown', (event) => {
    //     if (event.code === 'P' || event.key === 'p') {
    //         event.preventDefault();
    //         if (!interval && (timer % (periodDuration*60) == 0)) {
    //             updatePeriodDisplay();
    //         }
    //     }
    // });

    // Add button event listener
    const startStopButton = document.getElementById('startStopButton');
    if (startStopButton) {
        startStopButton.addEventListener('click', () => {
            if (interval) {
                stopTimer();
                interval = null;
            } else {
                startTimer();
            }
        });
    }

    // Score button listeners
    document.getElementById('score1Up').addEventListener('click', () => {
        if (interval) return;
        score1++;
        updateScores();
    });
    document.getElementById('score1Down').addEventListener('click', () => {
        if (interval) return;
        if (score1 > 0) score1--;
        updateScores();
    });
    document.getElementById('score2Up').addEventListener('click', () => {
        if (interval) return;
        score2++;
        updateScores();
    });
    document.getElementById('score2Down').addEventListener('click', () => {
        if (interval) return;
        if (score2 > 0) score2--;
        updateScores();
    });

    document.getElementById('resetButton').onclick = () => {
        if (interval) return;
        stopTimer();
        timer = 0;
        currentPeriod = 1;
        score1 = 0;
        score2 = 0;
        team1Penalties = [];
        team2Penalties = [];
        advancePeriodButton.style.display = 'none';
        updateDisplay();
        updateScores();
        renderPenalties();
    };

    // Make clock inputs editable
    minutesInput.addEventListener('change', () => {
        let m = parseInt(minutesInput.value, 10);
        if (isNaN(m) || m < 0) m = 0;
        if (m > 3*periodDuration+overtimeDuration) m = 3*periodDuration+overtimeDuration;
        const seconds = timer % 60;
        timer = m * 60 + seconds;
        updateDisplay();
        forcePeriodDisplay(); // Update period display after timer changes
    });

    secondsInput.addEventListener('change', () => {
        let s = parseInt(secondsInput.value, 10);
        if (isNaN(s) || s < 0) s = 0;
        if (s > 59) s = 59;
        timer = Math.floor(timer / 60) * 60 + s;
        updateDisplay();
    });

    // Period duration dropdown
    periodDurationSelect.addEventListener('change', () => {
        periodDuration = parseInt(periodDurationSelect.value, 10);
        updateDisplay();
    });
    // Overtime duration dropdown
    overtimeDurationSelect.addEventListener('change', () => {
        overtimeDuration = parseInt(overtimeDurationSelect.value, 10);
        updateDisplay();
    });

    updateDisplay();
    updateScores();
    // Initial render
    renderPenalties();

    // On initial load, ensure inputs are enabled
    setClockInputsEnabled(true);
}

startClock();

function updateCurrentDateTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('currentDateTime').textContent = `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}
updateCurrentDateTime();
setInterval(updateCurrentDateTime, 10000);