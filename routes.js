const express = require('express')
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
const path = require('path')
const router = express.Router()
const models = require('./models/index')
const { authAdmin } = require('./middlewares/auth')

function sendMail(userMail,info) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'takecareinsurance2018@gmail.com',
            pass: 'wxnykeedpanvsplp'
        },
    });

    const handlebarOptions = {
        viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve('./templates'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./templates'),
        extName: ".handlebars",
    }

    transporter.use('compile', hbs(handlebarOptions));

    // const body = `<h4>Hii ${user.name}</h4>`
    var mailOptions = {
        from: 'takecareinsurance2018@gmail.com',
        to: userMail,
        subject: 'Sending Email using Node.js',
        // html:body
        template: 'email',
        context: {
            // title: 'Hi everyone',
            name: info.name,
            body: info.body,
            // text: "Lorem ipsum dolor sit amet, consectetur..."
        }
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false
            // response.status(400).send(error)
        } else {
            console.log('Email sent: ' + info.response);
            // response.status(200).json('Email sent.')
            return true
        }
    });
}
/** Use to get the list of all user. */
router.get('/allUsers', async (request, response) => {
    await models.User.findAll().then(userResponse => {
        response.status(200).json(userResponse)
    }).catch(error => {
        response.status(400).send(error)
    })
})

/** Use to send the mail to the user. */
router.post('/sendMail', async (request, response) => {
    const admin = await models.User.findOne({
        where: {
            id: request.body.adminId
        }
    })
    if (authAdmin(admin.Role)) {
        if (request.body.userId) {
            request.body.userId.forEach(async (id) => {
                const user = await models.User.findOne({
                    where: {
                        id: id
                    }
                })
                sendMail(user.email,request.body.info) // Function call.
            });
        }
        if (request.body.groupId) {
            const { count, rows } = await models.User.findAndCountAll({
                where: {
                    GroupId: request.body.groupId
                }
            })
            rows.forEach(async (row) => {
                const user = await models.User.findOne({
                    where: {
                        id: row.id
                    }
                })
                sendMail(user.email,request.body.info) // Function call.
            });
        }
        response.status(200).json('Email sent.')
    } else {
        response.status(200).json({
            message: 'Admin has only access to send email.',
            status: 200
        })
    }

})

/** Use to update a entry for user in table. */
router.put('/updateUser/:id', async (request, response, next) => {

    if (request.body.role) {
        response.status(200).json({
            message: 'Cannot update user, update the user without assigning role.',
            status: 200
        })
    } else {
        const user = await models.User.findOne({
            where: {
                id: request.params.id
            }
        })
        const mail = request.body.mail
        const firstname = request.body.firstname
        const lastname = request.body.lastname
        const group = request.body.groupId
        await user.set({
            firstName: firstname,
            lastName: lastname,
            email: mail,
            GroupId: group,
        })
        try {
            await user.save()
            response.status(200).json({
                message: 'User details update succesfully.',
                status: 200
            })
        } catch (error) {
            response.status(400).send(error)
        }
    }
})

/** Use to delete a entry for user in table. */
router.delete('/deleteUser/:id', async (request, response) => {
    const user = await models.User.findOne({
        where: {
            id: request.params.id
        }
    })
    if (user === null) {
        response.status(200).json({
            message: 'No user found.',
            status: 200
        })
    } else {
        try {
            await user.destroy()
            response.status(200).json({
                message: 'User deleted succesfully.',
                status: 200
            })
        } catch (error) {
            response.status(400).send(error)
        }
    }

})

/** Use to add a entry for user in table. */
router.post('/createUser', async (request, response) => {
    const { firstname, lastname, mail, groupId } = request.body

    if (request.body.role) {
        response.status(200).json({
            message: 'Cannot add user, add the user without assigning role.',
            status: 200
        })
    } else {
        const newUser = models.User.create({
            'firstName': firstname,
            'lastName': lastname,
            'email': mail,
            'GroupId': groupId
        })
        try {
            await newUser
            response.status(200).json({
                message: 'User created succesfully.',
                status: 200
            })
        } catch (error) {
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                response.status(400).send({
                    message: 'No such group id present.'
                })
            } else {
                response.status(400).send(error)
            }
        }
    }
})

/** Use to add a entry for group in table. */
router.post('/createGroup', async (request, response) => {
    const name = request.body.name

    const newGroup = models.Group.create({
        'name': name,
    })
    try {
        await newGroup
        response.status(200).json({
            message: 'Group created succesfully.',
            status: 200
        })
    } catch (error) {
        response.status(400).send(error)
    }
})

module.exports = router