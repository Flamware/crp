import React from 'react';
import Header from '../component/header';

const Account = () => {
    const handleLogout = () => {
        console.log('User logged out');
    };

    return (
        <div className="account-page min-h-screen">
            <div className="container mx-auto p-6 max-w-4xl">
                {/* Profile Card */}
                <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 transform hover:scale-105 transition duration-300">
                    {/* Avatar and Greeting */}
                    <div className="flex items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-500  bg-flex items-center justify-center text-white text-2xl font-bold mr-4">
                            JD
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">Salut, John Doe!</h2>
                            <p className="text-gray-500">Bienvenue dans ton espace perso</p>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                            <span className="mr-2">Infos Perso</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <p><span className="font-semibold">Email:</span> john.doe@example.com</p>
                            <p><span className="font-semibold">Âge:</span> 18 ans</p>
                            <p><span className="font-semibold">Téléphone:</span> +41 79 123 45 67</p>
                            <p><span className="font-semibold">Ville:</span> Lausanne</p>
                            <p><span className="font-semibold">Pseudo réseaux:</span> @johnnyD</p>
                        </div>
                    </section>

                    {/* Education/Apprenticeship Info */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center">
                            <span className="mr-2">Parcours</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <p><span className="font-semibold">École:</span> Gymnase de Lausanne</p>
                            <p><span className="font-semibold">Formation:</span> Apprentissage CFC Informatique</p>
                            <p><span className="font-semibold">Employeur:</span> Retraites Populaires (Stage)</p>
                            <p><span className="font-semibold">Début:</span> 01.08.2024</p>
                        </div>
                    </section>

                    {/* Financial Info (Youth-Friendly) */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-yellow-600 mb-4 flex items-center">
                            <span className="mr-2"> Mon Salaire</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                            <p><span className="font-semibold">Salaire mensuel:</span> CHF 1,200 (apprenti)</p>
                            <p><span className="font-semibold">Objectif:</span> Économiser pour un voyage</p>
                        </div>
                    </section>

                    {/* Fun Facts */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center">
                            <span className="mr-2">Fun Facts</span>
                        </h3>
                        <ul className="list-disc list-inside text-gray-700">
                            <li>Passion: Skateboard 🛹</li>
                            <li>Jeu préféré: FIFA 25 🎮</li>
                            <li>Rêve: Visiter le Japon 🇯🇵</li>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;