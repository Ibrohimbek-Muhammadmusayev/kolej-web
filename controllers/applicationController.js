const db = require('../models');

exports.createApplication = async (req, res) => {
    try {
        console.log('Received application/message:', req.body);
        // Simple mapping from form fields (hyphenated) to model (camelCase) if needed
        const { "full-name": fullName, phone, dob, passport, address, education, "field-id": fieldId } = req.body;

        // Handle both camelCase input (from API/JSON) and hyphenated (from HTML Form)
        const appData = {
            fullName: fullName || req.body.fullName,
            phone: phone || req.body.phone,
            dob: dob || req.body.dob,
            passport: passport || req.body.passport,
            address: address || req.body.address,
            education: education || req.body.education,
            fieldId: fieldId || req.body.fieldId,
            message: req.body.message
        };

        const application = await db.Application.create(appData);
        res.status(201).json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const apps = await db.Application.findAll({ order: [['createdAt', 'DESC']] });
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await db.Application.update({ status }, { where: { id: req.params.id } });
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        await db.Application.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
