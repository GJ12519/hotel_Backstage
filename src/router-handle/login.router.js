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


// 添加用户的函数    用户注册
exports.regUser = async (req, res) => {
    const EmployeeID = await generateUniqueRandomNumber(16)
    console.log(EmployeeID);
    let { password, username, gender, birthday, phone, address, idcard, name } = req.body
    password = bcryptjs.hashSync(password, 10)

    const sql = 'insert into employee (EmployeeID,name,Password,EmployeeName,Gender,Phone,Address,IDCard,conditions) values (?,?,?,?,?,?,?,?,?)'
    db.query(sql, [EmployeeID, name, password, username, gender, phone, address, idcard, conditions = 1], (err, results) => {
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
// 无token验证处理,后续需改进
exports.login = (req, res) => {
    const userinfo = req.body
    console.log(userinfo);
    // 定义sql语句
    const sql = 'select * from employee where EmployeeName = ? and conditions = ?'

    db.query(sql, [userinfo.username, 1], (err, results) => {
        // 执行sql语句失败
        if (err) {
            return res.send(err)
        }
        if (results.length != 1) {
            console.log('账号错误，请重新输入');
            return res.cc('账号有问题，请重新输入', status = 401)
        }
        //判断密码是否正确
        const compareResult = bcryptjs.compareSync(userinfo.password, results[0].Password)
        if (!compareResult) {
            console.log('密码错误，请重新输入！');
            return res.cc('密码错误，请重新输入！', status = 401)
        }

        // 剔除重要信息，生成token字符串
        const users = { ...results[0], Password: '' }
        const tokenStr = jwt.sign(users, config.jwtSecretKey, { expiresIn: config.expiresIn })
        console.log(`${userinfo.username}登录成功`);
        res.send({
            status: 200,
            message: "登录成功",
            token: 'Bearer ' + tokenStr,
            users
        })
    })
}

/* 通过用户id获取角色信息 */
exports.getrolemsg = (req, res) => {
    const ID = req.body.userID
    // console.log(ID);
    const sql = 'select role.* from role inner join employee_role on role.RoleID = employee_role.role_id where employee_role.EmployeeID = ?'
    db.query(sql, ID, (err, results) => {
        if (err) {
            console.log(err);
            return res.send(err)
        }
        console.log('获取角色信息成功');
        res.cc('获取成功', 200, results)
    })
}

/* 通过角色id获取菜单信息 */
exports.getMenumsg = (req, res) => {
    const ID = req.body.RoleID
    const sql = 'select menu.* from menu inner join rolemenu on menu.MenuID = rolemenu.MenuID where rolemenu.RoleID = ?'
    db.query(sql, ID, (err, results) => {
        if (err) {
            console.log("message", err);
            return res.send(err)
        }
        console.log('获取菜单信息成功');
        res.cc('获取成功', 200, results)
    })
}

/* 通过角色id获取权限信息 */
exports.getPowermsg = (req, res) => {
    const ID = req.body.RoleID
    const sql = 'select permission.* from permission inner join rolepermission on permission.PermissionID = rolepermission.PermissionID where rolepermission.RoleID = ?'
    db.query(sql, ID, (err, results) => {
        if (err) {
            console.log("message", err);
            return res.send(err)
        }
        console.log('获取权限信息成功');
        res.cc('获取成功', 200, results)
    })
}
