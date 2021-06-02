const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()


//* Create Tasks 
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
      ...req.body,
      owner: req.user._id
    })
    try {
      await task.save()
      res.status(201).send(task);
    } catch (e) {
      res.status(400).send(e);
    }
  })
  
  //! Get All Tasks
  // router.get('/tasks', auth, async (req, res) => {
  //   try {
  //     // const tasks = await Task.find({ owner: req.user._id })
  //     // res.send(tasks)
  //     await req.user.populate('tasks').execPopulate()
  //     res.send(req.user.tasks)
  //   } catch (e) {
  //     res.status(500).send()
  //   }
  // })

// GET /tasks?completed=true  filter
// GET /tasks?limit=10&skip=20  paginating
// GET /tasks?sortBy=createdAt:desc   sorting
router.get('/tasks', auth, async (req, res) => {
  const match = {}

  // if (req.query.completed) {
  //     match.completed = req.query.completed === 'true'
  // }

  try {
      await req.user.populate({
          path: 'tasks',
          match,
          options: {
              limit: parseInt(req.query.limit),
              // skip: parseInt(req.query.skip),
              sort: {
                completed: 1
              }
          }
      }).execPopulate()
      res.send(req.user.tasks)
  } catch (e) {
      res.status(500).send()
  }
})
  
  // Get one Task
  router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
      // const task = await Task.findById(_id)

      const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task){
          return res.status(404).send()
        }
      res.send(task)
    } catch (e) {
      res.status(500).send()
    }
  
  })
  
 
  // Update task
  router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    const _id = req.params.id
  
    if (!isValidOperation){
      return res.status(400).send({ error: 'Invalid update!' })
    }
    
    try {      
      const task  = await Task.findOne({_id: req.params.id, owner: req.user._id})

          if (!task){
            return res.status(404).send()
          }
      
      updates.forEach((update) => task[update] = req.body[update])
      await task.save()

        res.send(task)
    } catch (e) {
      res.status(500).send()
    }
   
  })
  
  //! Delete Task
  router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
      const task  = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
      // const task = await Task.findByIdAndDelete(_id)
        if (!task){
          return res.status(404).send()
        }
      res.send(task)
    } catch (e) {
      res.status(500).send()
    }
  
  })
  
  module.exports = router 