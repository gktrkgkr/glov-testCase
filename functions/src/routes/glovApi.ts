import express = require('express');
const auth = require('../middlewares/auth');
const glovApiController = require('../controllers/glovApiController');

const router = express.Router();

router.get('/', auth, glovApiController.requestHandler);

module.exports = router;