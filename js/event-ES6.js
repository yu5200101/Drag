~function () {
    Function.prototype.myBind = function myBind(context = window,...outer) {
        // if (Function.prototype.bind) {}
        if ('bind' in this) {
            return this.bind(...arguments);
        }
        return (...inner) => this.apply(context, outer.contact(inner));
    };
    let on = function (curEle, type, fn) {
        if (document.addEventListener) {
            curEle.addEventListener(type, fn, false);
            return;
        }
        if (typeof curEle['pond' + type] === 'undefined') {
            curEle['pond' + type] = [];
            curEle.attachEvent('on' + type, run.myBind(curEle))
        }
        let pondAry = curEle['pond' + type];
        for (let i = 0; i < pondAry.length; i++) {
            if (pondAry[i] === fn) return;
        }
        pondAry.push(fn);
    };
    let off = function (curEle, type, fn) {
        if (document.removeEventListener) {
            curEle.removeEventListener(type, fn, false);
            return;
        }
        let pondAry = curEle['pond' + type];
        if (!pondAry) return;
        for (let i = 0; i < pondAry.length; i++) {
            let itemFn = pondAry[i];
            if (itemFn === fn) {
                pondAry[i] = null;
                break;
            }
        }
    };
    let run = function (e) {
        e = e || window.event;
        if (!e.target) {
            e.target = e.srcElement;
            e.pageX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
            e.pageY = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
            e.which = e.keyCode;
            e.preventDefault = function () {
                e.returnValue = false;
            };
            e.stopPropagation = function () {
                e.cancelBubble = true;
            };
        }
        let pondAry = this['pond' + e.type];
        for (let i = 0; i < pondAry.length; i++) {
            let itemFn = pondAry[i];
            if (itemFn === null) {
                pondAry.splice(i, 1);
                i--;
                continue;
            }
            itemFn.call(this, e);
        }
    };
    window.$event = {
        on:on,
        off:off
    };
}();