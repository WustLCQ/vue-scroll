
function plugin (Vue, { name = 'scroll' } = {}) {
    let savedClientY = 0;
    const handleTouchStart = (el) => {
        return (event) => {
            const clientY = event.touches[0].clientY;
            savedClientY = clientY;
        };
    };
    const handleTouchMove = (el) => {
        return (event) => {
            const clientY = event.touches[0].clientY;
            el.style.transform = `translateY(${clientY - savedClientY}px)`;
        };
    };
    const handleTouchEnd = (el) => {
        return (event) => {
            el.style.transform = '';
        };
    };
    const directive = {
        inserted (el, { value }, vnode) {
            el.addEventListener('touchstart', handleTouchStart(el));
            el.addEventListener('touchmove', handleTouchMove(el));
            el.addEventListener('touchend', handleTouchEnd(el));
        },
        unbind (el) {
            el.removeEventListener('touchstart', handleTouchStart(el));
            el.removeEventListener('touchmove', handleTouchMove(el));
            el.removeEventListener('touchend', handleTouchEnd(el));
        }
    }
    Vue.directive(name, directive)
}

plugin.version = '1.0.0'

export default plugin