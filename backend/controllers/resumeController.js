const pool = require('../config/db');
const supabase = require('../config/supabase');
const path = require('path');

const uploadResume = async (req, res) =>  {
    const uploadResume = async (req, res) => {
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);
    }
    try {
        if(!req.file)  {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const user_id = req.user.id;
        const fileBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        const mimeType = req.file.mimetype;
        const fileName = `${user_id}-${Date.now()}-${originalName}`;

        const { data, error } = await supabase.storage
            .from('resumes')
            .upload(fileName, fileBuffer,  {
                contentType: mimeType,
                upsert: true
        });

        if(error)  {
            return res.status(500).json({ message: 'Upload failed.', error: error.message });
        }

        const { data: urlData } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName);

        await pool.query(
            'UPDATE users SET resume_path = $1 WHERE id = $2',
            [urlData.publicUrl, user_id]
        );

        res.status(200).json({
            message: 'Resume uploaded successfully.',
            file: {
                filename: fileName, 
                originalname: originalName, 
                url: urlData.publicUrl
            }
        });

    } catch(err)  {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const getResume = async (req, res) =>  {
    try  {
        const user_id = req.user.id;

        const user = await pool.query(
            'SELECT resume_path FROM users WHERE id = $1',
            [user_id]
        );

        if(!user.rows[0].resume_path)  {
            return res.status(404).json({ message: 'No resume found.' });
        }

        res.status(200).json({
            resume_url: user.rows[0].resume_path
        });
    } catch (err)  {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { uploadResume, getResume };