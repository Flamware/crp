import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
          Offres de Stage / Apprentissage
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
            <Link to="/create-profile" onClick={() => setActiveButton('create-profile')}>
                <div className="flex items-center space-x-2">
                    <p className={`font-bold ${activeButton === 'create-profile' ? 'text-primary' : 'text-black'}`}>
                        Créer un Compte
                    </p>
                </div>
            </Link>
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

const AdminSection = ({ activeButton, setActiveButton }) => {
    const navigate = useNavigate();
    const ADMIN_PASSWORD = "rtxurxcv01"; // Set your password here
    const [errorMessage, setErrorMessage] = useState('');

    const handleAdminAccess = (e) => {
        e.preventDefault(); // Prevent default Link navigation

        // Check if the user has already authenticated for this session
        const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';

        if (isAdminAuthenticated) {
            setActiveButton('admin');
            navigate('/admin');
            return;
        }

        // Prompt for password
        const enteredPassword = prompt('Veuillez entrer le mot de passe pour accéder à la section Admin :');

        if (enteredPassword === ADMIN_PASSWORD) {
            // Password correct, set authentication flag and navigate
            localStorage.setItem('adminAuthenticated', 'true');
            setActiveButton('admin');
            navigate('/admin');
            setErrorMessage('');
        } else {
            // Password incorrect, show error message
            setErrorMessage('Mot de passe incorrect. Accès refusé.');
        }
    };

    return (
        <div className="flex flex-col items-center">
            <Link to="/admin" onClick={handleAdminAccess}>
        <span className={`inline-flex flex-col items-center ${activeButton === 'admin' ? 'border-b-4 border-primary pb-1' : ''}`}>
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-8 h-8 text-gray-600"
              fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2V7zm0 4h2v6h-2v-6z" />
          </svg>
          <p className={`font-bold ${activeButton === 'admin' ? 'text-primary' : 'text-black'}`}>Admin</p>
        </span>
            </Link>
            {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
        </div>
    );
};

const Header = ({ onUserSelect, user }) => {
    const [activeButton, setActiveButton] = useState('');
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const API_URL = 'http://localhost:5000/';
    const location = useLocation();

    // Update active button based on current location
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/dashboard')) setActiveButton('dashboard');
        else if (path.startsWith('/admin')) setActiveButton('admin');
        else if (path.startsWith('/account')) setActiveButton('account');
        else if (path.startsWith('/create-profile')) setActiveButton('create-profile');
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