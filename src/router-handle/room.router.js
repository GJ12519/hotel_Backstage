//导入数据库操作模块
const db = require('../../db/index')
//导入bcryptjs
const bcryptjs = require('bcryptjs')
// 导入生成随机id
const { generateUniqueRandomNumber } = require('@/util/index')
// 导入jwt生成token
const jwt = require('jsonwebtoken')
// 导入密钥
const config = require("../../config")

// 获取客房信息
exports.roommsg = (req, res) => {
    console.log('客房数据获取成功');
    const sql = 'select r.*,u.Gus_name,u.Phone,u.IDCard from room r left join users u on r.userID = u.Gus_id where r.userID is null or r.userID !="" ORDER BY room_id'
    // const sql = 'select room.* from room'
    db.query(sql, (err, results) => {
        if (err) {
            return res.send(err)
        }
        res.cc('获取成功', 200, results)
    })
}


// 根据用户id获取用户信息
exports.getroomuse = (req, res) => {
    console.log(req.body);
    const id = req.body
    const ID = Object.keys(id)
    console.log(ID);
    console.log('1111');
    const sql = "select Gus_name,Phone,IDCard from users where Gus_id = ?"
    db.query(sql, ID, (err, results) => {
        if (err) {
            return res.send(err)
        }
        res.cc('获取成功', 200, results)
    })
}

// 预定
exports.reserve = async (req, res) => {
    const data = req.body
    const { IDCard, name, conditions, etime, stime, phone, room } = data
    console.log(data, stime, etime);
    try {
        // 查询该客户，如果不存在，则添加，存在则返回信息
        const IDD = await new Promise((resolve, reject) => {
            const sql1 = 'select Gus_id,conditions from users where IDCard = ?'
            db.query(sql1, IDCard, (err, results) => {
                if (err) {
                    return res.send(err)
                }
                resolve(results)
            })
        })

        console.log('获取到的id', IDD);
        // 空表示无此人，则进行注册
        if (IDD.length === 0) {
            console.log('22');
            const ID = await generateUniqueRandomNumber(16)
            const note = "系统注册"
            let password = bcryptjs.hashSync("123456", 10)

            /* 空用户进行注册 */
            const sql2 = 'insert into users (Gus_id,Gus_name,IDCard,Gus_password,Phone,conditions,note) values (?,?,?,?,?,?,?)'
            await new Promise((resolve, reject) => {
                db.query(sql2, [ID, name, IDCard, password, phone, 1, note], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('进行注册', results);
                    resolve(results)
                })
            })
            /* 注册完成直接进行预定 */
            await new Promise((resolve, reject) => {
                const sql3 = 'update room set isable = ?,userID = ?,stime=?,etime=? where room_id = ?'
                db.query(sql3, [1, ID, stime, etime, room], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('直接进行预定');
                    // return res.cc('预定成功', 200, results)
                    resolve(results)
                })
            })
            // 生成订单
            await new Promise((resolve, reject) => {
                const sql = 'insert into `order` (Gus_id,room_id,isable,stime,etime) values (?,?,?,?,?)'
                db.query(sql, [ID, room, 0, stime, etime], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    // resolve(results)
                    return res.cc('预订成功', 200, results)
                })
            })
        }
        // 确认预定 
        else if (IDD[0].conditions === 1) {
            const IDD1 = IDD[0].Gus_id
            if (conditions == 1) {
                console.log('2233', IDD[0].Gus_id);
                // 确认预订
                await new Promise((resolve, reject) => {
                    const sql4 = 'update room set isable = ?,userID = ?,stime=?,etime=? where room_id = ?'
                    db.query(sql4, [1, IDD1, stime, etime, room], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        console.log('确认预定的预定成功');
                        resolve(results)
                        // return res.cc('预定成功', 200, results)
                    })
                })
                // 生成订单
                await new Promise((resolve, reject) => {
                    const sql = 'insert into `order` (Gus_id,room_id,isable,stime,etime) values (?,?,?,?,?)'
                    db.query(sql, [IDD1, room, 0, stime, etime], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        // resolve(results)
                        res.cc('预订成功', 200, results)
                    })
                })
            }
            // 取消预定
            else if (conditions == -1) {
                const sql5 = 'update room set isable = ?,userID = ?,stime=?,etime=? where room_id = ?'
                await new Promise((resolve, reject) => {
                    db.query(sql5, [0, null, stime, etime, room], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        console.log('取消预定');
                        // return res.cc('取消预定成功', 200, results)
                        resolve(results)
                    })
                })
                // 删除订单
                await new Promise((resolve, reject) => {
                    const sql = 'update `order` set isable = ? where Gus_id = ? and room_id = ?'
                    db.query(sql, [-1, IDD1, room], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        resolve(results)
                        console.log('删除成功');
                        return res.cc('取消预定成功', 200, results)
                    })
                })
                console.log('2');
            }
        } else if (IDD[0].conditions == -1) {
            console.log('存在问题');
            return res.cc('该客户账号存在问题', 401)
        }
    } catch (error) {
        console.log(error);
    }
}

