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

// 查询所有用户的信息  
exports.getallusermsg = async (req, res) => {
    const query = req.query
    let pageNum = parseInt(req.query.pageNum)
    let pageSize = parseInt(req.query.pageSize)
    let result = []
    let total = 0
    console.log(req.query);

    try {
        // 两个查询条件都有的
        if (query.username && query.conditions) {
            const { conditions, username } = query
            result = await new Promise((resolve, reject) => {
                const usernames = `%${username}%`
                const sql = 'SELECT e.*, r.RoleID,r.RoleName,r.desc,r.keys FROM employee e LEFT JOIN employee_role er ON e.EmployeeID = er.EmployeeID LEFT JOIN role r ON er.role_id = r.RoleID where EmployeeName like ? and e.conditions = ? limit ?,?'
                db.query(sql, [usernames, conditions, pageNum - 1, pageSize], (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.send(err)
                    }
                    resolve(results)
                })
            })

            total = await new Promise((resolve, reject) => {
                const usernames = `%${username}%`
                const sql = 'select employee.* from employee where EmployeeName like ? and conditions = ?'
                db.query(sql, [usernames, conditions], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    const totals = results.length
                    resolve(totals)
                })
            })
        }
        // 有一个查询条件的
        else if (query.username || query.conditions) {
            const { conditions, username } = query
            console.log(conditions, username);
            const sql = 'SELECT e.*, r.RoleID,r.RoleName,r.desc,r.keys FROM employee e LEFT JOIN employee_role er ON e.EmployeeID = er.EmployeeID LEFT JOIN role r ON er.role_id = r.RoleID where EmployeeName like ? or e.conditions = ? limit ?,?'
            result = await new Promise((resolve, reject) => {
                const usernames = username == "" ? "" : `%${username}%`
                db.query(sql, [usernames, conditions, pageNum - 1, pageSize], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results)
                })
            })
            total = await new Promise((resolve, reject) => {
                const usernames = `%${username}%`
                const sql = 'select employee.* from employee where EmployeeName like ? or conditions = ?'
                db.query(sql, [usernames, conditions], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    const totals = results.length
                    resolve(totals)
                })
            })
        }
        // 无查询条件的
        else {
            total = await new Promise((resolve, reject) => {
                const sql1 = 'select * from employee'
                db.query(sql1, (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results.length)
                })
            });
            result = await new Promise((resolve, reject) => {
                const sql = 'SELECT e.*, r.RoleID,r.RoleName,r.desc,r.keys FROM employee e LEFT JOIN employee_role er ON e.EmployeeID = er.EmployeeID LEFT JOIN role r ON er.role_id = r.RoleID limit ?,?';
                db.query(sql, [pageNum - 1, pageSize], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    resolve(results)
                })
            });
        }
        // console.log(total, result);
        res.cc('获取成功', 200, { total, result })
    }
    catch (error) {
    }
}

// 添加员工信息
exports.getusers = async (req, res) => {
    const EmployeeID = await generateUniqueRandomNumber(16)
    console.log('id', EmployeeID);
    console.log(req.body);
    let { name, EmployeeName, Password, Phone, email, note, conditions, gender, address, IDCard } = req.body
    console.log(Password);
    Password = bcryptjs.hashSync(Password, 10)
    console.log('密码', Password);

    const sql = 'insert into employee (EmployeeID,name,Password,EmployeeName,Gender,Phone,Address,IDCard,conditions,email) values (?,?,?,?,?,?,?,?,?,?)'
    db.query(sql, [EmployeeID, name, Password, EmployeeName, gender, Phone, address, IDCard, conditions = 1, email], (err, results) => {
        // 执行sql语句失败
        if (err) {
            return res.send(err)
        }
        if (results.affectedRows !== 1) {
            return res.cc('注册用户失败，请稍后再试！')
        }
        res.cc('注册用户成功！', 200)
    })
}

