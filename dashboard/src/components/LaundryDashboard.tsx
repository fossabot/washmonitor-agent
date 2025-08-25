'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LaundryDashboard = () => {
    const [user1Active, setUser1Active] = useState(false);
    const [user2Active, setUser2Active] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/washer/getAgentStatus`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.status === 'monitor' && data.user) {
                    if (data.user.toLowerCase() === 'user1') {
                        setUser1Active(true);
                        setUser2Active(false);
                    } else if (data.user.toLowerCase() === 'user2') {
                        setUser2Active(true);
                        setUser1Active(false);
                    } else {
                        setUser1Active(false);
                        setUser2Active(false);
                    }
                } else if (data.status === 'idle') {
                    setUser1Active(false);
                    setUser2Active(false);
                }
            } catch (e) {
                console.log('Error fetching status:', e);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

const handleButtonClick = async (person: 'user1' | 'user2') => {
    setLoading(true);
    const isActivating = person === 'user1' ? !user1Active : !user2Active;
    const status = isActivating ? 'monitor' : 'idle';
    const user = isActivating ? person : '';

    try {
        await fetch(`${API_URL}/washer/setAgentStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, user }),
        });
    } catch (e) {
        console.log('Error setting status:', e);
    }

    setTimeout(() => {
        if (person === 'user1') {
            setUser1Active(!user1Active);
            if (user2Active) setUser2Active(false);
        } else {
            setUser2Active(!user2Active);
            if (user1Active) setUser1Active(false);
        }
        setLoading(false);
    }, 300);
};

    return (
        <div className="flex flex-col h-screen w-screen">
            {(!user2Active && !user1Active) && (
                <div className="w-full bg-gray-900 text-white text-center py-4 text-2xl font-semibold shadow-md z-10">
                    Who is using the washer?
                </div>
            )}
            <div className="flex flex-1">
                {(!user2Active && !user1Active) && (
                    <>
                        <div
                            className={`flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words bg-rose-400 text-white`}
                            onClick={() => handleButtonClick('user1')}
                        >
                            {user1Active ? 'User1 is using the washer' : 'User1'}
                            {user1Active && <div className="loader mt-4"></div>}
                        </div>
                        <div
                            className={`flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words bg-purple-600 text-white`}
                            onClick={() => handleButtonClick('user2')}
                        >
                            {user2Active ? 'User2 is using the washer' : 'User2'}
                            {user2Active && <div className="loader mt-4"></div>}
                        </div>
                    </>
                )}
                {user1Active && !user2Active && (
                    <div
                        className="flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words bg-rose-400 text-white h-full w-full"
                        onClick={() => handleButtonClick('user1')}
                    >
                        User1 is using the washer
                        <div className="loader mt-4"></div>
                    </div>
                )}
                {user2Active && !user1Active && (
                    <div
                        className="flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words bg-purple-600 text-white h-full w-full"
                        onClick={() => handleButtonClick('user2')}
                    >
                        User2 is using the washer
                        <div className="loader mt-4"></div>
                    </div>
                )}
                {loading && (
                    <div
                        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-500">
                        <div
                            className="loader w-16 h-16 border-4 border-t-black border-b-black border-solid rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LaundryDashboard;