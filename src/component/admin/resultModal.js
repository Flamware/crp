import React, { useEffect, useState } from "react";
import axios from "axios";
import SpiderChart from "../spiderChart";
import { FaChevronDown, FaChevronUp, FaCode, FaBrain, FaComments } from "react-icons/fa";

const ResultModal = ({ offer, onClose }) => {
    const [candidates, setCandidates] = useState([]);
    const [expandedCandidates, setExpandedCandidates] = useState({});
    const API_URL = "http://10.187.1.40:5000";
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [psychologyResults, setPsychologyResults] = useState([]);

    useEffect(() => {
        if (!offer) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [candidatesRes, psychologyRes] = await Promise.all([
                    axios.get(`${API_URL}/user`),
                    axios.get(`${API_URL}/psychology`),
                ]);

                const filteredCandidates = candidatesRes.data.filter((candidate) =>
                    candidate.candidature?.some((item) => item.offerId === offer.id)
                );

                setCandidates(filteredCandidates);
                setPsychologyResults(psychologyRes.data[0]?.result || []);
                // Initialize all candidates as collapsed
                setExpandedCandidates(
                    filteredCandidates.reduce((acc, candidate) => {
                        acc[candidate.id || Math.random()] = false;
                        return acc;
                    }, {})
                );
            } catch (error) {
                setError("Erreur lors du chargement des données.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [offer]);

    const toggleCandidate = (candidateId) => {
        setExpandedCandidates((prev) => ({
            ...prev,
            [candidateId]: !prev[candidateId],
        }));
    };

    return (
        <div className="fixed inset-0 p-6 bg-gray-900 bg-opacity-80 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Résumé des résultats des candidats
                    </h2>
                    <button
                        onClick={onClose}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-300"
                    >
                        Fermer
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center">
                        <svg
                            className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <p className="text-lg text-gray-600 mt-2">Chargement des candidats...</p>
                    </div>
                ) : error ? (
                    <p className="text-center text-lg text-red-500 font-semibold">{error}</p>
                ) : candidates.length === 0 ? (
                    <p className="text-center text-lg text-gray-600">
                        Aucun résultat de candidat disponible.
                    </p>
                ) : (
                    candidates.map((candidate, index) => {
                        const candidateId = candidate.id || index;
                        const isExpanded = expandedCandidates[candidateId];
                        const summary = {
                            responsesCount: candidate.responses ? Object.keys(candidate.responses).length : 0,
                        };
                        const candidateCandidature = candidate.candidature.find(
                            (item) => item.offerId === offer.id
                        );
                        const technicalQualityCount = candidateCandidature?.qualityCount || {};
                        const personalityTest = candidate.personalityTests?.[0] || null;
                        const psychoQualityCount = personalityTest?.qualityCount || {};
                        const mbtiType = personalityTest?.mbtiType || "Non déterminé";
                        const mbtiDescription =
                            psychologyResults.find((item) => item.type === mbtiType)?.description ||
                            "Aucune description disponible.";
                        const communicationResults = candidateCandidature?.communication;

                        return (
                            <div
                                key={candidateId}
                                className="mb-6 border rounded-lg shadow-sm bg-white overflow-hidden"
                            >
                                <div
                                    className={`p-4 cursor-pointer flex justify-between items-center transition-colors duration-200 ${
                                        isExpanded ? "bg-blue-100" : "bg-blue-50 hover:bg-blue-100"
                                    }`}
                                    onClick={() => toggleCandidate(candidateId)}
                                >
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {candidate.personalInfo?.firstName || "N/D"}{" "}
                                        {candidate.personalInfo?.lastName || "N/D"}
                                    </h3>
                                    {isExpanded ? (
                                        <FaChevronUp className="text-gray-600" />
                                    ) : (
                                        <FaChevronDown className="text-gray-600" />
                                    )}
                                </div>

                                {isExpanded && (
                                    <div className="p-6 animate-slide-down">
                                        <CandidateInfo candidate={candidate} />
                                        <TestResults
                                            technicalQualityCount={technicalQualityCount}
                                            psychoQualityCount={psychoQualityCount}
                                            mbtiType={mbtiType}
                                            mbtiDescription={mbtiDescription}
                                            communicationResults={communicationResults}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const CandidateInfo = ({ candidate }) => (
    <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoItem label="Nom" value={`${candidate.personalInfo?.firstName || "N/D"} ${candidate.personalInfo?.lastName || "N/D"}`} />
            <InfoItem label="Email" value={candidate.personalInfo?.email || "N/D"} />
            <InfoItem label="Éducation" value={`${candidate.education?.school || "N/D"} - ${candidate.education?.program || "N/D"}`} />
            <InfoItem label="Objectif Salaire" value={candidate.salary?.goal || "N/D"} />
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-gray-700 font-semibold text-sm">{label}</p>
        <p className="text-gray-600">{value}</p>
    </div>
);

const TestResults = ({
                         technicalQualityCount,
                         psychoQualityCount,
                         mbtiType,
                         mbtiDescription,
                         communicationResults,
                     }) => (
                         <div className="flex flex-col space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TestChart
            title="Test Technique"
            qualityCount={technicalQualityCount}
            icon={<FaCode className="text-blue-500" />}
        />
        <TestChart
            title="Test Psychologique"
            qualityCount={psychoQualityCount}
            icon={<FaBrain className="text-purple-500" />
        }
        />

        {communicationResults && (
            <TestChart
                title="Test de Communication"
                icon={<FaComments className="text-green-500" />}
                content={
                    <div className="space-y-6">
                        <ResponseSection
                            title="Réponse Email"
                            content={communicationResults.emailResponse}
                        />
                        <ResponseSection
                            title={`Réponse ${communicationResults.mediaType === "video" ? "Vidéo" : "Audio"}`}
                            media={communicationResults.media}
                            mediaType={communicationResults.mediaType}
                        />
                    </div>
                }
            />
        )}
    </div>
                             <div className="bg-blue-50 p-4 rounded-lg mt-4">
                                 <p className="text-gray-800 font-semibold text-lg text-center">{mbtiType}</p>
                                 <p className="text-gray-600 text-sm leading-relaxed mt-2 text-center">
                                     {mbtiDescription}
                                 </p>
                             </div>
                         </div>
);

const TestChart = ({ title, qualityCount, icon, extraContent, content }) => (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
        <div className="flex items-center justify-center mb-4">
            {icon}
            <h3 className="text-xl font-semibold text-gray-800 ml-2">{title}</h3>
        </div>
        {content ? (
            content
        ) : (
            <>
                <div className="w-full h-64">
                    <SpiderChart qualityCount={qualityCount} className="w-full h-full" />
                </div>
                {extraContent}
            </>
        )}
    </div>
);

const ResponseSection = ({ title, content, media, mediaType }) => (
    <div className="mt-4">
        <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
        {content ? (
            <div className="p-4 bg-gray-100 rounded-lg border max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-gray-600">
                {content}
            </div>
        ) : media ? (
            <div className="flex justify-center">
                {mediaType === "video" ? (
                    <video
                        controls
                        src={media}
                        className="w-full max-w-sm h-40 rounded-lg shadow-sm"
                    />
                ) : (
                    <audio controls src={media} className="w-full max-w-sm" />
                )}
            </div>
        ) : (
            <p className="text-gray-600 text-center">Aucune réponse disponible.</p>
        )}
    </div>
);

export default ResultModal;

// Add this to your CSS (e.g., in a global stylesheet or a CSS module)
const styles = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
`;