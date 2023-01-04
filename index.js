const express = require('express');
const apiRoutes = require('./routes')
const {sequelize,connectToDb} = require('./db')
// const bodyParser = require('body-parser');

const app = express()
const PORT = process.env.port || 5220

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use('/api',apiRoutes)

app.listen(PORT, async ()=>{
    console.log(`App is runnig on http://localhost:${PORT}`);
    await connectToDb()
})