// 修改员工信息
exports.upuser = (req, res) => {
    console.log('修改员工信息');
    const { name, EmployeeName, Password, Phone, email, note, conditions, address, id } = req.body
    console.log(req.body);

    // 密码为*号返回false，为其他返回true
    const pass = Password.trim() !== '*'.repeat(Password.length)
    console.log(pass);

    const sql = 'update employee set name = ?,Password = CASE WHEN ? THEN ? ELSE Password END,EmployeeName = ?,Phone = ?,email=?,Address = ?,conditions = ?,Note = ? where EmployeeID = ?'
    db.query(sql, [name, pass, Password, EmployeeName, Phone, email, address, conditions, note, id], (err, results) => {
        if (err) {
            return res.send(err)
        }
        // console.log(results);
        res.cc('修改成功', 200, results)
    })
}


// 离职
exports.delusers = (req, res) => {
    const { id } = req.body
    console.log('iddd', req.body);
    const sql = 'update employee set conditions = ? where EmployeeID = ?'
    db.query(sql, [-1, id], (err, results) => {
        if (err) {
            return res.send(err)
        }
        res.cc('删除成功', 200)
    })
}

// 分配角色
exports.addrole = async (req, res) => {
    console.log(req.body);
    // console.log(req.body.keys[0]);
    const { keys, id } = req.body

    // 角色id和角色名
    const role = await new Promise((resolve, reject) => {
        const sql = 'select RoleID,RoleName from role where `keys` = ?'
        db.query(sql, keys, (err, results) => {
            if (err) {
                return res.send(err)
            }
            resolve(results)
        })
    })
    console.log('1', role);

    // 查询关联表中是否有该用户
    const role1 = await new Promise((resolve, reject) => {
        const sql = 'select * from employee_role where EmployeeID = ?'
        db.query(sql, id, (err, results) => {
            if (err) {
                return res.send(err)
            }
            resolve(results)
        })
    })
    console.log('2', role1);

    // 无传keys
    if (role.length === 0) {
        // 有该条数据
        if (role1.length !== 0) {
            // 删除关联表中该数据
            await new Promise((resolve, reject) => {
                const sql = 'delete from employee_role where EmployeeID = ?'
                db.query(sql, id, (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('关联表');
                    resolve(results)
                })
            })

            //修改员工职位 
            await new Promise((resolve, reject) => {
                const sql = 'update employee set Position = ? where EmployeeID = ?'
                db.query(sql, ['', id], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('修改职位');
                    resolve(results)
                })
            })
        }
    }
    // 有传keys
    else {
        // 无该条数据
        if (role1.length === 0) {
            // 插入关联表
            await new Promise((resolve, reject) => {
                const sql = 'insert into employee_role (EmployeeID,role_id) values (?,?)'
                db.query(sql, [id, role[0].RoleID], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('插入关联表');
                    resolve(results)
                })
            })
        } else {
            // 修改关联表
            await new Promise((resolve, reject) => {
                const sql = 'update employee_role set role_id = ? where EmployeeID = ?'
                db.query(sql, [role[0].RoleID, id], (err, results) => {
                    if (err) {
                        return res.send(err)
                    }
                    console.log('关联表');
                    resolve(results)
                })
            })
        }

        //修改员工职位 
        await new Promise((resolve, reject) => {
            const sql = 'update employee set Position = ? where EmployeeID = ?'
            db.query(sql, [role[0].RoleName, id], (err, results) => {
                if (err) {
                    return res.send(err)
                }
                console.log('修改职位');
                resolve(results)
            })
        })
    }

    res.cc('分配成功', 200)

}

// 获取角色
exports.getrole = (req, res) => {
    console.log('触发了', req.body);
    const { pageNum, pageSize } = req.body
    console.log(pageNum, pageSize);
    const sql = 'select * from role'
    db.query(sql, (err, results) => {
        if (err) {
            return res.send(err)
        }
        res.cc('角色获取成功', 200, results)
    })
}



// INSERT INTO`employee_role`(`EmployeeID`, `role_id`) VALUES (?, : ?) ON DUPLICATE KEY UPDATE `role_id` = : ?;