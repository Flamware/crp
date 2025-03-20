import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';

const Logo = ({ setActiveButton }) => (
    <div className="flex items-center space-x-4">
        <a
            href="https://www.retraitespopulaires.ch/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setActiveButton('home')}
        >
            <img
                className="w-auto h-16 max-h-16"
                src="https://www.retraitespopulaires.ch/themes/retraitespopulaires/build/svg/logo-retraitespopulaires.svg"
                alt="Retraites Populaires"
                title="Cliquez pour accéder à la page d'accueil de Retraites Populaires"
            />
        </a>
    </div>
);

const JobOfferLink = ({ activeButton, setActiveButton }) => (
    <div>
        <Link to="/dashboard" onClick={() => setActiveButton('dashboard')}>
      <span className={`inline-block ${activeButton === 'dashboard' ? 'border-b-4 border-primary pb-1' : ''}`}>
        <p className={`text-lg font-bold ${activeButton === 'dashboard' ? 'text-primary' : 'text-black'}`}>
          Offres d’Emploi / Alternance
        </p>
      </span>
        </Link>
    </div>
);

const UserSection = ({ user, users, handleUserChange, activeButton, setActiveButton }) => {
    if (user) {
        return (
            <Link to="/account" onClick={() => setActiveButton('account')}>
                <div className="flex items-center space-x-2">
                    <FaUserCircle className="w-8 h-8 text-gray-600" />
                    <span className={`font-semibold ${activeButton === 'account' ? 'text-primary' : 'text-black'}`}>
            {user.personalInfo.firstName} {user.personalInfo.lastName}
          </span>
                </div>
            </Link>
        );
    }
    return (
        <>
            <div className="relative flex items-center">
                <FaUserCircle className="w-8 h-8 text-gray-600" />
                <select
                    onChange={handleUserChange}
                    className="ml-2 bg-white border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                    <option value="">Select a user</option>
                    {users.length > 0 ? (
                        users.map((u, idx) => (
                            <option key={idx} value={`${u.personalInfo.firstName} ${u.personalInfo.lastName}`}>
                                {u.personalInfo.firstName} {u.personalInfo.lastName}
                            </option>
                        ))
                    ) : (
                        <option disabled>Loading users...</option>
                    )}
                </select>
            </div>
            <Link to="/account" onClick={() => setActiveButton('account')}>
                <div className="flex items-center space-x-2">
                    <FaUserCircle className="w-8 h-8 text-gray-600" />
                    <p className={`font-bold ${activeButton === 'account' ? 'text-primary' : 'text-black'}`}>
                        Mon Profil
                    </p>
                </div>
            </Link>
        </>
    );
};

const AdminSection = ({ activeButton, setActiveButton }) => (
    <Link to="/admin" onClick={() => setActiveButton('admin')}>
    <span className={`inline-flex flex-col items-center ${activeButton === 'admin' ? 'border-b-4 border-primary pb-1' : ''}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8 text-gray-600">
        <path
            fill="currentColor"
            d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1 .7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4z"
        />
      </svg>
      <p className={`font-bold ${activeButton === 'admin' ? 'text-primary' : 'text-black'}`}>Admin</p>
    </span>
    </Link>
);

const Header = ({ onUserSelect, user }) => {
    const [activeButton, setActiveButton] = useState('');
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const API_URL = 'http://10.187.1.40:5000/';
    const location = useLocation();

    // Update active button based on current location
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/dashboard')) setActiveButton('dashboard');
        else if (path.startsWith('/admin')) setActiveButton('admin');
        else if (path.startsWith('/account')) setActiveButton('account');
        else setActiveButton('');
    }, [location]);

    // Fetch users if no user is selected
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_URL}user`);
                setUsers(response.data);
                setError('');
            } catch (err) {
                console.error("Error fetching users:", err);
                setError('Failed to load users.');
            }
        };

        if (!user) {
            fetchUsers();
        }
    }, [user]);

    const handleUserChange = (event) => {
        const selectedValue = event.target.value;
        const selectedUserObj = users.find(
            (u) => `${u.personalInfo.firstName} ${u.personalInfo.lastName}` === selectedValue
        );
        onUserSelect(selectedUserObj);
    };

    return (
        <div className="flex w-full z-40">
            <div className="max-w-5xl flex w-full bg-white shadow-md items-center justify-between rounded-b-lg p-2 mx-auto">
                <Logo setActiveButton={setActiveButton} />
                <JobOfferLink activeButton={activeButton} setActiveButton={setActiveButton} />
                <div className="flex items-center space-x-4">
                    <UserSection
                        user={user}
                        users={users}
                        handleUserChange={handleUserChange}
                        activeButton={activeButton}
                        setActiveButton={setActiveButton}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <AdminSection activeButton={activeButton} setActiveButton={setActiveButton} />
                </div>
            </div>
        </div>
    );
};

export default Header;