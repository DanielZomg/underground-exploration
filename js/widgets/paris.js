// Paris / Marie-Antoinette compound widget.
// Stage 1: fossil free-text riddle. Solving it unlocks Stage 2.
// Stage 2: Fersen-cipher decoder, with the Stage 1 answer pre-loaded as the keyword.
// onSolved fires only after Stage 2 completes.

import { fersenEncode, fersenDecode, isEnciphered, vigenereTable } from './_fersen-cipher.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function mount(root, { scene, onSolved, initiallySolved }) {
    root.innerHTML = '';

    // Sanity check: encoded plaintext under the answer keyword must equal the stored ciphertext.
    try {
        const expected = fersenEncode(scene.plaintext, scene.fossilAnswer);
        if (expected !== scene.ciphertext) {
            console.warn('[paris] ciphertext does not match plaintext under keyword', {
                expected, stored: scene.ciphertext,
            });
        }
    } catch (e) {
        console.warn('[paris] sanity check failed:', e.message);
    }

    const stage1Mount = document.createElement('div');
    stage1Mount.className = 'paris-stage';
    root.appendChild(stage1Mount);

    const stage2Mount = document.createElement('div');
    stage2Mount.className = 'paris-stage';
    stage2Mount.style.display = 'none';
    root.appendChild(stage2Mount);

    let fossilSolved = false;
    let cipherSolved = false;

    function maybeOnSolved() {
        if (fossilSolved && cipherSolved) onSolved();
    }

    function unlockStage2() {
        stage2Mount.style.display = '';
        mountFersenStage(stage2Mount, scene, () => {
            cipherSolved = true;
            maybeOnSolved();
        }, initiallySolved);
    }

    mountFossilStage(stage1Mount, scene, () => {
        fossilSolved = true;
        unlockStage2();
    }, initiallySolved);

    if (initiallySolved) {
        fossilSolved = true;
        cipherSolved = true;
        unlockStage2();
    }
}

// ---------- Stage 1: fossil riddle ----------

function mountFossilStage(root, scene, onStageSolved, initiallySolved) {
    const heading = document.createElement('h3');
    heading.textContent = "Marie-Antoinette's Riddle";
    root.appendChild(heading);

    const riddle = document.createElement('p');
    riddle.className = 'ghost-text';
    riddle.textContent = `"${scene.riddle}"`;
    root.appendChild(riddle);

    const aside = document.createElement('p');
    aside.style.color = '#a0a0a8';
    aside.style.fontSize = '0.9rem';
    aside.style.fontStyle = 'italic';
    aside.textContent = "(The catacomb walls are studded with fossils. Use the world outside the game if you must; she expects it.)";
    root.appendChild(aside);

    const form = document.createElement('div');
    form.className = 'controls';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'name the fossil';
    input.setAttribute('aria-label', 'fossil name');
    input.style.padding = '8px 10px';
    input.style.background = '#0d0d10';
    input.style.border = '1px solid #34343c';
    input.style.color = '#ececec';
    input.style.borderRadius = '4px';
    input.style.fontFamily = 'inherit';
    input.style.minWidth = '220px';
    const submit = document.createElement('button');
    submit.textContent = 'Answer';
    form.appendChild(input);
    form.appendChild(submit);
    root.appendChild(form);

    const feedback = document.createElement('div');
    feedback.className = 'hint-line';
    feedback.setAttribute('aria-live', 'polite');
    root.appendChild(feedback);

    const hintCtrl = document.createElement('div');
    hintCtrl.className = 'controls';
    const hintBtn = document.createElement('button');
    hintBtn.textContent = 'Ask Marie-Antoinette';
    let hintIdx = 0;
    hintBtn.addEventListener('click', () => {
        if (hintIdx < scene.fossilHints.length) {
            feedback.textContent = `"${scene.fossilHints[hintIdx]}"`;
            hintIdx++;
            if (hintIdx >= scene.fossilHints.length) hintBtn.disabled = true;
        }
    });
    hintCtrl.appendChild(hintBtn);
    root.appendChild(hintCtrl);

    const normalise = s => s.toLowerCase().replace(/[^a-z]/g, '');
    const accepted = new Set(scene.fossilAccepted.map(normalise));
    const wrongAnswers = {
        ammonite: "Marie-Antoinette: 'A beautiful spiral. But a snail-shell, not a key.'",
        trilobite: "Marie-Antoinette: 'A creature of older seas still. But have you ever seen one shaped like a key?'",
        nautilus: "Marie-Antoinette: 'Still living, in warm waters. And spiral, like its cousin. Not what I mean.'",
    };

    function attempt() {
        const raw = input.value.trim();
        const norm = normalise(raw);
        if (!norm) return;
        if (accepted.has(norm)) {
            feedback.innerHTML = `<span style="color:#8fe388">Marie-Antoinette inclines her head. "Just so. <em>Belemnites.</em> The thunderbolts of the ancient sea, shaped like the wards of a key. Now read what I left."</span>`;
            input.disabled = true;
            submit.disabled = true;
            hintBtn.disabled = true;
            onStageSolved();
        } else {
            const flavour = wrongAnswers[norm];
            feedback.textContent = flavour
                ? flavour
                : `"That is not the one. Look for something the catacomb walls themselves remember."`;
        }
    }

    submit.addEventListener('click', attempt);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });

    if (initiallySolved) {
        input.value = scene.fossilAnswer;
        input.disabled = true;
        submit.disabled = true;
        hintBtn.disabled = true;
        feedback.innerHTML = `<span style="color:#8fe388">Marie-Antoinette: "Just so. <em>Belemnites.</em>"</span>`;
    }
}

