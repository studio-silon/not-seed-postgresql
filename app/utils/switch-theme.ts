export function switchTheme() {
    if (!window) return;

    document.startViewTransition(() => {
        document.body.classList.toggle('dark');
    });
}
