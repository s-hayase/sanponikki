var express = require('express');
var router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const { v4: uuidv4 } = require('uuid');
const Diary = require('../models/diary');
const Step = require('../models/step');
const Content = require('../models/content');
const User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('users', { title: 'sanpo nikki', user: req.user });
});

router.post('/diaries', authenticationEnsurer, async (req, res, next) => {
  const diaryId = uuidv4();
  const createdAt = new Date();
  const diary = await Diary.create({
    diaryId: diaryId,
    date: createdAt,
    userId: req.user.id,
    text: req.body.diarytext,
    step: req.body.step
  });
  res.redirect('/users/diaries');
});

router.get('/diaries', authenticationEnsurer, async (req, res, next) => {
  const diaries = await Diary.findAll({
    include: [
      {
        model: User,
        attributes: ['userId']
      }],
    where: {
      userId: req.user.id
    },
    order: [['date', 'DESC']]
  });
  console.info(diaries.length);
  if (diaries) {
    res.render('diary', {
      title: "sanpo nikki",
      user: req.user,
      diaries: diaries,
    });
  } else {
    const err = new Error('指定された予定は見つかりません');
    err.status = 404;
    next(err);
  }
});

module.exports = router;
