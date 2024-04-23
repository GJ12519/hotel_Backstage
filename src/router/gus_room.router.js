// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数的模块
const getroom = require("@/router-handle/gus_room.router")

// 导入中间件
const authMiddleware = require("@/authmiddleware/index")

// 获取订单信息
router.get('/room', getroom.getguroom)

// 客户注册
router.post('/regues', authMiddleware.namemiddle, getroom.gusregus)

// 客户登录
router.post('/login', getroom.roomlogin)

// 客户预订
router.post('/reserve', getroom.roomreserve)

// 客户修改个人信息
router.post('/update', getroom.update)

// 向外共享路由对象
module.exports = router