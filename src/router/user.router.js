// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数的模块
const getuser = require("@/router-handle/user.router")

// 获取员工的信息
router.get('/useradmin', getuser.getallusermsg)

// 添加员工
router.post('/addhusers', getuser.getusers)

// 修改员工信息
router.post('/uphuser', getuser.upuser)

// 员工离职
router.post('/deluse', getuser.delusers)

// 获取角色
router.post('/getroles', getuser.getrole)

// 分配角色
router.post('/addrole', getuser.addrole)

// // 向外共享路由对象
module.exports = router