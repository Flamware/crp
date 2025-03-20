const OfferList = ({ offers, onEdit, onDelete, onOpenQuestionForm,onCandidaturesShow }) => (
    <section className="p-2  w-full h-full">
        {offers.length === 0 ? (
            <p className="text-gray-600">Aucune offre pour le moment.</p>
        ) : (
            <div className="space-y-4">
                {offers.map((offer) => (
                    <div
                        key={offer.id}
                        className="p-4 border rounded-lg flex justify-between items-center"
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
                            <p className="text-gray-600">
                                {offer.location} - {offer.type}
                            </p>
                            <p className="text-gray-500 text-sm">
                                {offer.questions?.length || 0} question(s) associée(s)
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onCandidaturesShow(offer)}
                                className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
                            >
                                Candidatures
                            </button>


                            <button
                                onClick={() => onEdit(offer.id)}
                                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                            >
                                Modifier
                            </button>

                            <button
                                onClick={() => onDelete(offer.id)}
                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>

                ))}
            </div>
        )}
    </section>
);

export default OfferList;