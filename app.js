const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./database/routes/products');

// Swagger setup
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '172.16.13.29'; // তোমার IP

// Middleware
app.use(cors());
app.use(express.json());

// Swagger options
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Products API',
            version: '1.0.0',
            description: 'CRUD API for Products',
        },
        servers: [
            { url: `http://${HOST}:${PORT}` },
            { url: `http://localhost:${PORT}` },
        ],
    },
    apis: ['./database/routes/*.js'], // আপনার routes directory
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/products', productRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Node.js with SQL Server CRUD API is running!');
});

// 404 Middleware
app.use((req, res, next) => {
    res.status(404).send('Route not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
