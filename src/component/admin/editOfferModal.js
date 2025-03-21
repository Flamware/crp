import React, { useEffect, useState } from "react";
import axios from "axios";

const EditOfferModal = ({ offer, onSave, onClose }) => {
    const [formData, setFormData] = useState({ situations: [] });
    const [loading, setLoading] = useState(true);
    const [newSituations, setNewSituations] = useState({});
    const API_URL = "https://crp-hcnk.onrender.com";

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${API_URL}/offers/${offer}`)
            .then((res) => {
                setFormData(res.data);
            })
            .catch((err) => console.error("Error loading offer:", err))
            .finally(() => setLoading(false));
    }, [offer]);

    const handleNewSituationChange = (situationId, e) => {
        const { name, value } = e.target;
        setNewSituations((prev) => ({
            ...prev,
            [situationId]: { ...prev[situationId], [name]: value },
        }));
    };

    const handleAddSituation = async (previousSituationId = null) => {
        const newSituationId = `S${Date.now()}`;
        const title = previousSituationId
            ? newSituations[previousSituationId]?.title || "New Situation"
            : newSituations["root"]?.title || "New Situation";
        const statement = previousSituationId
            ? newSituations[previousSituationId]?.statement || ""
            : newSituations["root"]?.statement || "";

        const newSituation = {
            id: newSituationId,
            title,
            statement,
            choices: [],
            nextSituationId: null,
        };

        let updatedSituations = [...formData.situations];
        if (previousSituationId) {
            updatedSituations = updatedSituations.map((situation) =>
                situation.id === previousSituationId
                    ? { ...situation, nextSituationId: newSituationId }
                    : situation
            );
        }

        updatedSituations.push(newSituation);

        try {
            await axios.put(`${API_URL}/offers/${offer}`, {
                ...formData,
                situations: updatedSituations,
            });
            setFormData({ ...formData, situations: updatedSituations });
            setNewSituations((prev) => ({
                ...prev,
                [newSituationId]: { title: "", statement: "" },
            }));
        } catch (error) {
            console.error("Error adding situation:", error);
        }
    };

    const handleChoiceChange = (situationId, choiceIndex, e) => {
        const { name, value } = e.target;
        const updatedSituations = formData.situations.map((situation) => {
            if (situation.id === situationId) {
                const updatedChoices = [...situation.choices];
                updatedChoices[choiceIndex] = { ...updatedChoices[choiceIndex], [name]: value };
                return { ...situation, choices: updatedChoices };
            }
            return situation;
        });
        setFormData({ ...formData, situations: updatedSituations });
    };

    const handleAddChoice = (situationId) => {
        const updatedSituations = formData.situations.map((situation) =>
            situation.id === situationId
                ? { ...situation, choices: [...situation.choices, { text: "", quality: "" }] }
                : situation
        );
        setFormData({ ...formData, situations: updatedSituations });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span>Loading offer...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Edit Offer</h2>

                {formData.situations.length === 0 ? (
                    <div className="border p-4 rounded bg-gray-100">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Add First Situation</h4>
                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={newSituations["root"]?.title || ""}
                            onChange={(e) => handleNewSituationChange("root", e)}
                            className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring focus:border-blue-300"
                        />
                        <textarea
                            name="statement"
                            placeholder="Statement"
                            value={newSituations["root"]?.statement || ""}
                            onChange={(e) => handleNewSituationChange("root", e)}
                            className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring focus:border-blue-300"
                        />
                        <button
                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500"
                            onClick={() => handleAddSituation()}
                        >
                            Ajouter une situation
                        </button>
                    </div>
                ) : (
                    formData.situations.map((situation, index) => (
                        <div key={situation.id} className="relative mb-8">
                            <div className={`border-l-4 pl-4 py-4 ${index === 0 ? "border-blue-500" : "border-gray-300"}`}>
                                <h3 className="text-lg font-semibold text-gray-800">{situation.title}</h3>
                                <p className="text-gray-600 mb-2">{situation.statement}</p>

                                <div className="mb-4">
                                    <h5 className="font-medium text-gray-700">Choix</h5>
                                    {situation.choices.map((choice, choiceIndex) => (
                                        <div key={choiceIndex} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                name="text"
                                                placeholder="Response"
                                                value={choice.text}
                                                onChange={(e) => handleChoiceChange(situation.id, choiceIndex, e)}
                                                className="flex-1 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                                            />
                                            <input
                                                type="text"
                                                name="quality"
                                                placeholder="Quality"
                                                value={choice.quality}
                                                onChange={(e) => handleChoiceChange(situation.id, choiceIndex, e)}
                                                className="flex-1 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                                            />
                                        </div>
                                    ))}
                                    <button className="text-green-600 hover:underline text-sm" onClick={() => handleAddChoice(situation.id)}>
                                        + Ajouter choix
                                    </button>
                                </div>

                                {!situation.nextSituationId && (
                                    <div className="mt-4 p-4 border rounded bg-gray-100">
                                        <h5 className="font-medium text-gray-700 mb-2">Ajouter une nouvelle situation</h5>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="Title"
                                            value={newSituations[situation.id]?.title || ""}
                                            onChange={(e) => handleNewSituationChange(situation.id, e)}
                                            className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                                        />
                                        <textarea
                                            name="statement"
                                            placeholder="Statement"
                                            value={newSituations[situation.id]?.statement || ""}
                                            onChange={(e) => handleNewSituationChange(situation.id, e)}
                                            className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                                        />
                                        <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-500" onClick={() => handleAddSituation(situation.id)}>
                                            Ajouter une situation
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                <div className="flex justify-end">
                    <button onClick={() => onSave(formData)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                        Sauvegarder
                    </button>
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded ml-2 hover:bg-gray-400">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditOfferModal;
