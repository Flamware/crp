import React, { useState } from "react";
import axios from "axios";

const CreateProfile = () => {
    // Initial form state based on the required structure
    const [formData, setFormData] = useState({
        personalInfo: {
            firstName: "",
            lastName: "",
            email: "",
            age: "",
            phone: "",
            city: "",
            socialHandle: "",
        },
        education: {
            school: "",
            program: "",
            employer: "",
            startDate: "",
        },
        salary: {
            monthlySalary: "",
            goal: "",
        },
        funFacts: [
            { passion: "" },
            { favoriteGame: "" },
            { dream: "" },
        ],
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const API_URL = "http://localhost:5000/user";

    // Handle input changes for nested fields
    const handleChange = (e, section, field, index = null) => {
        const { value } = e.target;

        if (section === "funFacts") {
            setFormData((prev) => {
                const updatedFunFacts = [...prev.funFacts];
                updatedFunFacts[index] = { [field]: value };
                return { ...prev, funFacts: updatedFunFacts };
            });
        } else {
            setFormData((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value,
                },
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = {};
        const { personalInfo } = formData;

        // Required fields
        if (!personalInfo.firstName.trim()) {
            newErrors.firstName = "Le prénom est requis.";
        }
        if (!personalInfo.lastName.trim()) {
            newErrors.lastName = "Le nom de famille est requis.";
        }
        if (!personalInfo.email.trim()) {
            newErrors.email = "L'email est requis.";
        } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
            newErrors.email = "L'email n'est pas valide.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage("");

        try {
            // Generate a simple ID (in a real app, the backend should handle this)
            const newUser = {
                id: Date.now().toString(), // Temporary ID generation
                ...formData,
            };

            // Send data to the backend
            await axios.post(API_URL, newUser);

            setSubmitMessage("Profil créé avec succès !");
            // Reset form after successful submission
            setFormData({
                personalInfo: {
                    firstName: "",
                    lastName: "",
                    email: "",
                    age: "",
                    phone: "",
                    city: "",
                    socialHandle: "",
                },
                education: {
                    school: "",
                    program: "",
                    employer: "",
                    startDate: "",
                },
                salary: {
                    monthlySalary: "",
                    goal: "",
                },
                funFacts: [
                    { passion: "" },
                    { favoriteGame: "" },
                    { dream: "" },
                ],
            });
            setErrors({});
        } catch (error) {
            console.error("Error creating profile:", error);
            setSubmitMessage("Erreur lors de la création du profil. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Créer un Profil
            </h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-8 space-y-8">
                {/* Personal Info Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        Informations Personnelles
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Prénom *
                            </label>
                            <input
                                type="text"
                                value={formData.personalInfo.firstName}
                                onChange={(e) => handleChange(e, "personalInfo", "firstName")}
                                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.firstName ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Nom de famille *
                            </label>
                            <input
                                type="text"
                                value={formData.personalInfo.lastName}
                                onChange={(e) => handleChange(e, "personalInfo", "lastName")}
                                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.lastName ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.personalInfo.email}
                                onChange={(e) => handleChange(e, "personalInfo", "email")}
                                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.email ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Âge
                            </label>
                            <input
                                type="number"
                                value={formData.personalInfo.age}
                                onChange={(e) => handleChange(e, "personalInfo", "age")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Téléphone
                            </label>
                            <input
                                type="text"
                                value={formData.personalInfo.phone}
                                onChange={(e) => handleChange(e, "personalInfo", "phone")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Ville
                            </label>
                            <input
                                type="text"
                                value={formData.personalInfo.city}
                                onChange={(e) => handleChange(e, "personalInfo", "city")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Pseudo sur les réseaux sociaux
                            </label>
                            <input
                                type="text"
                                value={formData.personalInfo.socialHandle}
                                onChange={(e) => handleChange(e, "personalInfo", "socialHandle")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Education Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Éducation</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                École
                            </label>
                            <input
                                type="text"
                                value={formData.education.school}
                                onChange={(e) => handleChange(e, "education", "school")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Programme
                            </label>
                            <input
                                type="text"
                                value={formData.education.program}
                                onChange={(e) => handleChange(e, "education", "program")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Employeur (stage)
                            </label>
                            <input
                                type="text"
                                value={formData.education.employer}
                                onChange={(e) => handleChange(e, "education", "employer")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Date de début
                            </label>
                            <input
                                type="text"
                                value={formData.education.startDate}
                                onChange={(e) => handleChange(e, "education", "startDate")}
                                placeholder="DD.MM.YYYY"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Salary Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Salaire</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Salaire mensuel
                            </label>
                            <input
                                type="text"
                                value={formData.salary.monthlySalary}
                                onChange={(e) => handleChange(e, "salary", "monthlySalary")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Objectif
                            </label>
                            <input
                                type="text"
                                value={formData.salary.goal}
                                onChange={(e) => handleChange(e, "salary", "goal")}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Fun Facts Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Faits Amusants</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Passion
                            </label>
                            <input
                                type="text"
                                value={formData.funFacts[0].passion}
                                onChange={(e) => handleChange(e, "funFacts", "passion", 0)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Jeu préféré
                            </label>
                            <input
                                type="text"
                                value={formData.funFacts[1].favoriteGame}
                                onChange={(e) => handleChange(e, "funFacts", "favoriteGame", 1)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Rêve
                            </label>
                            <input
                                type="text"
                                value={formData.funFacts[2].dream}
                                onChange={(e) => handleChange(e, "funFacts", "dream", 2)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all ${
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isSubmitting ? "Création en cours..." : "Créer le Profil"}
                    </button>
                    {submitMessage && (
                        <p
                            className={`mt-4 text-lg ${
                                submitMessage.includes("Erreur") ? "text-red-500" : "text-green-500"
                            }`}
                        >
                            {submitMessage}
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateProfile;