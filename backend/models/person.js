const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)

    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
  content: {
    type: String,
    minlength: [3, 'Name must be at least 3 characters'],
    required: [true, 'Name is required']
  },
  number: {
    type: String,
    required: [true, 'Number is required'],
    minlength: [8, 'Number must be at least 8 characters'],
    validate: {
      validator: function(v) {
        // säännöllinen lauseke: 2–3 numeroa, väliviiva, väh. 4 numeroa
        return /^\d{2,3}-\d{4,}$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number (format must be xx-xxxx or xxx-xxxx)`
    }
  }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)