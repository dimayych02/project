export function parsePrice(str: string): number[] {
    const regex = /(-?\d+)\s*р\.?/g;
    const matches = [...str.matchAll(regex)];

    return matches.map((match) => {
        const value = match[1];
        return isNaN(parseInt(value)) || value.startsWith('-') ? 0 : parseInt(value);
    })
}
