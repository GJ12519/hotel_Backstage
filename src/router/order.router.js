// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数的模块
const getOrder = require("@/router-handle/order.router")

// 获取订单信息
router.get('/order', getOrder.getordermsg)


// 向外共享路由对象
module.exports = router