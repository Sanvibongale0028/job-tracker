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

    console.log('Extracted text length:', resumeText.length);

    const prompt = `Analyze this resume and provide a JSON response with exactly this structure:
      {
        "skills": ["skill1", "skill2"],
        "suggested_roles": ["role1", "role2"],
        "missing_skills": ["skill1", "skill2"],
        "resume_score": 85,
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "improvement_suggestions": ["suggestion1", "suggestion2"]
      }
      Resume text:
      ${resumeText}
      Return only valid JSON, no extra text.
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile'
    });

    const text = completion.choices[0].message.content;
    const cleanText = text.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(cleanText);

    res.status(200).json({
      message: 'Resume analyzed successfully.',
      analysis
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ message: 'Failed to analyze resume.', error: error.message });
  }
};

module.exports = { analyzeResume };