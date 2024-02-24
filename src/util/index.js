const crypto = require('crypto');

function generateUniqueRandomNumber(length = 8) {
    // 创建一个集合用于存储已生成的随机数
    const uniqueNumbers = new Set();

    // 循环生成随机数，直到生成的随机数是唯一的
    while (true) {
        const bytes = crypto.randomBytes(Math.ceil(length / 2));
        const randomNumber = bytes.toString('hex').slice(0, length);

        // 检查生成的随机数是否已存在于集合中
        if (!uniqueNumbers.has(randomNumber)) {
            // 如果随机数是唯一的，则返回它
            return randomNumber;
        }
    }
}

module.exports = generateUniqueRandomNumber
