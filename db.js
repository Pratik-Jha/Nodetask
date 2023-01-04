const {Sequelize} = require('sequelize')

const sequelize = new Sequelize(
    'cybercomdb',
    'root',
    '',
    {
        dialect: 'mysql',
        host: 'localhost'
    }
)
const connectToDb = async()=>{
    try{
        await sequelize.authenticate()
        console.log('DB connected successfully.');
    }
    catch(error){
        console.log(error);
    }
}

module.exports = {sequelize,connectToDb}