const mongoose = require('mongoose');

console.log('MONGO_URI:', process.env.MONGO_URI); // للتحقق من تحميل MONGO_URI
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));