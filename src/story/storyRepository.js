class storyRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS story (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        contents TEXT,
        createTime INTEGER NOT NULL,
        updateTime INTEGER,
        type TEXT,
        character TEXT DEFAULT NULL,
        background TEXT DEFAULT NULL,
        event TEXT DEFAULT NULL,
        tag TEXT DEFAULT NULL)`
    return sql
    }

    create({title, userId, contents = null, createTime, updateTime = Date.parse(new Date()), type = 'normal', character = null, background = null, event = null, tag = null}) {
        return this.dao.run(
            `INSERT INTO story (title, userId, contents, createTime, updateTime, type, character, background, event, tag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, userId, contents, createTime, updateTime, type, character, background, event, tag])
    }

    update(story) {
        const { title, id, contents = null, updateTime = Date.parse(new Date()), character = null, background = null, event = null, tag = null } = story
        return this.dao.run(
            `UPDATE story
            SET title = ?,
            contents = ?,
            updateTime = ?,
            character = ?,
            background = ?,
            event = ?,
            tag = ?
            WHERE id = ?`,
            [title, contents, updateTime, character, background, event, tag, id]
        )
    }

    delete(id) {
        return this.dao.run(
            `DELETE FROM story WHERE id = ?`,
            [id]
        )
    }

    getById(id) {
        return this.dao.get(
            `SELECT * FROM story WHERE id = ?`,
            [id])
    }
    getMinDate(userId) {
        return this.dao.get(
            `SELECT MIN(createTime) as 'minDate' FROM story where userId = ?`,
            [userId]
        )
    }
    getMaxDate(userId) {
        return this.dao.get(
            `SELECT MAX(createTime) as 'maxDate' FROM story where userId = ?`,
          [userId]
        )
    }
    getByTimes(startTime, endTime, userId) {
        console.log(userId)
        return this.dao.all(
            `SELECT * FROM story WHERE createTime >= ? and createTime <= ? and userId =? ORDER BY createTime DESC`,
            [startTime, endTime, userId])
    }
}

module.exports = storyRepository
