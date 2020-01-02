const express = require('express');
const router = express.Router();
const tokenMW = require('./../../middleware/token');
const { Category, categoryValidate } = require('../../data/schemas/category');
const { Video } = require('../../data/schemas/video');
const queryBuilder = require('../../data/util/queryBuilder');
const _ = require('lodash');
const categoryRoles = require('../../data/roles/category.roles');
const rolesValidation = require('./../../middleware/roles.validation');

router.use(tokenMW);
router.get('/', async (req, res) => {
    try {
        const response = await queryBuilder(req.query, Category);
        const categories = await response.query;

        res.status(200).send({
            code: 1,
            count: response.countDocuments || categories.length,
            data: categories
        });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Categories',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (_.isNull(category)) {
            res.status(404).send({
                code: 1,
                id: req.params.id,
                message: 'Category not found'
            });
        } else {
            res.status(200).send({
                code: 1,
                data: category
            });
        }
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error getting Category',
            error: error.message
        });
    }
});

router.put('/:id', [rolesValidation(categoryRoles.update)], async (req, res) => {
    const error = categoryValidate(req.body);
    if (error) {
        return res.status(400)
        .send({
            id: 12,
            message: error.message
        })
    };

    const category = req.body;
    const categoryId = req.params.id;
    if (!categoryId) {
        return res.status(404).send({
            id: 2,
            message: 'CategoryId not provided'
        });
    }

    try {
        const result = await Category.findByIdAndUpdate(categoryId, {
            $set: {
                name: category.name,
                description: category.description
            }
        });

        res.status(200).send({
            code: 1,
            message: 'Updated finished',
            savedCategory: result
        });
    } catch (error) {
        res.status(500).send({
            code: 2,
            message: error.message
        });
    }
});

router.post('/', [rolesValidation(categoryRoles.insert)], async (req, res) => {
    const error = categoryValidate(req.body);
    if (error) {
        return res.status(400).send({
            code: 12,
            error: error
        });
    }

    try {
        delete req.body._id;
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.status(201).json({
            code: 1,
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            code: 2,
            message: 'Error at creation',
            error: error.message
        });
    }
});

router.delete('/:id', [rolesValidation(categoryRoles.delete)], async (req, res) => {
    try {
        const video = await Video.findOne({category: req.params.id});
        if (!_.isNull(video)) {
            return res.status(400).send({
                code: 400,
                message: 'Cannot delete - Relationship',
                table: 'Videos'
            });
        }

        const category = await Category.findByIdAndRemove(req.params.id);
        if (category)
            res.status(200).send({
                code: 1,
                data: category
            });
        else
            res.status(404).send({
                code: 2,
                data: null,
                message: 'Category not found'
            });
    }
    catch (error) {
        res.status(500).send({
            code: 2,
            message: 'Error deleting Category',
            error: error.message
        });
    }
});

module.exports = router;