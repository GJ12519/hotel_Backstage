const db = require('../../db/index')

// 重名校验
exports.namemiddle = async (req, res, next) => {
    console.log('111', req.body);
    const name = await new Promise((resolve, reject) => {
        const sql = 'select * from users where Gus_name = ?'
        db.query(sql, req.body.name, (err, results) => {
            if (err) {
                return res.send(err)
            }
            const len = results.length
            resolve(len)
        })
    })
    console.log(name);
    if (name) {
        // 重名了
        return res.cc('用户名重复，请更换', 401)
    }
    next()
}
