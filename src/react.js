import { REACT_ELEMENT, REACT_FORWARD_REF, toVNode } from "./utils";
import { Component } from "./Component";
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
const obj = {
  type: "div",
  key: null,
  props: {
    children: "Hello Simple React",
  },
  _owner: null,
  _store: {},
};

function createRef() {
  return {
    current: null
  }
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render
  }
}

const React = {
  createElement,
  Component,
  createRef,
  forwardRef
};
export default React;
