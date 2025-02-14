// Torch light effect
document.addEventListener('mousemove', function(e) {
    const torch = document.getElementById('torch-light');
    torch.style.left = e.pageX - 100 + 'px';
    torch.style.top = e.pageY - 100 + 'px';
});

let hintCount = 0;

function checkAnswer() {
    const input = document.getElementById('message-input').value.toUpperCase();
    if (input === "BRUTUS IS MEETING THE SENATORS AT DAWN") {
        const scene = document.querySelector('.scene');
        scene.innerHTML += `
            <p class="ghost-text" style="animation: fadeIn 2s">
                "Ah... so you've deciphered it. Yes, this was the warning I failed to heed.
                Perhaps if I had decoded it in time... but that is the past now.
                You've proven yourself worthy of more secrets these tunnels hold..."
            </p>
        `;
        // Could add next stage here
    } else {
        alert("The ghostly figure shakes his head slowly...");
    }
}

function showHint() {
    hintCount++;
    const hints = [
        "Caesar's ghost whispers: 'In life, I was known for my methods of securing messages. Each letter was shifted by the same number of positions...'",
        "The spectral figure points to the letters: 'A becomes D, B becomes E, C becomes F...'",
        "Caesar's form flickers: 'The shift... is three letters forwards. To decode, move three letters back...'"
    ];

    if (hintCount <= hints.length) {
        alert(hints[hintCount - 1]);
    }
}

// 'Notepad' functionality

const encryptedMessage = "EUXWXV LV PHHWLQJ WKH VHQDWRUV DW GDZQ";

function createCipherInputs() {
    const cipherContainer = document.getElementById('cipher-inputs');
    cipherContainer.innerHTML = ''; // Clear any existing content

    for (let i = 0; i < encryptedMessage.length; i++) {
        const char = encryptedMessage[i];

        // Only create input boxes for non-space characters
        if (char !== ' ') {
            const span = document.createElement('span');
            const originalChar = document.createElement('div');
            originalChar.textContent = char;

            const input = document.createElement('input');
            input.setAttribute('maxlength', '1');
            input.setAttribute('data-char', char);
            input.addEventListener('input', function(e) {
                e.target.value = e.target.value.toUpperCase();
            });

            span.appendChild(originalChar);
            span.appendChild(input);
            cipherContainer.appendChild(span);
        } else {
            // For spaces, just add a span with the space
            const span = document.createElement('span');
            span.textContent = ' ';
            cipherContainer.appendChild(span);
        }
    }
}

function createAlphabetMapping() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const mappingContainer = document.getElementById('alphabet-mapping');
    mappingContainer.innerHTML = ''; // Clear any existing content

    for (let char of alphabet) {
        const span = document.createElement('span');
        const originalChar = document.createElement('div');
        originalChar.textContent = char;

        const input = document.createElement('input');
        input.setAttribute('maxlength', '1');
        input.setAttribute('data-original', char);
        input.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });

        span.appendChild(originalChar);
        span.appendChild(input);
        mappingContainer.appendChild(span);
    }
}

function applyMapping() {
    // Build mapping dictionary
    const mappingInputs = document.querySelectorAll('#alphabet-mapping input');
    let mappingDict = {};

    mappingInputs.forEach(input => {
        const original = input.getAttribute('data-original');
        const mapped = input.value;
        if (mapped && /^[A-Z]$/.test(mapped)) {
            mappingDict[original] = mapped;
        }
    });

    // Apply mapping to encrypted message
    let decrypted = '';

    for (let char of encryptedMessage) {
        if (char === ' ') {
            decrypted += ' ';
        } else {
            decrypted += mappingDict[char] || '_';
        }
    }

    document.getElementById('decrypted-output').textContent = decrypted;
}

function resetNotepad() {
    // Clear all inputs in cipher section
    const cipherInputs = document.querySelectorAll('#cipher-inputs input');
    cipherInputs.forEach(input => {
        input.value = '';
    });

    // Clear all inputs in mapping section
    const mappingInputs = document.querySelectorAll('#alphabet-mapping input');
    mappingInputs.forEach(input => {
        input.value = '';
    });

    // Clear decrypted output
    document.getElementById('decrypted-output').textContent = '';
}

// Initialise notepad on page load
window.onload = function() {
    createCipherInputs();
    createAlphabetMapping();
};
