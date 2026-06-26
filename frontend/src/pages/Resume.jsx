// import { useState, useEffect } from 'react';
// import api from '../utils/api';
// import Navbar from '../components/layout/Navbar';
// import toast from 'react-hot-toast';

// function Resume() {
//     const [resumeUrl, setResumeUrl] = useState(null);
//     const [uploading, setUploading] = useState(false);
//     const [analyzing, setAnalyzing] = useState(false);
//     const [analysis, setAnalysis] = useState(null);
//     const [experienceLevel, setExperienceLevel] = useState('fresher');
//     const [loadingResume, setLoadingResume] = useState(true);

//     useEffect(() => {
//         fetchResume();
//     }, []);

//     const fetchResume = async () => {
//         try {
//             const res = await api.get('/api/resume');
//             setResumeUrl(res.data.resume_url);
//         } catch (err) {
//             // 404 just means no resume yet — not an error worth toasting
//             if (err.response?.status !== 404) {
//                 toast.error('Failed to fetch resume');
//             }
//         } finally {
//             setLoadingResume(false);
//         }
//     };

//     const handleUpload = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         const formData = new FormData();
//         formData.append('file', file);

//         setUploading(true);
//         try {
//             const res = await api.post('/api/resume/upload', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
//             setResumeUrl(res.data.file.url);
//             setAnalysis(null); // clear old analysis on new upload
//             toast.success('Resume uploaded successfully!');
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const handleAnalyze = async () => {
//         setAnalyzing(true);
//         try {
//             const res = await api.get(`/api/analyzer/analyze?experience_level=${experienceLevel}`);
//             setAnalysis(res.data.analysis);
//             toast.success('Analysis complete!');
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Analysis failed');
//         } finally {
//             setAnalyzing(false);
//         }
//     };

//     if (loadingResume) return <div className="loading">Loading...</div>;

//     return (
//         <div>
//             <Navbar />
//             <div className="resume-container">
//                 <h1>Resume</h1>

//                 {/* Upload Section */}
//                 <div className="resume-card">
//                     <h2>Your Resume</h2>

//                     {resumeUrl ? (
//                         <div className="resume-preview">
//                             <p>Resume uploaded ✅</p>
//                             <div className="resume-actions">
//                                 <a href={resumeUrl} target="_blank" rel="noreferrer">
//                                     <button className="btn btn-secondary">View Resume</button>
//                                 </a>
//                                 <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
//                                     {uploading ? 'Uploading...' : 'Replace Resume'}
//                                     <input
//                                         type="file"
//                                         accept=".pdf,.doc,.docx"
//                                         onChange={handleUpload}
//                                         style={{ display: 'none' }}
//                                         disabled={uploading}
//                                     />
//                                 </label>
//                                 <button
//                                     className="btn btn-accent"
//                                     onClick={handleAnalyze}
//                                     disabled={analyzing}
//                                 >
//                                     {analyzing ? 'Analyzing...' : '✨ Analyze with AI'}
//                                 </button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="resume-empty">
//                             <p>No resume uploaded yet.</p>
//                             <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
//                                 {uploading ? 'Uploading...' : 'Upload Resume'}
//                                 <input
//                                     type="file"
//                                     accept=".pdf,.doc,.docx"
//                                     onChange={handleUpload}
//                                     style={{ display: 'none' }}
//                                     disabled={uploading}
//                                 />
//                             </label>
//                         </div>
//                     )}
//                 </div>

//                 {/* Analysis Results */}
//                 {analysis && (
//                     <div className="analysis-container">

//                         {/* Score */}
//                         <div className="analysis-score-card">
//                             <h2>Resume Score</h2>
//                             <div className="score-circle">
//                                 <span>{analysis.resume_score}</span>
//                                 <small>/100</small>
//                             </div>
//                         </div>

//                         <div className="analysis-grid">

//                             {/* Skills */}
//                             <div className="analysis-card">
//                                 <h3>🛠 Skills Detected</h3>
//                                 <div className="tag-list">
//                                     {analysis.skills?.map((s, i) => (
//                                         <span key={i} className="tag tag-blue">{s}</span>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Suggested Roles */}
//                             <div className="analysis-card">
//                                 <h3>🎯 Suggested Roles</h3>
//                                 <div className="tag-list">
//                                     {analysis.suggested_roles?.map((r, i) => (
//                                         <span key={i} className="tag tag-green">{r}</span>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Missing Skills */}
//                             <div className="analysis-card">
//                                 <h3>⚠️ Missing Skills</h3>
//                                 <div className="tag-list">
//                                     {analysis.missing_skills?.map((s, i) => (
//                                         <span key={i} className="tag tag-red">{s}</span>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Strengths */}
//                             <div className="analysis-card">
//                                 <h3>✅ Strengths</h3>
//                                 <ul>
//                                     {analysis.strengths?.map((s, i) => (
//                                         <li key={i}>{s}</li>
//                                     ))}
//                                 </ul>
//                             </div>

//                             {/* Weaknesses */}
//                             <div className="analysis-card">
//                                 <h3>❌ Weaknesses</h3>
//                                 <ul>
//                                     {analysis.weaknesses?.map((w, i) => (
//                                         <li key={i}>{w}</li>
//                                     ))}
//                                 </ul>
//                             </div>

//                             {/* Improvement Suggestions */}
//                             <div className="analysis-card">
//                                 <h3>💡 Improvement Suggestions</h3>
//                                 <ul>
//                                     {analysis.improvement_suggestions?.map((s, i) => (
//                                         <li key={i}>{s}</li>
//                                     ))}
//                                 </ul>
//                             </div>

//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Resume;

import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

function Resume() {
    const [resumeUrl, setResumeUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [experienceLevel, setExperienceLevel] = useState('fresher');
    const [loadingResume, setLoadingResume] = useState(true);

    useEffect(() => {
        fetchResume();
    }, []);

    const fetchResume = async () => {
        try {
            const res = await api.get('/api/resume');
            setResumeUrl(res.data.resume_url);
        } catch (err) {
            if (err.response?.status !== 404) {
                toast.error('Failed to fetch resume');
            }
        } finally {
            setLoadingResume(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            const res = await api.post('/api/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResumeUrl(res.data.file.url);
            setAnalysis(null);
            toast.success('Resume uploaded successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const res = await api.get(`/api/analyzer/analyze?experience_level=${experienceLevel}`);
            setAnalysis(res.data.analysis);
            toast.success('Analysis complete!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loadingResume) return <div className="loading">Loading...</div>;

    const levels = [
        { value: 'fresher', label: '🎓 Fresher', sub: '0 years' },
        { value: 'intermediate', label: '💼 Intermediate', sub: '1–2 years' },
        { value: 'experienced', label: '🚀 Experienced', sub: '2+ years' },
    ];

    return (
        <div>
            <Navbar />
            <div className="resume-container">
                <h1>Resume</h1>

                {/* Upload Section */}
                <div className="resume-card">
                    <h2>Your Resume</h2>

                    {resumeUrl ? (
                        <div className="resume-preview">
                            <p>Resume uploaded ✅</p>

                            {/* Experience Level Selector */}
                            <div className="my-4">
                                <label className="text-sm font-medium text-slate-700 block mb-2">
                                    Analyze as
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {levels.map(level => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => {
                                                setExperienceLevel(level.value);
                                                setAnalysis(null); // clear old analysis on level change
                                            }}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                                experienceLevel === level.value
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                        >
                                            {level.label}
                                            <span className={`ml-1 text-xs ${
                                                experienceLevel === level.value
                                                    ? 'text-blue-100'
                                                    : 'text-slate-400'
                                            }`}>
                                                ({level.sub})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="resume-actions">
                                <a href={resumeUrl} target="_blank" rel="noreferrer">
                                    <button className="btn btn-secondary">View Resume</button>
                                </a>
                                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                    {uploading ? 'Uploading...' : 'Replace Resume'}
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleUpload}
                                        style={{ display: 'none' }}
                                        disabled={uploading}
                                    />
                                </label>
                                <button
                                    className="btn btn-accent"
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                >
                                    {analyzing ? 'Analyzing...' : '✨ Analyze Resume'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="resume-empty">
                            <p>No resume uploaded yet.</p>
                            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                {uploading ? 'Uploading...' : 'Upload Resume'}
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Analysis Results */}
                {analysis && (
                    <div className="analysis-container">

                        {/* Score + level badge */}
                        <div className="analysis-score-card">
                            <div>
                                <h2>Resume Score</h2>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                    experienceLevel === 'fresher'
                                        ? 'bg-blue-100 text-blue-700'
                                        : experienceLevel === 'intermediate'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {levels.find(l => l.value === experienceLevel)?.label}
                                </span>
                            </div>
                            <div className="score-circle">
                                <span className={
                                    analysis.resume_score >= 75
                                        ? 'text-4xl font-bold text-emerald-500'
                                        : analysis.resume_score >= 50
                                        ? 'text-4xl font-bold text-amber-500'
                                        : 'text-4xl font-bold text-red-500'
                                }>
                                    {analysis.resume_score}
                                </span>
                                <small>/100</small>
                            </div>
                        </div>

                        <div className="analysis-grid">

                            {/* Skills */}
                            <div className="analysis-card">
                                <h3>🛠 Skills Detected</h3>
                                <div className="tag-list">
                                    {analysis.skills?.map((s, i) => (
                                        <span key={i} className="tag tag-blue">{s}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Suggested Roles */}
                            <div className="analysis-card">
                                <h3>🎯 Suggested Roles</h3>
                                <div className="tag-list">
                                    {analysis.suggested_roles?.map((r, i) => (
                                        <span key={i} className="tag tag-green">{r}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Missing Skills */}
                            <div className="analysis-card">
                                <h3>⚠️ Missing Skills</h3>
                                <div className="tag-list">
                                    {analysis.missing_skills?.map((s, i) => (
                                        <span key={i} className="tag tag-red">{s}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Strengths */}
                            <div className="analysis-card">
                                <h3>✅ Strengths</h3>
                                <ul>
                                    {analysis.strengths?.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="analysis-card">
                                <h3>❌ Weaknesses</h3>
                                <ul>
                                    {analysis.weaknesses?.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvement Suggestions */}
                            <div className="analysis-card">
                                <h3>💡 Improvement Suggestions</h3>
                                <ul>
                                    {analysis.improvement_suggestions?.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Resume;