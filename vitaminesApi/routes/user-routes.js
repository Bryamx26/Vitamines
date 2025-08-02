const express = require('express');
const router = express.Router();

const userController = require("../controllers/user-controller");


router.post("/auth", userController.verifyUser);


module.exports = router;