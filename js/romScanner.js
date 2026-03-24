/**
 * Fetches the ROM manifest from games/manifest.json.
 */
export async function scanROMs() {
    try {
        const res = await fetch('./games/manifest.json');
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}
