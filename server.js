const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes/api');
require('dotenv').config();

const app = express();

// إعدادات Helmet الشاملة بما فيها Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'https://cdn.freecodecamp.org'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", 'https://stock-price-checker-proxy.freecodecamp.rocks'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true
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
