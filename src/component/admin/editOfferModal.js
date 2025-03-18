import React, { useEffect, useState } from "react";
import axios from "axios";

const EditOfferModal = ({ offer, onSave, onClose }) => {
    const [formData, setFormData] = useState({ situations: [] });
    const [loading, setLoading] = useState(true);
    const [newSituations, setNewSituations] = useState({});
    const API_URL = "http://localhost:5000";

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_URL}/offers/${offer}`)
            .then((res) => {
                setFormData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur lors du chargement de l'offre:", err);
                setLoading(false);
            });
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
        const title = previousSituationId === null
            ? newSituations["root"]?.title || "Nouvelle situation"
            : newSituations[previousSituationId]?.title || "Nouvelle situation";

        const statement = previousSituationId === null
            ? newSituations["root"]?.statement || ""
            : newSituations[previousSituationId]?.statement || "";

        const newSituation = {
            id: newSituationId,
            title,
            statement,
            choices: [],
            nextSituationId: null,
        };

        let updatedSituations = [...formData.situations];

        if (previousSituationId) {
            // Lock the nextSituationId once set
            updatedSituations = updatedSituations.map((situation) =>
                situation.id === previousSituationId
                    ? { ...situation, nextSituationId: newSituationId }
                    : situation
            );
        }

        updatedSituations.push(newSituation);

        try {
            await axios.put(`${API_URL}/offers/${offer}`, { ...formData, situations: updatedSituations });
            setFormData({ ...formData, situations: updatedSituations });
            setNewSituations((prev) => ({
                ...prev,
                [newSituationId]: { title: "", statement: "" },
            }));
        } catch (error) {
            console.error("Erreur lors de l'ajout de la situation :", error);
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
        const updatedSituations = formData.situations.map((situation) => {
            if (situation.id === situationId) {
                const newChoice = { text: "", quality: "" };
                return { ...situation, choices: [...situation.choices, newChoice] };
            }
            return situation;
        });
        setFormData({ ...formData, situations: updatedSituations });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg w-1/2">
                    <p className="text-gray-700">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-auto">
                <h2 className="text-xl font-bold mb-4">Modifier l’offre</h2>

                {formData.situations.length === 0 ? (
                    <div className="p-4 border rounded bg-gray-100">
                        <h4 className="font-medium text-lg">Ajouter la première situation</h4>
                        <input
                            type="text"
                            name="title"
                            value={newSituations["root"]?.title || ""}
                            onChange={(e) => handleNewSituationChange("root", e)}
                            placeholder="Titre"
                            className="w-full p-2 border rounded mb-2"
                        />
                        <textarea
                            name="statement"
                            value={newSituations["root"]?.statement || ""}
                            onChange={(e) => handleNewSituationChange("root", e)}
                            placeholder="Énoncé"
                            className="w-full p-2 border rounded mb-2"
                        />
                        <button onClick={() => handleAddSituation()} className="bg-green-500 text-white py-2 px-4 rounded">
                            Ajouter Situation
                        </button>
                    </div>
                ) : (
                    formData.situations.map((situation, index) => (
                        <div key={situation.id} className={`border-l-4 pl-4 mb-6 ${index > 0 ? "border-gray-300" : "border-blue-500"}`}>
                            <h3 className="text-lg font-semibold">{situation.title}</h3>
                            <p className="mb-2">{situation.statement}</p>
                            <p className="text-sm text-gray-500">
                                {situation.nextSituationId
                                    ? `Suivante: ${situation.nextSituationId} (non modifiable)`
                                    : "Dernière situation"}
                            </p>

                            <div className="mb-4">
                                <h4 className="font-medium">Réponses</h4>
                                {situation.choices.map((choice, choiceIndex) => (
                                    <div key={choiceIndex} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            name="text"
                                            value={choice.text}
                                            onChange={(e) => handleChoiceChange(situation.id, choiceIndex, e)}
                                            placeholder="Texte de la réponse"
                                            className="border p-1 rounded mr-2 w-2/3"
                                        />
                                        <input
                                            type="text"
                                            name="quality"
                                            value={choice.quality}
                                            onChange={(e) => handleChoiceChange(situation.id, choiceIndex, e)}
                                            placeholder="Qualité (libre)"
                                            className="border p-1 rounded w-1/3"
                                        />
                                    </div>
                                ))}
                                <button onClick={() => handleAddChoice(situation.id)} className="text-green-500 hover:underline text-sm">
                                    + Ajouter une réponse
                                </button>
                            </div>

                            {!situation.nextSituationId && (
                                <div className="mt-4 p-3 border rounded bg-gray-100">
                                    <h4 className="text-md font-medium">Ajouter une situation après</h4>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newSituations[situation.id]?.title || ""}
                                        onChange={(e) => handleNewSituationChange(situation.id, e)}
                                        placeholder="Titre"
                                        className="w-full p-2 border rounded mb-2"
                                    />
                                    <textarea
                                        name="statement"
                                        value={newSituations[situation.id]?.statement || ""}
                                        onChange={(e) => handleNewSituationChange(situation.id, e)}
                                        placeholder="Énoncé"
                                        className="w-full p-2 border rounded mb-2"
                                    />
                                    <button onClick={() => handleAddSituation(situation.id)} className="bg-green-500 text-white py-2 px-4 rounded">
                                        Ajouter Situation
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}

                <button onClick={() => onSave(formData)} className="bg-blue-500 text-white py-2 px-4 rounded">
                    Sauvegarder
                </button>
                <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded ml-2">
                    Close
                </button>
            </div>
        </div>
    );
};

export default EditOfferModal;
