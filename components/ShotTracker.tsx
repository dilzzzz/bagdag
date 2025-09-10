import React, { useState, useMemo } from 'react';
import { Shot } from '../types';
import { TargetIcon, ChartBarIcon } from './icons';

const CLUBS = ['Driver', '3 Wood', '5 Wood', '4 Iron', '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron', 'Pitching Wedge', 'Sand Wedge', 'Lob Wedge', 'Putter'];
const RESULTS = ['Fairway Hit', 'Green in Regulation', 'Missed Left', 'Missed Right', 'Short', 'Long', 'In the Hole'];

// Sample data to make the component look populated initially
const initialShots: Shot[] = [
    { id: 1, club: 'Driver', distance: 265, result: 'Fairway Hit', date: new Date() },
    { id: 2, club: '7 Iron', distance: 160, result: 'Green in Regulation', date: new Date() },
    { id: 3, club: 'Driver', distance: 250, result: 'Missed Right', date: new Date() },
    { id: 4, club: 'Pitching Wedge', distance: 115, result: 'Short', date: new Date() },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-gray-700 p-4 rounded-lg flex items-center">
        <div className="bg-green-600 p-3 rounded-md mr-4">
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);


const ShotTracker: React.FC = () => {
    const [shots, setShots] = useState<Shot[]>(initialShots);
    const [club, setClub] = useState<string>(CLUBS[0]);
    const [distance, setDistance] = useState<string>('');
    const [result, setResult] = useState<string>(RESULTS[0]);

    const handleLogShot = (e: React.FormEvent) => {
        e.preventDefault();
        const distNum = parseInt(distance, 10);
        if (!club || !result || isNaN(distNum) || distNum <= 0) {
            alert("Please fill in all fields with valid data.");
            return;
        }

        const newShot: Shot = {
            id: Date.now(),
            club,
            distance: distNum,
            result,
            date: new Date(),
        };
        setShots(prevShots => [newShot, ...prevShots]);
        setDistance('');
    };
    
    const stats = useMemo(() => {
        const driverShots = shots.filter(s => s.club === 'Driver');
        const fairwayHits = driverShots.filter(s => s.result === 'Fairway Hit').length;
        
        const avgDrivingDistance = driverShots.length > 0
            ? (driverShots.reduce((sum, shot) => sum + shot.distance, 0) / driverShots.length).toFixed(0)
            : 'N/A';
            
        const fairwayHitPercentage = driverShots.length > 0
            ? ((fairwayHits / driverShots.length) * 100).toFixed(0)
            : 'N/A';

        return {
            totalShots: shots.length,
            avgDrivingDistance,
            fairwayHitPercentage
        };
    }, [shots]);

    return (
        <div className="flex flex-col h-full bg-gray-800 text-white p-6 md:p-8">
            <header className="mb-6">
                <h2 className="text-3xl font-bold text-green-400">Shot Tracker</h2>
                <p className="text-gray-400 mt-2">Log your shots to analyze your performance and improve your game.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Shots Logged" value={stats.totalShots.toString()} icon={ChartBarIcon} />
                <StatCard title="Avg. Driving Distance" value={`${stats.avgDrivingDistance} yds`} icon={TargetIcon} />
                <StatCard title="Fairway Hit %" value={`${stats.fairwayHitPercentage}%`} icon={TargetIcon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4">Log a New Shot</h3>
                    <form onSubmit={handleLogShot} className="space-y-4">
                        <div>
                            <label htmlFor="club" className="block text-sm font-medium text-gray-300 mb-1">Club</label>
                            <select id="club" value={club} onChange={e => setClub(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500">
                                {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="distance" className="block text-sm font-medium text-gray-300 mb-1">Distance (yards)</label>
                            <input type="number" id="distance" value={distance} onChange={e => setDistance(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500" placeholder="e.g., 250" />
                        </div>
                        <div>
                            <label htmlFor="result" className="block text-sm font-medium text-gray-300 mb-1">Result</label>
                            <select id="result" value={result} onChange={e => setResult(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-green-500 focus:border-green-500">
                                {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors">
                            Log Shot
                        </button>
                    </form>
                </div>
                
                {/* History Section */}
                <div className="lg:col-span-2 bg-gray-900 p-6 rounded-lg border border-gray-700">
                     <h3 className="text-xl font-semibold mb-4">Recent Shots</h3>
                     <div className="overflow-y-auto max-h-[calc(100vh-25rem)] pr-2">
                        {shots.length > 0 ? (
                            <ul className="space-y-3">
                                {shots.map(shot => (
                                    <li key={shot.id} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white">{shot.club}</p>
                                            <p className="text-sm text-gray-400">{shot.result}</p>
                                        </div>
                                        <p className="text-lg font-semibold text-green-400">{shot.distance} yds</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <div className="text-center py-10">
                                <p className="text-gray-500">No shots logged yet.</p>
                                <p className="text-gray-500 text-sm">Use the form to add your first shot.</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ShotTracker;
