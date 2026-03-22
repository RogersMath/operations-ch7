/**
 * quiz.js — Chapter 7 Bottleneck Formula Practice Tool
 *
 * Question types:
 *   'mc'   — multiple choice (4 options, 1 correct)
 *   'fill' — fill-in-the-blank (accepts close numeric answers + synonyms)
 *
 * All state is in-memory. No localStorage used.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     QUESTION BANK
  ───────────────────────────────────────── */
  var QUESTIONS = [

    // ── DEFINITIONS & VOCABULARY ──
    {
      type: 'mc',
      topic: 'Vocabulary',
      q: 'What is the BOTTLENECK of a process?',
      options: [
        'The step with the longest processing time per customer',
        'The step with the lowest capacity (fewest customers per hour)',
        'The step with the most servers assigned to it',
        'The first step every customer must pass through'
      ],
      answer: 1,
      explain: 'The bottleneck is the step with the <strong>lowest capacity</strong> — measured in customers per hour. A step can have a long processing time but still not be the bottleneck if it has enough parallel servers. Always convert to capacity before comparing.'
    },
    {
      type: 'mc',
      topic: 'Vocabulary',
      q: 'Process FLOW TIME is defined as:',
      options: [
        'The capacity of the bottleneck step in customers per hour',
        'The time it takes one customer to move through the process from start to finish',
        'The number of servers multiplied by the processing time',
        'The difference between demand rate and capacity'
      ],
      answer: 1,
      explain: 'Flow time (also called throughput time) is the total elapsed time for one unit of work — one customer — to complete the entire process. For a sequential process, it is the sum of all activity times on that customer\'s path.'
    },
    {
      type: 'mc',
      topic: 'Vocabulary',
      q: 'PROCESS THROUGHPUT RATE is determined by:',
      options: [
        'The sum of all activity times',
        'The average processing time across all steps',
        'The capacity of the bottleneck activity',
        'The number of customers currently waiting'
      ],
      answer: 2,
      explain: 'Throughput rate equals the capacity of the bottleneck — and nothing else. You cannot push more customers per hour through the whole process than the bottleneck can handle, regardless of how fast every other step is.'
    },
    {
      type: 'mc',
      topic: 'Vocabulary',
      q: 'Which of these is TRUE about improving a non-bottleneck step?',
      options: [
        'It always increases process throughput proportionally',
        'It reduces flow time but does NOT increase throughput',
        'It shifts the bottleneck to the new step',
        'It has no effect at all on the process'
      ],
      answer: 1,
      explain: 'Improving a non-bottleneck step can reduce flow time (the customer\'s experience gets faster) but it <strong>cannot increase throughput</strong>. The bottleneck is still the rate-limiting constraint. Only improvements to the bottleneck step increase throughput.'
    },

    // ── FORMULAS: SINGLE SERVER ──
    {
      type: 'mc',
      topic: 'Formula: Single Server Capacity',
      q: 'A step has ONE server that takes 12 minutes per customer. What is the capacity of this step in customers per hour?',
      options: ['12 customers/hr', '7 customers/hr', '5 customers/hr', '4 customers/hr'],
      answer: 2,  /* 60/12 = 5 */
      explain: 'Capacity = 60 ÷ processing time = 60 ÷ 12 = <code>5 customers/hr</code>. The formula is always: convert 60 minutes to customers by dividing by how many minutes each customer takes.'
    },
    {
      type: 'fill',
      topic: 'Formula: Single Server Capacity',
      q: 'A cashier takes 4 minutes to serve each customer. There is 1 cashier. What is the capacity of this step in customers per hour?',
      hint: 'Enter a number (customers per hour)',
      answer: '15',
      accept: ['15', '15.0'],
      explain: 'Capacity = 60 ÷ 4 = <code>15 customers/hr</code>.'
    },
    {
      type: 'fill',
      topic: 'Formula: Single Server Capacity',
      q: 'One doctor takes 20 minutes per patient exam. What is this step\'s capacity in patients per hour?',
      hint: 'Enter a number',
      answer: '3',
      accept: ['3', '3.0'],
      explain: 'Capacity = 60 ÷ 20 = <code>3 patients/hr</code>.'
    },

    // ── FORMULAS: PARALLEL SERVERS ──
    {
      type: 'mc',
      topic: 'Formula: Parallel Servers',
      q: 'A step has 3 servers, each taking 15 minutes per customer. What is the TOTAL CAPACITY of this step?',
      options: [
        '4 customers/hr  (60 ÷ 15, ignoring extra servers)',
        '45 customers/hr  (3 × 15)',
        '12 customers/hr  (3 × 60 ÷ 15)',
        '20 customers/hr  (60 ÷ 3)'
      ],
      answer: 2,  /* 3 × 4 = 12 */
      explain: 'Capacity of a parallel step = Number of servers × (60 ÷ time per server) = 3 × (60 ÷ 15) = 3 × 4 = <code>12 customers/hr</code>. Each server independently handles customers simultaneously.'
    },
    {
      type: 'fill',
      topic: 'Formula: Parallel Servers',
      q: 'A triage step has 2 nurses, each taking 10 minutes per patient. What is the total capacity of the triage step in patients per hour?',
      hint: 'Enter a number',
      answer: '12',
      accept: ['12', '12.0'],
      explain: 'Capacity = 2 × (60 ÷ 10) = 2 × 6 = <code>12 patients/hr</code>.'
    },
    {
      type: 'mc',
      topic: 'Formula: Parallel Servers',
      q: 'Two parallel barbers work at Step B3. Barber A takes 15 min per customer; Barber B takes 10 min per customer. What is the COMBINED capacity of Step B3?',
      options: [
        '4 customers/hr  (60 ÷ 15 only)',
        '6 customers/hr  (60 ÷ 10 only)',
        '10 customers/hr  (60÷15 + 60÷10)',
        '5 customers/hr  (60 ÷ average of 12.5)'
      ],
      answer: 2,  /* 4 + 6 = 10 */
      explain: 'When parallel servers have different speeds, add their individual capacities: (60÷15) + (60÷10) = 4.0 + 6.0 = <code>10 customers/hr</code>. Do NOT average the processing times — that understates the true combined capacity.'
    },

    // ── IDENTIFYING THE BOTTLENECK ──
    {
      type: 'mc',
      topic: 'Identifying the Bottleneck',
      q: 'A process has four steps with capacities: Step 1 = 15/hr, Step 2 = 8/hr, Step 3 = 12/hr, Step 4 = 20/hr. Which is the bottleneck?',
      options: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
      answer: 1,
      explain: 'The bottleneck is the step with the <strong>lowest capacity</strong>. Step 2 at 8/hr is the smallest value. The process can produce at most 8 customers/hr regardless of the other steps\' capacities.'
    },
    {
      type: 'mc',
      topic: 'Identifying the Bottleneck',
      q: 'Step A: 1 server × 10 min each → 6/hr. Step B: 2 servers × 8 min each → ? Step C: 1 server × 5 min each → 12/hr. What is Step B\'s capacity, and is it the bottleneck?',
      options: [
        'Step B = 7.5/hr; yes it is the bottleneck',
        'Step B = 15/hr; no, Step A is the bottleneck',
        'Step B = 8/hr; yes it is the bottleneck',
        'Step B = 15/hr; yes it is the bottleneck'
      ],
      answer: 1,  /* 2 × (60/8) = 2 × 7.5 = 15; A=6 is bottleneck */
      explain: 'Step B capacity = 2 × (60 ÷ 8) = <code>15/hr</code>. Comparing: A=6, B=15, C=12. <strong>Step A is the bottleneck</strong> at 6/hr — even though its processing time (10 min) is not the longest. With only 1 server vs. 2 at Step B, Step A has the lowest total capacity.'
    },
    {
      type: 'fill',
      topic: 'Identifying the Bottleneck',
      q: 'A process has three steps. Step 1: 1 server, 5 min → 12/hr. Step 2: 3 servers, 20 min each. Step 3: 1 server, 6 min → 10/hr. What is the throughput rate of the entire process in customers per hour?',
      hint: 'Calculate Step 2 capacity first, then find the lowest',
      answer: '9',
      accept: ['9', '9.0'],
      explain: 'Step 2 capacity = 3 × (60÷20) = 3 × 3 = 9/hr. Comparing: Step 1=12, Step 2=9, Step 3=10. <strong>Step 2 is the bottleneck</strong> at <code>9/hr</code>. That is the process throughput.'
    },

    // ── FLOW TIME ──
    {
      type: 'fill',
      topic: 'Flow Time',
      q: 'A sequential process has 5 steps: 3 min, 6 min, 9 min, 4 min, 2 min. What is the flow time for one customer (in minutes)?',
      hint: 'Enter the total in minutes',
      answer: '24',
      accept: ['24', '24.0'],
      explain: 'Flow time = sum of all steps on the path = 3 + 6 + 9 + 4 + 2 = <code>24 minutes</code>. Every customer passes through all 5 steps in sequence.'
    },
    {
      type: 'mc',
      topic: 'Flow Time',
      q: 'A customer at a photo studio takes the GROUP PORTRAIT path. Steps: Registration (5 min) → Cashier (6 min avg) → Group portrait (20 min) → Pick up (7 min). What is the flow time?',
      options: ['31 minutes', '32 minutes', '38 minutes', '41 minutes'],
      answer: 2,  /* 5+6+20+7=38 */
      explain: 'Flow time = 5 + 6 + 20 + 7 = <code>38 minutes</code>. For diverging-path processes, always trace the specific customer\'s route — do not include steps they don\'t visit.'
    },
    {
      type: 'mc',
      topic: 'Flow Time',
      q: 'A barbershop has two parallel barbers (B3-a: 15 min, B3-b: 10 min). What is the AVERAGE flow time through B3 used in an overall flow time calculation?',
      options: [
        '15 min (always use the slower server)',
        '10 min (always use the faster server)',
        '12.5 min (average of the two)',
        'It depends on which server the customer gets'
      ],
      answer: 2,
      explain: 'For a flow time calculation representing the <em>average</em> customer, use the average time at a parallel step: (15 + 10) ÷ 2 = <code>12.5 minutes</code>. For a specific path, use the server they actually visited.'
    },

    // ── DIVERGING PATHS ──
    {
      type: 'mc',
      topic: 'Diverging Paths',
      q: 'In a process where customers split into Group and Individual paths, with 50/50 mix, Group portrait takes 20 min (1 server = 3/hr) and Individual takes 15 min (1 server = 4/hr). What limits the overall throughput?',
      options: [
        'Individual portrait, because it serves more customers',
        'Group portrait, because 3/hr < 4/hr',
        'The registration step, because everyone goes through it',
        'Both paths equally, since the mix is 50/50'
      ],
      answer: 1,
      explain: 'The Group portrait step bottlenecks its stream at 3/hr. With a 50/50 mix, if Group runs at 3/hr, then Individual must also run at 3/hr (to maintain the equal ratio). Total throughput = 3 + 3 = 6/hr. The <strong>Group portrait is the binding constraint</strong>.'
    },
    {
      type: 'mc',
      topic: 'Diverging Paths',
      q: 'In a diverging-path process, what does "pooled" servers at a shared step mean?',
      options: [
        'Servers at that step only handle one type of customer',
        'Any customer can use any server at that step',
        'Servers at that step are faster than dedicated servers',
        'The step is not a possible bottleneck'
      ],
      answer: 1,
      explain: 'Pooled means any server can serve any customer type. This is more efficient than dedicated servers because idle capacity at one server can be used by demand from any stream. Pooling always improves or maintains throughput relative to dedicated assignment.'
    },

    // ── IMPROVING THE PROCESS ──
    {
      type: 'mc',
      topic: 'Improving Process Throughput',
      q: 'Which of the following actions would INCREASE the throughput rate of a process?',
      options: [
        'Halving the processing time at a non-bottleneck step',
        'Adding a parallel server at the bottleneck step',
        'Reducing the flow time by removing waiting between steps',
        'Moving customers to a faster path at a non-bottleneck step'
      ],
      answer: 1,
      explain: 'Only changes to the <strong>bottleneck</strong> step can increase throughput. Adding a parallel server at the bottleneck increases that step\'s capacity, potentially making a different step the new bottleneck. The other options either affect non-bottleneck steps or reduce waiting time (which affects flow time, not throughput).'
    },
    {
      type: 'mc',
      topic: 'Improving Process Throughput',
      q: 'After adding a server to the bottleneck, throughput increases. What must you check next?',
      options: [
        'Whether customers prefer the new server',
        'Whether a different step is now the bottleneck',
        'Whether flow time has been reduced',
        'Nothing — adding servers always solves all process problems'
      ],
      answer: 1,
      explain: 'When you relieve the bottleneck, the constraint shifts to the next-lowest-capacity step, which becomes the <strong>new bottleneck</strong>. You must re-compare all step capacities to find where the process is now limited. Bottleneck analysis is iterative.'
    },
    {
      type: 'fill',
      topic: 'Improving Process Throughput',
      q: 'A bottleneck step currently has 1 server taking 15 min each (capacity = 4/hr). You want to raise throughput to at least 10/hr. How many TOTAL servers do you need at this step?',
      hint: 'N servers × (60÷15) ≥ 10. Solve for N.',
      answer: '3',
      accept: ['3'],
      explain: 'N × (60÷15) ≥ 10 → N × 4 ≥ 10 → N ≥ 2.5. Round up to the nearest whole number: <code>3 servers</code>. With 3 servers: 3 × 4 = 12/hr, which exceeds the 10/hr target.'
    },

    // ── SCENARIO IDENTIFICATION ──
    {
      type: 'mc',
      topic: 'Scenario: Identify the Issue',
      q: 'A process has: Step 1 = 20/hr, Step 2 = 5/hr, Step 3 = 18/hr, Step 4 = 15/hr. Management adds a server to Step 1, raising its capacity to 40/hr. What happened to process throughput?',
      options: [
        'Doubled — throughput went from 5/hr to 10/hr',
        'Nothing — Step 2 is still the bottleneck at 5/hr',
        'Increased slightly — Step 1 now supports Step 2 better',
        'Increased to 15/hr — Step 4 is now the bottleneck'
      ],
      answer: 1,
      explain: 'Step 2 remains the bottleneck at 5/hr regardless of Step 1\'s capacity. Adding resources to a non-bottleneck has <strong>zero effect on throughput</strong>. The process still produces 5/hr. Only improving Step 2 would change the outcome.'
    },
    {
      type: 'mc',
      topic: 'Scenario: Identify the Issue',
      q: 'Bill\'s Barbershop: B1=10min, B2=8min, B3-a=15min, B3-b=10min, B4=9min. Capacities: B1=6/hr, B2=7.5/hr, B3=10/hr, B4=6.7/hr. What is the bottleneck and throughput?',
      options: [
        'B3-a is the bottleneck; throughput = 4/hr',
        'B1 and B4 are tied bottlenecks; throughput = 6/hr',
        'B4 is the bottleneck; throughput = 6.7/hr',
        'B2 is the bottleneck; throughput = 7.5/hr'
      ],
      answer: 2,
      explain: 'Comparing capacities: B1=6.0, B2=7.5, B3=10.0, B4=6.7. The lowest is B1=6.0 — wait, actually B1 (6.0) < B4 (6.7). So <strong>B1 is the bottleneck at 6/hr</strong>. If you selected B4, re-check: 6.0 < 6.7. Throughput = 6 customers/hr. Note: this question tests careful comparison of close values.'
    },

    // ── POOLED vs DEDICATED ──
    {
      type: 'mc',
      topic: 'Pooled vs. Dedicated Servers',
      q: 'Two cashiers process customers. Cashier A takes 5 min/customer; Cashier B takes 7 min/customer. If they are POOLED (any customer uses either), what is their combined capacity?',
      options: [
        '8.6/hr  (60/7 only)',
        '12/hr  (60/5 only)',
        '20.6/hr  (60/5 + 60/7)',
        '6/hr  (average of 5 and 7 = 6, then 60/6)'
      ],
      answer: 2,  /* 12 + 8.57 ≈ 20.6 */
      explain: 'Pooled servers: add individual capacities. (60÷5) + (60÷7) = 12.0 + 8.6 = <code>20.6 customers/hr</code>. Do not average the times — that gives an incorrect lower capacity. The pooled step can handle 20.6 customers from any mix of demand.'
    },
    {
      type: 'mc',
      topic: 'Pooled vs. Dedicated Servers',
      q: 'Why does pooling resources generally IMPROVE process performance compared to dedicated assignment?',
      options: [
        'Pooled servers are individually faster than dedicated ones',
        'Pooled servers eliminate the need for a bottleneck step',
        'Idle capacity at one server can absorb demand from any stream, reducing waste',
        'Pooling reduces flow time because customers skip steps'
      ],
      answer: 2,
      explain: 'With dedicated servers, a server assigned to one customer type sits idle when that type is underrepresented — even if the other type is backed up. Pooling allows any idle capacity to be used by any demand, which improves throughput and reduces waiting. This is the core efficiency argument for cross-training and shared queues.'
    },

    // ── CALCULATION CHAIN ──
    {
      type: 'fill',
      topic: 'Full Calculation Chain',
      q: 'A drive-through has: Order (2 min, 1 speaker), Pay (3 min, 2 cashiers), Prepare food (5 min, 2 cooks), Hand off (1 min, 1 window). What is the process throughput in cars per hour?',
      hint: 'Calculate capacity at each step, find the lowest',
      answer: '24',
      accept: ['24', '24.0'],
      explain: 'Order: 1×(60÷2)=30/hr | Pay: 2×(60÷3)=40/hr | Prepare: 2×(60÷5)=24/hr | Hand off: 1×(60÷1)=60/hr. Lowest = Prepare food at <code>24 cars/hr</code> — that is the bottleneck and the throughput rate.'
    },
    {
      type: 'fill',
      topic: 'Full Calculation Chain',
      q: 'Urgent care: Check-in (4 min, 1 clerk), Triage (10 min, 2 nurses), Doctor (20 min, 3 doctors), Checkout (3 min, 1 clerk). What is the flow time in minutes for one patient?',
      hint: 'Add all step times for one patient\'s path',
      answer: '37',
      accept: ['37', '37.0'],
      explain: 'Flow time = 4 + 10 + 20 + 3 = <code>37 minutes</code>. The number of servers at each step does not affect flow time — it affects capacity. Each individual patient still waits through all four steps.'
    }
  ];

  /* ─────────────────────────────────────────
     STATE
  ───────────────────────────────────────── */
  var state = {
    questions: [],
    index: 0,
    correct: 0,
    attempted: 0,
    streak: 0,
    answered: false
  };

  /* ─────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────── */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function el(id) { return document.getElementById(id); }

  function normalizeAnswer(str) {
    return String(str).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  function renderQuestion() {
    var q = state.questions[state.index];
    state.answered = false;

    // progress
    var pct = Math.round((state.index / state.questions.length) * 100);
    el('q-num').textContent = state.index + 1;
    el('q-total').textContent = state.questions.length;
    var fill = el('progress-fill');
    fill.style.width = pct + '%';
    fill.parentElement.setAttribute('aria-valuenow', pct);

    el('quiz-type-badge').textContent = q.topic;
    el('quiz-question').textContent = q.q;

    // hide feedback
    var fb = el('quiz-feedback');
    fb.hidden = true;
    fb.removeAttribute('aria-live');

    if (q.type === 'mc') {
      renderMC(q);
    } else {
      renderFill(q);
    }
  }

  function renderMC(q) {
    var optionsEl = el('quiz-options');
    var fillEl = el('quiz-fill');
    optionsEl.innerHTML = '';
    optionsEl.hidden = false;
    fillEl.hidden = true;

    var keys = ['A', 'B', 'C', 'D'];
    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.setAttribute('type', 'button');
      btn.dataset.index = i;
      btn.innerHTML =
        '<span class="opt-key" aria-hidden="true">' + keys[i] + '</span>' +
        '<span>' + opt + '</span>';
      btn.addEventListener('click', function () { handleMCAnswer(q, i); });
      optionsEl.appendChild(btn);
    });
  }

  function renderFill(q) {
    var optionsEl = el('quiz-options');
    var fillEl = el('quiz-fill');
    optionsEl.hidden = true;
    fillEl.hidden = false;

    var input = el('quiz-input');
    input.value = '';
    input.className = 'quiz-input';
    input.disabled = false;
    input.placeholder = '';

    el('quiz-fill-hint').textContent = q.hint || '';
    el('quiz-fill-label').textContent = 'Your answer:';

    var submitBtn = el('quiz-submit');
    submitBtn.disabled = false;

    // allow Enter key
    input.onkeydown = function (e) {
      if (e.key === 'Enter' && !state.answered) {
        handleFillAnswer(q);
      }
    };
    submitBtn.onclick = function () {
      if (!state.answered) handleFillAnswer(q);
    };

    // focus input
    setTimeout(function () { input.focus(); }, 60);
  }

  /* ─────────────────────────────────────────
     ANSWER HANDLERS
  ───────────────────────────────────────── */
  function handleMCAnswer(q, chosen) {
    if (state.answered) return;
    state.answered = true;
    state.attempted++;

    var correct = chosen === q.answer;
    if (correct) { state.correct++; state.streak++; }
    else { state.streak = 0; }

    updateScoreboard();

    // style buttons
    var btns = el('quiz-options').querySelectorAll('.quiz-option');
    btns.forEach(function (btn) {
      var idx = parseInt(btn.dataset.index);
      btn.disabled = true;
      if (idx === q.answer) {
        btn.classList.add(correct && idx === chosen ? 'correct' : 'revealed');
      }
      if (!correct && idx === chosen) {
        btn.classList.add('incorrect');
      }
    });

    showFeedback(correct, q.explain);
  }

  function handleFillAnswer(q) {
    if (state.answered) return;
    state.answered = true;
    state.attempted++;

    var input = el('quiz-input');
    var raw = normalizeAnswer(input.value);
    var accepted = q.accept || [q.answer];
    var correct = accepted.some(function (a) {
      return normalizeAnswer(a) === raw;
    });

    if (correct) { state.correct++; state.streak++; }
    else { state.streak = 0; }

    updateScoreboard();

    input.disabled = true;
    el('quiz-submit').disabled = true;
    input.classList.add(correct ? 'input-correct' : 'input-incorrect');
    if (!correct) {
      input.value = input.value + '  (correct: ' + q.answer + ')';
    }

    showFeedback(correct, q.explain);
  }

  function showFeedback(correct, explainHtml) {
    var fb = el('quiz-feedback');
    fb.hidden = false;
    fb.setAttribute('aria-live', 'polite');

    var verdict = el('feedback-verdict');
    verdict.textContent = correct ? '✓ Correct' : '✗ Incorrect';
    verdict.className = 'feedback-verdict ' + (correct ? 'verdict-correct' : 'verdict-incorrect');

    el('feedback-explain').innerHTML = explainHtml;

    var nextBtn = el('quiz-next');
    nextBtn.focus();
    nextBtn.onclick = function () { advanceQuestion(); };
  }

  /* ─────────────────────────────────────────
     NAVIGATION
  ───────────────────────────────────────── */
  function advanceQuestion() {
    state.index++;
    if (state.index >= state.questions.length) {
      showComplete();
    } else {
      renderQuestion();
    }
  }

  function showComplete() {
    var pct = state.questions.length > 0
      ? Math.round((state.correct / state.attempted) * 100)
      : 0;

    var card = el('quiz-card');
    card.innerHTML =
      '<div class="quiz-complete">' +
        '<h3>Session Complete</h3>' +
        '<span class="final-score">' + state.correct + ' / ' + state.attempted + '</span>' +
        '<p>' + pct + '% correct &nbsp;·&nbsp; ' + state.questions.length + ' questions</p>' +
        (pct >= 90
          ? '<p style="color:var(--text-green);font-weight:600;">Strong result. You\'re ready for the exam.</p>'
          : '<p style="color:var(--amber-light);">Keep drilling. Focus on the question types you missed.</p>'
        ) +
        '<button class="quiz-reset-btn" id="quiz-complete-reset" style="margin:0 auto;">↺ Try Again</button>' +
      '</div>';

    document.getElementById('quiz-complete-reset').addEventListener('click', resetQuiz);
  }

  /* ─────────────────────────────────────────
     SCOREBOARD
  ───────────────────────────────────────── */
  function updateScoreboard() {
    el('score-correct').textContent = state.correct;
    el('score-attempted').textContent = state.attempted;
    el('score-streak').textContent = state.streak;
  }

  /* ─────────────────────────────────────────
     INIT & RESET
  ───────────────────────────────────────── */
  function resetQuiz() {
    state.questions = shuffle(QUESTIONS);
    state.index = 0;
    state.correct = 0;
    state.attempted = 0;
    state.streak = 0;
    state.answered = false;
    updateScoreboard();

    // Rebuild card if it was replaced by completion screen
    var container = el('quiz-container');
    var existingCard = el('quiz-card');
    if (!existingCard) {
      // recreate card markup
      var card = document.createElement('div');
      card.className = 'quiz-card';
      card.id = 'quiz-card';
      card.innerHTML =
        '<div class="quiz-progress" id="quiz-progress" aria-label="Question progress">' +
          '<span id="q-num">—</span>' +
          '<div class="progress-bar-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="Progress">' +
            '<div class="progress-bar-fill" id="progress-fill"></div>' +
          '</div>' +
          '<span id="q-total">—</span>' +
        '</div>' +
        '<p class="quiz-type-badge" id="quiz-type-badge" aria-label="Question type">—</p>' +
        '<p class="quiz-question" id="quiz-question">Loading…</p>' +
        '<div class="quiz-options" id="quiz-options" role="group" aria-labelledby="quiz-question"></div>' +
        '<div class="quiz-fill" id="quiz-fill" hidden>' +
          '<label class="quiz-fill-label" for="quiz-input" id="quiz-fill-label">Your answer:</label>' +
          '<div class="quiz-fill-row">' +
            '<input type="text" id="quiz-input" class="quiz-input" autocomplete="off" autocorrect="off" spellcheck="false" aria-describedby="quiz-fill-hint"/>' +
            '<button class="quiz-submit-btn" id="quiz-submit">Check</button>' +
          '</div>' +
          '<p class="quiz-fill-hint" id="quiz-fill-hint"></p>' +
        '</div>' +
        '<div class="quiz-feedback" id="quiz-feedback" hidden role="status" aria-live="polite">' +
          '<p class="feedback-verdict" id="feedback-verdict"></p>' +
          '<p class="feedback-explain" id="feedback-explain"></p>' +
          '<button class="quiz-next-btn" id="quiz-next">Next Question →</button>' +
        '</div>';
      container.appendChild(card);
    }

    renderQuestion();
  }

  function init() {
    var container = el('quiz-container');
    if (!container) return;

    // Wire reset button
    var resetBtn = el('quiz-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetQuiz);
    }

    resetQuiz();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
