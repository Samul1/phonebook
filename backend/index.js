require('dotenv').config()
const morgan = require('morgan')
const express = require('express')
const Person = require('./models/person')

const app = express()

app.use(express.json())
morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('dist'))

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then((persons) => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({}).then(count => {
        const currentTime = new Date()
        response.send(
            `<p>Phonebook has info for ${count} people</p>
            <p>${currentTime}</p>`
        )
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({ 
          error: 'name is missing'  
        })
    }  
    else if (!body.number) {
        return response.status(400).json({ 
          error: 'number is missing'  
        })
    } 

    Person.findOne({ content: body.content })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ error: 'name must be unique' })
      }

      const person = new Person({
        content: body.content,
        number: body.number
      })

      return person.save()
    })
    .then(savedPerson => {
      if (savedPerson) response.status(201).json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        if (result) {
            response.status(204).end()
        } else {
            response.status(404).json({ error: 'person not found' })
        }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { content, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { content, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})