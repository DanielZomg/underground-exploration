// Scene data. Each scene names a widget; engine.js mounts it.
// Adding an era = appending an entry here.

export const scenes = [
    {
        id: 'rome-caesar',
        location: 'Roman Catacombs (Present Day)',
        intro: [
            "Your torch beam cuts through the darkness of Rome's underground passages. The air is thick with dust and old smoke; your footsteps return to you off the limestone.",
            "The temperature drops. A figure resolves out of the cold: translucent, draped, unmistakable. Julius Caesar.",
        ],
        ghostLines: [
            "Salve, viator. Two millennia under stone, and still I am bothered by unread mail.",
            "In life I used a simple trick to keep my couriers' messages mine. Each letter slid forward by the same count. Decode it and I'll tell you why it mattered.",
        ],
        widget: 'caesar',
        ciphertext: 'EUXWXV LV PHHWLQJ WKH VHQDWRUV DW GDZQ',
        plaintext: 'BRUTUS IS MEETING THE SENATORS AT DAWN',
        // Shift used to encrypt: +3 (Caesar's classical shift). Widget rotates a dial; not revealed up front.
        hints: [
            "Caesar's ghost: 'The trick is uniform. Every letter moves by the same step.'",
            "Caesar's ghost: 'Try the dial. You're looking for the step that turns this into a tongue you can read.'",
        ],
        history: {
            title: "Caesar's Shift (~50 BCE)",
            body: "Suetonius records that Caesar enciphered military correspondence by shifting each letter three places forward. The cipher is trivial to a modern eye, but in a world where most couriers were illiterate and most interceptors barely literate, it was good enough. Its real legacy is conceptual: a <em>key</em> (the shift count) and an <em>algorithm</em> (the shift itself), separable in a way earlier code-talk wasn't.",
        },
        onSolvedLines: [
            "Caesar nods slowly. 'Yes. The warning Artemidorus tried to give me. I let the scroll go unread.'",
            "He gestures into the dark. 'Deeper, then. Others kept their letters longer than I did.'",
        ],
    },

    {
        id: 'baghdad-alkindi',
        location: 'Cistern Beneath Baghdad (c. 850 CE)',
        intro: [
            "The catacombs unspool into a vaulted cistern. Brick columns disappear into still water. Your reflection trails behind you.",
            "A scholar sits cross-legged on a dry ledge, ink-stained fingers turning the pages of a bound manuscript.",
        ],
        ghostLines: [
            "Peace, traveller. I am al-Kindi. I have written a small book on reading what others hoped you would not.",
            "This message uses no simple shift. Each letter has been replaced by another, by no pattern you can guess from the key alone.",
            "But count the letters. Look at how often each one appears. The language itself betrays the cipher.",
        ],
        widget: 'substitution',
        // Designed so plaintext-E (most common in English) maps to cipher T, giving the tallest bar.
        // Injective plain->cipher map; widget builds the inverse for validation & live decode.
        keyMapPlainToCipher: {
            A: 'R', B: 'Z', C: 'F', D: 'L', E: 'T', F: 'D', G: 'V', H: 'Q',
            I: 'X', J: 'U', K: 'C', L: 'H', M: 'K', N: 'N', O: 'P', P: 'W',
            Q: 'O', R: 'A', S: 'B', T: 'Y', U: 'M', V: 'I', W: 'J', X: 'S',
            Y: 'G', Z: 'E',
        },
        plaintext: 'TELL TO PARIS THE KEEP REMAINS THE SAFEST HIDING IS IN THE CATACOMBS',
        ciphertext: 'YTHH YP WRAXB YQT CTTW ATKRXNB YQT BRDTBY QXLXNV XB XN YQT FRYRFPKZB',
        hints: [
            "al-Kindi: 'In English, the letter E is by far the most common. Look at the tallest bar; that is likely E.'",
            "al-Kindi: 'A common three-letter word ending in E is THE. Find a recurring three-letter group ending in your candidate for E.'",
        ],
        history: {
            title: "al-Kindi and Frequency Analysis (~850 CE)",
            body: "Abu Yusuf al-Kindi, working in the House of Wisdom in Baghdad, wrote <em>Risāla fī Istikhrāj al-Mu'ammā</em> ('A Manuscript on Deciphering Cryptographic Messages'). It is the earliest known description of frequency analysis. His insight: the cipher hides the <em>letters</em>, but not the <em>language</em>. Every language has a fingerprint of letter frequencies, and substitution preserves it. After al-Kindi, the monoalphabetic cipher was no longer secure, a fact European cryptographers wouldn't catch up to for another six centuries.",
        },
        onSolvedLines: [
            "al-Kindi smiles. 'You see. The letters lied; the language told the truth.'",
            "He waves at a passage opening west. 'But you will find Europe took its time learning this. They paid for it.'",
        ],
    },

    {
        id: 'paris-alberti',
        location: 'Paris Carrières (1467)',
        intro: [
            "Limestone passages narrow. The walls bear soot-marks from older lamps than yours. You step into a low chamber where a Florentine, dressed against the cold, is bent over a pair of brass disks pinned together at the center.",
            "He looks up. 'Ah, another one who's read al-Kindi.'",
        ],
        ghostLines: [
            "I am Leon Battista Alberti. I read the Arab too. He broke our ciphers, so I built one he could not break.",
            "Watch: I do not use one alphabet. I use many. Each letter of the keyword tells me which alphabet to use for the next letter of the message.",
            "Decode this with the keyword you have been given. Rotate the inner ring so the keyword letter sits beneath A on the outer ring; then the cipher letter, read on the inner, points to the plaintext letter on the outer.",
        ],
        widget: 'vigenere',
        keyword: 'LUMEN',
        // Vigenère: cipher = (plain + key) mod 26. Computed; verified by widget on mount.
        plaintext: 'BELOW THE LAMPS THE CIPHER ENDURES',
        ciphertext: 'MYXSJ EBQ PNXJE XUP WUTUPL QRQFLQW',
        hints: [
            "Alberti: 'The first letter of the keyword shifts the first letter of the ciphertext. The second, the second. When the keyword ends, begin it again.'",
            "Alberti: 'For each ciphertext letter: turn the inner ring so this position's keyword letter sits under A. Then the cipher letter on the inner ring points to the plaintext letter above it.'",
        ],
        history: {
            title: "Alberti, the Cipher Disk, and Vigenère (1467 / 1586)",
            body: "Leon Battista Alberti described the first known polyalphabetic cipher in his 1467 essay <em>De componendis cifris</em>, alongside a brass cipher disk that mechanised the alphabet-swap. A century later, Blaise de Vigenère systematised the idea with a repeating keyword, the cipher that now bears his name. The crucial property: because the substitution <em>changes</em> letter by letter, al-Kindi's frequency analysis flattens out. The 'tall bar for E' disappears. Vigenère's cipher was called <em>le chiffre indéchiffrable</em> for three centuries before Babbage and Kasiski found cracks in the 1850s.",
        },
        onSolvedLines: [
            "Alberti spins the disk idly. 'Good. You see why the bars went flat: each letter has a different alphabet behind it. al-Kindi's tool, useless.'",
            "He stands. 'There is more below. Machines that turn the disk for you, faster than any hand. But that is a longer walk than I have time for tonight.'",
        ],
    },
];

export function getScene(id) {
    return scenes.find(s => s.id === id);
}

export function firstSceneId() {
    return scenes[0].id;
}

export function nextSceneId(currentId) {
    const i = scenes.findIndex(s => s.id === currentId);
    if (i < 0 || i >= scenes.length - 1) return null;
    return scenes[i + 1].id;
}
