import { scenes, getScene, firstSceneId, nextSceneId } from './scenes.js';
import {
    getCurrentSceneId,
    setCurrentSceneId,
    markSolved,
    isSolved,
    getHistory,
    reset as resetJournal,
} from './journal.js';

import * as caesar from './widgets/caesar.js';
import * as substitution from './widgets/substitution.js';
import * as vigenere from './widgets/vigenere.js';

const widgets = { caesar, substitution, vigenere };

const sceneRoot = document.getElementById('scene-root');
const journalRoot = document.getElementById('journal-root');
const journalToggle = document.getElementById('journal-toggle');

journalToggle.addEventListener('click', () => {
    const hidden = journalRoot.classList.toggle('hidden');
    journalRoot.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    if (!hidden) renderJournal();
});

function renderJournal() {
    const entries = getHistory();
    journalRoot.innerHTML = `<h2>Journal</h2>`;
    if (entries.length === 0) {
        const p = document.createElement('p');
        p.className = 'journal-empty';
        p.textContent = "No history unlocked yet. Solve a cipher to learn its story.";
        journalRoot.appendChild(p);
    } else {
        for (const e of entries) {
            const div = document.createElement('div');
            div.className = 'journal-entry';
            div.innerHTML = `<h3></h3><p></p>`;
            div.querySelector('h3').textContent = e.title;
            div.querySelector('p').textContent = e.body;
            journalRoot.appendChild(div);
        }
    }
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset progress';
    resetBtn.style.marginTop = '8px';
    resetBtn.addEventListener('click', () => {
        if (confirm('Reset all progress?')) {
            resetJournal();
            loadScene(firstSceneId());
            renderJournal();
        }
    });
    journalRoot.appendChild(resetBtn);
}

function loadScene(sceneId) {
    const scene = getScene(sceneId);
    if (!scene) return;
    setCurrentSceneId(sceneId);

    sceneRoot.innerHTML = '';

    const header = document.createElement('h1');
    header.className = 'location-header';
    header.textContent = scene.location;
    sceneRoot.appendChild(header);

    const narrative = document.createElement('div');
    narrative.className = 'narrative';
    for (const line of scene.intro) {
        const p = document.createElement('p');
        p.textContent = line;
        narrative.appendChild(p);
    }
    for (const line of scene.ghostLines) {
        const p = document.createElement('p');
        p.className = 'ghost-text';
        p.textContent = `"${line}"`;
        narrative.appendChild(p);
    }
    sceneRoot.appendChild(narrative);

    const widgetMount = document.createElement('div');
    widgetMount.className = 'widget';
    sceneRoot.appendChild(widgetMount);

    const hintLine = document.createElement('div');
    hintLine.className = 'hint-line';
    sceneRoot.appendChild(hintLine);

    const hintCtrls = document.createElement('div');
    hintCtrls.className = 'controls';
    let hintIdx = 0;
    const hintBtn = document.createElement('button');
    hintBtn.textContent = 'Ask for a hint';
    hintBtn.addEventListener('click', () => {
        if (hintIdx < scene.hints.length) {
            hintLine.textContent = scene.hints[hintIdx];
            hintIdx++;
            if (hintIdx >= scene.hints.length) hintBtn.disabled = true;
        }
    });
    hintCtrls.appendChild(hintBtn);
    sceneRoot.appendChild(hintCtrls);

    const widget = widgets[scene.widget];
    if (!widget) {
        widgetMount.textContent = `[engine: unknown widget "${scene.widget}"]`;
        return;
    }

    const alreadySolved = isSolved(sceneId);
    widget.mount(widgetMount, {
        scene,
        onSolved: () => handleSolved(scene),
        initiallySolved: alreadySolved,
    });

    if (alreadySolved) handleSolved(scene, { silent: true });
}

function handleSolved(scene, { silent = false } = {}) {
    if (!silent) markSolved(scene.id, scene.history);

    // Avoid duplicating the banner if already rendered.
    if (sceneRoot.querySelector('.solved-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'solved-banner';

    const h = document.createElement('h3');
    h.textContent = scene.history.title;
    banner.appendChild(h);

    const body = document.createElement('p');
    // scene.history.body is author-controlled (no user input), so HTML is safe here;
    // this lets scenes.js use <em> for emphasis.
    body.innerHTML = scene.history.body;
    banner.appendChild(body);

    for (const line of scene.onSolvedLines) {
        const p = document.createElement('p');
        p.className = 'ghost-text';
        p.textContent = `"${line}"`;
        banner.appendChild(p);
    }

    const next = nextSceneId(scene.id);
    if (next) {
        const btn = document.createElement('button');
        btn.textContent = 'Continue deeper →';
        btn.addEventListener('click', () => loadScene(next));
        banner.appendChild(btn);
    } else {
        const p = document.createElement('p');
        p.textContent = 'End of prototype. The tunnels continue, but not tonight.';
        p.style.fontStyle = 'italic';
        p.style.marginTop = '10px';
        banner.appendChild(p);
    }

    sceneRoot.appendChild(banner);
}

// Boot.
const startId = getCurrentSceneId() || firstSceneId();
loadScene(startId);
