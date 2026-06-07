import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_TEXT,
  REACT_MEMO,
  toVNode,
  shallowEqual,
} from "./utils";
import { Component } from "./Component";
export * from "./hooks";
function createElement(type, properties, children) {
  ["__self", "__source"].forEach((key) => {
    delete properties[key];
  });
  let ref = properties.ref || null;
  let key = properties.key || null;
  let props = { ...properties };
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(toVNode);
  } else {
    props.children = toVNode(children);
  }
  return {
    $$typeof: REACT_ELEMENT,
    type,
    ref,
    key,
    props,
  };
}

function createRef() {
  return {
    current: null,
  };
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  }
}

function memo(type, compare) {
  return {
    $$typeof: REACT_MEMO,
    type,
    compare: compare || shallowEqual,
  };
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  PureComponent,
  memo,
};
export default React;
