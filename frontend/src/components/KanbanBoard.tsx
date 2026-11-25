import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

interface Candidate {
    _id: string;
    name: string;
    jobTitle: string;
    score: number;
    status: string;
    email?: string;
}

const COLUMNS = ['Applied', 'Shortlisted', 'Interview', 'Rejected'];

const KanbanBoard: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/candidates`);
            const formattedData = res.data.map((c: any) => ({
                ...c,
                status: c.status || 'Applied'
            }));
            setCandidates(formattedData);
        } catch (error) {
            console.error("Failed to fetch candidates", error);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('candidateId', id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            (e.target as HTMLElement).classList.add('opacity-50');
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.target as HTMLElement).classList.remove('opacity-50');
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const candidateId = e.dataTransfer.getData('candidateId');
        if (!candidateId) return;

        setCandidates(prev => prev.map(c => 
            c._id === candidateId ? { ...c, status: newStatus } : c
        ));

        try {
            const response = await axios.patch(`${API_BASE}/api/candidates/${candidateId}/status`, {
                status: newStatus
            });
            console.log("Save successful!", response.data);
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.message;
            alert(`Backend Save Failed: ${errorMsg}\nCheck if the backend server is running and reachable.`);
            console.error("Failed to update status", error);
            fetchCandidates();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-700 bg-green-100 border-green-200';
        if (score >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
        return 'text-red-700 bg-red-100 border-red-200';
    };

    const filteredCandidates = candidates.filter(candidate => {
        const searchLower = searchQuery.toLowerCase();
        return (
            candidate.name?.toLowerCase().includes(searchLower) ||
            candidate.jobTitle?.toLowerCase().includes(searchLower) ||
            candidate.email?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-6 w-full min-h-screen bg-white rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-black text-gray-800">ATS Pipeline</h2>
                
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search candidates or roles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 transition-all"
                    />
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 h-full overflow-x-auto pb-4">
                {COLUMNS.map(column => (
                    <div 
                        key={column}
                        className="flex-1 bg-gray-50/50 rounded-2xl p-4 min-w-[280px] min-h-[600px] border border-gray-100 shadow-sm"
                        onDrop={(e) => handleDrop(e, column)}
                        onDragOver={handleDragOver}
                    >
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                            <h3 className="font-bold text-gray-700">{column}</h3>
                            <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full font-bold">
                                {filteredCandidates.filter(c => c.status === column).length}
                            </span>
                        </div>
                        
                        <div className="space-y-3 min-h-[100px]">
                            {filteredCandidates
                                .filter(c => c.status === column)
                                .map(candidate => (
                                    <div
                                        key={candidate._id}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, candidate._id)}
                                        onDragEnd={handleDragEnd}
                                        className="bg-white p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all border border-gray-200 group"
                                    >
                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{candidate.name}</h4>
                                        <p className="text-xs text-gray-500 mb-3 mt-0.5 truncate pr-2" title={candidate.jobTitle}>
                                            {candidate.jobTitle}
                                        </p>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getScoreColor(candidate.score)}`}>
                                            Match: {candidate.score}%
                                        </span>
                                    </div>
                                ))}
                                {filteredCandidates.filter(c => c.status === column).length === 0 && (
                                    <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-medium">
                                        Drop candidates here
                                    </div>
                                )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;