import * as admin from 'firebase-admin';

const serviceAccount = require('../glov-97db9-firebase-adminsdk-loj1r-f28be03645.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.api = require('./api');





