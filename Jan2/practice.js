// The 'Map' (Logic)
// format: current_state : input_event -> new_state

// const trafficRules = {
// "RED:timer": "GREEN",
// "GREEN:timer": "YELLOW",
// "YELLOW:timer": "RED",
// "RED:pedestrian_jumped": "RED"
// };

// function trafficLightSimulator(startState, events) {
// let currentState = startState;

// for (let event of events) {
// console.log(`Light is [${currentState}]. Event happened: "${event}"`);

// const key = `${currentState}:${event}`;
// const nextState = trafficRules[key];

// if (nextState) {
// currentState = nextState;
// } else {
// console.log(" -> Ignored (No rule for this!)");
// }
// }
// }

// const dayEvents = ["timer", "timer", "pedestrian_jumped", "timer"];
// trafficLightSimulator("RED", dayEvents);

// trafficRules = {
// "RED:timer": "GREEN",
// "GREEN:timer": "YELLOW",
// "YELLOW:timer": "RED",
// "RED:pedestrian_jumped": "RED",
// };

const rules = { RED: "GREEN", GREEN: "YELLOW", YELLOW: "RED" };

function startTrafficLight(currentState) {
  console.log(`Light is now: [${currentState}]`);

  const nextState = rules[currentState];

  setTimeout(() => {
    startTrafficLight(nextState);
  }, 1000);
}

startTrafficLight("RED");

function startTrafficLight(currentState, cycleCount) {
  console.log(`Cycle: ${cycleCount} | Light: ${currentState}`);

  if (cycleCount >= 5) {
    currentState = "RED";
    return;
  }

  const nextState = rules[currentState];

  setTimeout(() => {
    startTrafficLight(nextState, cycleCount + 1);
  }, 1000);
}

startTrafficLight("RED", 0);
