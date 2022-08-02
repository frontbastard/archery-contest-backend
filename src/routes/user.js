const express = require('express');

const router = new express.Router();
const { authUser } = require('../middleware/auth');
const {
  add,
  login,
  logout,
  logoutAll,
  getAll,
  get,
  update,
  remove,
} = require('../controllers/user');

router.post('/', add);
router.post('/login', login);
router.post('/logout', authUser, logout);
router.post('/logout-all', authUser, logoutAll);
router.get('/', authUser, getAll);
router.get('/:id', authUser, get);
router.put('/:id', authUser, update);
router.delete('/:id', authUser, remove);

module.exports = router;
