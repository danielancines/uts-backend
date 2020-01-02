const express = require('express');
const router = express.Router();
const dbPool = require('./../../data/dbConnection');
const path = require('path');
const tokenMW = require('./../../middleware/token');
const Role = require('../../data/schemas/role');
const queryBuilder = require('../../data/util/queryBuilder');

router.use(tokenMW);
router.post('/', (req, res) => {
    
    if (!req.body.name) {
        return res.status(200).json({
            code: 12,
            message: 'Role name is required',
            status: 'error'
        });
    }

    const role = [req.body.name, req.body.description, req.body.color];

    dbPool.connect((err, client) => {
        if (err) {
            res.status(500).json({
                code: 12,
                message: 'Error connection database',
                error: err.message
            });
            throw err;
        }

        client.query('insert into "Roles" ("Name", "Description", "Color") values ($1, $2, $3) returning *', role, (err, results) => {
            if (err) {
                res.status(500).json({
                    code: 12,
                    message: 'Error at creation',
                    error: err.message
                });
            } else {
                res.status(201).json({
                    location: path.join(req.hostname, req.originalUrl, results.rows[0].Id),
                    data: results.rows[0]
                });
            }

            client.release();
        });
    });
});

router.delete('/:id', (req, res) => {
    if (!req.params.id) {
        return res.status(200).json({
            code: 12,
            message: 'Role id is required for delete',
            status: 'error'
        });
    }

    dbPool.connect((err, client) => {
        if (err) {
            res.status(500).json({
                code: 12,
                message: 'Error connection database',
                error: err.message
            });
            throw err;
        }

        client.query('delete from "Roles" where "Id" = $1 returning *', [req.params.id], (err, results) => {
            if (err) {
                res.status(500).json({
                    code: 12,
                    message: 'Error at deletion',
                    error: err.message
                });
            } else {
                if (results.rows.length <= 0) {
                    res.status(200).json({
                        deleted: false,
                        message: 'Role not found!'
                    });
                } else {
                    res.status(200).json({
                        deleted: true
                    });
                }
            }

            client.release();
        });
    });
});

router.patch('/:id', (req, res) => {
    if (!req.params.id) {
        return res.status(200).json({
            code: 12,
            message: 'Role id is required for update',
            status: 'error'
        });
    }

    const role = req.body;
    if (!role) {
        return res.status(200).json({
            code: 12,
            message: 'Role is required',
            status: 'error'
        });
    }

    if (!role.name) {
        return res.status(200).json({
            code: 12,
            message: 'Role name cannot be null',
            status: 'error'
        });
    }

    dbPool.connect((err, client) => {
        if (err) {
            res.status(500).json({
                code: 12,
                message: 'Error connection database',
                error: err.message
            });
            throw err;
        }

        client.query('update "Roles" set "Name" = $1 where "Id" = $2 returning *', [role.name, req.params.id], (err, results) => {
            client.release();

            if (err) {
                return res.status(500).json({
                    code: 12,
                    message: 'Error at update',
                    error: err.message
                });
            } else {
                if (results.rows.length <= 0) {
                    return res.status(200).json({
                        updated: false,
                        message: 'No rows founded!'
                    });
                } else {
                    return res.status(200).json({
                        updated: true,
                        roleDescription: results.rows[0].Name
                    });
                }
            }
        });
    });
});

router.get('/', async (req, res) => {
    try {
        const response = await queryBuilder(req.query, Role);
        const roles = await response.query;

        res.status(200).send({
            code: 1,
            count: response.countDocuments || roles.length,
            data: roles
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Roles',
            error: error.message
        });
    }
});

module.exports = router;