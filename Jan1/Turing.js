// Topic The Universal Logic of Computation (Turing COmpletenes).
// Concept: Any Computer algorithm can be simulated by a simple machine that reads/writes symbols on a tape
// Task: Write a simulator of a Turing Machine in Javascript or Python
//  It should take an "instruction set" and a "tape" (array)
//  It should read the current cell, update state, write a value, and move left/right.

// alen turing prove that any algorithm no matter how complex is it can be executed by simple machines in four steps
// 1. tape ; This is infinite strip of memory cells
// 2. the head : this is the pointer
// 3. the state; the machine's current mood
// 4. the rules; simple lookup logics
//
// Turing machine simulator code to inverts bits until it hits a blank space

function turingMachine(tape, rules, currentState = "start", head = 0) {
  console.log(`initial tape: [${tape}]`);

  while (currentState !== "HALT") {
    const read = tape[head] || " ";
    const key = `${currentState}:${read}`;

    if (!rules[key]) {
      console.error("Crash: No rule defined!");
      break;
    }

    const { write, move, nextState } = rules[key];

    tape[head] = write;
    head += move == "R" ? 1 : -1;
    currentState = nextState;
  }
  return tape;
}

const myRules = {
  "start:0": { write: "1", move: "R", nextState: "start" },
  "start:1": { write: "0", move: "R", nextState: "start" },
  "start: ": { write: "", move: "L", nextState: "HALT" },
};

console.log("Final Tape:", turingMachine(["1", "0", "1"], myRules));
