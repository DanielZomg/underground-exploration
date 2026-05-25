// Fersen cipher primitives.
//
// The cipher Marie-Antoinette used with Axel von Fersen had two distinguishing features:
//   1. Polyalphabetic, indexed by a keyword (like Vigenère).
//   2. Every-other-letter enciphering: only alternate letters are encrypted; the rest pass
//      through in plaintext. The keyword index advances ONLY on encrypted positions.
//
// V1 uses a clean Vigenère table (26 rows; row k maps p -> (p+k) mod 26). The historical
// Fersen table is 22 rows of paired-letter involutions; swapping to it later is a one-file
// change here: provide a new `table` object and the widget code is untouched.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function buildVigenereTable() {
    const t = {};
    for (let k = 0; k < 26; k++) {
        const rowKey = ALPHABET[k];
        const row = {};
        for (let p = 0; p < 26; p++) {
            row[ALPHABET[p]] = ALPHABET[(p + k) % 26];
        }
        t[rowKey] = row;
    }
    return t;
}

export const vigenereTable = buildVigenereTable();

function invertRow(row) {
    const inv = {};
    for (const [p, c] of Object.entries(row)) inv[c] = p;
    return inv;
}

// Encipher every other letter (starting at the first), advancing the keyword on each
// enciphered letter. Non-letters (spaces, punctuation) pass through and do not count.
export function fersenEncode(plaintext, keyword, table = vigenereTable) {
    let out = '';
    let letterIdx = 0;
    let keyIdx = 0;
    for (const ch of plaintext) {
        if (!/[A-Z]/i.test(ch)) {
            out += ch;
            continue;
        }
        const p = ch.toUpperCase();
        if (letterIdx % 2 === 0) {
            const rowKey = keyword[keyIdx % keyword.length].toUpperCase();
            const row = table[rowKey];
            if (!row) throw new Error(`fersenEncode: no row for key letter "${rowKey}"`);
            out += row[p];
            keyIdx++;
        } else {
            out += p;
        }
        letterIdx++;
    }
    return out;
}

export function fersenDecode(ciphertext, keyword, table = vigenereTable) {
    let out = '';
    let letterIdx = 0;
    let keyIdx = 0;
    for (const ch of ciphertext) {
        if (!/[A-Z]/i.test(ch)) {
            out += ch;
            continue;
        }
        const c = ch.toUpperCase();
        if (letterIdx % 2 === 0) {
            const rowKey = keyword[keyIdx % keyword.length].toUpperCase();
            const row = table[rowKey];
            if (!row) throw new Error(`fersenDecode: no row for key letter "${rowKey}"`);
            const inv = invertRow(row);
            out += inv[c];
            keyIdx++;
        } else {
            out += c;
        }
        letterIdx++;
    }
    return out;
}

// True if a position (0-indexed, letters only) is an enciphered slot.
export function isEnciphered(letterIdx) {
    return letterIdx % 2 === 0;
}
