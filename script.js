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
