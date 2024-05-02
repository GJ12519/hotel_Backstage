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

// 前端客房信息
exports.getguroom = (req, res) => {
    const sql = 'select * from roomtype'
    db.query(sql, (err, results) => {
        if (err) {
            return res.send(err)
        }
        res.cc('获取成功', 200, results)
    })
}

// 前台客户注册
exports.gusregus = async (req, res) => {
    let { password = '123456', name, sex, email, phone, IDCard } = req.body

    // 生成id
    const ID = await generateUniqueRandomNumber(16)
    console.log(ID);
    // 加密
    password = bcryptjs.hashSync(password, 10)

    const sql = 'insert into users (Gus_id,Gus_password,Gus_name,Gender,Email,Phone,IDCard,conditions) values (?,?,?,?,?,?,?,?)'
    db.query(sql, [ID, password, name, sex, email, phone, IDCard, 1], (err, results) => {
        if (err) {
            return res.send(err)
        }
        res.cc('注册成功', 200)
    })
}


// 前台客户登录
exports.roomlogin = (req, res) => {
    const userinfo = req.body
    console.log(userinfo);
    // 定义sql语句
    const sql = 'select * from users where Gus_name = ? and conditions = ?'

    db.query(sql, [userinfo.name, 1], (err, results) => {
        // 执行sql语句失败
        if (err) {
            return res.send(err)
        }
        if (results.length != 1) {
            console.log('账号错误或存在问题，请重新输入');
            return res.cc('账号错误或存在问题，请重新输入', status = 401)
        }
        //判断密码是否正确
        const compareResult = bcryptjs.compareSync(userinfo.password, results[0].Gus_password)
        if (!compareResult) {
            console.log('密码错误，请重新输入！');
            return res.cc('密码错误，请重新输入！', status = 401)
        }

        // 剔除重要信息，生成token字符串
        const users = { ...results[0] }
        console.log(users);
        const tokenStr = jwt.sign(users, config.jwtSecretKey, { expiresIn: config.expiresIn })
        console.log(`${userinfo.name}登录成功`);
        res.send({
            status: 200,
            message: "登录成功",
            token: 'Bearer' + tokenStr,
            users
        })
    })
}

// 前台客户预订
/* 查询该类型客房的剩余客房，获取到列表中的第一客房，将数据放入该客房，然后生成订单 */
exports.roomreserve = async (req, res) => {
    console.log(req.body);
    const { Gus_id, IDCard, etime, stime, name, phone, rt_id } = req.body
    // 查询空余客房的id
    const roomId = await new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM room WHERE isable = 0 and rt_id = ?;'
        let room = []
        db.query(sql, rt_id, (err, results) => {
            if (err) {
                return res.send(err)
            }
            if (results.length === 0) {
                console.log('无该类型的客房');
                return res.cc('无该类型的客服，请更换其他类型的客房', 202)
            } else {
                room = results[0]?.room_id
            }
            console.log('有客房', room, results.length);
            resolve(room)
        })
    })

    console.log(roomId);

    // 进行预订
    await new Promise((resolve, reject) => {
        const sql = 'update room set isable = ?,userID = ?,stime=?,etime=? where room_id = ?'
        db.query(sql, [1, Gus_id, stime, etime, roomId], (err, results) => {
            if (err) {
                return res.send(err)
            }
            console.log('客户预订成功');
            resolve(results)
        })
    })

    // 生成订单
    await new Promise((resolve, reject) => {
        const sql = 'insert into `order` (Gus_id,room_id,isable,stime,etime) values (?,?,?,?,?)'
        db.query(sql, [Gus_id, roomId, 0, stime, etime], (err, results) => {
            if (err) {
                return res.send(err)
            }
            resolve(results)
        })
    })
    res.cc('预订成功', 200, roomId)
}


// 修改客户个人信息
exports.update = async (req, res) => {
    console.log('被修改', req.body);
    const { name, password, sex, phone, email, address, Gus_id } = req.body
    // 密码为*号返回false，为其他返回true
    const pass = password.trim() !== '*'.repeat(password.length)
    console.log(pass);
    // 加密
    let Password = bcryptjs.hashSync(password, 10)


    await new Promise((resolve, reject) => {
        const sql = 'update users set Gus_name = ?,Gus_password = CASE WHEN ? THEN ? ELSE Gus_password END,Gender= ?,Phone = ?,Email=?,Address = ? where Gus_id = ?'
        db.query(sql, [name, pass, Password, sex, phone, email, address, Gus_id], (err, results) => {
            if (err) {
                return res.send(err)
            }
            resolve(results)
        })
    })

    const userinfo = await new Promise((resolve, reject) => {
        const sql = 'select * from users where Gus_id = ?'
        db.query(sql, Gus_id, (err, results) => {
            if (err) {
                return res.send(err)
            }
            resolve(results)
        })
    })
    res.cc('修改成功', 200, userinfo)
}