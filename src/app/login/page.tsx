'use client';
import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, GraduationCap, Users, CornerDownRight } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M44 24C44 21.57 43.83 19.19 43.5 16.89H24V24H35.84C35.33 28.53 32.84 32.36 29.21 34.82L29.25 34.87L38.28 41.74L38.33 41.79C43.58 37.16 47 30.2 47 24C47 22.84 46.85 21.72 46.61 20.64H24V24Z"/>
        <path fill="#34A853" d="M24 47C29.62 47 34.54 45.19 38.33 41.79L29.21 34.82C26.79 36.43 23.86 37.33 20.8 37.33C15.28 37.33 10.53 33.62 8.87 28.53L8.82 28.49L1.87 33.85L1.75 33.9C5.46 41.38 12.5 47 24 47Z"/>
        <path fill="#FBBC05" d="M8.87 28.53C8.45 27.2 8.24 25.66 8.24 24C8.24 22.34 8.45 20.8 8.87 19.47L1.75 13.9C0.62 16.32 0 19.04 0 21.99C0 24.94 0.62 27.66 1.75 30.08L8.87 28.53Z"/>
        <path fill="#EA4335" d="M24 10.67C27.34 10.67 30.41 11.96 32.74 14.15L39.54 7.37C34.54 2.81 29.62 1 24 1C12.5 1 5.46 6.62 1.75 14.09L8.87 19.47C10.53 14.38 15.28 10.67 20.8 10.67C21.78 10.67 22.75 10.79 23.7 11.02L24 10.67Z"/>
        <path fill="none" d="M0 0H48V48H0V0Z"/>
    </svg>
);

const FacebookIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="#ffffff" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 6h5v-6h-5c-3.86 0-7 3.14-7 7v3h-4v6h4v16h6v-16h5l1-6h-6v-3c0-0.542 0.458-1 1-1z" />
    </svg>
);

const AuthInput = ({ icon: Icon, type = 'text', placeholder, value, onChange }) => (
    <div className="relative">
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/70" />
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full p-3 pl-12 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-primary transition duration-150"
            required
        />
    </div>
);

const SocialAuthButton = ({ Icon, provider, bgColor, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center p-3 font-semibold rounded-xl text-white ${bgColor} shadow-md hover:opacity-90 transition duration-150 transform hover:scale-[1.01]`}
    >
        <Icon />
        Sign in with {provider}
    </button>
);

const LoginForm = ({ onSwitch, role, setRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Simulated ${role} Login Attempt:`, { email, password });
        alert(`Login attempted as ${role} (Simulated)`);
    };

    const handleSocialClick = (provider) => {
        console.log(`Simulated ${provider} Sign-in Clicked for role: ${role}`);
        alert(`Redirecting to ${provider} for sign-in as ${role} (Simulated)`);
    }

    const buttonText = role === 'mentor' ? 'Login as Mentor' : 'Login as Mentee';
    const LoginIcon = role === 'mentor' ? GraduationCap : Users;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome to GuideLab</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1 italic">Your dream starts here</p>
            </div>

            <div className="space-y-3">
                <SocialAuthButton
                    Icon={GoogleIcon}
                    provider="Google"
                    bgColor="bg-red-600"
                    onClick={() => handleSocialClick('Google')}
                />
                <SocialAuthButton
                    Icon={FacebookIcon}
                    provider="Facebook"
                    bgColor="bg-blue-700"
                    onClick={() => handleSocialClick('Facebook')}
                />
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <AuthInput
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <AuthInput
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                type="submit"
                className="w-full flex items-center justify-center p-3 font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition duration-150 shadow-lg transform hover:scale-[1.01]"
            >
                <LoginIcon className="w-5 h-5 mr-2" />
                {buttonText}
            </button>
            
            {role !== 'mentor' && (
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => setRole('mentor')}
                        className="w-full flex items-center justify-center p-2 rounded-xl text-primary dark:text-primary/90 bg-primary/10 dark:bg-gray-700 font-semibold hover:bg-primary/20 dark:hover:bg-gray-600 transition duration-150"
                    >
                        <CornerDownRight className="w-4 h-4 mr-2" />
                        Log in as a Mentor
                    </button>
                </div>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={() => onSwitch(false)}
                    className="font-semibold text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 transition duration-150 focus:outline-none"
                >
                    Register Now
                </button>
            </p>
        </form>
    );
};

const RegisterForm = ({ onSwitch }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Simulated Registration Attempt:", { name, email, password });
        alert('Registration attempted (Simulated)');
    };

    const handleSocialClick = (provider) => {
        console.log(`Simulated ${provider} Registration Clicked`);
        alert(`Redirecting to ${provider} for registration (Simulated)`);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-6">Create Your Account</h2>

            <div className="space-y-3">
                <SocialAuthButton
                    Icon={GoogleIcon}
                    provider="Google"
                    bgColor="bg-red-600"
                    onClick={() => handleSocialClick('Google')}
                />
                <SocialAuthButton
                    Icon={FacebookIcon}
                    provider="Facebook"
                    bgColor="bg-blue-700"
                    onClick={() => handleSocialClick('Facebook')}
                />
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <AuthInput
                icon={User}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <AuthInput
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <AuthInput
                icon={Lock}
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                type="submit"
                className="w-full flex items-center justify-center p-3 font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition duration-150 shadow-lg transform hover:scale-[1.01]"
            >
                <UserPlus className="w-5 h-5 mr-2" />
                Register
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={() => onSwitch(true)}
                    className="font-semibold text-primary dark:text-primary/90 hover:text-primary/80 dark:hover:text-primary/70 transition duration-150 focus:outline-none"
                >
                    Login Here
                </button>
            </p>
        </form>
    );
};

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('mentee');

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 dark:bg-gray-900 font-sans">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border-t-8 border-primary transform hover:scale-[1.01] transition duration-300">
                    {isLogin ? (
                        <LoginForm onSwitch={setIsLogin} role={role} setRole={setRole} />
                    ) : (
                        <RegisterForm onSwitch={setIsLogin} />
                    )}
                </div>
            </div>
        </div>
    );
};
