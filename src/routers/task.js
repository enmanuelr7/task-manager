const express = require('express')
const Task = require('../models/task')
const router = express.Router()
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {

    const task = new Task({ ...req.body, owner: req.user._id })

    try {
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET tasks? sort=createdAt-desc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sort) {
        const sortData = req.query.sort.split('-')
        sort[sortData[0]] = sortData[1] === 'desc' ? -1 : 1
    }

    try {
        const tasks = await Task.find({ ...match, owner: req.user._id })
            .limit(+req.query.limit)
            .skip(+req.query.skip)
            .sort(sort)

        res.send(tasks)
    } catch (e) {
        res.status(500).send(e)
    }

})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) return res.status(404).send()

        res.send(task)
    } catch (e) {
        if (e.kind === "ObjectId") return res.status(400).send(e)
        res.status(500).send(e)
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) return res.status(400).send({ error: 'Invalid Update' })

    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) return res.status(400).send()

        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }

})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
        if (!task) return res.status(400).send()
        res.send(task)
    } catch (e) {
        if (e.kind === "ObjectId") return res.status(400).send(e)
        res.status(500).send(e)
    }
})

module.exports = router