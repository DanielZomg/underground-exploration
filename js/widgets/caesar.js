// Caesar shift widget: rotating dial. Solved when the visible plaintext == scene.plaintext.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function mount(root, { scene, onSolved, initiallySolved }) {
    root.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = 'Caesar Dial: rotate to find the shift';
    root.appendChild(heading);

    const cipherDisplay = document.createElement('div');
    cipherDisplay.className = 'ciphertext-display';
    cipherDisplay.textContent = scene.ciphertext;
    root.appendChild(cipherDisplay);

    const wrap = document.createElement('div');
    wrap.className = 'dial-wrap';
    root.appendChild(wrap);

    const dial = document.createElement('div');
    dial.className = 'dial';
    wrap.appendChild(dial);

    const shiftLabel = document.createElement('div');
    shiftLabel.className = 'dial-shift';
    wrap.appendChild(shiftLabel);

    const controls = document.createElement('div');
    controls.className = 'controls';
    const leftBtn = document.createElement('button');
    leftBtn.textContent = '← shift back';
    const rightBtn = document.createElement('button');
    rightBtn.textContent = 'shift forward →';
    controls.appendChild(leftBtn);
    controls.appendChild(rightBtn);
    wrap.appendChild(controls);

    const out = document.createElement('div');
    out.className = 'live-output';
    root.appendChild(out);

    let shift = 0;
    let solved = false;

    function render() {
        dial.innerHTML = '';
        for (let i = 0; i < 26; i++) {
            const col = document.createElement('div');
            col.className = 'dial-col';

            const plain = document.createElement('div');
            plain.className = 'plain';
            plain.textContent = ALPHABET[i];

            const cipher = document.createElement('div');
            cipher.className = 'cipher';
            // Cipher letter that maps TO this plaintext letter under the current shift.
            // Decoding: plain = (cipher - shift) mod 26  =>  cipher = (plain + shift) mod 26
            cipher.textContent = ALPHABET[(i + shift + 26) % 26];

            col.appendChild(plain);
            col.appendChild(cipher);
            dial.appendChild(col);
        }
        shiftLabel.textContent = `shift = ${shift >= 0 ? '+' : ''}${shift}`;

        // Decode visible.
        const decoded = scene.ciphertext.split('').map(c => {
            if (!/[A-Z]/.test(c)) return c;
            const ci = ALPHABET.indexOf(c);
            return ALPHABET[(ci - shift + 26) % 26];
        }).join('');
        out.textContent = decoded;

        if (!solved && decoded === scene.plaintext) {
            solved = true;
            out.classList.add('solved');
            leftBtn.disabled = true;
            rightBtn.disabled = true;
            onSolved();
        }
    }

    leftBtn.addEventListener('click', () => { shift = (shift - 1 + 26) % 26; render(); });
    rightBtn.addEventListener('click', () => { shift = (shift + 1) % 26; render(); });

    if (initiallySolved) {
        // Jump to the right shift so returning players see their solved state.
        for (let s = 0; s < 26; s++) {
            const decoded = scene.ciphertext.split('').map(c => {
                if (!/[A-Z]/.test(c)) return c;
                const ci = ALPHABET.indexOf(c);
                return ALPHABET[(ci - s + 26) % 26];
            }).join('');
            if (decoded === scene.plaintext) { shift = s; break; }
        }
    }

    render();
}
