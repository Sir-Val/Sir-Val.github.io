/**
 * ============================================================
 * UPHSD Molino Campus - Exam Timer
 * College of Computer Studies
 * University of Perpetual Help System DALTA - Molino Campus
 * ============================================================
 * File        : js/timer.js
 * Description : Core application logic for the Exam Timer.
 *
 *   Responsibilities:
 *     - Live wall-clock display (current time, updates every second)
 *     - Exam configuration (title, duration, reading time, toggles)
 *     - Countdown engine (reading phase → exam phase)
 *     - Start / Pause-Resume / Reset controls
 *     - Auto-start (optional scheduled start)
 *     - Seconds visibility management (hide after 5 s unless toggled)
 *     - Warning/critical visual cues on the digit cards
 *     - Time-expired overlay with audio cue
 *     - Setup modal open/close with Save & Close
 *     - Light / Dark theme toggle
 *     - Persists settings in localStorage
 *     - Footer year auto-fill
 *
 *   Architecture:
 *     All mutable state lives in a single `state` object.
 *     DOM references are collected once at startup.
 *     Pure helper functions are kept side-effect-free.
 *     Event handlers are attached via addEventListeners() at init.
 *
 * Author      : CCS Department - UPHSD Molino
 * Version     : 1.0.0
 * ============================================================
 */

'use strict';

/* ============================================================
   SECTION 1: STATE
   ============================================================
   The single source of truth for the entire application.
   Mutating state outside this object is intentionally avoided
   so bugs can be traced to one place.
============================================================ */
const state = {
  /* ── Timer internals ── */
  intervalId:        null,   // setInterval handle for the countdown tick
  wallClockId:       null,   // setInterval handle for the wall-clock display
  autoStartTimeoutId: null,  // setTimeout handle for the auto-start feature

  totalSeconds:      3600,   // Countdown duration in seconds (default: 1 h)
  remainingSeconds:  3600,   // Seconds left in the current phase
  isRunning:         false,  // Whether the countdown is actively ticking
  isPaused:          false,  // Whether the timer has been manually paused

  /* ── Phase tracking ── */
  phase: 'idle',  // 'idle' | 'reading' | 'exam' | 'expired'

  /* ── Timestamps ── */
  startTimestamp:  null,  // Date object: when Start was pressed
  finishTimestamp: null,  // Date object: calculated end time

  /* ── User-configured settings ── */
  settings: {
    examTitle:        '',   // Optional exam name
    examHours:        1,    // Exam length – hours portion
    examMinutes:      0,    // Exam length – minutes portion
    readingMinutes:   0,    // Optional reading time in minutes
    showInstructions: false,
    alwaysSeconds:    false,
    autoStart:        false,
    autoStartTime:    '',   // "HH:MM" (24-hour)
  },

  /* ── UI helpers ── */
  secondsHidden:     false,  // Whether the seconds card is currently hidden
  secondsHideTimer:  null,   // setTimeout to auto-hide seconds
  isDarkTheme:       false,
};


/* ============================================================
   SECTION 2: DOM REFERENCES
   ============================================================
   Collected once at DOMContentLoaded to avoid repeated
   querySelector calls inside frequently-called functions.
============================================================ */
const dom = {};

/**
 * Queries the DOM and stores element references in `dom`.
 * Call this once after the document is ready.
 */
