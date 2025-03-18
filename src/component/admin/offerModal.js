import React from 'react';

const OfferModal = ({ offer, handleChange, handleSubmit, closeModal }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {offer.id ? 'Modifier l’Offre' : 'Créer une Nouvelle Offre'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['title', 'location', 'type', 'salary', 'startDate', 'imgUrl'].map((field) => (
                        <input
                            key={field}
                            type="text"
                            name={field}
                            value={offer[field] || ''}
                            onChange={handleChange}
                            placeholder={field.replace(/([A-Z])/g, ' $1')}
                            className="p-3 border rounded-lg w-full"
                            required={field !== 'imgUrl'}
                        />
                    ))}
                </div>
                <textarea
                    name="description"
                    value={offer.description || ''}
                    onChange={handleChange}
                    placeholder="Description de l’offre"
                    className="p-3 border rounded-lg w-full h-24"
                    required
                />
                <div className="flex justify-end space-x-4 mt-4">
                    <button type="button" onClick={closeModal} className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">
                        Annuler
                    </button>
                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                        {offer.id ? 'Sauvegarder' : 'Créer'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

export default OfferModal;
