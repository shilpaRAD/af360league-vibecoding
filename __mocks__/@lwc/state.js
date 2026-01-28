// Minimal mock of @lwc/state for unit tests

const stateCache = new WeakMap();

function atom(initial) {
  return { value: initial };
}

function setAtom(a, v) {
  a.value = v;
}

function compute(fn) {
  return {
    get value() {
      return fn();
    }
  };
}

function defineState(initFn) {
  // Return a factory that returns a singleton state object per initFn
  return () => {
    if (!stateCache.has(initFn)) {
      stateCache.set(initFn, initFn());
    }
    return stateCache.get(initFn);
  };
}

function _createProxyForState(stateObj) {
  // Proxy that exposes atom values directly on property access, while
  // providing a `.value` accessor to get the raw state object
  return new Proxy(stateObj, {
    get(target, prop) {
      if (prop === "value") return target;
      const val = target[prop];
      // If it's an atom (object with .value), return its value
      if (
        val &&
        typeof val === "object" &&
        Object.prototype.hasOwnProperty.call(val, "value")
      ) {
        return val.value;
      }
      return val;
    }
  });
}

function provideContext(component, stateFactory) {
  const stateObj = stateFactory();
  const proxy = _createProxyForState(stateObj);
  // Attach the proxy to the component for easy access in tests
  component.promotionState = proxy;
  return proxy;
}

function fromContext(component, stateFactory) {
  const stateObj = stateFactory();
  const proxy = _createProxyForState(stateObj);
  component.promotionState = proxy;
  return proxy;
}

module.exports = {
  atom,
  setAtom,
  compute,
  defineState,
  provideContext,
  fromContext
};
