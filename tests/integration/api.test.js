const request = require('supertest');
const app = require('../../src/app');

describe('API Endpoints', () => {
  describe('GET /', () => {
    test('returns welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Welcome');
    });
  });
  
  describe('GET /health', () => {
    test('returns health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'UP');
      expect(response.body).toHaveProperty('version');
    });
  });
  
  describe('POST /calculate', () => {
    test('adds two numbers correctly', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({ operation: 'add', a: 5, b: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result', 8);
    });
    
    test('subtracts two numbers correctly', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({ operation: 'subtract', a: 5, b: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result', 2);
    });
    
    test('handles invalid operations', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({ operation: 'divide', a: 6, b: 2 });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    test('handles invalid input', async () => {
      const response = await request(app)
        .post('/calculate')
        .send({ operation: 'add', a: 'not-a-number', b: 2 });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
