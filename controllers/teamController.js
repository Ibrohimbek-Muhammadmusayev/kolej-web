const db = require('../models');

module.exports = {
    async getAllTeam(req, res) {
        try {
            const team = await db.TeamMember.findAll({ order: [['order', 'ASC']] });
            res.json(team);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async createTeamMember(req, res) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.image_url = `/uploads/${req.file.filename}`;
            }
            const member = await db.TeamMember.create(data);
            res.status(201).json(member);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async updateTeamMember(req, res) {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.image_url = `/uploads/${req.file.filename}`;
            }
            await db.TeamMember.update(data, { where: { id: req.params.id } });
            res.json({ message: 'Updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async deleteTeamMember(req, res) {
        try {
            await db.TeamMember.destroy({ where: { id: req.params.id } });
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
