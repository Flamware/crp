import React, { useEffect, useState } from "react";
import axios from "axios";
import QualityRadarChart from "../spiderChart";

const TechnicalTestModal = ({ offerId, onClose, userId, onEnd }) => {
    const [offer, setOffer] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedChoices, setSelectedChoices] = useState({});
    const [qualityCount, setQualityCount] = useState({});
    const [isTestFinished, setIsTestFinished] = useState(false);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/offers/${offerId}`);
                const fetchedOffer = response.data;
                setOffer(fetchedOffer);

                // Initialize quality count with all possible qualities set to 0
                const initialQualityCount = {};
                fetchedOffer.situations.forEach(situation => {
                    situation.choices.forEach(choice => {
                        const quality = choice.quality || "Other";
                        if (!(quality in initialQualityCount)) {
                            initialQualityCount[quality] = 0;
                        }
                    });
                });
                setQualityCount(initialQualityCount);
            } catch (error) {
                console.error("Error fetching offer:", error);
            }
        };

        fetchOffer();
    }, [offerId]);

    const handleChoiceSelect = (situationId, choiceIndex) => {
        setSelectedChoices((prev) => ({
            ...prev,
            [situationId]: choiceIndex
        }));
    };

    const handleNextQuestion = () => {
        const currentSituation = offer.situations[currentQuestionIndex];
        const selectedChoiceIndex = selectedChoices[currentSituation.id];

        if (selectedChoiceIndex !== undefined) {
            const selectedQuality = currentSituation.choices[selectedChoiceIndex].quality || "Other";

            setQualityCount((prevQualityCount) => ({
                ...prevQualityCount,
                [selectedQuality]: (prevQualityCount[selectedQuality] || 0) + 1
            }));

            if (currentQuestionIndex < offer.situations.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                setIsTestFinished(true);
            }
        } else {
            alert("Please select an option before proceeding.");
        }
    };

    const handlePreviousQuestion = () => {
        setSelectedChoices({});
        setQualityCount({});
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    if (!offer) {
        return (
            <div className="flex justify-center items-center h-screen text-xl font-semibold">
                Loading...
            </div>
        );
    }
    const handleSubmitResults = async () => {
        try {
            const result = {
                offerId: offer.id,
                offerTitle: offer.title,
                qualityCount: qualityCount
            };

            // Fetch the current user data
            const userResponse = await axios.get(`http://localhost:5000/user/${userId}`);
            const userData = userResponse.data;

            // Check if result for this offer already exists
            const updatedCandidature = userData.candidature.map(item =>
                item.offerId === offer.id ? result : item
            );

            // If result doesn't exist, add it
            if (!userData.candidature.some(item => item.offerId === offer.id)) {
                updatedCandidature.push(result);
            }

            // Update user data on the server
            await axios.put(`http://localhost:5000/user/${userId}`, {
                ...userData,
                candidature: updatedCandidature
            });

            alert("Test results successfully submitted!");
        } catch (error) {
            console.error("Error updating user candidature:", error);
            alert("Failed to submit test results.");
        }
    };



    if (isTestFinished) {
        return (
            <div className="absolute    w-full h-full bg-gray-800 bg-opacity-75 flex items-center justify-center overflow-y-auto">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Test Results</h2>

                    <QualityRadarChart qualityCount={qualityCount} />

                    <button
                        onClick={handleSubmitResults}
                        className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-semibold"
                    >
                        Submit Results
                    </button>

                    <button
                        onClick={onClose}
                        className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const currentSituation = offer.situations[currentQuestionIndex];

    return (
        <div className="fixed inset-0 p-8 bg-gray-800 bg-opacity-75 flex items-center justify-center overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-6xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
                    {offer.title} - Technical Test
                </h2>

                <div className="w-full bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2">{currentSituation.title}</h3>
                    <img
                        src={currentSituation.pictureUrl}
                        className=" w-full h-64 object-cover rounded-lg mb-4"
                    />
                    <p className="text-gray-700 mb-4">{currentSituation.statement}</p>

                    <ul className="space-y-3">
                        {currentSituation.choices.map((choice, index) => {
                            const isSelected = selectedChoices[currentSituation.id] === index;
                            return (
                                <li
                                    key={index}
                                    className={`flex items-center p-3 rounded-lg shadow text-gray-800 border ${
                                        isSelected ? "bg-blue-500 text-white" : "bg-white border-gray-300"
                                    } hover:bg-blue-100 cursor-pointer transition`}
                                    onClick={() => handleChoiceSelect(currentSituation.id, index)}
                                >
                                    <input type="radio" checked={isSelected} readOnly hidden />
                                    {choice.text}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={handlePreviousQuestion}
                        className={`px-4 py-2 rounded-lg ${
                            currentQuestionIndex === 0
                                ? "bg-gray-300 text-gray-600"
                                : "bg-gray-200 hover:bg-gray-300 text-black"
                        }`}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </button>

                    <button onClick={onClose} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
                        Close
                    </button>

                    <button
                        onClick={handleNextQuestion}
                        className={`px-4 py-2 rounded-lg ${
                            currentQuestionIndex === offer.situations.length - 1
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-gray-200 hover:bg-gray-300 text-black"
                        }`}
                    >
                        {currentQuestionIndex === offer.situations.length - 1 ? "Submit" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TechnicalTestModal;
