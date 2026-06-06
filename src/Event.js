import { updaterQueue, flushUpdaterQueue } from "./Component";

export function addEvent(dom, eventName, bindFunction) {
  // 添加附加属性
  dom.attach = dom.attach || {};
  // 我们不直接将事件绑定到DOM元素中而是缓存起来
  // button.onclick = handleClick (X)
  dom.attach[eventName] = bindFunction
  // 事件合成机制核心一：事件绑定到document(React16)
  if (document[eventName]) return
  document[eventName] = dispatchEvent
}
// 中央分发器
function dispatchEvent(nativeEvent) {
  updaterQueue.isBatch = true;
  // 事件合成机制核心二：屏蔽浏览器差异
  let syntheticEvent = createSyntheticEvent(nativeEvent);
  let target = nativeEvent.target
  while (target) {
    syntheticEvent.currentTarget = target;
    let eventName = `on${nativeEvent.type}`
    let bindFunction = target.attach && target.attach[eventName]
    bindFunction && bindFunction(syntheticEvent)
    if (syntheticEvent.isPropagationStopped) {
      break;
    }
    target = target.parentNode
  }
  flushUpdaterQueue()
}

function createSyntheticEvent(nativeEvent) {
  let nativeEventKeyValue = {};
  // 此处我们不能用Object.keys()进行遍历,因为它只能获取对象【自身】【可枚举】属性
  // 原生事件对象如(MouseEvent),为了【面向对象编程】+【节省内存】绝大部分【核心属性】定义在【prototype】中
  for (let key in nativeEvent) {
    // 函数需要绑定上下文
    // 这些函数主要包括阻止冒泡、原生行为等
    nativeEventKeyValue[key] = typeof nativeEvent[key] === 'function' ? nativeEvent[key].bind(nativeEvent) : nativeEvent[key]
  }
  // Object.assign(target,...source)将source可枚举属性复制到target中
  let syntheticEvent = Object.assign(nativeEventKeyValue, {
    nativeEvent,
    isDefaultPrevented: false,
    isPropagationStopped: false,
    // 原生事件差异的实现
    preventDefault: function () {
      this.isDefaultPrevented = true;
      if (this.nativeEvent.preventDefault) {
        this.nativeEvent.preventDefault();
      } else {
        this.nativeEvent.returnValue = false
      }
    },
    stopPropagation: function () {
      this.isPropagationStopped = true;
      if (this.nativeEvent.stopPropagation) {
        this.nativeEvent.stopPropagation();
      } else {
        this.nativeEvent.cancelBubble = true
      }
    }
  });
  return syntheticEvent
}