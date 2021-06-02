const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


//* Create Users
router.post('/users', async (req, res) => {
    // console.log(req.body);
    const user = new User(req.body)
    try {
      await user.save()
      const token = await user.generateAuthToken()
      res.status(201).send({user, token});
    } catch (e) {
      res.status(400).send(e);
    }  
   
  })

  //? login
  router.post('/users/login', async(req, res) => {

    try{
      const user = await User.findByCredentials(req.body.email, req.body.password)
      const token = await user.generateAuthToken()
      res.send({ user, token})
    }catch (e){
      res.status(400).send()
    }

  })


   //? logout
   router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//! logout from all
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
      req.user.tokens = []
      await req.user.save()
      res.send()
  } catch (e) {
      res.status(500).send()
  }
})
  
  // Get profile User
  router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
  })
  
  // Get one User
  // router.get('/users/:id', async (req, res) => {
  //   const _id = req.params.id
  //   try {
  //     const user = await User.findById(_id)
  //         if (!user){
  //           return res.status(404).send()
  //         }
  //       res.send(user)
  //   } catch (e) {
  //     res.status(500).send()
  //   }
  
  // })
  
  // Update User
  router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email' , 'password' , 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    const _id = req.params.id
  
    if (!isValidOperation){
      return res.status(400).send({ error: 'Invalid update!' })
    }
    
    try {

        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)

    } catch (e) {
      res.status(500).send()
    }
   
  })
  
  //! Delete User
  router.delete('/users/me', auth, async (req, res) => {
    try {
      await req.user.remove()
      res.send(req.user)
    } catch (e) {
      res.status(500).send()
    }
  
  })
  

  module.exports = router 