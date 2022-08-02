const express = require('express');

const router = new express.Router();
const multer = require('multer');
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
  uploadAvatar,
  getAvatar,
  removeAvatar,
} = require('../controllers/user');

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
      return cb(new Error('Please upload a JPG, JPEG or PNG file'));
    }

    return cb(undefined, true);
    // cb(new Error('File must be a ...'));
  },
});

router.post('/', add);
router.post('/login', login);
router.post('/logout', authUser, logout);
router.post('/logout-all', authUser, logoutAll);
router.get('/', authUser, getAll);
router.get('/:id', authUser, get);
router.put('/:id', authUser, update);
router.delete('/:id', authUser, remove);
router.post(
  '/profile/avatar',
  upload.single('avatar'),
  authUser,
  uploadAvatar,
  // eslint-disable-next-line no-unused-vars
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
router.get('/:id/avatar', getAvatar);
router.delete('/profile/avatar', authUser, removeAvatar);

module.exports = router;
