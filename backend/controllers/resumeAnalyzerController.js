// const analyzeResume = async (req, res) => {
//     const user_id = req.user.id;
//     const { experience_level } = req.query; // ✅ read from query param

//     // ✅ prompt changes based on experience level
//     const experienceContext = {
//         'fresher': 'The candidate is a fresher (0 years of experience). Evaluate accordingly — focus on academics, projects, internships, and foundational skills. Suggested roles should be entry-level or junior positions.',
//         'intermediate': 'The candidate has 1-2 years of experience. Evaluate accordingly — focus on practical skills, work experience, and growth potential. Suggested roles should be mid-level positions.',
//         'experienced': 'The candidate has more than 2 years of experience. Evaluate accordingly — focus on impact, leadership, advanced skills, and career progression. Suggested roles should be senior or specialist positions.'
//     };

//     const levelContext = experienceContext[experience_level] || experienceContext['fresher'];

//     try {
//         const user = await pool.query(
//             'SELECT resume_path FROM users WHERE id = $1',
//             [user_id]
//         );

//         if (!user.rows[0].resume_path) {
//             return res.status(404).json({ message: 'No resume found. Please upload a resume first.' });
//         }

//         const resumeUrl = user.rows[0].resume_path;
//         const fileName = resumeUrl.split('/').pop();

//         const { data, error } = await supabase.storage
//             .from('resumes')
//             .download(fileName);

//         if (error) {
//             return res.status(500).json({ message: 'Failed to download resume.', error: error.message });
//         }

//         const arrayBuffer = await data.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const resumeText = await extractTextFromPDF(buffer);

//         const prompt = `You are a professional resume reviewer.

// Context: ${levelContext}

// Analyze this resume for the above experience level and provide a JSON response with exactly this structure:
// {
//   "skills": ["skill1", "skill2"],
//   "suggested_roles": ["role1", "role2"],
//   "missing_skills": ["skill1", "skill2"],
//   "resume_score": 85,
//   "strengths": ["strength1", "strength2"],
//   "weaknesses": ["weakness1", "weakness2"],
//   "improvement_suggestions": ["suggestion1", "suggestion2"]
// }

// Important: Score and suggestions must be calibrated for a ${experience_level || 'fresher'} level candidate. Do not penalize a fresher for lacking work experience.

// Resume text:
// ${resumeText}

// Return only valid JSON, no extra text.`;

//         const completion = await groq.chat.completions.create({
//             messages: [{ role: 'user', content: prompt }],
//             model: 'llama-3.3-70b-versatile'
//         });

//         const text = completion.choices[0].message.content;
//         const cleanText = text.replace(/```json|```/g, '').trim();
//         const analysis = JSON.parse(cleanText);

//         res.status(200).json({
//             message: 'Resume analyzed successfully.',
//             analysis,
//             experience_level: experience_level || 'fresher' // ✅ echo back so frontend can display it
//         });

//     } catch (error) {
//         console.error('Error analyzing resume:', error);
//         res.status(500).json({ message: 'Failed to analyze resume.', error: error.message });
//     }
// };

const pool = require('../config/db');
const supabase = require('../config/supabase');
const { PdfReader } = require('pdfreader');
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractTextFromPDF = (buffer) => {
    return new Promise((resolve, reject) => {
        const rows = {};
        new PdfReader().parseBuffer(buffer, (err, item) => {
            if (err) {
                reject(err);
            } else if (!item) {
                const text = Object.keys(rows)
                    .sort((a, b) => a - b)
                    .map(y => rows[y].join(' '))
                    .join('\n');
                resolve(text);
            } else if (item.text) {
                (rows[item.y] = rows[item.y] || []).push(item.text);
            }
        });
    });
};

const analyzeResume = async (req, res) => {
    const user_id = req.user.id;
    const { experience_level, role_type } = req.query;

    const experienceContext = {
        'fresher': 'The candidate is a fresher (0 years of experience). Focus on academics, projects, internships, and foundational skills. Suggested roles should be entry-level or junior positions. Do not penalize for lack of work experience.',
        'intermediate': 'The candidate has 1-2 years of experience. Focus on practical skills, work experience quality, and growth potential. Suggested roles should be mid-level positions.',
        'experienced': 'The candidate has more than 2 years of experience. Focus on impact, leadership, advanced skills, and career progression. Suggested roles should be senior or specialist positions.'
    };

    const roleContext = {
        'software-development': 'The candidate is targeting Software Development roles (SDE, backend, fullstack). Evaluate backend skills (Node.js, Java, Python, databases, system design, DSA), project quality, and problem-solving ability. Missing skills should be relevant to SDE interviews.',
        'frontend': 'The candidate is targeting Frontend / UI roles. Evaluate HTML, CSS, JavaScript, React or similar frameworks, responsive design, and UI/UX sensibility. Missing skills should focus on modern frontend tools.',
        'data-science': 'The candidate is targeting Data Science / ML roles. Evaluate Python, statistics, ML frameworks (TensorFlow, PyTorch, scikit-learn), data analysis, and relevant projects. Missing skills should reflect DS/ML expectations.',
        'devops': 'The candidate is targeting DevOps / Cloud roles. Evaluate Docker, Kubernetes, CI/CD, cloud platforms (AWS, GCP, Azure), Linux, and automation skills. Missing skills should reflect DevOps expectations.',
        'product-management': 'The candidate is targeting Product Management roles. Evaluate communication, analytical thinking, product sense, stakeholder management experience, and any metrics-driven project outcomes. Missing skills should reflect PM expectations.',
        'general': 'The candidate is open to general software roles. Provide a broad evaluation covering technical and soft skills.'
    };

    const levelContext = experienceContext[experience_level] || experienceContext['fresher'];
    const targetContext = roleContext[role_type] || roleContext['general'];

    try {
        const user = await pool.query(
            'SELECT resume_path FROM users WHERE id = $1',
            [user_id]
        );

        if (!user.rows[0].resume_path) {
            return res.status(404).json({ message: 'No resume found. Please upload a resume first.' });
        }

        const resumeUrl = user.rows[0].resume_path;
        const fileName = resumeUrl.split('/').pop();

        const { data, error } = await supabase.storage
            .from('resumes')
            .download(fileName);

        if (error) {
            return res.status(500).json({ message: 'Failed to download resume.', error: error.message });
        }

        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const resumeText = await extractTextFromPDF(buffer);

        const prompt = `You are a professional resume reviewer and hiring expert.

Experience Level Context: ${levelContext}

Target Role Context: ${targetContext}

Using both contexts above, analyze this resume and provide a JSON response with exactly this structure:
{
  "skills": ["skill1", "skill2"],
  "suggested_roles": ["role1", "role2"],
  "missing_skills": ["skill1", "skill2"],
  "resume_score": 85,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvement_suggestions": ["suggestion1", "suggestion2"]
}

Rules:
- Score must reflect both experience level and target role fit
- suggested_roles must be specific to the target role type
- missing_skills must be specific to what is expected for the target role
- improvement_suggestions must be actionable and specific to the target role
- Return only valid JSON, no extra text

Resume text:
${resumeText}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile'
        });

        const text = completion.choices[0].message.content;
        const cleanText = text.replace(/```json|```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        res.status(200).json({
            message: 'Resume analyzed successfully.',
            analysis,
            experience_level: experience_level || 'fresher',
            role_type: role_type || 'general'
        });

    } catch (error) {
        console.error('Error analyzing resume:', error);
        res.status(500).json({ message: 'Failed to analyze resume.', error: error.message });
    }
};

module.exports = { analyzeResume };