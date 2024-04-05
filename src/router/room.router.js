// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数的模块
const getroom = require("@/router-handle/room.router")

// 获取客房信息
router.get('/getroommsg', getroom.roommsg)

// 根据用户id获取信息
router.post('/getroomuse', getroom.getroomuse)

// 预定
router.post('/reserve', getroom.reserve)

// 入住
router.post('/checkin', getroom.checkin)



// 向外共享路由对象
module.exports = router