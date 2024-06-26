// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数的模块
const getRoleMessage = require('@/router-handle/role.router')

//导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')

// 获取角色信息
router.post('/getrole', getRoleMessage.getrolemsg)

// 修改角色信息
router.post('/uprole', getRoleMessage.uprole)

// // 向外共享路由对象
module.exports = router