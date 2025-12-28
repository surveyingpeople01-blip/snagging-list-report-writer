import { useState } from 'react';
import logoImg from '/logo.jpg';

interface LoginProps {
    onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple demo login - accept admin/admin
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('isLoggedIn', 'true');
            onLogin();
        } else {
            setError('Invalid credentials. Use admin/admin for demo.');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #003d82 0%, #0052a3 100%)' }}
        >
            <div className="bg-white rounded-[20px] shadow-xl p-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src={logoImg} alt="Surveying People" className="h-20 object-contain" />
                </div>

                {/* Title */}
                <h1 className="text-center text-[#002855] text-3xl font-bold mb-2">
                    Snagging List Report Writer
                </h1>
                <p className="text-center text-gray-500 text-sm mb-8">
                    Professional New Build Defects System - London, UK
                </p>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[#002855] font-semibold mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full h-[52px] px-4 bg-[#e8f0fe] border-2 border-[#003d82] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052a3]"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="block text-[#002855] font-semibold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-[52px] px-4 bg-[#e8f0fe] border-2 border-[#003d82] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052a3]"
                            placeholder="Enter password"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full h-[52px] bg-[#003d82] text-white font-bold text-lg rounded-lg shadow-md hover:bg-[#002d62] transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-gray-50 border-l-4 border-[#003d82] rounded-r-lg">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Demo Credentials
                    </p>
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Username:</span> admin
                    </p>
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Password:</span> admin
                    </p>
                </div>
            </div>
        </div>
    );
}
