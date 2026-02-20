/**
 * ROM Scanner - web-compatible fetch-based implementation
 * Fetches a static manifest.json listing available ROMs.
 * Works in both browser (Live Server) and Electron environments.
 */

export async function scanROMs() {
    try {
        // manifest.json lives at games/manifest.json relative to index.html
        const res = await fetch('./games/manifest.json');
        if (!res.ok) {
            return [];
        }
        const roms = await res.json();
        return roms;
    } catch (e) {
        return [];
    }
}