// ---------- Stage 2: Fersen cipher ----------

function mountFersenStage(root, scene, onStageSolved, initiallySolved) {
    const heading = document.createElement('h3');
    heading.textContent = "Fersen's Cipher — every other letter, indexed by the keyword";
    root.appendChild(heading);

    const intro = document.createElement('p');
    intro.style.color = '#c8c8d0';
    intro.style.fontSize = '0.92rem';
    intro.innerHTML = `She used this cipher in her letters to <em>Axel von Fersen</em>. Only every other letter is enciphered; the rest are written in clear. The keyword you just earned, <span style="color:#ff6b6b;font-family:Courier New,monospace">${scene.fossilAnswer.toUpperCase()}</span>, picks the alphabet for each enciphered letter (cycling).`;
    root.appendChild(intro);

    const cipherDisplay = document.createElement('div');
    cipherDisplay.className = 'ciphertext-display';
    cipherDisplay.innerHTML = renderCipherDisplay(scene.ciphertext);
    root.appendChild(cipherDisplay);

    // Build per-letter input cells. Plaintext-pass-through letters are filled and locked.
    const cells = document.createElement('div');
    cells.className = 'fersen-cells';
    root.appendChild(cells);

    const keyword = scene.fossilAnswer.toUpperCase();
    const inputs = [];
    let letterIdx = 0;
    let keyIdx = 0;

    for (const ch of scene.ciphertext) {
        if (!/[A-Z]/i.test(ch)) {
            const space = document.createElement('span');
            space.className = 'fersen-space';
            space.textContent = ch === ' ' ? ' ' : ch;
            cells.appendChild(space);
            continue;
        }

        const wrap = document.createElement('div');
        wrap.className = 'fersen-cell';

        const cipherLabel = document.createElement('div');
        cipherLabel.className = 'fersen-cipher-letter';
        cipherLabel.textContent = ch.toUpperCase();

        const keyLabel = document.createElement('div');
        keyLabel.className = 'fersen-key-letter';

        const input = document.createElement('input');
        input.maxLength = 1;
        input.className = 'fersen-input';

        if (isEnciphered(letterIdx)) {
            wrap.classList.add('enciphered');
            keyLabel.textContent = keyword[keyIdx % keyword.length];
            keyIdx++;
            input.addEventListener('input', e => {
                e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                render();
            });
        } else {
            // Plaintext pass-through — fill and lock so the player sees the rule.
            wrap.classList.add('clear');
            keyLabel.textContent = '·';
            input.value = ch.toUpperCase();
            input.disabled = true;
        }

        wrap.appendChild(cipherLabel);
        wrap.appendChild(keyLabel);
        wrap.appendChild(input);
        cells.appendChild(wrap);
        inputs.push({ input, isEnc: isEnciphered(letterIdx), cipherChar: ch.toUpperCase() });
        letterIdx++;
    }

    // Controls: show table, reveal one, reveal all (for stuck players).
    const controls = document.createElement('div');
    controls.className = 'controls';
    const tableBtn = document.createElement('button');
    tableBtn.textContent = 'Show / hide cipher table';
    const revealBtn = document.createElement('button');
    revealBtn.textContent = 'Reveal one enciphered letter';
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear my guesses';
    controls.appendChild(tableBtn);
    controls.appendChild(revealBtn);
    controls.appendChild(clearBtn);
    root.appendChild(controls);

    const tableEl = document.createElement('div');
    tableEl.className = 'fersen-table hidden';
    tableEl.appendChild(buildTableEl(keyword));
    root.appendChild(tableEl);
    tableBtn.addEventListener('click', () => tableEl.classList.toggle('hidden'));

    const out = document.createElement('div');
    out.className = 'live-output';
    root.appendChild(out);

    let solved = false;
    function render() {
        const decoded = inputs.map(({ input, isEnc, cipherChar }) => {
            if (!isEnc) return cipherChar;
            return input.value || '_';
        });
        // Re-inject spaces / punctuation from ciphertext.
        let s = '';
        let i = 0;
        for (const ch of scene.ciphertext) {
            if (!/[A-Z]/i.test(ch)) { s += ch; continue; }
            s += decoded[i++];
        }
        out.textContent = s;
        if (!solved && s === scene.plaintext) {
            solved = true;
            out.classList.add('solved');
            for (const { input } of inputs) input.disabled = true;
            revealBtn.disabled = true;
            clearBtn.disabled = true;
            onStageSolved();
        }
    }

    revealBtn.addEventListener('click', () => {
        // Find first unfilled enciphered slot.
        let li = 0;
        let ki = 0;
        for (const { input, isEnc, cipherChar } of inputs) {
            if (isEnc && !input.value) {
                const rowKey = keyword[ki % keyword.length];
                const decoded = fersenDecode(cipherChar, rowKey);
                input.value = decoded;
                render();
                return;
            }
            if (isEnc) ki++;
            li++;
        }
    });

    clearBtn.addEventListener('click', () => {
        for (const { input, isEnc } of inputs) {
            if (isEnc) input.value = '';
        }
        render();
    });

    if (initiallySolved) {
        // Fill in the correct decoded letters and mark solved.
        let ki = 0;
        for (const { input, isEnc, cipherChar } of inputs) {
            if (isEnc) {
                input.value = fersenDecode(cipherChar, keyword[ki % keyword.length]);
                ki++;
            }
        }
    }

    render();
}

