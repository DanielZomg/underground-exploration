// Alberti / Vigenère widget.
// The player walks through the ciphertext letter-by-letter. For each letter,
// they rotate the inner disk so the current keyword letter sits beneath A on the outer ring,
// then read off the plaintext on the outer ring that sits above the ciphertext letter on the inner.
// We auto-rotate the disk to match the keyword position; the player presses "Reveal" to lock in.
// (This keeps focus on the mental model: keyword letter = which alphabet, rather than fine motor.)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function mount(root, { scene, onSolved, initiallySolved }) {
    root.innerHTML = '';

    // Strip spaces for indexing; keep them for display.
    const cipherChars = scene.ciphertext.split('');
    const plainChars = scene.plaintext.split('');

    // Sanity-check the scene authored-data (cipher should decode to plain under keyword).
    if (!verifyVigenere(scene.ciphertext, scene.plaintext, scene.keyword)) {
        console.warn('[vigenere] scene data does not satisfy Vigenère relation', scene.id);
    }

    const heading = document.createElement('h3');
    heading.textContent = "Alberti's Disk: one alphabet per keyword letter";
    root.appendChild(heading);

    const cipherDisplay = document.createElement('div');
    cipherDisplay.className = 'ciphertext-display';
    cipherDisplay.textContent = scene.ciphertext;
    root.appendChild(cipherDisplay);

    const wrap = document.createElement('div');
    wrap.className = 'alberti-wrap';
    root.appendChild(wrap);

    const meta = document.createElement('div');
    meta.className = 'alberti-meta';
    wrap.appendChild(meta);

    const rings = document.createElement('div');
    rings.className = 'alberti-rings';
    wrap.appendChild(rings);

    const outer = buildRing('outer', 130);
    const inner = buildRing('inner', 92);
    rings.appendChild(outer.el);
    rings.appendChild(inner.el);

    const controls = document.createElement('div');
    controls.className = 'controls';
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← previous letter';
    const revealBtn = document.createElement('button');
    revealBtn.textContent = 'Reveal this letter';
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'next letter →';
    controls.appendChild(prevBtn);
    controls.appendChild(revealBtn);
    controls.appendChild(nextBtn);
    wrap.appendChild(controls);

    const out = document.createElement('div');
    out.className = 'live-output';
    root.appendChild(out);

    // Position pointer = index into ciphertext (letters only). Keyword index = letter-position mod keyword length.
    let pos = 0; // letter-index (skipping non-letters)
    const decoded = cipherChars.map(c => /[A-Z]/.test(c) ? '_' : c);
    let solved = false;

    function letterIndices() {
        // Map of (letter-position in plaintext) -> (index in cipherChars).
        const arr = [];
        for (let i = 0; i < cipherChars.length; i++) {
            if (/[A-Z]/.test(cipherChars[i])) arr.push(i);
        }
        return arr;
    }
    const idx = letterIndices();

    function currentKeyLetter() {
        return scene.keyword[pos % scene.keyword.length];
    }

    function render() {
        if (pos < 0) pos = 0;
        if (pos >= idx.length) pos = idx.length - 1;

        const ki = ALPHABET.indexOf(currentKeyLetter());
        // Rotate inner so that keyword letter on inner sits at the top (under A on outer).
        // We position letters by angle; "rotate the inner ring by -ki * (360/26)" places the keyword letter at 12 o'clock.
        const deg = -ki * (360 / 26);
        inner.el.style.transform = `rotate(${deg}deg)`;
        // Counter-rotate the letter glyphs so they stay upright.
        inner.counterRotate(deg);

        const cipherLetter = cipherChars[idx[pos]];
        meta.innerHTML = '';
        const line = document.createElement('div');
        line.innerHTML = `letter <span class="ciphertext-letter">${pos + 1}</span> of ${idx.length}
            · keyword: <span class="keyword">${scene.keyword}</span>
            · using <span class="keyword">${currentKeyLetter()}</span>
            · ciphertext letter: <span class="ciphertext-letter">${cipherLetter}</span>`;
        meta.appendChild(line);

        prevBtn.disabled = pos === 0 || solved;
        nextBtn.disabled = pos === idx.length - 1 || solved;
        revealBtn.disabled = solved;

        out.textContent = decoded.join('');
        if (!solved && decoded.join('') === scene.plaintext) {
            solved = true;
            out.classList.add('solved');
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            revealBtn.disabled = true;
            onSolved();
        }
    }

    prevBtn.addEventListener('click', () => { pos--; render(); });
    nextBtn.addEventListener('click', () => { pos++; render(); });
    revealBtn.addEventListener('click', () => {
        const ci = ALPHABET.indexOf(cipherChars[idx[pos]]);
        const ki = ALPHABET.indexOf(currentKeyLetter());
        const pi = (ci - ki + 26) % 26;
        decoded[idx[pos]] = ALPHABET[pi];
        if (pos < idx.length - 1) pos++;
        render();
    });

    if (initiallySolved) {
        for (let p = 0; p < idx.length; p++) {
            const ci = ALPHABET.indexOf(cipherChars[idx[p]]);
            const ki = ALPHABET.indexOf(scene.keyword[p % scene.keyword.length]);
            decoded[idx[p]] = ALPHABET[(ci - ki + 26) % 26];
        }
    }

    render();
}

function buildRing(kind, radius) {
    const el = document.createElement('div');
    el.className = `alberti-ring ${kind}`;
    const glyphs = [];
    for (let i = 0; i < 26; i++) {
        const span = document.createElement('span');
        span.className = 'alberti-letter';
        span.textContent = ALPHABET[i];
        // Angle: 0 deg at top (12 o'clock), clockwise.
        const angleDeg = i * (360 / 26);
        const angleRad = (angleDeg - 90) * Math.PI / 180; // -90 to put 0 at top
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;
        span.style.left = `calc(50% + ${x}px)`;
        span.style.top = `calc(50% + ${y}px)`;
        span.style.transform = `translate(-50%, -50%)`;
        span.dataset.angleDeg = String(angleDeg);
        el.appendChild(span);
        glyphs.push(span);
    }
    function counterRotate(deg) {
        for (const g of glyphs) {
            g.style.transform = `translate(-50%, -50%) rotate(${-deg}deg)`;
        }
    }
    return { el, counterRotate };
}

function verifyVigenere(ciphertext, plaintext, keyword) {
    if (ciphertext.length !== plaintext.length) return false;
    let k = 0;
    for (let i = 0; i < ciphertext.length; i++) {
        const c = ciphertext[i];
        const p = plaintext[i];
        if (!/[A-Z]/.test(c)) {
            if (c !== p) return false;
            continue;
        }
        const ki = keyword.charCodeAt(k % keyword.length) - 65;
        const ci = c.charCodeAt(0) - 65;
        const pi = p.charCodeAt(0) - 65;
        if (((ci - ki + 26) % 26) !== pi) return false;
        k++;
    }
    return true;
}