function cacheDomReferences() {
  /* ── App root ── */
  dom.body         = document.getElementById('app-body');
  dom.footerYear   = document.getElementById('footer-year');

  /* ── Toolbar buttons ── */
  dom.btnStart     = document.getElementById('btn-start');
  dom.btnPause     = document.getElementById('btn-pause');
  dom.btnSetup     = document.getElementById('btn-setup');
  dom.btnReset     = document.getElementById('btn-reset');
  dom.btnTheme     = document.getElementById('btn-theme');
  dom.themeIcon    = document.getElementById('theme-icon');

  /* ── Main timer display ── */
  dom.examTitle    = document.getElementById('exam-title');
  dom.currentTime  = document.getElementById('current-time');
  dom.startTime    = document.getElementById('start-time');
  dom.finishTime   = document.getElementById('finish-time');
  dom.phaseLabel   = document.getElementById('phase-label');
  dom.countdownLabel = document.getElementById('countdown-label');

  /* ── Digit cards ── */
  dom.cardHours    = document.getElementById('card-hours');
  dom.cardMinutes  = document.getElementById('card-minutes');
  dom.cardSeconds  = document.getElementById('card-seconds');
  dom.digitHours   = document.getElementById('digit-hours');
  dom.digitMinutes = document.getElementById('digit-minutes');
  dom.digitSeconds = document.getElementById('digit-seconds');

  /* ── Instructions ── */
  dom.instructionsBlock = document.getElementById('instructions-block');

  /* ── Modal ── */
  dom.modalOverlay   = document.getElementById('modal-overlay');
  dom.btnCloseModal  = document.getElementById('btn-close-modal');
  dom.btnSaveSetup   = document.getElementById('btn-save-setup');
  dom.inputExamTitle = document.getElementById('input-exam-title');
  dom.inputExamHours = document.getElementById('input-exam-hours');
  dom.inputExamMins  = document.getElementById('input-exam-minutes');
  dom.inputReadTime  = document.getElementById('input-reading-time');
  dom.toggleInstructions = document.getElementById('toggle-instructions');
  dom.toggleSeconds  = document.getElementById('toggle-seconds');
  dom.toggleAutostart = document.getElementById('toggle-autostart');
  dom.autostartPicker = document.getElementById('autostart-picker');
  dom.inputAutoStartTime = document.getElementById('input-autostart-time');

  /* ── Expired overlay ── */
  dom.expiredOverlay   = document.getElementById('expired-overlay');
  dom.expiredExamName  = document.getElementById('expired-exam-name');
  dom.btnDismissExpired = document.getElementById('btn-dismiss-expired');
}


/* ============================================================
   SECTION 3: UTILITY / HELPER FUNCTIONS
   ============================================================ */

/**
 * Pads a number to at least 2 digits with leading zero.
 * @param  {number} n
 * @returns {string} e.g. 7 → "07", 12 → "12"
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Formats a Date object as a 12-hour time string.
 * @param  {Date} date
 * @returns {string} e.g. "8:12 am"
 */
function formatTime12h(date) {
  let hours   = date.getHours();
  const mins  = date.getMinutes();
  const ampm  = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12; // Convert 0 → 12 for midnight
  return `${hours}:${pad(mins)} ${ampm}`;
}

/**
 * Returns total seconds for the configured exam duration.
 * @returns {number}
 */
function calcExamSeconds() {
  const { examHours, examMinutes } = state.settings;
  return (examHours * 3600) + (examMinutes * 60);
}

/**
 * Returns total seconds for the configured reading time.
 * @returns {number}
 */
function calcReadingSeconds() {
  return state.settings.readingMinutes * 60;
}

/**
 * Saves the current settings object to localStorage.
 * Allows settings to persist across page reloads.
 */
function persistSettings() {
  try {
    localStorage.setItem('uphsd_exam_timer_settings', JSON.stringify(state.settings));
  } catch (e) {
    // localStorage may be unavailable (e.g. in private browsing)
    console.warn('Could not persist settings to localStorage:', e);
  }
}

/**
 * Loads settings from localStorage (if available).
 * Merges stored values into the default state.settings object
 * so any new keys added in future versions still get defaults.
 */
function loadSettings() {
  try {
    const stored = localStorage.getItem('uphsd_exam_timer_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge: stored values overwrite defaults, but new keys survive
      Object.assign(state.settings, parsed);
    }
  } catch (e) {
    console.warn('Could not load settings from localStorage:', e);
  }
}

/**
 * Loads the dark-theme preference from localStorage.
 */
function loadThemePreference() {
  try {
    const dark = localStorage.getItem('uphsd_exam_timer_dark') === 'true';
    if (dark) applyTheme(true);
  } catch (e) { /* ignore */ }
}

/**
 * Clears any active countdown interval.
 */
function clearCountdownInterval() {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

/**
 * Creates and returns an AudioContext-based beep sound.
 * Used when the timer expires (no external audio files needed).
 * @param {number} freq      Frequency in Hz
 * @param {number} duration  Duration in seconds
 * @param {string} type      OscillatorType: 'sine' | 'square' | etc.
 */
function playBeep(freq = 880, duration = 0.3, type = 'sine') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode   = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type      = type;
    oscillator.frequency.value = freq;
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    // Fade out to avoid a click artefact at the end
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio API may not be available; silently ignore
  }
}

/**
 * Plays a three-beep "time's up" alarm sequence.
 */
