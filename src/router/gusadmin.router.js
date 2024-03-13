// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户路由处理函数的模块
const getuser = require("@/router-handle/gusadmin.router")

// 获取客户信息
router.get('/getgusmsg', getuser.getgusmsg)

// 修改客户信息
router.post('/upgusmsg', getuser.UpGusMsg)

// 添加客户信息
router.post('/addgus', getuser.AddGus)

// 向外共享路由对象
module.exports = router