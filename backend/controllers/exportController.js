const pool = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const exportToExcel = async (req, res) =>  {
    const user_id = req.user.id;

    try  {
        const applications = await pool.query(
            'SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Job Applications');

        worksheet.columns = [
            { header: 'Company', key: 'company', width: 20 },
            { header: 'Role', key: 'role', width: 20 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Date Applied', key: 'date_applied', width: 20 },
            { header: 'Notes', key: 'notes', width: 30 },
        ];

        worksheet.addRow(1).font = { bold: true };
        worksheet.getRow(1).fill =  {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        applications.rows.forEach(app =>  {
            worksheet.addRow({
                company: app.company,
                role: app.role,
                status: app.status,
                date_applied: app.date_applied ? new Date(app.date_applied).toLocaleDateString() : '',
                notes: app.notes
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=job_applications.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (err)  {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};


const exportToPDF = async (req, res) =>  {
    const user_id = req.user.id;

    try  {
        const applications = await pool.query(
            'SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=job_applications.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Job Application Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        applications.rows.forEach((app, index) => {
            doc.fontSize(14).text(`${index + 1}. ${app.company} - ${app.role}`, { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(11).text(`Status: ${app.status}`);
            doc.fontSize(11).text(`Date Applied: ${app.date_applied ? new Date(app.date_applied).toLocaleDateString() : 'N/A'}`);
            if (app.notes) {
                doc.fontSize(11).text(`Notes: ${app.notes}`);
            }
            doc.moveDown(1);

            if (index < applications.rows.length -1)  {
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(1);
            }
        });

        doc.end();

    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { exportToExcel, exportToPDF };