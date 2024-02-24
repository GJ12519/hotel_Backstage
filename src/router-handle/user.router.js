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


// 添加用户的函数    用户注册
exports.regUser = async (req, res) => {
    const EmployeeID = await generateUniqueRandomNumber(16)
    console.log(EmployeeID);
    let { password, username, gender, birthday, phone, address, idcard, } = req.body
    password = bcryptjs.hashSync(password, 10)

    const sql = 'insert into employee (EmployeeID,Password,EmployeeName,Gender,Phone,Address,IDCard,Status) values (?,?,?,?,?,?,?,?)'
    db.query(sql, [EmployeeID, password, username, gender, phone, address, idcard, Status = 1], (err, results) => {
        // 执行sql语句失败
        if (err) {
            return res.send(err)
        }
        if (results.affectedRows !== 1) {
            return res.cc('注册用户失败，请稍后再试！')
        }
        res.cc('注册用户成功！', 0)
    })
}

// 用户登录的处理函数    用户登录
// 无加密,token验证处理,后续需改进
exports.login = (req, res) => {
    const userinfo = req.body
    // 定义sql语句
    const sql = 'select * from employee where EmployeeName = ?'

    db.query(sql, userinfo.username, (err, results) => {
        // 执行sql语句失败
        if (err) {
            return res.send(err)
        }
        if (results.length != 1) {
            return res.send('账号错误，请重新输入')
        }
        //判断密码是否正确
        const compareResult = bcryptjs.compareSync(userinfo.password, results[0].Password)
        if (!compareResult) {
            return res.send('密码错误，请重新输入！')
        }

        // 剔除重要信息，生成token字符串
        const users = { ...results[0], Password: '', IDCard: '' }
        const tokenStr = jwt.sign(users, config.jwtSecretKey, { expiresIn: config.expiresIn })
        res.send({
            status: 0,
            message: '登录成功！',
            token: tokenStr,
            userid: results[0].EmployeeID
        })
    })
}