var express = require('express');
var router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const { v4: uuidv4 } = require('uuid');
const Diary = require('../models/diary');
const User = require('../models/user');

/* GET users listing. */
router.get('/', authenticationEnsurer,function (req, res, next) {
  res.render('users', { title: 'sanpo nikki', user: req.user });
});

router.get('/new', authenticationEnsurer, function (req, res, next) {
  res.render('new', { title: 'sanpo nikki', user: req.user });
});

router.post('/diaries', authenticationEnsurer, async (req, res, next) => {
  const diaries = await Diary.findAll({
    include: [
      {
        model: User,
        attributes: ['userId']
      }],
    where: {
      userId: req.user.id,
      date: req.body.date
    },
    order: [['date', 'DESC']]
  });

  if (isEmpty(diaries)) {
    const diaryId = uuidv4();
    const createdAt = new Date();
    const diary = await Diary.create({
      diaryId: diaryId,
      date: req.body.date,
      userId: req.user.id,
      text: req.body.diarytext,
      step: req.body.step,
      updatedAt: createdAt
    });
    res.redirect('/users/diaries');
  } else {
    res.render('new', {
      title: 'sanpo nikki',
      user: req.user,
      err: `すでに${req.body.date}の日記は存在しています`
    });
  }
});

function isEmpty(diaries) {
  return !Object.keys(diaries).length;
}

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
    order: [['date', 'ASC']]
  });
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
  if (isMine(req, diaries)) {
    res.render('edit', {
      title: "sanpo nikki",
      user: req.user,
      diaries: diaries,
    });
  } else {
    const err = new Error('指定された予定がない、または、予定する権限がありません');
    err.status = 404;
    next(err);
  }
});

function isMine(req, diaries) {
  return diaries && parseInt(diaries.userId) === parseInt(req.user.id);
}

router.post('/diaries/:diaryId', authenticationEnsurer, async (req, res, next) => {

  if (parseInt(req.query.edit) === 1) {
    let diaries = await Diary.findOne({
      where: {
        diaryId: req.params.diaryId
      }
    });
    const updatedAt = new Date();
    diaries = await diaries.update({
      step: req.body.step,
      text: req.body.text,
      updatedAt: updatedAt
    });
    res.redirect(`/users/diaries`);
  } else if (parseInt(req.query.delete) === 1) {
    await deleteDiaryAggregate(req.params.diaryId);
    res.redirect('/users/diaries');
  } else {
    const err = new Error('指定された予定がない、または、編集する権限がありません');
    err.status = 404;
    next(err);
  }
});

async function deleteDiaryAggregate(diaryId) {
  const diaries = await Diary.findByPk(diaryId);
  await diaries.destroy();
}

module.exports = router;
