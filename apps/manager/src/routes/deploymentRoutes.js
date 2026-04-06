const express = require('express');
const router = express.Router();
const controller = require('../controllers/deploymentController');

router.post('/deploy', controller.startDeployment);
router.get('/deployments', controller.getDeployments);
router.delete('/deployments/clear', controller.clearHistory);

module.exports = router;