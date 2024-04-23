//导入数据库操作模块
const db = require('../../db/index')
//导入bcryptjs
const bcryptjs = require('bcryptjs')
// 导入生成随机id
const {generateUniqueRandomNumber} = require('@/util/index')
// 导入jwt生成token
const jwt = require('jsonwebtoken')
// 导入密钥
const config = require("../../config")

// 获取用户信息
exports.getgusmsg = async (req, res) => {
    const query = req.query
    // const { pageNum, pageSize } = query
    let pageNum = parseInt(req.query.pageNum)
    let pageSize = parseInt(req.query.pageSize)
    let result = []
    let total = 0
    console.log(query);
    try {
        // 两个都有
        if (query.name && query.conditions) {
            const { conditions, name } = query
            console.log(conditions, name);
            result = await new Promise((resolve, reject) => {
                const names = `%${name}%`
                const sql = 'select users.* from users where Gus_name like ? and conditions = ? limit ?,?'
                db.query(sql, [names, conditions, pageNum - 1, pageSize], (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.send(err)
                    }
                    resolve(results)
                })
            })

            total = await new Promise((resolve, reject) => {
                const names = `%${name}%`
                const sql = 'select users.* from users where Gus_name like ? and conditions = ?'
                db.query(sql, [names, conditions], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    const totals = results.length
                    resolve(totals)
                })
            })

            console.log(result, total);
        }
        // 有一个
        else if (query.name || query.conditions) {
            const { conditions, name } = query
            console.log(conditions, name);
            const sql = 'select users.* from users where Gus_name like ? or conditions = ? limit ?,?'
            result = await new Promise((resolve, reject) => {
                const names = name == "" ? "" : `%${name}%`
                db.query(sql, [names, conditions, pageNum - 1, pageSize], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results)
                })
            })
            total = await new Promise((resolve, reject) => {
                const names = `%${name}%`
                const sql = 'select users.* from users where Gus_name like ? or conditions = ?'
                db.query(sql, [names, conditions], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    const totals = results.length
                    resolve(totals)
                })
            })
        }
        // 都没有
        else {
            total = await new Promise((resolve, reject) => {
                const sql = 'select * from users'
                db.query(sql, (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.send(err)
                    }
                    resolve(results.length)
                })
            });
            const sql = 'select * from users limit ? , ?';
            result = await new Promise((resolve, reject) => {
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
        }
        res.cc('获取成功', 200, { result, total })
    } catch (err) {

    }
}

// 修改客户信息
exports.UpGusMsg = (req, res) => {
    console.log('修改客户信息');
    const { ID, sex, IDCard, name, Password, Phone, email, note, conditions } = req.body
    console.log(Password);

    const sql = 'update users set Gus_name=?,IDCard=?,Gender= ?,Gus_password=?,Phone=?,email=?,note=?,conditions=? where Gus_id=?'
    db.query(sql, [name, IDCard, sex, Password, Phone, email, note, conditions, ID], (err, results) => {
        if (err) {
            return res.send(err)
        }
        console.log(results);
        res.send(results)
    })
}

// 添加客户信息
exports.AddGus = async (req, res) => {
    console.log('添加客户信息');
    console.log(req.body);
    const ID = await generateUniqueRandomNumber(16)
    console.log(ID);

    let { name, sex, Password = '123456', IDCard, Phone, conditions = 1, email = "", note = "" } = req.body
    Password = bcryptjs.hashSync(Password, 10)

    const sql = 'insert into users (Gus_id,Gus_password,Gus_name,Gender,Email,Phone,IDCard,conditions,note) values (?,?,?,?,?,?,?,?,?)'
    db.query(sql, [ID, Password, name, sex, email, Phone, IDCard, conditions, note], (err, results) => {
        if (err) {
            console.log(err);
            return res.send(err)
        }
        res.cc('添加成功', 200, results)
    })
}