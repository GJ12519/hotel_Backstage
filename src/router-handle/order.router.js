//导入数据库操作模块
const db = require('../../db/index')
//导入bcryptjs
const bcryptjs = require('bcryptjs')
// 导入生成随机id
const { generateUniqueRandomNumber, isNumberOnly } = require('@/util/index')
// 导入jwt生成token
const jwt = require('jsonwebtoken')
// 导入密钥
const config = require("../../config")

// 获取订单
exports.getordermsg = async (req, res) => {
    const query = req.query
    let pageNum = parseInt(req.query.pageNum)
    let pageSize = parseInt(req.query.pageSize)
    console.log('获取成功111', query, pageNum, pageSize);
    let total = 0
    let result = []

    try {
        // 两个查询条件都有
        if (query.name && query.conditions) {
            const { conditions, name } = query
            console.log(conditions, name);
            // 判断是订单号查询还是用户名查询
            if (isNumberOnly(name)) {
                // 该查询为订单号查询
                result = await new Promise((resolve, reject) => {
                    const sql = 'SELECT `order`.*, roomtype.*,users.Gus_name,users.Phone,users.IDCard FROM `order` INNER JOIN room ON `order`.room_id = room.room_id INNER JOIN users ON `order`.Gus_id = users.Gus_id INNER JOIN roomtype ON room.rt_id = roomtype.rt_id where order_id = ? and `order`.isable = ? limit ?,?;'
                    db.query(sql, [name, conditions, pageNum - 1, pageSize], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        resolve(results)
                    })
                })
                total = result.length
            } else {
                // 根据客户名查询
                result = await new Promise((resolve, reject) => {
                    const names = `%${name}%`
                    const sql = 'SELECT `order`.*, roomtype.*,users.Gus_name,users.Phone,users.IDCard FROM `order` INNER JOIN room ON `order`.room_id = room.room_id INNER JOIN users ON `order`.Gus_id = users.Gus_id INNER JOIN roomtype ON room.rt_id = roomtype.rt_id where Gus_name like ? and `order`.isable = ? limit ?,?;'
                    db.query(sql, [name, conditions, pageNum - 1, pageSize], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        resolve(results)
                    })
                })
                total = result.length
            }
        }
        // 单个条件查询
        else if (query.name || query.conditions) {
            const { conditions, name } = query
            console.log(conditions, name);
            // 有状态
            if (conditions) {
                const sql = 'SELECT `order`.*, roomtype.*,users.Gus_name,users.Phone,users.IDCard FROM `order` INNER JOIN room ON `order`.room_id = room.room_id INNER JOIN users ON `order`.Gus_id = users.Gus_id INNER JOIN roomtype ON room.rt_id = roomtype.rt_id where `order`.isable = ? limit ?,?;'
                result = await new Promise((resolve, reject) => {
                    db.query(sql, [conditions, pageNum - 1, pageSize], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        resolve(results)
                    })
                })
            }
            // 无状态，则有name
            else {
                if (isNumberOnly(name)) {
                    // 该查询为订单号查询
                    result = await new Promise((resolve, reject) => {
                        const sql = 'SELECT `order`.*, roomtype.*,users.Gus_name,users.Phone,users.IDCard FROM `order` INNER JOIN room ON `order`.room_id = room.room_id INNER JOIN users ON `order`.Gus_id = users.Gus_id INNER JOIN roomtype ON room.rt_id = roomtype.rt_id where order_id = ? limit ?,?;'
                        db.query(sql, [name, pageNum - 1, pageSize], (err, results) => {
                            if (err) {
                                return res.send(err)
                            }
                            resolve(results)
                        })
                    })
                    total = result.length
                } else {
                    // 根据客户名查询
                    result = await new Promise((resolve, reject) => {
                        const names = `%${name}%`
                        const sql = 'SELECT `order`.*, roomtype.*,users.Gus_name,users.Phone,users.IDCard FROM `order` INNER JOIN room ON `order`.room_id = room.room_id INNER JOIN users ON `order`.Gus_id = users.Gus_id INNER JOIN roomtype ON room.rt_id = roomtype.rt_id where Gus_name like ? limit ?,?;'
                        db.query(sql, [name, pageNum - 1, pageSize], (err, results) => {
                            if (err) {
                                return res.send(err)
                            }
                            resolve(results)
                        })
                    })
                    total = result.length
                }
            }
        }
        // 全查询
        else {
            // 订单数量
            total = await new Promise((resolve, reject) => {
                const sql1 = 'select * from `order`'
                db.query(sql1, (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results.length)
                })
            })

            console.log('total', total);

            result = await new Promise((resolve, reject) => {
                const sql2 = 'SELECT `order`.*, roomtype.*,users.Gus_name,users.Phone,users.IDCard FROM `order` INNER JOIN room ON `order`.room_id = room.room_id INNER JOIN users ON `order`.Gus_id = users.Gus_id INNER JOIN roomtype ON room.rt_id = roomtype.rt_id limit ?,?;'
                db.query(sql2, [pageNum - 1, pageSize], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results)
                })
            })
        }

        res.cc('获取成功', 200, { total, result })
    } catch {
        console.log('出错');
    }
}

// 订单搜索
