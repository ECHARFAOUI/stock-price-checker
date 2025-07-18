const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes/api');
require('dotenv').config();

const app = express();

// إعدادات Helmet الصحيحة لاجتياز اختبار Content-Security-Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    },
  })
);

// إعدادات CORS
app.use(cors({ origin: '*' }));

// إعدادات أخرى
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// المسارات الخاصة بـ /api
app.use('/api', routes);

// إضافة مسارات الاختبار
require('./routes/fcctesting.js')(app);

// معالجة 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error' });
});

// الاتصال بقاعدة البيانات MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// تشغيل الخادم
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
