const express = require("express");

const Product = require("../models/Product");
const Transaction = require("../models/Transaction");

const router = express.Router();

// CREATE PRODUCT
router.post("/", async (req, res) => {
    try {
        const { productName, price, availableStock } = req.body;

        if (!productName || price === undefined || availableStock === undefined) {
            return res.status(400).json({
                message: "Product name, price and available stock are required"
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                message: "Product price must be greater than zero"
            });
        }

        if (availableStock < 0) {
            return res.status(400).json({
                message: "Product stock cannot be negative"
            });
        }

        const existingProduct = await Product.findOne({ productName });

        if (existingProduct) {
            return res.status(409).json({
                message: "Product name already exists"
            });
        }

        const product = await Product.create({
            productName,
            price,
            availableStock
        });

        res.status(201).json({
            message: "Product created successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
});

// PURCHASE PRODUCT
router.post("/purchase", async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                message: "Product ID and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                message: "Purchase quantity must be greater than zero"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (quantity > product.availableStock) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        product.availableStock -= quantity;

        await product.save();

        const transaction = await Transaction.create({
            productId: product._id,
            transactionType: "Purchase",
            quantity
        });

        res.status(200).json({
            message: "Product purchased successfully",
            product,
            transaction
        });

    } catch (error) {
        res.status(500).json({
            message: "Purchase failed",
            error: error.message
        });
    }
});

// RESTOCK PRODUCT
router.post("/restock", async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                message: "Product ID and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                message: "Restock quantity must be greater than zero"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        product.availableStock += quantity;

        await product.save();

        const transaction = await Transaction.create({
            productId: product._id,
            transactionType: "Restock",
            quantity
        });

        res.status(200).json({
            message: "Product restocked successfully",
            product,
            transaction
        });

    } catch (error) {
        res.status(500).json({
            message: "Restock failed",
            error: error.message
        });
    }
});

// PRODUCT TRANSACTION HISTORY
router.get("/:productId/history", async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const transactions = await Transaction.find({
            productId
        }).sort({
            transactionDate: -1
        });

        res.status(200).json({
            product,
            transactions
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transaction history",
            error: error.message
        });
    }
});

module.exports = router;