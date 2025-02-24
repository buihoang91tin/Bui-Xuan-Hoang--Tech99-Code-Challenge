import request from 'supertest';
import app from './app';
import sqlite3 from 'sqlite3';

// Use in-memory database for tests
const DB_PATH = ':memory:'; // Use an in-memory SQLite database for testing
const db = new sqlite3.Database(DB_PATH);

describe('CRUD API Endpoints', () => {
  let createdItemId: number;

  // Clean up the items table before running tests
  beforeAll((done) => {
    // Create table for testing (in-memory DB does not persist)
    db.serialize(() => {
      db.run('CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT)', done);
    });
  });

  // Test creating an item
  it('should create a new item', async () => {
    const res = await request(app)
      .post('/items')
      .send({
        name: "Test Item",
        description: "A test item for Jest"
      });

    // Ensure response is correct
    expect(res.status).toBe(201); // Created status
    expect(res.body).toHaveProperty('id'); // Item should have an id
    expect(res.body.name).toBe("Test Item"); // Name should be correct
    createdItemId = res.body.id; // Store the created item ID for further tests
  });

  // Test listing items
  it('should list items with filters and pagination', async () => {
    const res = await request(app).get('/items')
      .query({ limit: 2, page: 1, name: '' });

    // Ensure response is correct
    expect(res.status).toBe(200); // OK status
    expect(Array.isArray(res.body.data)).toBeTruthy(); // Response should contain an items array
    expect(res.body.data.length).toBeGreaterThan(0); // Should have at least one item
    expect(res.body.total).toBeGreaterThan(0); // Total number of items should be greater than 0
  });

  // Test getting item details by ID
  it('should get item details by id', async () => {
    const res = await request(app).get(`/items/${createdItemId}`);
    expect(res.status).toBe(200); // OK status
    expect(res.body).toHaveProperty('id', createdItemId); // Response should have the correct ID
  });

  // Test updating an item
  it('should update an item', async () => {
    const res = await request(app)
      .put(`/items/${createdItemId}`)
      .send({
        name: "Updated Test Item",
        description: "Updated description"
      });
    // Ensure response is correct
    expect(res.status).toBe(200); // OK status
    expect(res.body.message).toBe("Item updated successfully"); // Name should be updated
  });

  // Test updating an item that does not exist (should return 404)
  it('should return 404 for a non-existent item', async () => {
    const res = await request(app)
      .put('/items/99999') // Non-existent ID
      .send({
        name: "Non-existent Item",
        description: "This should not exist"
      });

    // Expect a 404 response
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Item with id 99999 not found");
  });

  // Test deleting an item
  it('should delete an item', async () => {
    const res = await request(app).delete(`/items/${createdItemId}`);
    expect(res.status).toBe(204); // No content status
  });

  // Test getting deleted item (should return 404)
  it('should return 404 for a deleted item', async () => {
    const res = await request(app).get(`/items/${createdItemId}`);
    expect(res.status).toBe(404); // Not found status
  });

  // Test that item cannot be created with a non-unique name (if you want to enforce unique names)
  it('should return 400 for creating an item with a duplicate name', async () => {
    // First, create the initial item
    await request(app)
      .post('/items')
      .send({
        name: "Unique Item",
        description: "A unique item"
      });

    // Try to create another item with the same name
    const res = await request(app)
      .post('/items')
      .send({
        name: "Unique Item", // Same name as the previous one
        description: "A duplicate item"
      });

    // Expect 400 - bad request
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Item with this name already exists");
  });
});