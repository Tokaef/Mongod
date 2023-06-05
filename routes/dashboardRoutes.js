const express = require('express');
const router = express.Router();
const UserDetails = require('../models/UserDetails');
const User = require('../models/user');

router.get('/', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
}

  res.render('dashboard', { session: req.session });
}); 

router.get('/user-data', (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/dashboard');
  }

  res.render('userDataForm', { session: req.session });
});

router.get('/profile/:id', async (req,res) => {
  const userDetails = await UserDetails.findOne({ user: req.params.id }).populate('user');
  if (!userDetails) {
    return res.redirect('/dashboard');
}

 res.render('userDataForm', { session: req.session, userDetails });
});

router.post('/user-data', async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/dashboard');
  }  
  
  try {

    let userDetails = await UserDetails.findOne({ user: req.session.user._id });

    if (!userDetails) {
      userDetails = new UserDetails({
        nickname: req.body.nickname,
        avatarUrl: req.body.avatarUrl,
        about: req.body.about,
        user: req.session.user._id,
      });
    }

    else {
      userDetails.nickname = req.body.nickname;
      userDetails.avatarUrl = req.body.avatarUrl;
      userDetails.about = req.body.about;
    }
    await userDetails.save();
    const user = await User.findById(req.session.user._id);
    user.userDetails = userDetails._id;
    await user.save();
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка на сервере');
  }
  });

  const multer = require('multer');
  const path = require('path');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/img/avatars');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + Date.now() + ext;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
}).single('avatar');

router.post('/user-data', async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/dashboard');
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.render('userDataForm', { session: req.session, error: err });
    }

    let userDetails;

    userDetails = await UserDetails.findOne({ user: req.session.user._id });

    if (userDetails) {
      userDetails.nickname = req.body.nickname;
      userDetails.about = req.body.about;
      if (req.file) {
        userDetails.avatarUrl = '/img/avatars/' + req.file.filename;
      }
      await userDetails.save();
    } else {

      userDetails = new UserDetails({
        user:req.body.user,
        nickname: req.body.nickname,
        about: req.body.about,
        avatarUrl: req.file ? '/img/avatars/' + req.file.filename : null,
      });
      await userDetails.save();
    }

    res.redirect('/dashboard/user-data');
  })
});


module.exports = router;
    
    