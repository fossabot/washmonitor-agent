'use client';

import { useState, useEffect } from 'react';



const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LaundryDashboard = () => {
    const [user1Active, setUser1Active] = useState(false);
    const [user2Active, setUser2Active] = useState(false);
    const [loading, setLoading] = useState(false);
    type UserInfo = { name: string; color: string };
    const [userInfo, setUserInfo] = useState<{ user1: UserInfo; user2: UserInfo }>({
        user1: { name: 'User1', color: '#3b82f6' }, // blue-500 as hex
        user2: { name: 'User2', color: '#22c55e' }, // green-500 as hex
    });
    const [userNamesError, setUserNamesError] = useState(false);

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

        const fetchNames = async () => {
            try {
                const res = await fetch(`${API_URL}/users/names`);
                if (!res.ok) {
                    setUserNamesError(true);
                    setUserInfo({
                        user1: { name: 'User1', color: '#3b82f6' },
                        user2: { name: 'User2', color: '#22c55e' },
                    });
                    return;
                }
                const data = await res.json();
                if (
                    data.user1 && data.user2 &&
                    typeof data.user1.name === 'string' && typeof data.user2.name === 'string' &&
                    typeof data.user1.color === 'string' && typeof data.user2.color === 'string'
                ) {
                    setUserInfo({
                        user1: { name: data.user1.name, color: data.user1.color },
                        user2: { name: data.user2.name, color: data.user2.color },
                    });
                    setUserNamesError(false);
                } else {
                    setUserNamesError(true);
                    setUserInfo({
                        user1: { name: 'User1', color: '#3b82f6' },
                        user2: { name: 'User2', color: '#22c55e' },
                    });
                }
            } catch (e) {
                setUserNamesError(true);
                setUserInfo({
                    user1: { name: 'User1', color: '#3b82f6' },
                    user2: { name: 'User2', color: '#22c55e' },
                });
                console.log('Error fetching user names:', e);
            }
        };

        fetchNames();
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
            {userNamesError && (
                <div className="w-full bg-red-600 text-white text-center py-2 text-lg font-semibold shadow-md z-20">
                    Could not obtain user names. Using default placeholders.
                </div>
            )}
            {(!user2Active && !user1Active) && (
                <div className="w-full bg-gray-900 text-white text-center py-4 text-2xl font-semibold shadow-md z-10">
                    Who is using the washer?
                </div>
            )}
            <div className="flex flex-1">
                {(!user2Active && !user1Active) && (
                    <>
                        <div
                            className={"flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words text-white"}
                            style={{ backgroundColor: userInfo.user1.color }}
                            onClick={() => handleButtonClick('user1')}
                        >
                            {user1Active ? `${userInfo.user1.name} is using the washer` : userInfo.user1.name}
                            {user1Active && <div className="loader mt-4"></div>}
                        </div>
                        <div
                            className={"flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words text-white"}
                            style={{ backgroundColor: userInfo.user2.color }}
                            onClick={() => handleButtonClick('user2')}
                        >
                            {user2Active ? `${userInfo.user2.name} is using the washer` : userInfo.user2.name}
                            {user2Active && <div className="loader mt-4"></div>}
                        </div>
                    </>
                )}
                {user1Active && !user2Active && (
                    <div
                        className={"flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words text-white h-full w-full"}
                        style={{ backgroundColor: userInfo.user1.color }}
                        onClick={() => handleButtonClick('user1')}
                    >
                        {userInfo.user1.name} is using the washer
                        <div className="loader-running mt-4"></div>
                    </div>
                )}
                {user2Active && !user1Active && (
                    <div
                        className={"flex-1 flex flex-col justify-center items-center text-4xl cursor-pointer text-center break-words text-white h-full w-full"}
                        style={{ backgroundColor: userInfo.user2.color }}
                        onClick={() => handleButtonClick('user2')}
                    >
                        {userInfo.user2.name} is using the washer
                        <div className="loader-running mt-4"></div>
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