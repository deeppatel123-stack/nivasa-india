export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function pluralise(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
}
export function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
