import axios from "axios";
import { useState, useEffect } from "react";
import OfferModal from "../component/admin/offerModal";
import OfferList from "../component/admin/offerList";
import QuestionForm from "../component/admin/questionForm";
import EditOfferModal from "../component/admin/editOfferModal";
import ResultModal from "../component/admin/resultModal";

const API_URL = "http://localhost:5000/offers";

const Admin = () => {
    const [jobOffers, setJobOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
    const [isEditModalOfferOpen, setIsEditModalOfferOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    const openModal = (offer = {}) => {
        setSelectedOffer(offer);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOffer(null);
    };

    const openQuestionForm = (offer) => {
        setSelectedOffer(offer);
        setIsQuestionFormOpen(true);
    };

    const closeQuestionForm = () => {
        setIsQuestionFormOpen(false);
        setSelectedOffer(null);
    };
    const openEditModal = (offer) => {
        setSelectedOffer(offer);
        setIsEditModalOfferOpen(true);
    }
    const closeEditModal = () => {
        setIsEditModalOfferOpen(false);
        setSelectedOffer(null);
    }
    const handleShowResultModal = (offer) => {
        setSelectedOffer(offer);
        setIsResultModalOpen(true);
    };

    // Fetch Offers from JSON Server
    useEffect(() => {
        axios
            .get(API_URL)
            .then((res) => setJobOffers(res.data))
            .catch((err) => console.error("Error loading offers:", err));
    }, []);

    // Save Offer (Update)
    const saveEditedOffer = async (updatedOffer) => {
        try {
            await axios.put(`${API_URL}/${updatedOffer.id}`, updatedOffer);

            setJobOffers((prevOffers) =>
                prevOffers.map((offer) =>
                    offer.id === updatedOffer.id ? updatedOffer : offer
                )
            );

            setIsEditModalOfferOpen(false);
            setSelectedOffer(null);
        } catch (error) {
            console.error("Error saving edited offer:", error);
        }
    };


    const createOffer = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(API_URL, selectedOffer);
            setJobOffers([...jobOffers, res.data]);
            closeModal();
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    };

    // Delete Offer
    const deleteOffer = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setJobOffers(jobOffers.filter((offer) => offer.id !== id));
        } catch (error) {
            console.error("Error deleting offer:", error);
        }
    };

    // Edit Offer (Open Modal)
    const onEditClick = (id) => {
        setSelectedOffer(id);
        setIsEditModalOfferOpen(true);
    };
    const saveOffer = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/${selectedOffer.id}`, selectedOffer);
            setJobOffers((prev) =>
                prev.map((offer) =>
                    offer.id === selectedOffer.id ? selectedOffer : offer
                )
            );
            closeModal();
        } catch (error) {
            console.error("Error saving offer:", error);
        }
    };
    // Add Situation to Offer
    const addSituation = async (newSituation) => {
        const updatedOffer = {
            ...selectedOffer,
            situations: [...(selectedOffer.situations || []), newSituation],
        };
        setSelectedOffer(updatedOffer);
        setJobOffers((prev) =>
            prev.map((offer) => (offer.id === updatedOffer.id ? updatedOffer : offer))
        );
        // Persister immédiatement dans l’API
        try {
            await axios.put(`${API_URL}/${updatedOffer.id}`, updatedOffer);
        } catch (error) {
            console.error("Error saving updated offer with new situation:", error);
        }
        setIsQuestionFormOpen(false);
    };

    return (
        <div className="admin-page  min-h-screen">
            <div className="admin-page min-h-screen p-4">
                <div className="flex flex-col bg-secondary p-2 w-full h-full max-w-4xl mx-auto bg-white shadow-lg rounded-2xl">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 p-2">Offres Existantes</h2>
                        <button
                            onClick={() => openModal()}
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                        >
                            Créer une Nouvelle Offre
                        </button>
                    </div>
                    <OfferList
                        offers={jobOffers}
                        onEdit={onEditClick}
                        onDelete={deleteOffer}
                        onCandidaturesShow={handleShowResultModal}
                    />
                    {isModalOpen && (
                        <OfferModal
                            offer={selectedOffer}
                            handleChange={(e) =>
                                setSelectedOffer({ ...selectedOffer, [e.target.name]: e.target.value })
                            }
                            handleSubmit={selectedOffer?.id ? saveOffer : createOffer}
                            closeModal={closeModal}
                            openQuestionForm={openQuestionForm} // Passer pour ajouter des situations depuis le modal
                        />
                    )}


                    {isEditModalOfferOpen && (
                        <EditOfferModal
                            offer={selectedOffer}
                            onSave={saveEditedOffer}
                            onClose={closeEditModal}
                        />
                    )}
                    {isResultModalOpen && (
                        <ResultModal
                            offer={selectedOffer}
                            onClose={() => setIsResultModalOpen(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;