function playAlarm() {
  playBeep(880, 0.3, 'sine');
  setTimeout(() => playBeep(880, 0.3, 'sine'), 400);
  setTimeout(() => playBeep(1100, 0.6, 'sine'), 800);
}


/* ============================================================
   SECTION 4: DISPLAY / RENDER FUNCTIONS
   ============================================================ */

/**
 * Updates the live wall-clock ("Current" time) display.
 * Called every second by the wall-clock interval.
 */
function renderWallClock() {
  const now = new Date();
  dom.currentTime.textContent = formatTime12h(now);
  dom.currentTime.setAttribute('datetime', now.toISOString());
}

/**
 * Decomposes `seconds` into hours, minutes, and seconds.
 * @param  {number} totalSec
 * @returns {{ hours: number, minutes: number, seconds: number }}
 */
function decomposeTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { hours: h, minutes: m, seconds: s };
}

/**
 * Renders the countdown digit cards with the current remaining time.
 * Handles:
 *  - Showing/hiding the hours card (hidden when 0 hours remain)
 *  - Showing/hiding the seconds card based on settings & auto-hide
 *  - Applying warning/critical visual states to the cards
 *
 * @param {number} remainingSec  Seconds remaining in the current phase
 */
function renderCountdown(remainingSec) {
  const { hours, minutes, seconds } = decomposeTime(remainingSec);

  /* ── Update digit text ── */
  dom.digitHours.textContent   = hours;
  dom.digitMinutes.textContent = pad(minutes);
  dom.digitSeconds.textContent = pad(seconds);

  /* ── Show/hide hours card ── */
  dom.cardHours.hidden = (hours === 0 && state.isRunning);

  /* ── Seconds card visibility ── */
  if (state.settings.alwaysSeconds) {
    // User opted to always show seconds
    dom.cardSeconds.hidden = false;
    dom.cardSeconds.classList.remove('hidden');
  }
  // Otherwise, auto-hide logic is handled by scheduleSecondsHide()

  /* ── Warning / Critical visual states ── */
  const allCards = [dom.cardHours, dom.cardMinutes, dom.cardSeconds];

  // Remove all states first
  allCards.forEach(card => {
    card.classList.remove('digit-card--active', 'digit-card--warning', 'digit-card--critical');
  });

  if (state.isRunning) {
    if (remainingSec <= 60) {
      // Under 1 minute: critical (flashing red)
      allCards.forEach(c => c.classList.add('digit-card--critical'));
    } else if (remainingSec <= 300) {
      // Under 5 minutes: warning (amber pulse)
      allCards.forEach(c => c.classList.add('digit-card--warning'));
    } else {
      // Normal running state: subtle blue border
      allCards.forEach(c => c.classList.add('digit-card--active'));
    }
  }
}

/**
 * Renders the static initial display (before the timer starts).
 * Shows the configured exam duration without running the countdown.
 */
function renderIdleDisplay() {
  const { examHours, examMinutes } = state.settings;

  dom.digitHours.textContent   = examHours;
  dom.digitMinutes.textContent = pad(examMinutes);
  dom.digitSeconds.textContent = '00';

  // In idle state, always show all three cards
  dom.cardHours.hidden   = false;
  dom.cardMinutes.hidden = false;
  dom.cardSeconds.hidden = false;

  dom.countdownLabel.textContent = 'Exam Time:';
  dom.phaseLabel.hidden = true;

  // Clear start/finish times (show em-dash)
  dom.startTime.textContent  = '—';
  dom.finishTime.textContent = '—';
}

/**
 * Applies the exam title to both the timer page and expired overlay.
 */
function renderExamTitle() {
  const title = state.settings.examTitle.trim();
  dom.examTitle.textContent        = title;
  dom.expiredExamName.textContent  = title ? `Exam: ${title}` : '';
}

/**
 * Schedules the seconds card to auto-hide after 5 seconds of the
 * timer running. The card reappears at 59 seconds left (critical phase).
 * This behaviour is disabled if alwaysSeconds is true.
 */
function scheduleSecondsHide() {
  if (state.settings.alwaysSeconds) return; // User opted out of hiding

  // Clear any existing hide timer
  if (state.secondsHideTimer) clearTimeout(state.secondsHideTimer);

  // Schedule the hide
  state.secondsHideTimer = setTimeout(() => {
    if (!state.settings.alwaysSeconds && state.isRunning) {
      dom.cardSeconds.classList.add('hidden');
      state.secondsHidden = true;
    }
  }, 5000); // 5 seconds after start
}

