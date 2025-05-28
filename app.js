const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const adsRouter = require('./routes/ads');
const path = require('path');


const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'A simple API for a blog application',
      contact: {
        name: 'Jakub Złotek, Oskar Sadkowski, Maciej Pieprzyk'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          name: 'Authorization',
        }
      }
    }
  },


  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);
app.use('/api/posts', likeRoutes);
app.use('/api/ads', adsRouter);


app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running!' });
});

const port = process.env.PORT || 3000;
if (require.main === module) {

  app.listen(port, () => {
    console.log(`Server running on port ${port}\nhttp://localhost:${port}\nAPI: http://localhost:${port}/api-docs`);
  });
}

module.exports = app;