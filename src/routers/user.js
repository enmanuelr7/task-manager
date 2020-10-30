const express = require('express')
const multer = require('multer')
const User = require('../models/user')
const router = express.Router()
const auth = require('../middleware/auth')

// create user
router.post('/users', async (req, res) => {

    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

})

// retireve own user
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// retrieve single user
// This endpoint is not used but I leave it as an example
router.get('/users/:id', async (req, res) => {

    const id = req.params.id

    try {
        const user = await User.findById(id)
        if (!user) return res.status(400).send({ message: `object with _id ${id} not found` })
        res.send(user)
    } catch (e) {
        if (e.kind === "ObjectId") return res.status(400).send(e)
        res.status(500).send(e)
    }

})

// update user
router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) return res.status(400).send({ error: 'Invalid Update' })

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        if (e.kind === "ObjectId") return res.status(400).send(e)
        res.status(500).send(e)
    }

})

// delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// login user
router.post('/users/login', async (req, res) => {
    try {
        // findByCredentials is a custom method created in the User model
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

// logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// logout user from all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// upload profile avatar
const upload = multer({
    dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('file should be an image of type JPG, JPEG or PNG'))
        }

        cb(null, true)
    }
})
router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

module.exports = router