function printStats(gameName, status) {
  console.log(
    `[${gameName}] ${status} Player: ${this.username} | Level: ${this.level}`,
  );
}

const gamer = {
  username: "NoobMaster69",
  level: 5,
};

const admin = {
  username: "RootAdmin",
  level: 99,
};

console.log("--- User .call() ---");
printStats.call(gamer, "Call of Duty", "Active");

console.log("\n--- Using .apply() ---");
printStats.apply(admin, ["Minecraft", "Super"]);
