function orderPizza(callback) {
  console.log("1. Placing order...");
  setTimeout(() => {
    console.log("2. Order Received!");
    callback();
  }, 1000);
}

function preparePizza(callback) {
  console.log("3. Preparing dough...");
  setTimeout(() => {
    console.log("4. Pizza in oven!");
    callback();
  }, 1000);
}

orderPizza(() => {
  preparePizza(() => {
    console.log("5. Pizza delivered! (This is ugly code)");
  });
});
