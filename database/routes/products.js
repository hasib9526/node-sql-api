const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the product
 *         name:
 *           type: string
 *           description: Name of the product
 *         price:
 *           type: number
 *           format: double
 *           description: Price of the product
 *         description:
 *           type: string
 *           description: Product description
 *       example:
 *         id: 1
 *         name: Laptop
 *         price: 75000
 *         description: High performance laptop
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products in ascending order by id
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT id, name, price,qty, description FROM Products ORDER BY id ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Products WHERE id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).send('Product not found');
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/', async (req, res) => {
    try {
        const { name, price, description ,qty} = req.body;
        
        if (!name || !price || !qty) {
            return res.status(400).send('Name and price are required');
        }
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(10,2), price)
            .input('qty', sql.Int, qty)
            .input('description', sql.NVarChar, description || '')
            .query('INSERT INTO Products (name, price, description,qty) VALUES (@name, @price, @description,@qty); SELECT SCOPE_IDENTITY() as id');
        
        res.status(201).json({
            message: 'Product created successfully',
            id: result.recordset[0].id
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, price, description ,qty} = req.body;
        const productId = req.params.id;
        
        if (!name || !price || !qty) {
            return res.status(400).send('Name and price are required');
        }
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, productId)
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(10,2), price)
            .input('qty', sql.Int, qty)
            .input('description', sql.NVarChar, description || '')
            .query('UPDATE Products SET name = @name, price = @price, description = @description,qty=@qty WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Product not found');
        }
        
        res.send('Product updated successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Products WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).send('Product not found');
        }
        
        res.send('Product deleted successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
