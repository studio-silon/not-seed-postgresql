export function switchTheme() {
    if (!window) return;

    const transition = document.startViewTransition(() => {
        document.body.classList.toggle('dark');
    });
}
