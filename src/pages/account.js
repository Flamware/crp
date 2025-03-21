import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Account = ({ selectedUser, onLogout }) => {
    const [currentUser, setCurrentUser] = useState(selectedUser);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");
    const navigate = useNavigate();
    const API_URL = "http://10.187.1.40:5000/user";

    useEffect(() => {
        if (!selectedUser) {
            const storedUser = localStorage.getItem('selectedUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } else {
            setCurrentUser(selectedUser);
        }
    }, [selectedUser]);

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            return;
        }

        setIsDeleting(true);
        setDeleteMessage("");

        try {
            // Make a DELETE request to the backend to remove the user
            await axios.delete(`${API_URL}/${currentUser.id}`);

            // Clear local storage and log out the user
            localStorage.removeItem('selectedUser');
            onLogout();

            setDeleteMessage("Compte supprimé avec succès !");
            // Redirect to the homepage after a short delay
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error("Error deleting account:", error);
            setDeleteMessage("Erreur lors de la suppression du compte. Veuillez réessayer.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="account-page min-h-screen flex items-center justify-center">
                <p className="text-lg text-gray-600">Veuillez sélectionner un utilisateur.</p>
            </div>
        );
    }

    const { personalInfo = {}, education = {}, salary = {}, funFacts = [] } = currentUser;

    return (
        <div className="account-page min-h-screen">
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 transform hover:scale-105 transition duration-300">
                    {/* Avatar and Greeting */}
                    <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                            {personalInfo.firstName?.[0] || ''}{personalInfo.lastName?.[0] || ''}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Salut, {personalInfo.firstName} {personalInfo.lastName}!
                            </h2>
                            <p className="text-gray-500">Bienvenue dans ton espace perso</p>
                        </div>
                    </div>

                    {/* Personal Info Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-blue-600 mb-4">Infos Perso</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <p><span className="font-semibold">Email:</span> {personalInfo.email || 'N/A'}</p>
                            <p><span className="font-semibold">Âge:</span> {personalInfo.age || 'N/A'} ans</p>
                            <p><span className="font-semibold">Téléphone:</span> {personalInfo.phone || 'N/A'}</p>
                            <p><span className="font-semibold">Ville:</span> {personalInfo.city || 'N/A'}</p>
                            <p><span className="font-semibold">Pseudo réseaux:</span> {personalInfo.socialHandle || 'N/A'}</p>
                        </div>
                    </section>

                    {/* Education Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-green-600 mb-4">Parcours</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <p><span className="font-semibold">École:</span> {education.school || 'N/A'}</p>
                            <p><span className="font-semibold">Formation:</span> {education.program || 'N/A'}</p>
                            <p><span className="font-semibold">Employeur:</span> {education.employer || 'N/A'}</p>
                            <p><span className="font-semibold">Début:</span> {education.startDate || 'N/A'}</p>
                        </div>
                    </section>

                    {/* Salary Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-yellow-600 mb-4">Mon Salaire</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <p><span className="font-semibold">Salaire mensuel:</span> {salary.monthlySalary || 'N/A'}</p>
                            <p><span className="font-semibold">Objectif:</span> {salary.goal || 'N/A'}</p>
                        </div>
                    </section>

                    {/* Fun Facts Section */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-purple-600 mb-4">Fun Facts</h3>
                        <ul className="list-disc list-inside text-gray-700">
                            {funFacts.length > 0 ? (
                                funFacts.map((fact, idx) => {
                                    const factKey = Object.keys(fact)[0];
                                    return (
                                        <li key={idx}>
                      <span className="font-semibold">
                        {factKey.charAt(0).toUpperCase() + factKey.slice(1)}:
                      </span> {fact[factKey]}
                                        </li>
                                    );
                                })
                            ) : (
                                <li>Aucun fun fact disponible.</li>
                            )}
                        </ul>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            className="bg-red-500 text-white py-3 px-6 rounded-full hover:bg-red-600 transition duration-200 font-semibold"
                            onClick={handleLogout}
                        >
                            Déconnexion
                        </button>
                        <a
                            href="/edit-profile"
                            className="bg-blue-500 text-white py-3 px-6 rounded-full hover:bg-blue-600 transition duration-200 font-semibold text-center"
                        >
                            Modifier Profil
                        </a>
                        <button
                            className={`bg-gray-500 text-white py-3 px-6 rounded-full hover:bg-gray-600 transition duration-200 font-semibold ${
                                isDeleting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Suppression en cours..." : "Supprimer le Compte"}
                        </button>
                    </div>

                    {/* Delete Message */}
                    {deleteMessage && (
                        <p
                            className={`mt-4 text-lg text-center ${
                                deleteMessage.includes("Erreur") ? "text-red-500" : "text-green-500"
                            }`}
                        >
                            {deleteMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Account;