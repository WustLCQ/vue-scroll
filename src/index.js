
const initConfig = {
    pullDown: true,
    pullUp: true,
    pullDownDistance: 50,
    pullUpDistance: 50,
    onPullDown: null,
    onPullUp: null
};
function plugin (Vue, { name = 'scroll' } = {}) {
    let savedClientY = 0;
    let savedScrollTop = 0;
    let removeTouchStartListener, removeTouchMoveListener, removeTouchEndListener;

    const getScrollParentNode = (el) => {
        let currentNode = el;
        while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY') {
            const overflowY = getComputedStyle(currentNode).overflowY;
            if (overflowY === 'scroll' || overflowY === 'auto') {
                return currentNode;
            }
            currentNode = currentNode.parentNode;
        }
        return window;
    }
    const getScrollTop = (el) => {
        const scrollNode = getScrollParentNode(el);
        if (scrollNode === window) {
            return Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.pageYOffset);
        } else {
            return scrollNode.scrollTop;
        }
    }

    const pullUpCallback = (el) => {
        const scrollParentNode = getScrollParentNode(el);
        if (scrollParentNode === window) {
            console.log(el.scrollTop)
        }
    }

    const touchStartListener = (el) => {
        const handleTouchStart = (event) => {
            const clientY = event.touches[0].clientY;
            savedClientY = clientY;
            savedScrollTop = getScrollTop(el);
        }
        el.addEventListener('touchstart', handleTouchStart);

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
        }
    }
    const touchMoveListener = (el, config) => {
        const handleTouchMove = (event) => {
            const clientY = event.touches[0].clientY;
            const { pullDown,
                pullUp} = config;
            const scrollTop = getScrollTop(el);
            if (pullDown && clientY > savedClientY) {
                // pull down
                if (scrollTop === 0) {
                    el.style.transform = `translateY(${clientY - savedClientY - savedScrollTop}px)`;
                }
            } else if (pullUp && clientY < savedClientY) {
                // pull up
                if (scrollTop + parseInt(getComputedStyle(el).height.replace('px', ''), 10) === el.scrollHeight) {
                    el.style.transform = `translateY(${clientY - savedClientY}px)`;
                }
            }
        }
        el.addEventListener('touchmove', handleTouchMove);

        return () => {
            el.removeEventListener('touchmove', handleTouchMove);
        }
    }
    const touchEndListener = (el, config) => {
        const handleTouchEnd = (event) => {
            const clientY = event.changedTouches[0].clientY;
            const { pullDown,
                pullUp ,
                pullDownDistance,
                pullUpDistance,
                onPullDown,
                onPullUp } = config;

            if (pullDown && clientY - savedClientY > pullDownDistance) {
                pullUpCallback(el);
                onPullDown && onPullDown();
            } else if (pullUp && savedClientY - clientY > pullUpDistance) {
                onPullUp && onPullUp();
            }

            el.style.transform = '';
        }
        el.addEventListener('touchend', handleTouchEnd);
        return () => {
            el.removeEventListener('touchend', handleTouchEnd);
        }
    }
    const directive = {
        inserted (el, { value = {} }, vnode) {
            const config = {
                ...initConfig,
                ...value
            };
            removeTouchStartListener = touchStartListener(el);
            removeTouchMoveListener = touchMoveListener(el, config);
            removeTouchEndListener = touchEndListener(el, config);
        },
        unbind () {
            removeTouchStartListener();
            removeTouchMoveListener();
            removeTouchEndListener();
        }
    }
    Vue.directive(name, directive)
}

plugin.version = '1.0.0'

if (window.Vue && !Vue.prototype.$isServer) {
    Vue.use(plugin);
}

export default plugin