var express = require('express');
var router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const { v4: uuidv4 } = require('uuid');
const Diary = require('../models/diary');
const User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('users', { title: 'sanpo nikki', user: req.user });
});

router.get('/new', function (req, res, next) {
  res.render('new', { title: 'sanpo nikki', user: req.user });
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
  res.redirect('/users');
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
    const err = new Error('日記が見つかりません');
    err.status = 404;
    next(err);
  }
});

router.get('/diaries/:diaryId/edit', authenticationEnsurer, async (req, res, next) => {
  const diaries = await Diary.findOne({
    where: {
      diaryId: req.params.diaryId
    }
  });
  res.render('edit', {
    title: "sanpo nikki",
    user: req.user,
    diaries: diaries,
  });
  // if (isMine(req, schedule)) { // 作成者のみが編集フォームを開ける
  //   const candidates = await Candidate.findAll({
  //     where: { scheduleId: schedule.scheduleId },
  //     order: [['candidateId', 'ASC']]
  //   });
  //   res.render('edit', {
  //     user: req.user,
  //     schedule: schedule,
  //     candidates: candidates
  //   });
  // } else {
  //   const err = new Error('指定された予定がない、または、予定する権限がありません');
  //   err.status = 404;
  //   next(err);
  // }
});

function isMine(req, schedule) {
  return schedule && parseInt(schedule.createdBy) === parseInt(req.user.id);
}

module.exports = router;
