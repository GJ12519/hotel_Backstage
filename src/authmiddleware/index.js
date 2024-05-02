const config = require('../../config');
const db = require('../../db/index')

// 重名校验
exports.namemiddle = async (req, res, next) => {
    console.log('111', req.body);
    const name = await new Promise((resolve, reject) => {
        const sql = 'select * from users where Gus_name = ?'
        db.query(sql, req.body.name, (err, results) => {
            if (err) {
                return res.send(err)
            }
            const len = results.length
            resolve(len)
        })
    })
    console.log(name);
    if (name) {
        // 重名了
        return res.cc('用户名重复，请更换', 401)
    }
    next()
}
//验证授权
exports.verifyAuth = async (req, res, next) => {
    console.log(req.headers['authorization'], 111111);
    const authorization = req.headers['authorization']
    if (authorization) {
        // if (!authorization) {
        //   const err = new Error(UNAUTHORIZATION)
        //   ctx.app.emit('error', err, ctx)
        //   return;
        // }
        const token = authorization.replace('Bearer ', '')
        if (!token) return res.status(401).send('Access Denied');
        try {
            jwt.verify(token, config.jwtSecretKey, (err, user) => {
                if (err) return res.status(500).send('Failed to authenticate token.');
                req.user = user; // 将用户信息附加到请求对象上，以便在其他路由处理程序中使用  
                next(); // 继续执行下一个中间件或路由处理程序  
            });
        } catch (error) {
        }
    }
    next(); // 继续执行下一个中间件或路由处理程序  
}