const STORAGE_KEY = 'underground-exploration:v2';

const defaultState = () => ({
    currentSceneId: null,
    solved: {},        // sceneId -> true
    history: {},       // sceneId -> { title, body }
});

let state = load();

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState();
        return { ...defaultState(), ...JSON.parse(raw) };
    } catch {
        return defaultState();
    }
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // localStorage may be unavailable (file://, private mode); degrade silently.
    }
}

export function getCurrentSceneId() {
    return state.currentSceneId;
}

export function setCurrentSceneId(id) {
    state.currentSceneId = id;
    persist();
}

export function markSolved(sceneId, historyEntry) {
    state.solved[sceneId] = true;
    if (historyEntry) state.history[sceneId] = historyEntry;
    persist();
}

export function isSolved(sceneId) {
    return Boolean(state.solved[sceneId]);
}

export function getHistory() {
    return Object.entries(state.history).map(([id, entry]) => ({ id, ...entry }));
}

export function reset() {
    state = defaultState();
    persist();
}
