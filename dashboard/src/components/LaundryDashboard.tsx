'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LaundryDashboard = () => {
    const [brenActive, setBrenActive] = useState(false);
    const [masonActive, setMasonActive] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/washer/getAgentStatus`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.status === 'monitor' && data.user) {
                    if (data.user.toLowerCase() === 'bren') {
                        setBrenActive(true);
                        setMasonActive(false);
                    } else if (data.user.toLowerCase() === 'mason') {
                        setMasonActive(true);
                        setBrenActive(false);
                    } else {
                        setBrenActive(false);
                        setMasonActive(false);
                    }
                } else if (data.status === 'idle') {
                    setBrenActive(false);
                    setMasonActive(false);
                }
            } catch (e) {
                console.log('Error fetching status:', e);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

const handleButtonClick = async (person: 'bren' | 'mason') => {
    setLoading(true);
    const isActivating = person === 'bren' ? !brenActive : !masonActive;
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
        if (person === 'bren') {
            setBrenActive(!brenActive);
            if (masonActive) setMasonActive(false);
        } else {
            setMasonActive(!masonActive);
            if (brenActive) setBrenActive(false);
        }
        setLoading(false);
    }, 300);
};

    return (
        <div className="flex flex-col h-screen w-screen">
            {(!masonActive && !brenActive) && (
                <div className="w-full bg-gray-900 text-white text-center py-4 text-2xl font-semibold shadow-md z-10">
                    Who is using the washer?
                </div>
            )}
            <div className="flex flex-1">
                {(!masonActive && !brenActive) && (
                    <>
                        <div
                            className={`flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words bg-rose-400 text-white`}
                            onClick={() => handleButtonClick('bren')}
                        >
                            {brenActive ? 'Bren is using the washer' : 'Bren'}
                            {brenActive && <div className="loader mt-4"></div>}
                        </div>
                        <div
                            className={`flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words bg-purple-600 text-white`}
                            onClick={() => handleButtonClick('mason')}
                        >
                            {masonActive ? 'Mason is using the washer' : 'Mason'}
                            {masonActive && <div className="loader mt-4"></div>}
                        </div>
                    </>
                )}
                {brenActive && !masonActive && (
                    <div
                        className="flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words bg-rose-400 text-white h-full w-full"
                        onClick={() => handleButtonClick('bren')}
                    >
                        Bren is using the washer
                        <div className="loader mt-4"></div>
                    </div>
                )}
                {masonActive && !brenActive && (
                    <div
                        className="flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words bg-purple-600 text-white h-full w-full"
                        onClick={() => handleButtonClick('mason')}
                    >
                        Mason is using the washer
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