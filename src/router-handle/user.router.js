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
exports.getallusermsg = async (req, res) => {
    try {
        let pageNum = parseInt(req.query.pageNum)
        let pageSize = parseInt(req.query.pageSize)
        console.log(req.query);

        const sql1 = 'select * from employee'

        const total = await new Promise((resolve, reject) => {
            db.query(sql1, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.send(err)
                }
                resolve(results.length)
            })
        });

        console.log(total);

        const sql = pageNum ? 'select * from employee limit ? , ?' : 'select * from employee';
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [pageNum - 1, pageSize], (err, results) => {
                if (err) {
                    console.log(err);
                    return res.send(err)
                }
                // console.log(results);
                // res.cc('获取成功', 200, results)
                resolve(results)
            })
        });
        // console.log(total, result);
        res.cc('获取成功', 200, { total, result })
    }
    catch (error) {
    }
}