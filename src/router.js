import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Account from './pages/account';
import Header from "./component/header";
import Admin from './pages/admin';
const AppRouter = () => {
    return (
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/account" element={<Account />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="Dashboard" element={<App />} />&
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;