/**
 * Reveals the seconds card (called when entering the critical phase).
 */
function revealSeconds() {
  dom.cardSeconds.classList.remove('hidden');
  dom.cardSeconds.hidden = false;
  state.secondsHidden = false;
  if (state.secondsHideTimer) clearTimeout(state.secondsHideTimer);
}


/* ============================================================
   SECTION 5: COUNTDOWN ENGINE
   ============================================================ */

/**
 * The core tick function called every second by setInterval.
 * Decrements remainingSeconds and handles phase transitions.
 */
function onTick() {
  if (state.remainingSeconds <= 0) {
    // Phase ended
    handlePhaseEnd();
    return;
  }

  state.remainingSeconds -= 1;
  renderCountdown(state.remainingSeconds);

  /* ── Reveal seconds when entering the critical phase ── */
  if (state.remainingSeconds <= 60 && state.secondsHidden) {
    revealSeconds();
  }
}

/**
 * Called when the current phase countdown reaches zero.
 * If we were in the reading phase, transition to the exam phase.
 * If we were in the exam phase, the exam has expired.
 */
function handlePhaseEnd() {
  clearCountdownInterval();

  if (state.phase === 'reading') {
    // Reading time is over → transition to exam phase
    transitionToExamPhase();
  } else if (state.phase === 'exam') {
    // Exam time is over → show expired overlay
    expireExam();
  }
}

/**
 * Transitions from reading phase to exam phase.
 */
function transitionToExamPhase() {
  state.phase = 'exam';

  const examSec = calcExamSeconds();
  state.totalSeconds    = examSec;
  state.remainingSeconds = examSec;

  // Update the phase label on the main display
  dom.countdownLabel.textContent = 'Exam Time Remaining:';
  dom.phaseLabel.hidden = true;

  // Restart the countdown for the exam duration
  state.isRunning = true;
  state.intervalId = setInterval(onTick, 1000);

  scheduleSecondsHide();
  renderCountdown(state.remainingSeconds);

  // Flash the digit cards to signal the phase change
  flashCards();
}

/**
 * Marks the exam as expired and shows the full-screen overlay.
 */
function expireExam() {
  state.phase     = 'expired';
  state.isRunning = false;
  state.isPaused  = false;

  // Ensure digits show 0
  renderCountdown(0);

  // Update button states
  updateButtonStates();

  // Show the expired overlay
  showExpiredOverlay();

  // Play the alarm sound
  playAlarm();
}

/**
 * Starts the countdown engine from the correct phase.
 * If readingMinutes > 0, starts the reading phase first.
 * Otherwise goes directly to the exam phase.
 */
function startCountdown() {
  const readingSec = calcReadingSeconds();
  const examSec    = calcExamSeconds();

  // Record the start timestamp and calculate finish
  state.startTimestamp = new Date();

  if (readingSec > 0) {
    // Start in reading phase
    state.phase           = 'reading';
    state.totalSeconds    = readingSec;
    state.remainingSeconds = readingSec;

    // Finish time is after reading + exam
    state.finishTimestamp = new Date(
      state.startTimestamp.getTime() + (readingSec + examSec) * 1000
    );

    dom.countdownLabel.textContent = 'Reading Time:';
    dom.phaseLabel.hidden = false;
    dom.phaseLabel.textContent = '📖 Reading Time in Progress';
    dom.phaseLabel.style.animation = 'phaseIn 0.3s ease';

  } else {
    // Start directly in exam phase
    state.phase           = 'exam';
    state.totalSeconds    = examSec;
    state.remainingSeconds = examSec;

    // Finish time is start + exam duration
    state.finishTimestamp = new Date(
      state.startTimestamp.getTime() + examSec * 1000
    );

    dom.countdownLabel.textContent = 'Exam Time Remaining:';
    dom.phaseLabel.hidden = true;
  }

  // Update the Start and Finish clock displays
  dom.startTime.textContent  = formatTime12h(state.startTimestamp);
  dom.finishTime.textContent = formatTime12h(state.finishTimestamp);

  state.isRunning = true;
  state.isPaused  = false;

  // Begin ticking
  state.intervalId = setInterval(onTick, 1000);

  renderCountdown(state.remainingSeconds);
  scheduleSecondsHide();
  updateButtonStates();
}

