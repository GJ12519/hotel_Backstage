//导入数据库操作模块
const db = require('../../db/index')
//导入bcryptjs
const bcryptjs = require('bcryptjs')
// 导入生成随机id
const generateUniqueRandomNumber = require('@/util/index')
// 导入jwt生成token
const jwt = require('jsonwebtoken')
// 导入密钥
const config = require("../../config")

// 查询所有用户的信息
exports.getallusermsg = (req, res) => {
    // let {}
    const sql =  'select * from employee'
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.send(err)
        }
        res.cc('获取成功', 200, results)
    })
}