const optimizationService = require('../services/optimizationService');

exports.getAnalytics = async (req, res) => {
    try {
        const results = await optimizationService.runOptimization('analytics');
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFraudAnalysis = async (req, res) => {
    try {
        const results = await optimizationService.runOptimization('fraud');
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAutocomplete = async (req, res) => {
    try {
        const { query } = req.query;
        const results = await optimizationService.runOptimization('autocomplete', [query]);
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSortedTransactions = async (req, res) => {
    try {
        const results = await optimizationService.runOptimization('sort');
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
