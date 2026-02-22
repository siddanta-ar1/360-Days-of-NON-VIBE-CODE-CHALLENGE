exports.up = (pgm) => {
  pgm.addColumns("users", {
    bio: { type: "text" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("users", ["bio"]);
};
