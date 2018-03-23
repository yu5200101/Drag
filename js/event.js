Function.prototype.myBind = function myBind(context) {
  context = context || window;
  var _this = this;
  var outerAry = Array.prototype.slice.call(arguments,1);

  if('bind' in Function.prototype) {
      outerAry.unshift(context);
      return _this.bind(context,outerAry);
      // return _this.bind.apply(context,arguments);
  }
  return function () {
      var innerAry = Array.prototype.slice.call(arguments);
      _this.apply(context,outerAry.contact(innerAry));
  }
};

//=>on:向事件池中追加方法
function on(curEle, type, fn) {
    if (document.addEventListener) {
        curEle.addEventListener(type, fn, false);
        return;
    }
    if (typeof curEle[type + 'Pond'] === 'undefined') {
        curEle[type + 'Pond'] = [];
        //=>把run放到内置事件池中
        //curEle.addEventListener(type, run,false);
        // =>应该是IE6~8中才需要这样处理，所以使用attachEvent绑定才可以
        //=>解决一个问题：保证run中的this是当前元素curEle(执行run也需要传递一个事件对象来)
        //=>1、run中的this：curEle
        //=>2、run中传递了事件对象(e)和window.event相同
        // (1)curEle['on' + type] = run;
        /*(2)curEle.attachEvent('on' + type, function (e) {
            run.call(curEle,e);
        });*/
        curEle.attachEvent('on' + type, run.myBind(curEle));
    }
    var aryPond = curEle[type + 'Pond'];
    for (var i = 0; i < aryPond.length; i++) {
        if (aryPond[i] === fn) return;
    }
    aryPond.push(fn);
}

//=>off：移除事件池中的某个方法
function off(curEle, type, fn) {
    if (document.removeEventListener) {
        curEle.removeEventListener(type, fn, false);
        return;
    }
    var aryPond = curEle[type + 'Pond'];
    if (!aryPond) return;
    for (var i = 0; i < aryPond.length; i++) {
        if (aryPond[i] === fn) {
            // aryPond.splice(i, 1); 会引发数组塌陷，我们删除的时候不能让原始数组中的索引改变
            aryPond[i] = null;//=>用null占位
            break;
        }
    }
}

//=>run：把自己造的假事件池中的方法依次执行
function run(e) {
    //=>e:window.event
    //=>this:curEle
    //=>把事件对象e的兼容处理好：把绑定方法执行的时候，我们把处理好的e传递给方法，以后在绑定方法中直接用即可，不用再考虑兼容问题了（类似于JQ中事件绑定中的e）
    // (1)e = e || window.event;
    if (typeof  e.target === 'undefined') {
        e.target = e.srcElement;
        e.which = e.keyCode;
        e.pageX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
        e.preventDefault = function () {
            e.returnValue = false;
        };
        e.stopPropagation = function () {
            e.cancelBubble = true;
        };
    }
    var aryPond = this[e.type + 'Pond'];
    if (!aryPond) return;
    for (var i = 0; i < aryPond.length; i++) {
        var itemFn = aryPond[i];
        // itemFn();//=>this：window e:undeifned
        if (itemFn === null) {
            //=>当前这一项在执行的过程中被off方法移除掉了(Null不能执行，执行会报错)
            aryPond.splice(i, 1);
            i--;
            continue;
        }
        itemFn.call(this, e);
    }
}