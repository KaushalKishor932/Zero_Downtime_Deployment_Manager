const express = require('express');
const router = express.Router();
const controller = require('../controllers/deploymentController');

router.post('/deploy', controller.startDeployment);
router.get('/deployments', controller.getDeployments);
router.get('/config', controller.getConfig);

module.exports = router;
