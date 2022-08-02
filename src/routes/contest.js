const express = require('express');

const router = new express.Router();
const { authUser } = require('../middleware/auth');
const { add, getAll, get, update, remove } = require('../controllers/contest');

router.post('/', authUser, add);
router.get('/', authUser, getAll);
router.get('/:id', authUser, get);
router.put('/:id', authUser, update);
router.delete('/:id', authUser, remove);
module.exports = router;
