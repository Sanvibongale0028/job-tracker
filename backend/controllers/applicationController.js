// all CRUD logic for applications will be here
const pool = require('../config/db');

const addApplication = async (req, res) => {
    const { company, role, status, date_applied, notes } = req.body;
    const user_id = req.user.id;

    try  {
        const newApplication = await pool.query(
            'INSERT INTO applications (user_id, company, role, status, date_applied, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, company, role, status, date_applied, notes]
        );

        res.status(201).json({
            message: "Application added successfully.",
            application: newApplication.rows[0]
        });

    } catch(err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getApplications = async (req, res) =>  {
    const user_id = req.user.id;
    const { status } = req.query;  

    try  {
        let query = 'SELECT * FROM applications WHERE user_id = $1';
        let params = [user_id];

        if(status)  {
            query += ' AND status = $2';
            params.push(status);
        }

        query += ' ORDER BY date_applied DESC';

        const applications = await pool.query(query, params);

        res.status(200).json({
            count: applications.rows.length,
            applications: applications.rows
        });
    } catch (err)  {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const updateApplication = async (req, res) =>  {
    const { id } = req.params;
    const { company, role, status, date_applied, notes } = req.body;
    const user_id = req.user.id;

    try  {
        const application = await pool.query(
            'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if(application.rows.length === 0)  {
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

    } catch(err)  {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const deleteApplication = async (req, res) =>  {
    const { id } = req.params;
    const user_id = req.user.id;

    try  {
        const application = await pool.query(
            'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if(application.rows.length === 0)  {
            return res.status(404).json({ message: 'Application not found.' });
        }

        await pool.query('DELETE FROM applications WHERE id = $1', [id]);
        
        res.status(200).json({ message: 'Application deleted successfully.'});
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
}

module.exports = { 
    addApplication, 
    getApplications, 
    updateApplication, 
    deleteApplication 
};