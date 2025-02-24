import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import DBModel from './database';
import { errorHandler } from "./middleware/errorHandler"; // Import error handler

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// --- Swagger Setup ---
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'CRUD API with Express & SQLite',
      version: '1.0.0',
      description: 'A simple CRUD API using Express, SQLite, and TypeScript'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local server'
      }
    ]
  },
  apis: [path.join(__dirname, 'app.ts')]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the item.
 *         description:
 *           type: string
 *           description: Description of the item.
 *       example:
 *         name: "Sample Item"
 *         description: "This is a sample item."
 */

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item.
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: The item was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad Request.
 */
app.post('/items', async (req: Request, res: Response, next: NextFunction ) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  try {
    const existingItem = await DBModel.getItemByName(name);
    if (existingItem) {
      return res.status(400).json({ error: "Item with this name already exists" });
    }

    const itemId = await DBModel.insertItem(name, description || "");
    res.status(201).json({ id: itemId, name, description });
  } catch (error) { 
    next(error); // 👈 Pass error to the next middleware
  }
});

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get a list of items with filters, pagination, and total count.
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by item name (optional).
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filter by item description (optional).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination (optional).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page (optional).
 *     responses:
 *       200:
 *         description: A list of items with pagination and total count.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: The total number of items matching the filter.
 *                 page:
 *                   type: integer
 *                   description: The current page number.
 *                 limit:
 *                   type: integer
 *                   description: The number of items per page.
 *                 totalPages:
 *                   type: integer
 *                   description: The total number of pages.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the item.
 *                       name:
 *                         type: string
 *                         description: The name of the item.
 *                       description:
 *                         type: string
 *                         description: The description of the item.
 *       500:
 *         description: Internal server error.
 */
app.get('/items', async (req: Request, res: Response, next: NextFunction ) => {
  const { name, description, page = "1", limit = "10"  } = req.query;
  
  try {
    const pageNumber = Math.max(1, parseInt(page as string, 10)); // Ensure valid page
    const limitNumber = Math.max(1, parseInt(limit as string, 10)); // Ensure valid limit
    const offset = (pageNumber - 1) * limitNumber;

    const { items, total } = await DBModel.getFilteredItems(
      name as string,
      description as string,
      limitNumber,
      offset
    );

    res.json({
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: items,
    });
  } catch (error: unknown) {
    next(error); // 👈 Pass error to the next middleware
  }
});

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get an item by id.
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The item id.
 *     responses:
 *       200:
 *         description: The item description by id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found.
 */
app.get('/items/:id', async (req: Request, res: Response, next: NextFunction ) => {
  const { id } = req.params;
  try {
    const item = await DBModel.getItemById(Number(id));
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error: unknown) {
    next(error); // 👈 Pass error to the next middleware
  }
});

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item by id.
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The item id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: The updated item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found.
 */
app.put('/items/:id', async (req: Request, res: Response, next: NextFunction ) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {

    // Check if the item exists
    const item = await DBModel.getItemById(Number(id));
    if (!item) {
      // If the item is not found, return a 404 error
      return res.status(404).json({ message: `Item with id ${id} not found` });
    }

    // Check if the item exists with the same name
    const existingItem = await DBModel.getItemByName(name);
    if (existingItem && existingItem.id !== Number(id)) {
      return res.status(400).json({ error: "Another item with this name already exists" });
    }

    await DBModel.updateItem(Number(req.params.id), name, description || "");
    res.json({ message: "Item updated successfully" });
  } catch (error: unknown) {
    next(error); // 👈 Pass error to the next middleware
  }
});

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item by id.
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The item id.
 *     responses:
 *       204:
 *         description: Item deleted successfully.
 *       404:
 *         description: Item not found.
 */
app.delete('/items/:id', async (req: Request, res: Response, next: NextFunction ) => {
  const { id } = req.params;
  try {
    // Check if the item exists
    const item = await DBModel.getItemById(Number(id));
    if (!item) {
      // If the item is not found, return a 404 error
      return res.status(404).json({ message: `Item with id ${id} not found` });
    }
    await DBModel.deleteItem(Number(id));
    res.status(204).json({ message: "Item deleted successfully" });
  } catch (error) {
    next(error); // 👈 Pass error to the next middleware
  }
});

// ✅ Global Error Handling Middleware
app.use(errorHandler);

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;