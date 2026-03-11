const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPost);
