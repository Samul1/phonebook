const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Usage:')
  console.log('  node mongo.js <password> [name] [number]')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://samul1:${password}@cluster0.fydryf2.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  content: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  // Vain salasana annettu: listaa kaikki
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(p => {
      console.log(`${p.content} ${p.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  // Salasana + nimi + numero: lisää uusi
  const person = new Person({
    content: name,
    number: number
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('Error: incorrect number of arguments.')
  mongoose.connection.close()
}