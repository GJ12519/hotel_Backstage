// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数的模块
const userHandler = require('@/router-handle/login.router')

//导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')

//导入需要的验证规则对象
const { reg_login_verify, reg_userid_verify, reg_roleid_verify } = require('@/verify/user.verify')
// token登录校验
const { verifyAuth } = require('@/authmiddleware')

// 注册接口
router.post('/reguser', userHandler.regUser)

// 登录接口
router.post('/getuser', verifyAuth, expressJoi(reg_login_verify), userHandler.login)

// 获取角色信息
router.post('/getrole', userHandler.getrolemsg)

// 获取菜单信息
router.post('/getmenu', expressJoi(reg_roleid_verify), userHandler.getMenumsg)

// 获取权限信息
router.post('/getpower', expressJoi(reg_roleid_verify), userHandler.getPowermsg)


// 向外共享路由对象
module.exports = router