const AppDAO = require('./dao')
const storyRepository = require('./story/storyRepository')
const userRepository = require('./user/uersRepository')

function databaseMain() {
    const dao = new AppDAO('./../database.sqlite3')
    const storyRepo = new storyRepository(dao)
    const userRepo = new userRepository(dao)
    const sql = storyRepo.createTable() + ';' + userRepo.createTable()
    dao.exec(sql)
      .then((res) => {
        console.log()
        dao.close()
      })
}
module.exports =  databaseMain