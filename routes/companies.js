const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')

//GET companies - returns list of all companies
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    };
});


//GET company by code
router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        
        const comp_results = await db.query('SELECT * FROM companies WHERE code=$1', [code]);
        const invoice_results = await db.query('SELECT * FROM invoices WHERE comp_code=$1', [code]);
        const industries_results = await db.query('SELECT * FROM company_industries WHERE comp_code=$1', [code]);
        
        if (comp_results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        };
        comp_results.rows[0].invoices = invoice_results.rows;
        comp_results.rows[0].industries = industries_results.rows;
        return res.send({ company: comp_results.rows[0] });
    } catch (e) {
        return next(e);
    };
});


//POST add a new company
router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        let code = slugify(name, {lower: true});

        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    };
});


//PATCH update a company
router.patch('/:code', async (req, res, next) => {
    try {
        const code  = req.params.code;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        return res.send({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    };
});


//DELETE delete a company
router.delete('/:code', async (req, res, next) => {
    try {
        const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code]);
        return res.send({ msg: "Deleted!" });
    } catch (e) {
        return next(e);
    };
});


module.exports = router;