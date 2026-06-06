import { REACT_ELEMENT, REACT_FORWARD_REF, REACT_TEXT, CREATE, MOVE } from "./utils";
import { addEvent } from "./Event";

// 初始化
function render(VNode, containerDOM) {
  // 将virtual DOM转化为真实DOM
  // 真实DOM挂载到容器DOM
  mount(VNode, containerDOM);
}
// 挂载到容器中
function mount(VNode, containerDOM) {
  let newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

// 创建真实DOM
function createDOM(VNode) {
  const { type, props, ref } = VNode;
  // 1. 创建dom
  let dom;
  // 此处的$$typeof并不是直接在reactelement上第一层节点的typeof，而是type.$$typeof
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return getDomByForwardRefFunction(VNode)
  }
  if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT && type.IS_CLASS) {
    return getDomByClassComponent(VNode)
  }
  if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT) {
    return getDomByFunctionComponent(VNode)
  }
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.text)
  } else if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  // 2. 处理子元素
  if (props) {
    if (typeof props.children === 'object' && props.children.type) {
      // 对象
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      // 数组
      mountArray(props.children, dom)
    }
  }
  // 3.处理属性值
  setPropsForDOM(dom, props)
  VNode.dom = dom
  ref && (ref.current = dom)
  return dom
}
// 缺陷
// 1.没有处理嵌套数组以及数字节点
// 2.判断冗余
// 3.未忽略null、undefined以及boolean
function mountArray(children, parent) {
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; i++) {
    if (!children[i]) {
      children.splice(i, 1)
      i--
      continue
    }
    children[i].index = i;
    mount(children[i], parent)
  }
}

// 处理属性
function setPropsForDOM(dom, VNodeProps = {}) {
  if (!dom) return;
  for (const key in VNodeProps) {
    if (key === 'children') {
      return;
    } else if (/^on[A-Z].*/.test(key)) {
      // TODO:处理事件
      addEvent(dom, key.toLowerCase(), VNodeProps[key])
    } else if (key === 'style') {
      Object.keys(VNodeProps[key]).forEach(styleName => {
        dom.style[styleName] = VNodeProps[key][styleName]
      })
    } else {
      dom[key] = VNodeProps[key]
    }
  }
}

// 处理函数式组件
function getDomByFunctionComponent(VNode) {
  let { type, props } = VNode;
  let renderVNode = type(props);
  if (!renderVNode) return null;
  let dom = createDOM(renderVNode)
  return dom
}

// 处理类组件
function getDomByClassComponent(VNode) {
  let { type, props, ref } = VNode;
  let instance = new type(props);
  let renderVNode = instance.render();
  instance.oldVNode = renderVNode;
  ref && (ref.current = instance)
  if (!renderVNode) return null;
  let dom = createDOM(renderVNode);
  if (instance.componentDidMount) instance.componentDidMount()
  return dom
}

function getDomByForwardRefFunction(VNode) {
  let { type, props, ref } = VNode;
  let renderVNode = type.render(props, ref);
  if (!renderVNode) return;
  return createDOM(renderVNode)
}

export function findDOMByVNode(VNode) {
  if (!VNode) return;
  if (VNode.dom) return VNode.dom;
}

export function updateDomTree(oldVNode, newVNode, oldDOM) {
  const typeMap = {
    NO_OPERATE: !oldVNode && !newVNode,
    ADD: !oldVNode && newVNode,
    DELETE: oldVNode && !newVNode,
    REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type,
  }
  let UPDATE_TYPE = Object.keys(typeMap).filter(key => typeMap[key])[0]
  switch (UPDATE_TYPE) {
    case 'NO_OPERATE':
      break;
    case 'DELETE':
      removeVNode(oldVNode);
      break;
    case 'ADD':
      oldDOM.parentNode.appendChild(createDOM(newVNode));
      break;
    case 'REPLACE':
      removeVNode(oldVNode);
      oldDOM.parentNode.appendChild(createDOM(newVNode));
      break;
    default:
      deepDOMDiff(oldVNode, newVNode);
      break;
  }
}

function removeVNode(VNode) {
  const currentDOM = findDOMByVNode(VNode);
  if (currentDOM) currentDOM.remove();
  if (VNode.classInstance && VNode.classInstance.componentDidUnMount) {
    VNode.classInstance.componentDidUnMount()
  }
}