/**
 * Brief flash animation on the digit cards to signal a phase change.
 */
function flashCards() {
  const cards = [dom.cardHours, dom.cardMinutes, dom.cardSeconds];
  cards.forEach(c => {
    c.style.transition = 'background 0.1s';
    c.style.background = 'rgba(27,58,107,0.12)';
  });
  setTimeout(() => {
    cards.forEach(c => { c.style.background = ''; });
  }, 300);
}


/* ============================================================
   SECTION 6: BUTTON EVENT HANDLERS
   ============================================================ */

/**
 * Start button handler.
 * Validates that the exam duration is > 0, then begins the countdown.
 */
function handleStart() {
  const examSec = calcExamSeconds();

  if (examSec <= 0) {
    // Provide user feedback if no duration is set
    alert('Please set an exam duration in Setup before starting.');
    openModal();
    return;
  }

  // If already running or paused, do nothing (button should be disabled)
  if (state.isRunning || state.isPaused) return;

  startCountdown();
}

/**
 * Pause / Resume button handler.
 * Toggles between paused and running states.
 */
function handlePauseResume() {
  if (!state.isRunning && !state.isPaused) return; // Idle: ignore

  if (state.isPaused) {
    // ── Resume ──
    state.isPaused  = false;
    state.isRunning = true;
    state.intervalId = setInterval(onTick, 1000);
    dom.btnPause.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i> Pause';
    dom.btnPause.removeAttribute('data-state');
    scheduleSecondsHide();
  } else {
    // ── Pause ──
    state.isPaused  = true;
    state.isRunning = false;
    clearCountdownInterval();
    if (state.secondsHideTimer) clearTimeout(state.secondsHideTimer);
    dom.btnPause.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> Resume';
    dom.btnPause.setAttribute('data-state', 'paused');
  }

  updateButtonStates();
}

/**
 * Reset button handler.
 * Stops the countdown and restores the timer to the idle state.
 */
function handleReset() {
  // Stop any running interval
  clearCountdownInterval();
  if (state.secondsHideTimer) clearTimeout(state.secondsHideTimer);
  if (state.autoStartTimeoutId) clearTimeout(state.autoStartTimeoutId);

  // Reset state
  state.phase           = 'idle';
  state.isRunning       = false;
  state.isPaused        = false;
  state.remainingSeconds = calcExamSeconds();
  state.totalSeconds    = state.remainingSeconds;
  state.startTimestamp  = null;
  state.finishTimestamp = null;
  state.secondsHidden   = false;

  // Restore Pause button text
  dom.btnPause.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i> Pause';
  dom.btnPause.removeAttribute('data-state');

  // Re-render the idle display
  renderIdleDisplay();
  renderCountdown(state.remainingSeconds);
  updateButtonStates();

  // Ensure the seconds card is visible
  revealSeconds();
}

/**
 * Updates the enabled/disabled state of toolbar buttons
 * based on the current timer state.
 */
function updateButtonStates() {
  const { isRunning, isPaused, phase } = state;

  // Start: disabled once the timer has started (or expired)
  dom.btnStart.disabled = isRunning || isPaused || phase === 'expired';

  // Pause: enabled only when running or paused (not idle/expired)
  dom.btnPause.disabled = phase === 'idle' || phase === 'expired';

  // Reset: always available (so instructor can reset mid-exam)
  dom.btnReset.disabled = false;

  // Setup: disabled while the timer is running to prevent mid-exam changes
  dom.btnSetup.disabled = isRunning || isPaused;
}


/* ============================================================
   SECTION 7: SETUP MODAL
   ============================================================ */

/**
 * Opens the setup modal and populates inputs with current settings.
 */
function openModal() {
  const s = state.settings;

  dom.inputExamTitle.value    = s.examTitle;
  dom.inputExamHours.value    = s.examHours;
  dom.inputExamMins.value     = s.examMinutes;
  dom.inputReadTime.value     = s.readingMinutes;
  dom.toggleInstructions.checked = s.showInstructions;
  dom.toggleSeconds.checked   = s.alwaysSeconds;
  dom.toggleAutostart.checked = s.autoStart;

  if (s.autoStart && s.autoStartTime) {
    dom.inputAutoStartTime.value = s.autoStartTime;
    dom.autostartPicker.hidden = false;
  } else {
    dom.autostartPicker.hidden = true;
  }

  dom.modalOverlay.hidden = false;

  // Focus the first input for accessibility
  setTimeout(() => dom.inputExamTitle.focus(), 50);
}

