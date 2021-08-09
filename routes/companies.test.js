process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('fb', 'Facebook', 'Social Media') RETURNING code, name, description;`);
    testCompany = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
});

afterAll(async () => {
    await db.end();
});


describe("GET /companies", () => {
    test("Get a list with one company", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany] });
    });
});


describe("GET /companies/:code", () => {
    test("Gets a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany, invoices: [] });
    });
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/company/0`);
        expect(res.statusCode).toBe(404);
    });
});


describe("POST /companies", () => {
    test("Creates a single companies", async () => {
        const res = await request(app).post('/companies').send({ code: 'amz', name: 'Amazon', description: 'online retail' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: { code: 'amz', name: 'Amazon', description: 'online retail' }
        });
    });
});


describe("PATCH /companies/:code", () => {
    test("Updates a single company", async () => {
        const res = await request(app).patch(`/companies/${testCompany.code}`).send({ code: 'ama', name: 'Amazon Prime', description: 'streaming' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: { code: testCompany.code, name: 'Amazon Prime', description: 'streaming' }
        });
    });
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).patch(`/companies/0`).send({ code: 'ama', name: 'Amazon Prime', description: 'streaming' });
        expect(res.statusCode).toBe(404);
    });
});


describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
        const res = await request(app).delete(`/companies/${testCompany.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: 'Deleted!' });
    });
});
