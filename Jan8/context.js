const elon = {
  name: "Elon",
  money: 100000,

  calculateTax: function (taxRate) {
    const tax = this.money * taxRate;
    console.log(`${this.name} pays $${tax} in taxes. `);
  },
};

const siddanta = {
  name: "Siddanta",
  money: 50,
};

elon.calculateTax(0.1);

elon.calculateTax.call(siddanta, 0.1);

const siddantaTaxCalculator = elon.calculateTax.bind(siddanta);

siddantaTaxCalculator(0.2);
