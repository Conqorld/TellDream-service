class userRepository {
  constructor(dao) {
    this.dao = dao
  }
  
  createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account TEXT UNIQUE NOT NULL,
        passWord TEXT NOT NULL,
        token TEXT,
        createTime INTEGER NOT NULL,
        updateTime INTEGER NOT NULL)`
    return sql
  }
  
  create({account, passWord, createTime = Date.parse(new Date()), updateTime = Date.parse(new Date())}) {
    return this.dao.run(
      `INSERT INTO user (account, passWord, createTime, updateTime)
        VALUES (?, ?, ?, ?)`,
      [account, passWord, createTime, updateTime,])
  }
  
  updatePassWord(user) {
    const {id, updateTime = Date.parse(new Date()), passWord} = user
    return this.dao.run(
      `UPDATE user
            SET passWord = ?,
            updateTime = ?,
            WHERE id = ?`,
      [passWord, updateTime, id]
    )
  }
  getByUserAccount(account) {
    return this.dao.get(
      `SELECT * FROM user WHERE account = ?`,
      [account])
  }
  delete(id) {
    return this.dao.run(
      `DELETE FROM user WHERE id = ?`,
      [id]
    )
  }
  
}

module.exports = userRepository