const express = require('express');
const router = express.Router();
var app = express();
const soap_controller = require('../controllers/soap_controller');

router.get('/soap:id', soap_controller.soap_view());

router.post("/soap/:id", soap_controller.soap_add_visit());