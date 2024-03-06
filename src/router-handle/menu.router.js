//导入数据库操作模块
const db = require('../../db/index')

/* 通过用户id获取菜单信息 */
exports.getMenumessage = (req, res) => {
    const sql = 'select * from menu where MenuID = 1'
    db.query(sql, (err, results) => {
        if (err) {
            console.log("message", err);
        }
        return res.send(results)
        console.log(results);
    })
}