function renderCipherDisplay(ciphertext) {
    // Colour enciphered vs. plaintext-passthrough letters so the every-other rule is visible.
    let html = '';
    let letterIdx = 0;
    for (const ch of ciphertext) {
        if (!/[A-Z]/i.test(ch)) {
            html += ch === ' ' ? '&nbsp;' : ch;
            continue;
        }
        const isEnc = isEnciphered(letterIdx);
        const colour = isEnc ? '#ff6b6b' : '#8a8a93';
        html += `<span style="color:${colour}">${ch.toUpperCase()}</span>`;
        letterIdx++;
    }
    return html;
}

function buildTableEl(keyword) {
    const wrap = document.createElement('div');
    const note = document.createElement('p');
    note.style.fontSize = '0.85rem';
    note.style.color = '#a0a0a8';
    note.style.margin = '0 0 8px 0';
    note.innerHTML = `Rows used by your keyword <span style="color:#ff6b6b;font-family:Courier New,monospace">${keyword}</span> (highlighted). To decode an enciphered letter: find it in its row, read the plaintext letter from the top.`;
    wrap.appendChild(note);

    const tbl = document.createElement('table');
    tbl.className = 'fersen-table-grid';

    const usedRows = new Set(keyword.split(''));

    // Header row: A..Z plaintext letters.
    const head = document.createElement('tr');
    head.appendChild(document.createElement('th')); // corner
    for (const p of ALPHABET) {
        const th = document.createElement('th');
        th.textContent = p;
        head.appendChild(th);
    }
    tbl.appendChild(head);

    for (const k of ALPHABET) {
        const row = document.createElement('tr');
        if (usedRows.has(k)) row.classList.add('row-used');
        const rowLabel = document.createElement('th');
        rowLabel.textContent = k;
        row.appendChild(rowLabel);
        for (const p of ALPHABET) {
            const td = document.createElement('td');
            td.textContent = vigenereTable[k][p];
            row.appendChild(td);
        }
        tbl.appendChild(row);
    }
    wrap.appendChild(tbl);
    return wrap;
}
