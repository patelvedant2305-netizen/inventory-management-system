const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        transactionType: {
            type: String,
            enum: ["Purchase", "Restock"],
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be greater than zero"]
        },

        transactionDate: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);