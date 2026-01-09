const placeOrder = () => {
  return new Promise((resolve) => {
    console.log("1. Placing Order...");
    setTimeout(() => {
      resolve("Order ID: 123");
    }, 1000);
  });
};

const preparePizza = (orderId) => {
  return new Promise((resolve) => {
    console.log(`2. Kitchen received ${orderId}. Preparing...`);
    setTimeout(() => {
      resolve("Pepperoni Pizza");
    }, 1000);
  });
};

const deliverPizza = (pizza) => {
  return new Promise((resolve) => {
    console.log(`3. Driver picked up ${pizza}.`);
    setTimeout(() => {
      resolve("Delivered!");
    }, 1000);
  });
};

async function startFridayNight() {
  console.log("--- Starting Process ---");

  const id = await placeOrder();
  console.log(`Received ID: ${id}`);

  const pizza = await preparePizza(id);
  console.log(`Pizza is ready: ${pizza}`);

  const status = await deliverPizza(pizza);
  console.log(`(Status: ${status})`);

  console.log("--- Done --- ");
}

startFridayNight();