/**
 * Closes the setup modal without saving.
 */
function closeModal() {
  dom.modalOverlay.hidden = true;
}

/**
 * Reads the modal form values, updates state.settings, persists them,
 * and closes the modal.
 */
function saveAndCloseModal() {
  const s = state.settings;

  s.examTitle       = dom.inputExamTitle.value.trim();
  s.examHours       = Math.max(0, parseInt(dom.inputExamHours.value, 10)  || 0);
  s.examMinutes     = Math.max(0, Math.min(59, parseInt(dom.inputExamMins.value, 10) || 0));
  s.readingMinutes  = Math.max(0, parseInt(dom.inputReadTime.value, 10)   || 0);
  s.showInstructions = dom.toggleInstructions.checked;
  s.alwaysSeconds   = dom.toggleSeconds.checked;
  s.autoStart       = dom.toggleAutostart.checked;
  s.autoStartTime   = dom.inputAutoStartTime.value;

  // Recalculate total seconds based on new settings
  state.totalSeconds    = calcExamSeconds();
  state.remainingSeconds = state.totalSeconds;

  // Apply visible changes immediately
  renderExamTitle();
  renderIdleDisplay();

  // Show/hide the instructions block based on toggle
  dom.instructionsBlock.hidden = !s.showInstructions;

  // If always-seconds is now on, show the seconds card immediately
  if (s.alwaysSeconds) {
    revealSeconds();
  }

  // Schedule auto-start if configured
  if (s.autoStart && s.autoStartTime) {
    scheduleAutoStart(s.autoStartTime);
  }

  persistSettings();
  closeModal();
}

/**
 * Handles the auto-start toggle change inside the modal.
 * Shows/hides the time picker sub-section.
 */
function handleAutoStartToggle() {
  dom.autostartPicker.hidden = !dom.toggleAutostart.checked;
}


/* ============================================================
   SECTION 8: AUTO-START
   ============================================================ */

/**
 * Schedules the timer to start automatically at a given time.
 * @param {string} timeStr  Time in "HH:MM" (24-hour) format
 */
function scheduleAutoStart(timeStr) {
  if (state.autoStartTimeoutId) clearTimeout(state.autoStartTimeoutId);

  const [targetHour, targetMin] = timeStr.split(':').map(Number);

  const now    = new Date();
  let target   = new Date();
  target.setHours(targetHour, targetMin, 0, 0);

  // If the target time is already past for today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();

  state.autoStartTimeoutId = setTimeout(() => {
    if (!state.isRunning && state.phase === 'idle') {
      startCountdown();
    }
  }, delay);
}


/* ============================================================
   SECTION 9: EXPIRED OVERLAY
   ============================================================ */

/**
 * Shows the full-screen time-expired overlay.
 */
function showExpiredOverlay() {
  dom.expiredOverlay.hidden = false;
}

/**
 * Dismisses the time-expired overlay and resets the timer to idle.
 */
function dismissExpiredOverlay() {
  dom.expiredOverlay.hidden = true;
  handleReset();
}


/* ============================================================
   SECTION 10: THEME TOGGLE
   ============================================================ */

/**
 * Applies the given theme to the body element.
 * @param {boolean} dark  True for dark theme, false for light.
 */
function applyTheme(dark) {
  state.isDarkTheme = dark;
  dom.body.classList.toggle('theme-dark',  dark);
  dom.body.classList.toggle('theme-light', !dark);

  // Swap the button icon: sun (light mode) ↔ moon (dark mode)
  if (dom.themeIcon) {
    dom.themeIcon.className = dark
      ? 'fa-solid fa-moon'
      : 'fa-solid fa-sun';
  }

  // Persist preference
  try {
    localStorage.setItem('uphsd_exam_timer_dark', String(dark));
  } catch (e) { /* ignore */ }
}

/**
 * Toggles between light and dark themes.
 */
function handleThemeToggle() {
  applyTheme(!state.isDarkTheme);
}


/* ============================================================
   SECTION 11: KEYBOARD SHORTCUTS
   ============================================================
   Provides power-user keyboard accessibility without
   interfering with modal input fields.
============================================================ */

