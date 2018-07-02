
const initConfig = {
    pullDown: true, // 是否允许下拉
    pullUp: true, // 是否允许上拉
    pullDownDistance: 20, // 触发下拉回调函数的距离
    maxDownDistance: 100, // 允许下拉最远距离
    pullUpDistance: 20, // 触发上拉回调函数的距离
    maxUpDistance: 100, // 允许上拉最远距离
    onPullDown: null, // 下拉回调函数
    onPullUp: null // 上拉回调函数
};
function plugin (Vue, { name = 'scroll' } = {}) {
    let savedClientY = 0; // 保存的手指开始触摸时的位置
    let savedScrollTop = 0; // 保存的滚动条位置
    let maxPullDistance = 0; // 距离顶部/底部最远距离
    let removeTouchStartListener, removeTouchMoveListener, removeTouchEndListener;

    // 获取滚动元素的容器
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
    // 获取滚动的距离
    const getScrollTop = (el) => {
        const scrollNode = getScrollParentNode(el);
        if (scrollNode === window) {
            return Math.max(document.body.scrollTop, document.documentElement.scrollTop, window.pageYOffset);
        } else {
            return scrollNode.scrollTop;
        }
    }

    // 获取在滚动容器内的高度
    const getHeight = (el) => {
        const scrollNode = getScrollParentNode(el);
        if (scrollNode === window) {
            return window.outerHeight;
        } else {
            return parseInt(getComputedStyle(el).height.replace('px', ''), 10);
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
                pullUp,
                maxDownDistance,
                maxUpDistance } = config;
            const scrollTop = getScrollTop(el);
            if (pullDown && clientY > savedClientY) {
                // 滑动到顶部
                if (scrollTop === 0 && maxPullDistance < maxDownDistance) {
                    maxPullDistance = clientY - savedClientY - savedScrollTop > maxPullDistance ? clientY - savedClientY - savedScrollTop : maxPullDistance;
                    el.style.transform = `translateY(${clientY - savedClientY - savedScrollTop}px)`;
                }
            } else if (pullUp && clientY < savedClientY) {
                // 滑动到底部
                if (scrollTop + getHeight(el) === el.scrollHeight && maxPullDistance < maxUpDistance) {
                    maxPullDistance = Math.abs(clientY - savedClientY) > maxPullDistance ? Math.abs(clientY - savedClientY) : maxPullDistance;
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
            const { pullDown,
                pullUp ,
                pullDownDistance,
                pullUpDistance,
                onPullDown,
                onPullUp } = config;
            if (pullDown && maxPullDistance > pullDownDistance) {
                onPullDown && onPullDown();
            } else if (pullUp && maxPullDistance > pullUpDistance) {
                onPullUp && onPullUp();
            }
            maxPullDistance = 0; // 结束上/下拉后最远距离置0
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