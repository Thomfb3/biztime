const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


//POST create an industry 
router.post('/industry', async (req, res, next) => {
    try {
        const { code, name } = req.body;
        const results = await db.query('INSERT INTO industries (code, name) VALUES ($1, $2) RETURNING code, name', [code, name]);
        return res.status(201).json({ industry: results.rows[0] });
    } catch (e) {
        return next(e)
    };
});

//GET Industries - returns list of all industries
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM industries`);
        return res.json(results.rows)
    } catch (e) {
        return next(e);
    };
});

//GET Industries - returns list of all industries
router.get('/:code', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT i.code, i.name, c.name AS comp_name
            FROM industries AS i
            JOIN company_industries AS ci
            ON ci.industry_code =  i.code
            JOIN companies AS c
            ON c.code = ci.comp_code
            WHERE i.code = $1`, [req.params.code]);

        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find industry with code of ${req.params.code}`, 404);
        }
        const { code, name } = results.rows[0];
        const companies = results.rows.map(r => r.comp_name)
        return res.json({ code, name, companies })
    } catch (e) {
        return next(e);
    };
});


//POST associating an industry to a company
router.post('/', async (req, res, next) => {
    try {
        const { comp_code, industry_code } = req.body;
        const results = await db.query('INSERT INTO company_industries (comp_code, industry_code) VALUES ($1, $2) RETURNING comp_code, industry_code', [comp_code, industry_code]);
        return res.status(201).json({ company_industry: results.rows[0] });
    } catch (e) {
        return next(e)
    };
});



module.exports = router;