/**
 * Global keydown handler for keyboard shortcuts.
 * Only active when the modal is closed.
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {
  // Don't intercept keys when focus is inside an input/textarea
  const tag = document.activeElement.tagName.toLowerCase();
  if (['input', 'textarea', 'select'].includes(tag)) return;

  // Don't intercept when modal is open
  if (!dom.modalOverlay.hidden) return;

  switch (e.key) {
    case ' ':   // Spacebar: Start or Pause/Resume
    case 'Enter':
      e.preventDefault();
      if (state.phase === 'idle') {
        handleStart();
      } else {
        handlePauseResume();
      }
      break;

    case 'r':   // R: Reset
    case 'R':
      handleReset();
      break;

    case 's':   // S: Open Setup
    case 'S':
      if (!dom.btnSetup.disabled) openModal();
      break;

    case 'd':   // D: Toggle dark mode
    case 'D':
      handleThemeToggle();
      break;

    case 'Escape': // Esc: Dismiss expired overlay if visible
      if (!dom.expiredOverlay.hidden) dismissExpiredOverlay();
      break;
  }
}


/* ============================================================
   SECTION 12: WALL-CLOCK TICKER
   ============================================================ */

/**
 * Starts the 1-second wall-clock interval that updates the
 * "Current" time display.
 */
function startWallClock() {
  // Render immediately (no 1-second delay on load)
  renderWallClock();
  state.wallClockId = setInterval(renderWallClock, 1000);
}


/* ============================================================
   SECTION 13: EVENT LISTENER REGISTRATION
   ============================================================ */

/**
 * Attaches all DOM event listeners.
 * Grouped by: toolbar buttons | modal | expired overlay | keyboard.
 */
function addEventListeners() {
  /* ── Toolbar ── */
  dom.btnStart.addEventListener('click',  handleStart);
  dom.btnPause.addEventListener('click',  handlePauseResume);
  dom.btnSetup.addEventListener('click',  openModal);
  dom.btnReset.addEventListener('click',  handleReset);
  dom.btnTheme.addEventListener('click',  handleThemeToggle);

  /* ── Setup Modal ── */
  dom.btnCloseModal.addEventListener('click',  closeModal);
  dom.btnSaveSetup.addEventListener('click',   saveAndCloseModal);
  dom.toggleAutostart.addEventListener('change', handleAutoStartToggle);

  // Close modal if user clicks on the backdrop (outside the modal card)
  dom.modalOverlay.addEventListener('click', function(e) {
    if (e.target === dom.modalOverlay) closeModal();
  });

  // Close modal on Escape key (when inside modal)
  dom.modalOverlay.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ── Expired Overlay ── */
  dom.btnDismissExpired.addEventListener('click', dismissExpiredOverlay);

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', handleKeydown);

  /* ── Prevent negative values in number inputs ── */
  [dom.inputExamHours, dom.inputExamMins, dom.inputReadTime].forEach(input => {
    input.addEventListener('input', function() {
      if (this.value < 0) this.value = 0;
    });
  });
}


/* ============================================================
   SECTION 14: INITIALISATION
   ============================================================ */

/**
 * Main initialisation function.
 * Called once when the DOM is fully loaded.
 */
function init() {
  /* 1. Cache DOM references */
  cacheDomReferences();

  /* 2. Load persisted settings and theme */
  loadSettings();
  loadThemePreference();

  /* 3. Apply loaded settings to the UI */
  state.totalSeconds    = calcExamSeconds();
  state.remainingSeconds = state.totalSeconds;

  renderExamTitle();
  renderIdleDisplay();
  renderCountdown(state.remainingSeconds);

  /* 4. Show/hide instructions block based on saved preference */
  dom.instructionsBlock.hidden = !state.settings.showInstructions;

  /* 5. Start the wall clock (current time display) */
  startWallClock();

  /* 6. Set up the auto-start if previously configured */
  if (state.settings.autoStart && state.settings.autoStartTime) {
    scheduleAutoStart(state.settings.autoStartTime);
  }

  /* 7. Attach all event listeners */
  addEventListeners();

  /* 8. Initial button states */
  updateButtonStates();

  /* 9. Set the footer copyright year dynamically */
  if (dom.footerYear) {
    dom.footerYear.textContent = new Date().getFullYear();
  }
}

/* ── Bootstrap: run init when the DOM is ready ── */
document.addEventListener('DOMContentLoaded', init);