import { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const EXPERIENCE_LEVELS = [
    { value: 'fresher', label: 'Fresher', sub: '0 years' },
    { value: 'intermediate', label: 'Intermediate', sub: '1–2 years' },
    { value: 'experienced', label: 'Experienced', sub: '2+ years' },
];

const ROLE_TYPES = [
    { value: 'software-development', label: 'Software Development', sub: 'SDE, backend, fullstack' },
    { value: 'frontend', label: 'Frontend / UI', sub: 'React, CSS, UI/UX' },
    { value: 'data-science', label: 'Data Science / ML', sub: 'Python, ML, analytics' },
    { value: 'devops', label: 'DevOps / Cloud', sub: 'Docker, AWS, CI/CD' },
    { value: 'product-management', label: 'Product Management', sub: 'PM, strategy' },
    { value: 'general', label: 'General / Any', sub: 'Broad evaluation' },
];

function Resume() {
    const [resumeUrl, setResumeUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [experienceLevel, setExperienceLevel] = useState('fresher');
    const [roleType, setRoleType] = useState('software-development');
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
            const res = await api.get(
                `/api/analyzer/analyze?experience_level=${experienceLevel}&role_type=${roleType}`
            );
            setAnalysis(res.data.analysis);
            toast.success('Analysis complete!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loadingResume) return <div className="loading">Loading...</div>;

    const selectedLevel = EXPERIENCE_LEVELS.find(l => l.value === experienceLevel);
    const selectedRole = ROLE_TYPES.find(r => r.value === roleType);

    return (
        <div>
            <Navbar />
            <div className="resume-container">
                <h1>Resume</h1>

                <div className="resume-card">
                    <h2>Your Resume</h2>

                    {resumeUrl ? (
                        <div className="resume-preview">
                            <p>Resume uploaded</p>

                            {/* Experience Level */}
                            <div className="mt-4 mb-3">
                                <label className="text-sm font-medium text-slate-700 block mb-2">
                                    Experience Level
                                </label>
                                <select
                                    value={experienceLevel}
                                    onChange={(e) => {
                                        setExperienceLevel(e.target.value);
                                        setAnalysis(null);
                                    }}
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full sm:w-auto min-w-[220px]"
                                >
                                    {EXPERIENCE_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label} ({level.sub})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Role Type */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-slate-700 block mb-2">
                                    Target Role
                                </label>
                                <select
                                    value={roleType}
                                    onChange={(e) => {
                                        setRoleType(e.target.value);
                                        setAnalysis(null);
                                    }}
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition w-full sm:w-auto min-w-[220px]"
                                >
                                    {ROLE_TYPES.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label} ({role.sub})
                                        </option>
                                    ))}
                                </select>
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
                                    {analyzing ? 'Analyzing...' : 'Analyze Resume'}
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

                        {/* Score card with context badges */}
                        <div className="analysis-score-card">
                            <div>
                                <h2>Resume Score</h2>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${experienceLevel === 'fresher'
                                        ? 'bg-blue-100 text-blue-700'
                                        : experienceLevel === 'intermediate'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {selectedLevel?.label}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                        {selectedRole?.label}
                                    </span>
                                </div>
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

                            <div className="analysis-card">
                                <h3>Skills Detected</h3>
                                <div className="tag-list">
                                    {analysis.skills?.map((s, i) => (
                                        <span key={i} className="tag tag-blue">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="analysis-card">
                                <h3>Suggested Roles</h3>
                                <div className="tag-list">
                                    {analysis.suggested_roles?.map((r, i) => (
                                        <span key={i} className="tag tag-green">{r}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="analysis-card">
                                <h3>Missing Skills</h3>
                                <div className="tag-list">
                                    {analysis.missing_skills?.map((s, i) => (
                                        <span key={i} className="tag tag-red">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="analysis-card">
                                <h3>Strengths</h3>
                                <ul>
                                    {analysis.strengths?.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="analysis-card">
                                <h3>Weaknesses</h3>
                                <ul>
                                    {analysis.weaknesses?.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="analysis-card">
                                <h3>Improvement Suggestions</h3>
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