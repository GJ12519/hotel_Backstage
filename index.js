// 导入别名设置
require('module-alias/register')
// 导入 express 模块
const express = require('express')
// 创建 express 的服务器实例
const app = express()

//导入joi进行规则校验
const joi = require('@hapi/joi')
// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors())
//解析配置表单数据的中间件，注意:这个中间件只能解析application/x-www-form-urlencoded格式的表单数据
app.use(express.urlencoded({ extended: false }))

//封装res.cc函数
app.use((req, res, next) => {
    res.cc = function (err, status = 1, results) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err,
            results
        })
    }
    next()
})

// 登录获取用户信息
const userRouter = require('@/router/login.router')
app.use('/login', userRouter)

// 用户管理
const getallusemsg = require("@/router/user.router")
app.use('/system', getallusemsg)

// 客户管理
const gusadminRouter = require('@/router/gusadmin.router')
app.use('/guester', gusadminRouter)

// 客房管理
const getroom = require('@/router/room.router')
app.use('/roomadmin', getroom)

//错误中间件
app.use(function (err, req, res, next) {
    //数据验证失败
    if (err instanceof joi.ValidationError)
        return res.send(err)
    // 捕获身份认证失败的错误
    if (err.name === 'UnauthorizedError')
        // return res.send({
        //     status: 1,
        //     message: '身份认证失败！'
        // })
        return res.send('身份认证失败！', err)
    //未知错误
    res.send(err)
})

// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(8088, function () {
    console.log('api server running at http://127.0.0.1:8088')
})