const express = require("express");
const router = express.Router();
const zidController = require("../controllers/zidController");

router.get("/auth/zid", zidController.zidAuthRedirect);
router.get("/zid/callback", zidController.zidAuthCallback);

module.exports = router;
