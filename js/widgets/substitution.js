// Frequency-analysis substitution widget.
// Player assigns plaintext letters to ciphertext letters via the mapping grid.
// Solved when the full live decoding equals scene.plaintext.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// English letter frequency reference (Norvig / large corpus, normalised).
const ENGLISH_FREQ = {
    A: 8.2, B: 1.5, C: 2.8, D: 4.3, E: 12.7, F: 2.2, G: 2.0, H: 6.1,
    I: 7.0, J: 0.15, K: 0.77, L: 4.0, M: 2.4, N: 6.7, O: 7.5, P: 1.9,
    Q: 0.095, R: 6.0, S: 6.3, T: 9.1, U: 2.8, V: 0.98, W: 2.4, X: 0.15,
    Y: 2.0, Z: 0.074,
};

export function mount(root, { scene, onSolved, initiallySolved }) {
    root.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = "al-Kindi's Notepad: frequency, then mapping";
    root.appendChild(heading);

    const cipherDisplay = document.createElement('div');
    cipherDisplay.className = 'ciphertext-display';
    cipherDisplay.textContent = scene.ciphertext;
    root.appendChild(cipherDisplay);

    // --- Frequency comparison ---
    const cipherFreq = computeFrequency(scene.ciphertext);
    const maxFreq = Math.max(
        ...Object.values(cipherFreq),
        ...Object.values(ENGLISH_FREQ),
    );

    const cipherLabel = document.createElement('div');
    cipherLabel.className = 'freq-label';
    cipherLabel.textContent = 'Frequency in this ciphertext';
    root.appendChild(cipherLabel);
    root.appendChild(buildFreqRow(cipherFreq, maxFreq, false));

    const refLabel = document.createElement('div');
    refLabel.className = 'freq-label';
    refLabel.textContent = 'Reference: letter frequency in English';
    root.appendChild(refLabel);
    root.appendChild(buildFreqRow(ENGLISH_FREQ, maxFreq, true));

    // --- Mapping grid ---
    const mappingLabel = document.createElement('div');
    mappingLabel.className = 'freq-label';
    mappingLabel.style.marginTop = '14px';
    mappingLabel.textContent = 'Your guess: cipher letter → plaintext letter';
    root.appendChild(mappingLabel);

    const grid = document.createElement('div');
    grid.className = 'mapping-grid';
    root.appendChild(grid);

    // Only show cipher letters that actually appear, but render full grid for stability.
    const usedCipherLetters = new Set(
        scene.ciphertext.split('').filter(c => /[A-Z]/.test(c)),
    );

    const inputByCipher = {};
    for (const letter of ALPHABET) {
        const cell = document.createElement('div');
        cell.className = 'mapping-cell';

        const top = document.createElement('div');
        top.className = 'cipher';
        top.textContent = letter;
        cell.appendChild(top);

        const input = document.createElement('input');
        input.maxLength = 1;
        input.setAttribute('aria-label', `plaintext for ${letter}`);
        input.disabled = !usedCipherLetters.has(letter);
        input.addEventListener('input', e => {
            const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
            e.target.value = v;
            render();
        });
        inputByCipher[letter] = input;
        cell.appendChild(input);

        grid.appendChild(cell);
    }

    const out = document.createElement('div');
    out.className = 'live-output';
    root.appendChild(out);

    const controls = document.createElement('div');
    controls.className = 'controls';
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Clear mapping';
    resetBtn.addEventListener('click', () => {
        for (const input of Object.values(inputByCipher)) input.value = '';
        render();
    });
    controls.appendChild(resetBtn);
    root.appendChild(controls);

    let solved = false;

    function render() {
        const map = {};
        for (const [cipher, input] of Object.entries(inputByCipher)) {
            if (input.value) map[cipher] = input.value;
        }
        const decoded = scene.ciphertext.split('').map(c => {
            if (!/[A-Z]/.test(c)) return c;
            return map[c] || '_';
        }).join('');
        out.textContent = decoded;
        if (!solved && decoded === scene.plaintext) {
            solved = true;
            out.classList.add('solved');
            for (const input of Object.values(inputByCipher)) input.disabled = true;
            onSolved();
        }
    }

    if (initiallySolved) {
        // Auto-fill the correct mapping (inverse of keyMapPlainToCipher).
        const inverse = {};
        for (const [p, c] of Object.entries(scene.keyMapPlainToCipher)) inverse[c] = p;
        for (const [c, p] of Object.entries(inverse)) {
            if (inputByCipher[c]) inputByCipher[c].value = p;
        }
    }

    render();
}

function computeFrequency(text) {
    const counts = {};
    let total = 0;
    for (const ch of text) {
        if (!/[A-Z]/.test(ch)) continue;
        counts[ch] = (counts[ch] || 0) + 1;
        total++;
    }
    const freq = {};
    for (const letter of ALPHABET) {
        freq[letter] = total === 0 ? 0 : ((counts[letter] || 0) / total) * 100;
    }
    return freq;
}

function buildFreqRow(freq, maxFreq, isReference) {
    const row = document.createElement('div');
    row.className = 'freq-row';
    for (const letter of ALPHABET) {
        const cell = document.createElement('div');
        cell.className = 'freq-cell';

        const bar = document.createElement('div');
        bar.className = 'freq-bar' + (isReference ? ' reference' : '');
        const pct = maxFreq > 0 ? (freq[letter] / maxFreq) * 100 : 0;
        bar.style.height = pct + '%';
        cell.appendChild(bar);

        const lbl = document.createElement('div');
        lbl.className = 'freq-letter';
        lbl.textContent = letter;
        cell.appendChild(lbl);

        row.appendChild(cell);
    }
    return row;
}
