const myStack = [10, 20, 30];

Object.defineProperty(Array.prototype, "last", {
  value: function () {
    return this[this.length - 1];
  },
  enumerable: false,
});

console.log("Last item:", myStack.last());

const names = ["React", "AI", "Quantum"];
console.log("Last name:", names.last());
