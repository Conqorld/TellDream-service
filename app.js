var express = require('express')
var port = process.env.PORT || 4567
var app = express()
// import databaseMain from './databaseMain'
const databaseMain = require('./src/databaseMain')
const AppDAO = require('./src/dao')
const storyRepository = require('./src/story/storyRepository')
const userRepository = require('./src/user/uersRepository')
const encrypt = require('./src/encrypt/AES')
const md5 = require('md5')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')

app.listen(port)
databaseMain()

app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({            //此项必须在 bodyParser.json 下面,为参数编码
    extended: true
}));
app.use(cookieParser());  //body-parser 解析json格式数据

app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200); /让options请求快速返回/
    }
    else {
        next();
    }
});

app.get('/', function (req, res) {
    console.log(8888)
})
app.all('/tellDream/getStory', function (req, res) {
    let id = getTokenId(req, res)
    if (!id) {
      return false
    }
    const dao = new AppDAO('./database.sqlite3')
    const storyRepo = new storyRepository(dao)
    storyRepo.getByTimes(req.body.createTime * 1000, req.body.endTime * 1000, id)
        .then((rows) =>{
            rows.forEach((item) => {
                item.tag = item.tag !== null?JSON.parse(item.tag):null
                item.event = item.event !== null?JSON.parse(item.event):null
            })
            res.send(rows);
            res.end( );
            dao.close()
        })
})
app.all('/tellDream/deleteStory', function (req, res) {
    const dao = new AppDAO('./database.sqlite3')
    const storyRepo = new storyRepository(dao)
    storyRepo.delete(req.body.id)
        .then((rows) =>{
            let parms = {
              status : 1,
              result: 'OK'
            }
            res.send(parms);
            res.end( );
            dao.close()
        })
})
app.all('/tellDream/getStoryDetail', function (req, res) {
    const dao = new AppDAO('./database.sqlite3')
    const storyRepo = new storyRepository(dao)
    storyRepo.getById(req.body.id)
        .then((rows) =>{
            rows.tag = rows.tag?JSON.parse(rows.tag):null
            rows.event = rows.event?JSON.parse(rows.event):null
            let parms = {
              status : 1,
              result: rows
            }
            res.send(parms);
            res.end( );
            dao.close()
        })
})
app.all('/tellDream/login', function (req, res) {
    const dao = new AppDAO('./database.sqlite3')
    const userRepo = new userRepository(dao)
      userRepo.getByUserAccount(req.body.account)
        .then((rows) =>{
            if(rows && md5(rows.passWord + 'pou') === req.body.password){
              let token = encrypt.encryptedAES(rows.id.toString())
               res.send({token: token});
               res.end( );
               dao.close()
            }else if(rows){
              res.status(401).send({err: '密码不正确！'})
              res.end( );
              dao.close()
            }else {
              res.status(401).send({err: '账号不存在!'})
              res.end( );
              dao.close()
            }
        })
})
app.all('/tellDream/getUserByName', function (req, res) {
    const dao = new AppDAO('./database.sqlite3')
    const userRepo = new userRepository(dao)
      userRepo.getByUserAccount(req.body.account)
        .then((rows) =>{
            if(rows){
               res.send({haveUserIn: true});
               res.end( );
               dao.close()
            }else {
              res.send({haveUser: false})
              res.end( );
              dao.close()
            }
        })
})
app.all('/tellDream/register', function (req, res) {
    const dao = new AppDAO('./database.sqlite3')
    const userRepo = new userRepository(dao)
      userRepo.create({
        account:req.body.account,
        passWord: req.body.passWord
      })
        .then((rows) =>{
          return userRepo.getByUserAccount(req.body.account)
        })
        .then(result => {
          res.send({token: encrypt.encryptedAES(result.id.toString())});
          res.end( );
          dao.close()
        })
})
app.all('/tellDream/getMinMouth', function (req, res) {
    let id = getTokenId(req, res)
    if (!id) {
      return false
    }
    (async function() {
      const dao = new AppDAO('./database.sqlite3')
      const storyRepo = new storyRepository(dao)
      let min = await storyRepo.getMinDate(id)
      let max = await storyRepo.getMaxDate(id)
      if (!min || !max){
        min.minDate = Date.parse(new Date())
        max.maxDate = Date.parse(new Date())
      }
      let parms = {...min, ...max}
      res.send(parms);
      res.end( );
      dao.close()
    })()
})
app.all('/tellDream/createStory', function (req, res) {
    let id = getTokenId(req, res)
    if (!id) {
      return false
    }
    const dao = new AppDAO('./database.sqlite3')
    const storyRepo = new storyRepository(dao)
    let pamars
    if(req.body.type == 'normal'){
      pamars = {
        createTime: req.body.createTime,
        type: req.body.type,
        contents: req.body.content,
        title: req.body.title,
        tag: JSON.stringify( req.body.tag ),
        userId: id
      }
    }else {
      pamars = {
        createTime: req.body.createTime,
        type: req.body.type,
        title: req.body.title,
        background: req.body.background,
        character: req.body.character,
        tag: JSON.stringify( req.body.tag ),
        event: JSON.stringify( req.body.event ),
        userId: id
      }
    }
    storyRepo.create(pamars)
        .then((rows) =>{
            let parms = {
                status : 1,
                result: rows
            }
            res.send(parms);
            res.end( );
            dao.close()
        })
})
app.all('/tellDream/upDateStory', function (req, res) {
    const dao = new AppDAO('./database.sqlite3')
    const storyRepo = new storyRepository(dao)
    let pamars
    if(req.body.type == 'normal'){
      pamars = {
        id: req.body.id,
        createTime: req.body.createTime,
        contents: req.body.content,
        title: req.body.title,
        tag: JSON.stringify( req.body.tag ),
      }
    }else {
      pamars = {
        id: req.body.id,
        createTime: req.body.createTime,
        title: req.body.title,
        background: req.body.background,
        character: req.body.character,
        tag: JSON.stringify( req.body.tag ),
        event: JSON.stringify( req.body.event ),
      }
    }
      storyRepo.update(pamars)
        .then((rows) =>{
            let parms = {
                status : 1,
                result: rows
            }
            res.send(parms);
            res.end( );
            dao.close()
        })
})

function getTokenId(req, res) {
  try {
    return encrypt.decryptedAES(req.cookies.token.toString())
  } catch (err) {
    res.status(402).send({err: '账号有问题请重新登陆'})
    res.end( );
    return false
  }
}