// 入住   
exports.checkin = async (req, res) => {
    const data = req.body
    const { IDCard, name, conditions, etime, stime, phone, room } = data
    console.log(data, stime, etime);
    try {
        // 查询该客户，如果不存在，则添加，存在则返回信息
        const IDD = await new Promise((resolve, reject) => {
            const sql1 = 'select Gus_id from users where IDCard = ?'
            db.query(sql1, IDCard, (err, results) => {
                if (err) {
                    return res.send(err)
                }
                resolve(results)
            })
        })

        console.log('获取到的id', IDD);
        // 空表示无此人，则进行注册
        if (IDD.length === 0) {
            console.log('22');
            const ID = await generateUniqueRandomNumber(16)
            const note = "系统注册"
            let password = bcryptjs.hashSync("123456", 10)

            /* 空用户进行注册 */
            await new Promise((resolve, reject) => {
                const sql2 = 'insert into users (Gus_id,Gus_name,IDCard,Gus_password,Phone,conditions,note) values (?,?,?,?,?,?,?)'
                db.query(sql2, [ID, name, IDCard, password, phone, 1, note], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('进行注册', results);
                    resolve(results)

                })
            })
            /* 注册完成直接进行入住 */
            await new Promise((resolve, reject) => {
                const sql3 = 'update room set isable = ?,userID = ?,stime=?,etime=? where room_id = ?'
                db.query(sql3, [2, ID, stime, etime, room], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('直接进行入住');
                    resolve(results)
                    // return res.cc('入住成功', 200, results)
                })
            })
            // 空用户可以直接生成订单
            await new Promise((resolve, reject) => {
                const sql = 'insert into `order` (Gus_id,room_id,isable,stime,etime) values (?,?,?,?,?)'
                db.query(sql, [ID, room, 1, stime, etime], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results)
                    return res.cc('入住成功', 200, results)
                })
            })
        }
        // 确认入住
        else if (conditions == 1) {
            console.log('2233', IDD[0].Gus_id);
            const IDD1 = IDD[0].Gus_id
            await new Promise((resolve, reject) => {
                const sql4 = 'update room set isable = ?,userID = ?,stime=?,etime=? where room_id = ?'
                db.query(sql4, [2, IDD1, stime, etime, room], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('入住成功');
                    resolve(results)
                    // return res.cc('入住成功', 200, results)
                })
            })

            // 入住的话需要判断是否已有预订订单，有则修改无则生成
            const orderexist = await new Promise((resolve, reject) => {
                const sql = 'select * from `order` where Gus_id = ? and room_id = ? and isable = ?'
                db.query(sql, [IDD1, room, 0], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results)
                })
            })
            console.log(orderexist);

            // 无订单，则生成
            if (orderexist.length === 0) {
                // 生成订单
                await new Promise((resolve, reject) => {
                    const sql = 'insert into `order` (Gus_id,room_id,isable,stime,etime) values (?,?,?,?,?)'
                    db.query(sql, [IDD1, room, 1, stime, etime], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        resolve(results)
                        return res.cc('入住成功', 200, results)
                    })
                })
            } else {
                // 修改订单
                await new Promise((resolve, reject) => {
                    const sql = 'update `order` set isable = ? where Gus_id = ? and room_id = ?'
                    db.query(sql, [1, IDD1, room], (err, results) => {
                        if (err) {
                            return res.send(err)
                        }
                        resolve(results)
                        return res.cc('入住成功', 200, results)
                    })
                })
            }
        }
        // 退房
        else if (conditions == -1) {
            await new Promise((resolve, reject) => {
                const sql5 = 'update room set isable = ?,userID = ?,stime=?,etime=? where room_id = ?'
                db.query(sql5, [0, null, stime, etime, room], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('退房');
                    resolve(results)
                    // return res.cc('退房', 200, results)
                })
            })

            // 完成订单
            await new Promise((resolve, reject) => {
                const IDD1 = IDD[0].Gus_id
                const sql = 'update `order` set isable = ? where Gus_id = ? and room_id = ?'
                db.query(sql, [2, IDD1, room], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results)
                    console.log('删除成功');
                    return res.cc('取消预定成功', 200, results)
                })
            })
        }
    } catch (error) {
        console.log(error);
    }
}