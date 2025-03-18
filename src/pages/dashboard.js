import React, {useEffect, useState} from 'react';
import Header from '../component/header';
import axios from "axios";
const Dashboard = () => {
    const [jobOffers, setJobOffers] = useState([]);
    const API_URL = "http://localhost:5000/offers";

    useEffect(() => {
        axios.get(API_URL)
            .then((res) => setJobOffers(res.data))
            .catch((err) => console.error("Error loading offers:", err));
    }, []);

    return (
        <div className="dashboard-page min-h-screen ">
            <div className="container mx-auto p-6 max-w-5xl">
                {/* Dashboard Title */}

                {/* Job Offers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobOffers.map((offer) => (
                        <div
                            key={offer.id}
                            className="relative rounded-2xl p-2 shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 flex flex-col bg-white"
                        >
                            {/* Image Header */}
                            <div
                                className="h-48 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${offer.imgUrl})`,
                                    backgroundSize: 'cover',
                                }}
                            />

                            {/* Card Content */}
                            <div className="p-6 flex flex-col flex-grow">
                                {/* Title */}
                                <h2 className="text-xl font-bold text-gray-800 mb-3">{offer.title}</h2>

                                {/* Details */}
                                <div className="space-y-2 text-gray-700 text-base">
                                    <p>
                                        <span className="font-semibold text-gray-900">Employeur:</span> {offer.employer}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-gray-900">Lieu:</span> {offer.location}
                                    </p>
                                </div>

                                {/* Tags */}
                                <div className="flex space-x-3 my-4">
                  <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                    {offer.type}
                  </span>
                                    <span className="bg-yellow-100 text-yellow-700 text-sm font-medium px-3 py-1 rounded-full">
                    {offer.salary}
                  </span>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                                    {offer.description}
                                </p>

                                {/* Footer */}
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-500 text-sm">
                                        <span className="font-semibold text-gray-700">Début:</span> {offer.startDate}
                                    </p>
                                    <a
                                        href={`/apply/${offer.id}`}
                                        className="bg-blue-600 text-white py-2 px-5 rounded-full hover:bg-blue-700 transition duration-200 text-sm font-semibold"
                                    >
                                        Postuler
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {jobOffers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-2xl font-semibold text-gray-600">Aucune offre pour le moment 😕</p>
                        <p className="text-gray-500 mt-2">Reviens bientôt pour de nouvelles opportunités !</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;