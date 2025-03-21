import React, { useEffect, useState } from "react";
import axios from "axios";
import SpiderChart from "../spiderChart";

const PsychologyTestModal = ({ onClose, userId, onEnd }) => {
    const [selectedChoices, setSelectedChoices] = useState({});
    const [isTestFinished, setIsTestFinished] = useState(false);
    const [psychTest, setPsychTest] = useState(null);
    const [resultCorrespondance, setResultCorrespondance] = useState(null);

    useEffect(() => {
        const fetchPsychologyTestData = async () => {
            try {
                const response = await axios.get("https://crp-hcnk.onrender.com/psychology");
                const testData = response.data.find((item) => item.test);
                if (testData) {
                    setPsychTest(testData.test);
                }
                const resultCor = response.data.find((item) => item.result);
                if (resultCor) {
                    setResultCorrespondance(resultCor);
                }
            } catch (error) {
                console.error("Error fetching psychology test data:", error);
            }
        };
        fetchPsychologyTestData();
    }, []);

    const dichotomies = psychTest ?? [];

    const handleChoiceSelect = (dichotomyId, value) => {
        const strength = Math.abs(value); // 0 to 5
        const choice =
            value < 0
                ? dichotomies.find((d) => d.id === dichotomyId).left.letter
                : value > 0
                    ? dichotomies.find((d) => d.id === dichotomyId).right.letter
                    : null;
        setSelectedChoices((prev) => ({
            ...prev,
            [dichotomyId]: { choice, strength },
        }));
    };

    const calculateMBTIType = () => {
        let mbtiType = "";
        dichotomies.forEach((dichotomy) => {
            const choice = selectedChoices[dichotomy.id];
            if (choice?.choice) {
                mbtiType += choice.choice;
            } else {
                mbtiType += "-"; // Placeholder for undetermined
            }
        });
        return mbtiType || "Not determined";
    };

    const getWinningQuality = (dichotomy) => {
        const choiceData = selectedChoices[dichotomy.id] || { choice: null };
        if (!choiceData.choice) {
            return "Aucune préférence";
        }
        return choiceData.choice === dichotomy.left.letter
            ? dichotomy.left.type
            : dichotomy.right.type;
    };

    const handleSubmitResults = async () => {
        // Check if any slider is left unadjusted (i.e. remains 0)
        for (let dichotomy of dichotomies) {
            if (!selectedChoices[dichotomy.id] || selectedChoices[dichotomy.id].strength === 0) {
                alert("Choisisez une valeur differente de 0 pour chaque curseur.");
                return;
            }
        }
        try {
            const mbtiType = calculateMBTIType();

            const transformedPreferences = Object.keys(selectedChoices).map((dichotomyId) => {
                const choiceData = selectedChoices[dichotomyId] || { choice: null, strength: 0 };
                const dichotomy = dichotomies.find((d) => d.id === dichotomyId);
                const quality = getWinningQuality(dichotomy);
                return {
                    dichotomy: dichotomyId,
                    quality: quality === "Aucune préférence" ? null : quality,
                    letter: choiceData.choice || "-",
                    count: choiceData.strength || 0,
                };
            });

            const qualityCountObj = dichotomies.reduce((acc, dichotomy) => {
                const choiceData = selectedChoices[dichotomy.id] || { strength: 0 };
                const winningQuality = getWinningQuality(dichotomy);
                acc[winningQuality] = choiceData.strength;
                return acc;
            }, {});

            const result = {
                mbtiType: mbtiType,
                qualityCount: qualityCountObj,
            };

            const userResponse = await axios.get(`https://crp-hcnk.onrender.com/user/${userId}`);
            const userData = userResponse.data;

            await axios.put(`https://crp-hcnk.onrender.com/user/${userId}`, {
                ...userData,
                personalityTests: [result],
            });

            setIsTestFinished(true);
        } catch (error) {
            console.error("Error submitting personality test results:", error);
            alert("Failed to submit test results.");
        }
    };

    if (dichotomies.length === 0) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 text-white">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
                    <p className="text-xl font-semibold">No test data available.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        );
    }

    if (isTestFinished) {
        const mbtiType = calculateMBTIType();
        const qualityCountObj = dichotomies.reduce((acc, dichotomy) => {
            const choiceData = selectedChoices[dichotomy.id] || { strength: 0 };
            const winningQuality = getWinningQuality(dichotomy);
            acc[winningQuality] = choiceData.strength;
            return acc;
        }, {});

        const description =
            mbtiType.includes("-") || mbtiType === "Not determined"
                ? "Votre type est incomplet. Ajustez tous les curseurs pour obtenir une description complète."
                : resultCorrespondance?.result?.find((res) => res.type === mbtiType)?.description ||
                "Description non disponible pour ce type.";

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4">
                <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto text-center transform transition-all duration-300">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Test Results</h2>
                    <p className="text-lg text-gray-600 mb-1">
                        Votre type auto-évalué est :{" "}
                        <strong className="text-blue-600 text-xl font-bold">{mbtiType}</strong>
                    </p>
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Détails des scores</h3>
                            <ul className="text-left text-gray-600 space-y-2">
                                {dichotomies.map((dichotomy) => {
                                    const choiceData = selectedChoices[dichotomy.id] || { choice: "-", strength: 0 };
                                    const winningQuality = getWinningQuality(dichotomy);
                                    return (
                                        <li
                                            key={dichotomy.id}
                                            className="flex justify-between items-center p-1 rounded-md hover:bg-gray-100 transition"
                                        >
                                            <span className="text-gray-700 font-medium text-sm">{winningQuality}:</span>
                                            <span className="flex items-center gap-1">
                                                <strong className="text-blue-600">{choiceData.choice}</strong>
                                                <span className="text-xs text-gray-500">({choiceData.strength}/5)</span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="flex-1 flex flex-col items-center bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualisation des résultats</h3>
                            <div className="w-full max-w-xs h-48">
                                <SpiderChart qualityCount={qualityCountObj} />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Ma Personnalité</h2>
                <div className="space-y-8">
                    {dichotomies.map((dichotomy) => (
                        <div
                            key={dichotomy.id}
                            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                                {dichotomy.title}
                            </h3>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-600 font-medium w-1/3 text-center">
                                    {dichotomy.left.description}
                                </span>
                                <span className="text-sm text-gray-600 font-medium w-1/3 text-center">
                                    {dichotomy.right.description}
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="1"
                                    value={
                                        selectedChoices[dichotomy.id]?.strength *
                                        (selectedChoices[dichotomy.id]?.choice === dichotomy.left.letter ? -1 : 1) || 0
                                    }
                                    onChange={(e) => {
                                        const newValue = Number(e.target.value);
                                        if (newValue === 0) {
                                            alert("Selecting 0 is not allowed, please adjust the slider to a non-zero value.");
                                            return;
                                        }
                                        handleChoiceSelect(dichotomy.id, newValue);
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex justify-between w-full mt-2 text-sm text-gray-500">
                                    <span>(Très fortement)</span>
                                    <span>(Très fortement)</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-8">
                    <button
                        onClick={onClose}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmitResults}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        Soumettre
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PsychologyTestModal;