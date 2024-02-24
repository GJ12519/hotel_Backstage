// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数的模块
const userHandler = require('@/router-handle/user.router')

//导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')
//导入需要的验证规则对象
const { reg_login_verify } = require('@/verify/user.verify')


// 登录接口
router.post('/login', expressJoi(reg_login_verify), userHandler.login)

// 注册接口
router.post('/reguser', userHandler.regUser)

// // 向外共享路由对象
module.exports = router