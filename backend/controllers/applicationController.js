// all CRUD logic for applications will be here
const pool = require('../config/db');

const addApplication = async (req, res) => {
    const { company, role, status, date_applied, notes } = req.body;
    const user_id = req.user.id;

    try {
        const newApplication = await pool.query(
            'INSERT INTO applications (user_id, company, role, status, date_applied, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, company, role, status, date_applied, notes]
        );

        res.status(201).json({
            message: "Application added successfully.",
            application: newApplication.rows[0]
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getApplications = async (req, res) => {
    const user_id = req.user.id;
    const { status, search, sortBy, order, role } = req.query;

    try {
        let query = 'SELECT * FROM applications WHERE user_id = $1';
        let params = [user_id];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            params.push(status);
        }

        if (role) {
        paramCount++;
        query += ` AND role ILIKE $${paramCount}`;
        params.push(`%${role}%`);
        }

        if(search)  {
            paramCount++;
            query += ` AND (company ILIKE $${paramCount} OR role ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        const validSortFields = ['date_applied', 'company', 'role', 'status', 'created_at'];
        const validOrders = ['ASC', 'DESC'];

        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = validOrders.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

        query += ` ORDER BY ${sortField} ${sortOrder}`;

        const applications = await pool.query(query, params);
        console.log('sortBy:', sortBy);
        console.log('order:', order);
        console.log('sortField:', sortField);
        console.log('sortOrder:', sortOrder);
        console.log('Final query:', query);

        res.status(200).json({ 
            count: applications.rows.length,
            applications: applications.rows 
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const updateApplication = async (req, res) => {
    const { id } = req.params;
    const { company, role, status, date_applied, notes } = req.body;
    const user_id = req.user.id;

    try {
        const application = await pool.query(
            'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if (application.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        const updatedApplication = await pool.query(
            'UPDATE applications SET company = $1, role = $2, status = $3, date_applied = $4, notes = $5 WHERE id = $6 RETURNING *',
            [company, role, status, date_applied, notes, id]
        );

        res.status(200).json({
            message: 'Application updated successfully.',
            application: updatedApplication.rows[0]
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const deleteApplication = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const application = await pool.query(
            'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if (application.rows.length === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        await pool.query('DELETE FROM applications WHERE id = $1', [id]);

        res.status(200).json({ message: 'Application deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
}

const getStats = async (req, res) => {
    const user_id = req.user.id;

    try {
        const stats = await pool.query(
            `SELECT
                    COUNT(*) AS total,
                    COUNT(CASE WHEN status = 'Applied' THEN 1 END) AS applied,
                    COUNT(CASE WHEN status = 'Interview Scheduled' THEN 1 END) AS interviews,
                    COUNT(CASE WHEN status = 'Rejected' THEN 1 END) AS rejected,
                    COUNT(CASE WHEN status = 'Offer Received' THEN 1 END) AS offers
                    FROM applications
                    WHERE user_id = $1`,
            [user_id]
        );
        res.status(200).json({ stats: stats.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getAnalytics = async (req, res) =>  {
    const user_id = req.user.id;

    try  {
        const statusBreakdown = await pool.query(
            `SELECT status, COUNT(*) as count
            FROM applications
            WHERE user_id = $1
            GROUP BY status`,
            [user_id]
        );

        const monthlyTrend = await pool.query(
            `SELECT 
            TO_CHAR(date_applied, 'Mon YYYY') AS month,
            COUNT(*) as count
            FROM applications
            WHERE user_id = $1
            GROUP BY TO_CHAR(date_applied, 'Mon YYYY'), DATE_TRUNC('month', date_applied)
            ORDER BY DATE_TRUNC('month', date_applied) ASC`,
            [user_id]
        );

        const weeklyTrend = await pool.query(
            `SELECT 
            TO_CHAR(date_applied, 'Day') as day, 
            COUNT(*) as count
            FROM applications
            WHERE user_id = $1
            AND date_applied >= NOW() - INTERVAL '7 days'
            GROUP BY TO_CHAR(date_applied, 'Day')`,
            [user_id]
        );

        const topCompanies = await pool.query(
            `SELECT company, COUNT(*) as count
            FROM applications
            WHERE user_id = $1
            GROUP BY company
            ORDER BY count DESC
            LIMIT 5`,
            [user_id]
        );

        res.status(200).json({
            statusBreakdown: statusBreakdown.rows,
            monthlyTrend: monthlyTrend.rows,
            weeklyTrend: weeklyTrend.rows,
            topCompanies: topCompanies.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = {
    addApplication,
    getApplications,
    updateApplication,
    deleteApplication,
    getStats,
    getAnalytics
};