const transactionHistory = require('../models/transactionHistory');
const getTransactions = async (req, res) => {
    try {
        const { uid } = req.params;
        const response = await transactionHistory.find({ user: uid });
        if (response) {
            res.status(201).send({
                total: response.length,
                success: true,
                message: "success for finding transaction history",
                data: response
            });
        }
        else {
            console.log("user not present to find his transaction history");
        }
    }
    catch (exception) {
        res.status(401).send({
            success: false,
            message: "problem while getting transaction history",
            error: exception.message
        });

    }
}

module.exports = { getTransactions };