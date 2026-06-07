# Simple React

这是一个用于学习 React 核心原理的练习项目。项目基于 Create React App 搭建，但运行时没有直接使用官方 React 渲染逻辑，而是在 `src` 目录中实现了一套简化版的 React 和 ReactDOM。

项目重点不是生产可用性，而是帮助理解 JSX、虚拟 DOM、组件渲染、DOM Diff、合成事件、类组件更新队列以及常见 Hooks 的基本工作方式。

## 功能概览

- JSX 通过 `React.createElement` 转换为虚拟 DOM
- 支持原生 DOM 节点、文本节点、函数组件和类组件
- 支持 `ref`、`forwardRef`、`memo`、`PureComponent`
- 支持简化版 DOM 挂载和更新
- 支持基于 key 的子节点移动、创建和删除
- 支持简化版合成事件和批量更新
- 支持常见 Hooks：
  - `useState`
  - `useReducer`
  - `useEffect`
  - `useLayoutEffect`
  - `useRef`
  - `useImperativeHandle`
  - `useMemo`
  - `useCallback`

## 目录结构

```txt
src/
  Component.js    类组件基类、setState 更新器、批量更新队列
  Event.js        合成事件与事件委托
  hooks.js        Hooks 的简化实现
  index.js        示例入口
  react.js        createElement、createRef、memo、forwardRef 等 React API
  react-dom.js    render、mount、createDOM、DOM Diff 等渲染逻辑
  utils.js        React 标记常量、文本节点转换、浅比较、深拷贝工具
```

## 快速开始

安装依赖：

```powershell
npm install
```

启动开发服务：

```powershell
npm start
```

默认会使用 CRA 的开发服务器。项目脚本中设置了：

```txt
DISABLE_NEW_JSX_TRANSFORM=true
```

这样 JSX 会继续编译为 `React.createElement(...)`，方便使用本项目自己实现的 `createElement`。

## 当前示例

入口文件在：

```txt
src/index.js
```

当前示例演示了：

- `useState` 管理输入框和年龄状态
- `useMemo` 缓存对象数据
- `useCallback` 缓存事件处理函数
- `React.memo` 包裹子组件，观察组件重复渲染情况

可以通过修改 `src/index.js` 来切换不同实验场景，例如测试 `useRef`、`forwardRef`、类组件生命周期或 DOM Diff。

## 学习重点

建议按下面顺序阅读源码：

1. `src/react.js`：理解 JSX 如何变成虚拟 DOM
2. `src/react-dom.js`：理解虚拟 DOM 如何变成真实 DOM
3. `src/Event.js`：理解事件委托、合成事件和批量更新
4. `src/Component.js`：理解类组件的 `setState` 和更新流程
5. `src/hooks.js`：理解 Hooks 如何依赖调用顺序保存状态
6. `src/utils.js`：理解节点类型标记和辅助工具

## 注意事项

这是教学性质的简化实现，与真实 React 有很多差异：

- 没有完整 Fiber 架构
- 没有并发渲染和调度系统
- Hooks 状态使用全局数组保存，只适合简单示例
- DOM Diff 只覆盖部分常见场景
- Fragment、Portal、Context、Suspense 等高级能力未完整实现
- 错误边界、严格模式和服务端渲染未实现

因此它适合作为源码学习练习，不建议用于真实业务项目。

## 测试

项目中包含少量测试示例：

```powershell
npm test
```

测试文件：

```txt
src/react.test.js
```

## 开发约定

- 优先使用 PowerShell 7 执行命令，避免中文编码问题
- 修改功能时尽量保持小步、单点变更
- 不要在 TypeScript 中使用 `any` 类型
- 日志文件 `.codex-dev-server*.log` 已在 `.gitignore` 中忽略
