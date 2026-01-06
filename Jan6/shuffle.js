Object.defineProperty(Array.prototype, "shuffle", {
  value: function () {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
  },
  enumerable: false,
});

const cards = ["Ace", "King", "Queen", "Jack", "10"];
console.log("Original:", [...cards]);

cards.shuffle();
console.log("Shuffled:", cards);
