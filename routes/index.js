var express = require('express');
var router = express.Router();
const Diary = require('../models/diary');
const User = require('../models/user');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const today = new Date().toLocaleDateString();
  const diaries = await Diary.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ['userId',`username`]
      }],
    where: {
      date: today
    },
    order: [['step', 'DESC']],
    limit:10
  });
  res.render('index', { title: 'sanpo nikki', user: req.user,diaries:diaries.rows,today:today});
});

module.exports = router;
