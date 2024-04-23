//导入验证规则的包
const joi = require('joi')

//定义用户名和密码的验证规则
const username = joi.string().alphanum().min(1).max(10).required()
const password = joi.string().pattern(/^[\w]{6,12}$/).required()

// 定义 id, nickname, emial 的验证规则
const userID = joi.string().min(1).required()
const RoleID = joi.number().integer().min(1).required();
const nickname = joi.string().required()
const email = joi.string().email().required()
// dataUri() 指的是如下格式的字符串数据：
// data:image/png;base64,VE9PTUFOWVNFQ1JFVFM=
const avatar = joi.string().dataUri().required()

// 定义客户个人信息的验证规则


//定义验证登录表单数据的规则对象
exports.reg_login_verify = {
    body: {
        username,
        password
    }
}

// 定义验证注册表单数据的规则对象
exports.reg_reguser_verify = {
    bodu: {

    }
}

// 定义验证获取角色信息的规则对象
exports.reg_userid_verify = {
    body: {
        userID
    }
}

// 定义验证获取菜单和权限信息的规则对象
exports.reg_roleid_verify = {
    body: {
        RoleID
    }
}

// 客户注册验证
exports.reg_gus_verify = {

}


// 修改客户信息
// exports.update_gus_verify = {
//     body: {
//         name,
//         password,
//         sex,
//         phone,
//         email,
//         address,
//         ID
//     }
// }