// Load mongoose package
var mongoose = require('mongoose');
// Connect to MongoDB and create/use database called todoAppTest
mongoose.connect('mongodb://localhost:27017/knol1');
// Create a schema
var TodoSchema = new mongoose.Schema({
  name: String,
  completed: Number,
  note: String,
  updated_at: { type: Date, default: Date.now },
});
// Create a model based on the schema
var Tod = mongoose.model('Tod', TodoSchema);


// Create a todo in memory
var todooo = new Tod({name: 'Slave NodeJS', completed: 1});
// Save it to database
todooo.save(function(err){
  if(err)
    console.log(err);
  else
    console.log(todooo);
});
