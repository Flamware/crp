import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import TechnicalTestModal from "../component/candidate/technicalTest";
import SpiderChart from "../component/spiderChart";
import PsychologyTest from "../component/candidate/psychologyTest";
import CommunicationTest from "../component/candidate/communicationTest";

const Offer = ({ selectedUser }) => {
    const { id } = useParams();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTechnicalTestModalOpen, setIsTechnicalTestModalOpen] = useState(false);
    const [isTechnicalTestFinished, setIsTechnicalTestFinished] = useState(false);
    const [technicalTestResult, setTechnicalTestResult] = useState(null);
    const [isPychologyTestModalOpen, setIsPychologyTestModalOpen] = useState(false);
    const [isCommunicationTestModalOpen, setIsCommunicationTestModalOpen] = useState(false);
    const [psychologyTestResult, setPsychologyTestResult] = useState(null);
    const [communicationTestData, setCommunicationTestData] = useState(null);
    const [activeTab, setActiveTab] = useState("offer"); // "offer" or "result"
    const [isDeletingTechnical, setIsDeletingTechnical] = useState(false);
    const [isDeletingPsychology, setIsDeletingPsychology] = useState(false);
    const [isDeletingCommunication, setIsDeletingCommunication] = useState(false);
    const API_URL = "https://crp-hcnk.onrender.com/offers";

    useEffect(() => {
        const fetchUserCandidature = async () => {
            try {
                const response = await axios.get(`https://crp-hcnk.onrender.com/user/${selectedUser.id}`);
                const user = response.data;

                // Fetch Technical Test Results
                const candidature = user.candidature.find((item) => item.offerId === id);
                if (candidature) {
                    setTechnicalTestResult(candidature.qualityCount);
                    setIsTechnicalTestFinished(true);

                    // Fetch Communication Test Results
                    if (candidature.communication) {
                        setCommunicationTestData(candidature.communication);
                    }
                }

                // Fetch Psychology Test Results
                const testResult = user.personalityTests?.[0];
                if (testResult) {
                    setPsychologyTestResult(testResult.qualityCount);
                }
            } catch (error) {
                console.error("Error fetching candidature:", error);
            }
        };

        if (selectedUser?.id && id) fetchUserCandidature();
    }, [id, selectedUser]);

    useEffect(() => {
        axios
            .get(`${API_URL}/${id}`)
            .then((res) => {
                setOffer(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching offer:", err);
                setLoading(false);
            });
    }, [id]);

    // Delete Technical Test Result
    const handleDeleteTechnicalResult = async () => {

        setIsDeletingTechnical(true);
        try {
            const response = await axios.get(`https://crp-hcnk.onrender.com/user/${selectedUser.id}`);
            const user = response.data;

            // Update the candidature by removing qualityCount
            const updatedCandidature = user.candidature.map((item) => {
                if (item.offerId === id) {
                    const { qualityCount, ...rest } = item; // Remove qualityCount
                    return rest;
                }
                return item;
            });

            // Update user data in the backend
            await axios.put(`https://crp-hcnk.onrender.com/user/${selectedUser.id}`, {
                ...user,
                candidature: updatedCandidature,
            });

            // Reset state
            setTechnicalTestResult(null);
            setIsTechnicalTestFinished(false);
            alert("Résultats du test technique supprimés avec succès.");
        } catch (error) {
            console.error("Error deleting technical test result:", error);
            alert("Erreur lors de la suppression des résultats du test technique.");
        } finally {
            setIsDeletingTechnical(false);
        }
    };

    // Delete Psychological Test Result
    const handleDeletePsychologyResult = async () => {

        setIsDeletingPsychology(true);
        try {
            const response = await axios.get(`https://crp-hcnk.onrender.com/user/${selectedUser.id}`);
            const user = response.data;

            // Remove personalityTests
            await axios.put(`https://crp-hcnk.onrender.com/user/${selectedUser.id}`, {
                ...user,
                personalityTests: [], // Clear personality tests
            });

            // Reset state
            setPsychologyTestResult(null);
            alert("Résultats du test psychologique supprimés avec succès.");
        } catch (error) {
            console.error("Error deleting psychological test result:", error);
            alert("Erreur lors de la suppression des résultats du test psychologique.");
        } finally {
            setIsDeletingPsychology(false);
        }
    };

    // Delete Communication Test Result
    const handleDeleteCommunicationResult = async () => {

        setIsDeletingCommunication(true);
        try {
            const response = await axios.get(`https://crp-hcnk.onrender.com/user/${selectedUser.id}`);
            const user = response.data;

            // Update the candidature by removing communication data
            const updatedCandidature = user.candidature.map((item) => {
                if (item.offerId === id) {
                    const { communication, ...rest } = item; // Remove communication
                    return rest;
                }
                return item;
            });

            // Update user data in the backend
            await axios.put(`https://crp-hcnk.onrender.com/user/${selectedUser.id}`, {
                ...user,
                candidature: updatedCandidature,
            });

            // Reset state
            setCommunicationTestData(null);
            alert("Résultats du test de communication supprimés avec succès.");
        } catch (error) {
            console.error("Error deleting communication test result:", error);
            alert("Erreur lors de la suppression des résultats du test de communication.");
        } finally {
            setIsDeletingCommunication(false);
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex items-center justify-center">
                <p className="text-lg text-gray-600">Veuillez sélectionner un utilisateur.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center text-xl font-semibold">
                Chargement...
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="flex justify-center items-center text-xl text-red-500 font-semibold">
                Offre non trouvée
            </div>
        );
    }

    return (
        <div className="">
            {isTechnicalTestModalOpen && (
                <TechnicalTestModal
                    offerId={id}
                    userId={selectedUser.id}
                    onClose={() => setIsTechnicalTestModalOpen(false)}
                    onEnd={() => setIsTechnicalTestFinished(true)}
                />
            )}
            {isPychologyTestModalOpen && (
                <PsychologyTest
                    offerId={id}
                    userId={selectedUser.id}
                    onClose={() => setIsPychologyTestModalOpen(false)}
                    onEnd={() => setIsPychologyTestModalOpen(false)}
                />
            )}
            {isCommunicationTestModalOpen && (
                <CommunicationTest
                    offerId={id}
                    userId={selectedUser.id}
                    onClose={() => setIsCommunicationTestModalOpen(false)}
                    onEnd={() => setIsCommunicationTestModalOpen(false)}
                />
            )}

            <div className="container mx-auto max-w-4xl bg-white shadow-lg rounded-2xl p-8">
                <div className="text-center">
                    <img
                        src={offer.imgUrl}
                        alt={offer.title}
                        className="h-48 w-48 object-cover rounded-full border-4 border-blue-500 shadow-md mx-auto"
                    />
                    <h1 className="text-4xl font-bold text-gray-800 my-4">{offer.title}</h1>
                    <p className="text-gray-600 mb-6">{offer.description}</p>
                </div>

                {/* Onglets */}
                <div className="flex justify-center border-b mb-6">
                    <button
                        className={`px-6 py-2 font-semibold ${
                            activeTab === "offer" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                        }`}
                        onClick={() => setActiveTab("offer")}
                    >
                        Offre
                    </button>
                    <button
                        className={`px-6 py-2 font-semibold ${
                            activeTab === "result" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
                        }`}
                        onClick={() => setActiveTab("result")}
                    >
                        Résultat
                    </button>
                </div>

                {activeTab === "offer" && (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-gray-700">
                            <p><strong>Employeur:</strong> {offer.employer}</p>
                            <p><strong>Lieu:</strong> {offer.location}</p>
                            <p><strong>Type:</strong> {offer.type}</p>
                            <p><strong>Salaire:</strong> {offer.salary}</p>
                            <p><strong>Début:</strong> {offer.startDate}</p>
                        </div>

                        <div className="mt-8 space-y-6">
                            {/* Test Buttons */}
                            <div className="flex flex-wrap justify-between gap-4">
                                <button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg shadow-md transition-all"
                                    onClick={() => setIsTechnicalTestModalOpen(true)}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-semibold">Technique</span>
                                        <img
                                            src="https://www.svgrepo.com/show/76775/test.svg"
                                            alt="Test Technique"
                                            className="h-16 w-16 mt-2"
                                        />
                                    </div>
                                </button>

                                <button
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-lg shadow-md transition-all"
                                    onClick={() => setIsPychologyTestModalOpen(true)}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-semibold">Personnalité</span>
                                        <img
                                            src="https://www.svgrepo.com/show/11930/psychology-book.svg"
                                            alt="Test Personnalité"
                                            className="h-16 w-16 mt-2"
                                        />
                                    </div>
                                </button>

                                <button
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg shadow-md transition-all"
                                    onClick={() => setIsCommunicationTestModalOpen(true)}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-semibold">Communication</span>
                                        <img
                                            src="https://pic.onlinewebfonts.com/thumbnails/icons_278491.svg"
                                            alt="Test Communication"
                                            className="h-16 w-16 mt-2"
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "result" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Technical Test Result */}
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                            {isTechnicalTestFinished && technicalTestResult ? (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                        Résultat du Test Technique
                                    </h2>
                                    <div className="flex justify-center">
                                        <div className="w-full h-64">
                                            <SpiderChart qualityCount={technicalTestResult} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDeleteTechnicalResult}
                                        disabled={isDeletingTechnical}
                                        className={`mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all ${
                                            isDeletingTechnical ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {isDeletingTechnical ? "Suppression..." : "Supprimer les résultats"}
                                    </button>
                                </>
                            ) : (
                                <p className="text-gray-600 text-center">
                                    Vous n'avez pas encore terminé le test technique.
                                </p>
                            )}
                        </div>

                        {/* Psychological Test Result */}
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                            {psychologyTestResult ? (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                        Résultat du Test Psychologique
                                    </h2>
                                    <div className="flex justify-center">
                                        <div className="w-full h-64">
                                            <SpiderChart qualityCount={psychologyTestResult} />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDeletePsychologyResult}
                                        disabled={isDeletingPsychology}
                                        className={`mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all ${
                                            isDeletingPsychology ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {isDeletingPsychology ? "Suppression..." : "Supprimer les résultats"}
                                    </button>
                                </>
                            ) : (
                                <p className="text-gray-600 text-center">
                                    Vous n'avez pas encore terminé le test psychologique.
                                </p>
                            )}
                        </div>

                        {/* Communication Test Result */}
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                            {communicationTestData ? (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                        Résultat du Test de Communication
                                    </h2>
                                    <div className="space-y-6">
                                        {/* Email Response */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                Réponse à l'email
                                            </h3>
                                            <div className="bg-white p-4 rounded-lg border border-gray-300 max-h-40 overflow-y-auto">
                                                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                                    {communicationTestData.emailResponse || "Aucune réponse"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Recorded Media */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                Réponse {communicationTestData.mediaType === "video" ? "vidéo" : "audio"}
                                            </h3>
                                            {communicationTestData.media ? (
                                                communicationTestData.mediaType === "video" ? (
                                                    <video
                                                        src={communicationTestData.media}
                                                        controls
                                                        className="w-full max-w-sm h-40 rounded-lg shadow-sm mx-auto"
                                                    />
                                                ) : (
                                                    <audio
                                                        src={communicationTestData.media}
                                                        controls
                                                        className="w-full max-w-sm mx-auto"
                                                    />
                                                )
                                            ) : (
                                                <p className="text-sm text-gray-600 text-center">
                                                    Aucune vidéo/audio enregistrée
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDeleteCommunicationResult}
                                        disabled={isDeletingCommunication}
                                        className={`mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all ${
                                            isDeletingCommunication ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                    >
                                        {isDeletingCommunication ? "Suppression..." : "Supprimer les résultats"}
                                    </button>
                                </>
                            ) : (
                                <p className="text-gray-600 text-center">
                                    Vous n'avez pas encore terminé le test de communication.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Offer;