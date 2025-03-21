import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Account from './pages/account';
import Admin from './pages/admin';
import Offer from './pages/offer';
import Dashboard from './pages/dashboard';
import Header from './component/header';
import Register from "./pages/register";

const Layout = ({ user, onUserSelect, onLogout }) => (
    <div>
        <Header user={user} onUserSelect={onUserSelect} onLogout={onLogout} />
        <main>
            <Outlet />
        </main>
    </div>
);

const AppRouter = () => {
    const [selectedUser, setSelectedUser] = useState(() => {
        const storedUser = localStorage.getItem('selectedUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        localStorage.setItem('selectedUser', JSON.stringify(user));
    };

    const handleLogout = () => {
        setSelectedUser(null);
        localStorage.removeItem('selectedUser');
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    element={
                        <Layout
                            user={selectedUser}
                            onUserSelect={handleUserSelect}
                            onLogout={handleLogout}
                        />
                    }
                >
                    {/* Redirect root to dashboard or account if user is selected */}
                    <Route
                        path="/"
                        element={<Navigate to={selectedUser ? "/dashboard" : "/account"} />}
                    />

                    <Route
                        path="/account"
                        element={<Account
                            selectedUser={selectedUser}
                            onLogout={handleLogout} />}
                    />
                    <Route
                        path="/admin"
                        element={<Admin selectedUser={selectedUser} />}
                    />
                    <Route
                        path="/dashboard"
                        element={<Dashboard selectedUser={selectedUser} />}
                    />
                    <Route
                        path="/offer/:id"
                        element={<Offer selectedUser={selectedUser} />}
                    />
                    {/* Catch all - Redirect to dashboard */}
                    <Route
                        path="*"
                        element={<Navigate to="/dashboard" />}
                    />
                    <Route
                        path="/register"
                        element={<Register to="/dashboard" />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
