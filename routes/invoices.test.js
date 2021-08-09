process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');



let testInvoice;
let testInvoiceCompany;

beforeEach(async () => {
    const companyResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('goog', 'Google', 'Search Engine') RETURNING code, name, description;`);
    testInvoiceCompany = companyResult.rows[0];

    const invoiceResult = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('goog', 100, false, CURRENT_TIMESTAMP, null) RETURNING id, comp_code, amt, paid, add_date, paid_date;`);
    testInvoice = invoiceResult.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end();
});


describe("GET /invoices", () => {
    test("Get a list with one invoice", async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);

        expect(res.body.invoices[0].comp_code).toEqual('goog');
        expect(res.body.invoices[0].amt).toEqual(100);
        expect(res.body.invoices[0].paid).toEqual(false);
        expect(res.body.invoices[0].paid_date).toEqual(null);
    });
});


describe("GET /invoices/:id", () => {
    test("Gets a single invoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);

        expect(res.body.invoice.comp_code).toEqual('goog');
        expect(res.body.invoice.amt).toEqual(100);
        expect(res.body.invoice.paid).toEqual(false);
        expect(res.body.invoice.paid_date).toEqual(null);
    });
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/invoice/0`);
        expect(res.statusCode).toBe(404);
    });
});


describe("POST /invoices", () => {
    test("Creates a single invoices", async () => {
        const res = await request(app).post('/invoices').send({ comp_code: 'goog', amt: 100 });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: { id:expect.any(Number),  comp_code: 'goog', amt: 100, paid: false, add_date: res.body.invoice.add_date, paid_date: null }
        });
    });
});


describe("PATCH /invoices/:id", () => {
    test("Updates a single invoice", async () => {
        const res = await request(app).patch(`/invoices/${testInvoice.id}`).send({ comp_code: 'goog', amt: 200, paid: true });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: { id:expect.any(Number), comp_code: 'goog', amt: 200, paid: true, add_date: res.body.invoice.add_date, paid_date: res.body.invoice.paid_date }
        });
    });
    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).patch(`/invoices/0`).send({ comp_code: 'goog', amt: 200, paid: true });
        expect(res.statusCode).toBe(404);
    });
});


describe("DELETE /invoices/:id", () => {
    test("Deletes a single invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: 'Deleted!' });
    });
});
