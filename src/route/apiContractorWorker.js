const router=require('express').Router()

const contractorWorker=require('../controllers/contractorWorkerController')


router.post('/addContractorWorker',contractorWorker.addContractorWorker);
router.get('/getContractorWorkerById/:id',contractorWorker.getContractorWorkerById);
router.get('/getContractorWorkerByMail/:mail',contractorWorker.getContractorWorkerByMail);
router.get('/getAllContractorWorkers',contractorWorker.getAllContractorWorkers);
router.patch('/updateContractorWorkerById/:id',contractorWorker.updateContractorWorkerById);
router.patch('/updateContractorWorkerMail/:mail',contractorWorker.updateContractorWorkerByMail);
router.delete('/deleteContractorWorkerById/:id',contractorWorker.deleteContractorWorkerById);




module.exports=router