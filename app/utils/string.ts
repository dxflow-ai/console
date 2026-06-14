export function truncate(value: string, start: number, end: number = 0): string {
    const length = value.length;
    if (length <= start) {
        return value;
    }

    if (end > length - start) {
        end = length - start;
    }

    if (start + end >= length) {
        return value;
    }

    const prefix = value.slice(0, start);
    const suffix = value.slice(length - end);
    return `${prefix}...${suffix}`;
}
