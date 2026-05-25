// Paris / Marie-Antoinette branch: one dense scene, two-stage puzzle.
// (The 3-era pedagogical arc lives on the main branch.)

export const scenes = [
    {
        id: 'paris-antoinette',
        location: 'Paris Carrières (1793)',
        intro: [
            "You step into a small chamber off the main gallery. The walls are pale, almost glowing in your lamplight: chalk and limestone, dense with the chalk-white outlines of creatures dead for a hundred million years. The air smells of damp stone and lamp-oil.",
            "On a low shelf, someone has left a folded note, the ink fresh. The wax seal bears a swan.",
            "The air cools. A woman in court dress materialises, lace at her throat, her hair gone half-grey.",
        ],
        ghostLines: [
            "Bonsoir. You will forgive me if I do not waste words; my time above ended quickly, and my time below is borrowed.",
            "I have left a letter, but I do not trust the walls. The key to reading it is a fossil, and the fossil is a key.",
        ],
        widget: 'paris',

        // --- Stage 1: fossil riddle ---
        riddle: "The key is a fossil, and the fossil is a key.",
        fossilAnswer: 'BELEMNITE',
        fossilAccepted: ['belemnite', 'belemnites', 'belemnoidea'],
        fossilHints: [
            "A creature of the ancient seas, long since stone.",
            "Named for the Greek word for dart or arrow. Country folk once called them thunderbolts, fallen from the sky.",
            "Bullet-shaped, the colour of honey or pewter. Hold one up and you will see why I call it a key.",
        ],

        // --- Stage 2: Fersen cipher ---
        // Roundtrip-verified at widget mount: fersenEncode(plaintext, fossilAnswer) === ciphertext.
        plaintext: 'I LOVE YOU MADLY MY DEAR',
        ciphertext: 'J LSVP YSU YAQLG MR DIAS',

        history: {
            title: "The Cipher of Marie-Antoinette and Axel von Fersen",
            body: "Marie-Antoinette and the Swedish count Axel von Fersen corresponded in a polyalphabetic cipher whose distinguishing trick was enciphering only every <em>other</em> letter, leaving the rest in clear. Some of the letters were preserved by Fersen's family; some were redacted in black ink by a 19th-century descendant. In 2021, a team at the French National Centre for Scientific Research used multispectral imaging to read beneath the redactions, recovering passages of unmistakable tenderness that the historical record had erased. The cipher itself was solid for its day: <em>every other</em> letter enciphered under a 22-row table, the keyword changing per position, meant that even a determined adversary needed both the table and the keyword to read a word.",
        },
        onSolvedLines: [
            "She reads, more to herself than to you. 'Adieu. I sent so many of these. He kept them all.'",
            "She turns, and the lamplight goes through her. 'Take the note. Take the fossil. Some things outlast the people who carried them.'",
        ],
    },
];

export function getScene(id) {
    return scenes.find(s => s.id === id);
}

export function firstSceneId() {
    return scenes[0].id;
}

export function nextSceneId(_currentId) {
    return null;
}
