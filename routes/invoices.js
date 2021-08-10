const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


//GET Invoices - returns list of all companies
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: results.rows })
    } catch (e) {
        return next(e);
    };
});


//GET invoice by id
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        };
        return res.send({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    };
});


//POST add a new invoice
router.post('/', async (req, res, next) => {
    try {
        const paid = false;
        const paid_date = null;
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt, paid, paid_date]);
        return res.status(201).json({ invoice: results.rows[0] });
    } catch (e) {
        return next(e)
    };
});


//PUT update a invoice
router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amt, paid} = req.body;
        const results = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=${paid ? 'CURRENT_TIMESTAMP' : null} WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.send({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    };
});


//DELETE delete an invoice
router.delete('/:id', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
        return res.send({ msg: "Deleted!" });
    } catch (e) {
        return next(e);
    };
});




module.exports = router;