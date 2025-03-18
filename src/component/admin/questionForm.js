import React, {useEffect, useState} from "react";
import axios from "axios";

const QuestionForm = ({ offer, addQuestion, closeQuestionForm }) => {
    const [question, setQuestion] = useState({});

    const API_URL = "http://localhost:5000";

    useEffect(() => {
        axios
            .get(`${API_URL}/offers/${offer}`)
            .then((res) => {
                setQuestion(res.data); // Synchronize formData with loaded data
            })
            .catch((err) => {
                console.error("Error loading offer:", err);
            });
    }, [offer]); // Dependency on offerId to reload if ID changes

    // Situations existantes de l’offre
    const existingSituations = offer?.situations || [];

    const handleChange = (e) => {
        setQuestion({ ...question, [e.target.name]: e.target.value });
    };

    const handleChoiceChange = (index, field, value) => {
        const updatedChoices = question.choices.map((choice, i) =>
            i === index ? { ...choice, [field]: value } : choice
        );
        setQuestion({ ...question, choices: updatedChoices });
    };

    const addChoice = () => {
        const newChoice = {
            choiceId: question.choices.length + 1, // ID incrémental pour l’affichage
            text: "",
            feedback: "",
            nextSituationId: "", // Par défaut vide, à sélectionner dans le select
        };
        setQuestion({
            ...question,
            choices: [...question.choices, newChoice],
        });
    };

    const handleAddQuestion = () => {
        // Vérifier que chaque choix a un nextSituationId (optionnel si vous voulez autoriser des fins)
        const isValid = question.choices.every((choice) => choice.nextSituationId !== "");
        if (!isValid) {
            alert("Chaque choix doit être lié à une situation.");
            return;
        }
        addQuestion(question); // Passer la nouvelle question au parent
        setQuestion({
            id: `S${Date.now()}`, // Nouvel ID unique
            situation: "",
            choices: [],
        });
        closeQuestionForm(); // Fermer le formulaire
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-1/2">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Ajouter une Situation</h3>
                <textarea
                    name="situation"
                    value={question.situation || ""}
                    onChange={handleChange}
                    placeholder="Description de la situation"
                    className="p-3 border rounded-lg w-full h-20 mb-4"
                />
                {question.choices.length > 0 ? (
                    question.choices.map((choice, index) => (
                        <div key={choice.choiceId} className="space-y-2 mb-4">
                            <input
                                type="text"
                                value={choice.text || ""}
                                onChange={(e) => handleChoiceChange(index, "text", e.target.value)}
                                placeholder={`Choix ${choice.choiceId}`}
                                className="p-3 border rounded-lg w-full"
                            />
                            <input
                                type="text"
                                value={choice.feedback || ""}
                                onChange={(e) =>
                                    handleChoiceChange(index, "feedback", e.target.value)
                                }
                                placeholder={`Feedback pour Choix ${choice.choiceId}`}
                                className="p-3 border rounded-lg w-full"
                            />
                            <select
                                value={choice.nextSituationId || ""}
                                onChange={(e) =>
                                    handleChoiceChange(index, "nextSituationId", e.target.value)
                                }
                                className="p-3 border rounded-lg w-full"
                            >
                                <option value="">Sélectionner une situation</option>
                                {existingSituations.map((situation) => (
                                    <option key={situation.id} value={situation.id}>
                                        {situation.id} - {situation.situation.substring(0, 30)}...
                                    </option>
                                ))}
                                <option value={`S${Date.now() + index + 1}`}>
                                    Nouvelle situation
                                </option>
                            </select>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600 mb-4">
                        Aucun choix ajouté. Cliquez ci-dessous pour en ajouter un.
                    </p>
                )}
                <button
                    type="button"
                    onClick={addChoice}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mb-4"
                >
                    Ajouter un Choix
                </button>
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={closeQuestionForm}
                        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                    >
                        Ajouter la Situation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionForm;