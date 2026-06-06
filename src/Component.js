import { findDOMByVNode, updateDomTree } from "./react-dom";

// 全局单例对象,用于管理是否批处理更新队列
export let updaterQueue = {
  isBatch: false,
  updaters: new Set()// 存储更新器
}

// 清空updater队列

export function flushUpdaterQueue() {
  updaterQueue.isBatch = false;
  for (let updater of updaterQueue.updaters) {
    updater.launchUpdate()
  }
  updaterQueue.updaters.clear()
}

// 类组件更新器，用于管理类组件的更新逻辑
// 与类组件的实例是一对一的关系
class Updater {
  constructor(ClassComponentInstance) {
    // 要知道基类是谁
    this.ClassComponentInstance = ClassComponentInstance;
    // 更新队列
    this.pendingStates = [];
  }
  addState(partialState) {
    this.pendingStates.push(partialState)
    this.preHandleForUpdate()
  }
  preHandleForUpdate() {
    if (updaterQueue.isBatch) {
      updaterQueue.updaters.add(this)
    } else {
      this.launchUpdate()
    }
  }
  launchUpdate() {
    // 最终要调用组件基类中的更新函数进行更新
    const { ClassComponentInstance, pendingStates } = this;
    if (pendingStates.length === 0) return;
    ClassComponentInstance.state = this.pendingStates.reduce((preState, newState) => {
      return { ...preState, ...newState }
    }, ClassComponentInstance.state)
    this.pendingStates.length = 0
    ClassComponentInstance.update()
  }
}
export class Component {
  static IS_CLASS = true
  constructor(props) {
    this.updater = new Updater(this)
    this.state = {}
    this.props = props
  }
  setState(partialState) {
    // // 局部更新合并属性
    // this.state = { ...this.state, ...partialState }
    // // 重新渲染进行更新
    // this.update()
    this.updater.addState(partialState)
  }
  update() {
    // 获取重新执行render函数后的新VirtualDOM
    // 根据新的虚拟DOM=>真实DOM
    // 挂载
    let oldVNode = this.oldVNode;//TODO:类组件拥有一个属性保存实例对应的虚拟DOM
    let oldDOM = findDOMByVNode(oldVNode)// 真实DOM保存到对应的虚拟DOM上
    let newVNode = this.render();
    updateDomTree(oldVNode, newVNode, oldDOM)
    this.oldVNode = newVNode
  }
}