function deepDOMDiff(oldVNode, newVNode) {
  let diffTypeMap = {
    ORIGIN_NODE: typeof oldVNode.type === 'string',
    CLASS_COMPONENT: typeof oldVNode.type === 'function' && oldVNode.type.IS_CLASS_COMPONENT,
    FUNCTION_COMPONENT: typeof oldVNode.type === 'function',
    TEXT: oldVNode.type === REACT_TEXT,
  }

  let DIFF_TYPE = Object.keys(diffTypeMap).filter(key => diffTypeMap[key])[0]

  switch (DIFF_TYPE) {
    case 'ORIGIN_NODE':
      // 复用旧DOM
      let currentDOM = newVNode.dom = findDOMByVNode(oldVNode);
      setPropsForDOM(currentDOM, newVNode.props);
      updateChildren(currentDOM, oldVNode.props.children, newVNode.props.children);
      break;
    case 'CLASS_COMPONENT':
      updateClassComponent(oldVNode, newVNode);
      break;
    case 'FUNCTION_COMPONENT':
      updateFunctionComponent(oldVNode, newVNode);
      break;
    case 'TEXT':
      updateTextComponent(oldVNode, newVNode);
      break;
  }
}
function updateClassComponent(oldVNode, newVNode) {
  const classInstance = newVNode.classInstance = oldVNode.classInstance;
  classInstance.updater.launchUpdate(newVNode.props);
}

function updateFunctionComponent(oldVNode, newVNode) {
  let oldDOM = newVNode.dom = findDOMByVNode(oldVNode);
  if (!oldDOM) return;
  const { type, props } = newVNode;
  let newRenderVNode = type(props);
  updateDomTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
  newVNode.oldRenderVNode = newRenderVNode;
}

function updateTextComponent(oldVNode, newVNode) {
  let oldDOM = newVNode.dom = findDOMByVNode(oldVNode);
  if (!oldDOM) return;
  oldDOM.textContent = newVNode.props.text;
}


function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
  // Boolean过滤掉null和undefined 
  oldVNodeChildren = (Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren]).filter(Boolean);
  newVNodeChildren = (Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren]).filter(Boolean);
  // 记录最后一个不需要移动的索引
  let lastNotChangedIndex = -1;
  // 记录旧的虚拟DOM中key和虚拟DOM的映射关系
  let oldKeyChildMap = {};
  oldVNodeChildren.forEach((oldVNode, index) => {
    let oldKey = oldVNode && oldVNode.key ? oldVNode.key : index;
    oldKeyChildMap[oldKey] = oldVNode;
  });
  // 遍历新的虚拟DOM数组，找到可以复用且需要移动的、需要重新创建的、需要删除的节点，剩下的都是不用动的节点
  let actions = [];
  newVNodeChildren.forEach((newVNode, index) => {
    newVNode.index = index;
    let newKey = newVNode.key ? newVNode.key : index;
    let oldVNode = oldKeyChildMap[newKey];
    if (oldVNode) {
      deepDOMDiff(oldVNode, newVNode);
      // 相对位置变化了，需要移动
      if (oldVNode.index < lastNotChangedIndex) {
        actions.push({
          type: MOVE,
          oldVNode,
          newVNode,
          index // 新位置的索引
        })
      }
      // 已被复用,删除 遍历完成后映射表剩下中的元素就是要删除的元素
      delete oldKeyChildMap[newKey];
      lastNotChangedIndex = Math.max(lastNotChangedIndex, oldVNode.index);
    } else {
      // 没有找到对应的旧的虚拟DOM，需要重新创建
      actions.push({
        type: CREATE,
        newVNode,
        index // 新位置的索引
      });
    }
  });
  let VNodeToMove = actions.filter(action => action.type === MOVE).map(action => action.oldVNode);
  let VNodeToDelete = Object.values(oldKeyChildMap);
  VNodeToMove.concat(VNodeToDelete).forEach(oldVNode => {
    let currentDOM = findDOMByVNode(oldVNode);
    currentDOM.remove();
  });
  actions.forEach(action => {
    let { type, oldVNode, newVNode, index } = action;
    // 剩余节点
    let childNodes = parentDOM.childNodes;
    // 找到当前位置的节点
    let childNode = childNodes[index];
    const getDomForInsert = () => {
      if (type === CREATE) {
        return createDOM(newVNode);
      }
      if (type === MOVE) {
        return findDOMByVNode(oldVNode);
      }
    }
    if (childNode) {
      // 将新节点插入到当前位置节点之前
      // [x,y,z] -> [x,m,y,z] -> 获取y节点 -> 插入到y节点之前 
      parentDOM.insertBefore(getDomForInsert(), childNode);
    } else {
      // 如果当前位置节点不存在，则将新节点插入到父节点末尾
      parentDOM.appendChild(getDomForInsert());
    }
  });
}

const ReactDOM = {
  render,
};
export default ReactDOM;
