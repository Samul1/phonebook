const http = require('http')    // ottaa käyttöön Noden sisäänrakennetun 
const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('dist'))

let persons = [
    {
        id: "1",
        content: "Arto Hellas",
        number: "040-123456"
    },  
    {   
        id: "2",
        content: "Ada Lovelace",
        number: "39-44-5323523"
    },  
    {   
        id: "3",
        content: "Dan Abramov",
        number: "12-43-234345"
    },
    {   
        id: "4",
        content: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]

const generateId = () => {
    let randId = 1
    let iterations = 0
    while(persons.some(person => person.id === String(randId)) || iterations === 100000000){
        randId = Math.floor(Math.random() * 100000000) // satunnais luku välillä 0-99999999
        iterations += 1
    }
    return String(randId)
}

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    const currentTime = new Date()
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${currentTime}</p>`
    )
})

app.post('/api/persons', (request, response) => {
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

    const nameExists = persons.some(person => person.content === body.content)
    if (nameExists) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    } 
    const person = {
        id: generateId(),
        content: body.content,
        number: body.number
    }
    persons = persons.concat(person)
    response.status(201).json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
  const initialLength = persons.length
  persons = persons.filter(person => person.id !== id)

  if (persons.length < initialLength) {
    response.status(204).end({error: 'person deleted'})
  } else {
    response.status(404).json({ error: 'person not found' })
  }
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})