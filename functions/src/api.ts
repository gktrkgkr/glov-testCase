const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: true }));
app.use("/glovApi", require('./routes/glovApi'));

module.exports = functions.https.onRequest(app);