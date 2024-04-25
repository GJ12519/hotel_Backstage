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

// 获取角色信息
exports.getrolemsg = (req, res) => {
    console.log('触发了', req.body);
    const { pageNum, pageSize } = req.body
    console.log(pageNum, pageSize);
    const sql = 'select * from role limit ?,?'
    db.query(sql, [pageNum - 1, +pageSize], (err, results) => {
        if (err) {
            return res.send(err)
        }
        res.cc('角色获取成功', 200, results)
    })
}

// 修改角色信息
exports.uprole = (req, res) => {
    console.log('111', req.body);
    const { RoleName, conditions, desc, id } = req.body
    const sql = 'update role set RoleName = ?,conditions = ? , `desc` = ? where RoleID =  ?'
    db.query(sql, [RoleName, conditions, desc, id], (err, results) => {
        if (err) {
            return res.send(err)
        }
        res.cc('修改成功', 200, results)
    })

}