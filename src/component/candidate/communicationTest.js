import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import SpiderChart from "../spiderChart";

const CommunicationTest = ({ offerId, userId, onClose, onEnd }) => {
    const [emailResponse, setEmailResponse] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [mediaBlob, setMediaBlob] = useState(null);
    const [mediaType, setMediaType] = useState("video"); // "video" or "audio"
    const [isTestFinished, setIsTestFinished] = useState(false);
    const [qualityCount, setQualityCount] = useState(null);
    const [emailData, setEmailData] = useState(null);
    const [offerTitle, setOfferTitle] = useState("");
    const [permissionsChecked, setPermissionsChecked] = useState(false);
    const [useUpload, setUseUpload] = useState(false); // Toggle between recording and uploading
    const [uploadError, setUploadError] = useState(""); // Store upload errors
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const recordingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const predefinedQuestion = "Imaginez qu’un nouveau client se présente. " +
        "Présentez notre entreprise de manière claire et concise. \n Vous pouvez vous " +
        "inspirer des informations disponibles sur notre site web.";

    const MAX_DURATION = 30;

    useEffect(() => {
        const fetchOfferData = async () => {
            try {
                const response = await axios.get(`https://crp-hcnk.onrender.com/offers/${offerId}`);
                const offer = response.data;
                setEmailData(offer.email || null);
                setOfferTitle(offer.title || "Offre sans titre");
            } catch (error) {
                console.error("Error fetching offer data:", error);

            }
        };

        fetchOfferData();
    }, [offerId]);

    // Check camera/microphone permissions
    const checkPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: mediaType === "video",
                audio: true,
            });
            stream.getTracks().forEach((track) => track.stop());
            return true;
        } catch (error) {
            console.error("Permission check failed:", error);
            return false;
        }
    };

    useEffect(() => {
        const verifyPermissions = async () => {
            const hasPermission = await checkPermissions();
            setPermissionsChecked(hasPermission);
        };
        verifyPermissions();
    }, [mediaType]);

    // Start recording with a 30-second limit
    const startRecording = async () => {
        const hasPermission = await checkPermissions();
        if (!hasPermission) {
            alert(
                "L'accès à la caméra ou au microphone est bloqué. Veuillez vérifier les permissions dans les paramètres de votre navigateur et de votre système. Si l'option est grisée, contactez votre administrateur système."
            );
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: mediaType === "video",
                audio: true,
            });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: mediaType === "video" ? "video/webm" : "audio/webm" });
                setMediaBlob(blob);
                stream.getTracks().forEach((track) => track.stop());
                videoRef.current.srcObject = null;
                clearTimeout(recordingTimeoutRef.current);
            };

            recorder.start();
            setIsRecording(true);

            recordingTimeoutRef.current = setTimeout(() => {
                stopRecording();
            }, MAX_DURATION * 1000);
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Erreur lors de l'accès à la caméra/microphone. Veuillez vérifier les permissions.");
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearTimeout(recordingTimeoutRef.current);
        }
    };

    // Get duration of a media file
    const getMediaDuration = (file) => {
        return new Promise((resolve, reject) => {
            const mediaElement = mediaType === "video" ? document.createElement("video") : document.createElement("audio");
            mediaElement.preload = "metadata";
            mediaElement.onloadedmetadata = () => {
                resolve(mediaElement.duration);
            };
            mediaElement.onerror = () => {
                reject(new Error("Erreur lors du chargement du fichier média."));
            };
            mediaElement.src = URL.createObjectURL(file);
        });
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validVideoTypes = ["video/mp4", "video/webm"];
        const validAudioTypes = ["audio/mp3", "audio/webm", "audio/mpeg"];
        const validTypes = mediaType === "video" ? validVideoTypes : validAudioTypes;

        if (!validTypes.includes(file.type)) {
            setUploadError(
                `Veuillez sélectionner un fichier ${mediaType === "video" ? "vidéo" : "audio"} valide (${
                    mediaType === "video" ? "MP4, WebM" : "MP3, WebM"
                }).`
            );
            setMediaBlob(null);
            return;
        }

        // Check duration
        try {
            const duration = await getMediaDuration(file);
            if (duration > MAX_DURATION) {
                setUploadError(`Le fichier dépasse la durée maximale de ${MAX_DURATION} secondes.`);
                setMediaBlob(null);
                return;
            }

            setMediaBlob(file);
            setUploadError("");
        } catch (error) {
            setUploadError("Erreur lors de la vérification de la durée du fichier.");
            setMediaBlob(null);
        }
    };

    // Convert Blob to Base64
    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Evaluate responses
    const evaluateResponses = () => {
        const clarityScore = emailResponse.length > 100 ? 3 : emailResponse.length > 50 ? 2 : 1;
        const professionalismScore = emailResponse.includes("Cordialement") || emailResponse.includes("Merci") ? 3 : 2;
        const confidenceScore = mediaBlob ? 4 : 1;

        return {
            Clarté: clarityScore,
            Professionnalisme: professionalismScore,
            Confiance: confidenceScore,
        };
    };

    // Prevent copy-paste in the textarea
    const handlePaste = (e) => {
        e.preventDefault();
        alert("Le copier-coller n'est pas autorisé dans ce champ.");
    };

    const handleCopy = (e) => {
        e.preventDefault();
        alert("Le copier n'est pas autorisé dans ce champ.");
    };

    const handleCut = (e) => {
        e.preventDefault();
        alert("Le couper n'est pas autorisé dans ce champ.");
    };

    // Submit results
    const handleSubmitResults = async () => {
        if (!emailResponse || !mediaBlob) {
            alert("Veuillez répondre à l'email et enregistrer ou importer une réponse vidéo ou audio avant de soumettre.");
            return;
        }

        try {
            const evaluatedQualityCount = evaluateResponses();
            setQualityCount(evaluatedQualityCount);

            const mediaBase64 = await blobToBase64(mediaBlob);

            const userResponse = await axios.get(`https://crp-hcnk.onrender.com/user/${userId}`);
            const userData = userResponse.data;

            const updatedCandidature = userData.candidature.map((item) =>
                item.offerId === offerId
                    ? {
                        ...item,
                        qualityCount: evaluatedQualityCount,
                        communication: {
                            emailResponse: emailResponse,
                            media: mediaBase64,
                            mediaType: mediaType,
                        },
                    }
                    : item
            );

            if (!updatedCandidature.some((item) => item.offerId === offerId)) {
                updatedCandidature.push({
                    offerId,
                    offerTitle,
                    qualityCount: evaluatedQualityCount,
                    communication: {
                        emailResponse: emailResponse,
                        media: mediaBase64,
                        mediaType: mediaType,
                    },
                });
            }

            await axios.put(`https://crp-hcnk.onrender.com/user/${userId}`, {
                ...userData,
                candidature: updatedCandidature,
            });

            setIsTestFinished(true);
            onEnd();
        } catch (error) {
            console.error("Error submitting communication test results:", error);
            alert("Erreur lors de la soumission des résultats du test.");
        }
    };

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            clearTimeout(recordingTimeoutRef.current);
        };
    }, []);

    if (isTestFinished) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4">
                <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto text-center transform transition-all duration-300">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Résultats du Test de Communication</h2>
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 mt-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualisation des résultats</h3>
                        <div className="w-full h-64">
                            <SpiderChart qualityCount={qualityCount} />
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

    if (!emailData) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4">
                <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full text-center">
                    <p className="text-lg text-gray-600 animate-pulse">Chargement de l'email...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Communication</h2>

                <div className="space-y-8">
                    {/* Email Response Section */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                            Réponse à un email
                        </h3>
                        <div className="bg-white p-4 rounded-lg border border-gray-300 mb-4">
                            <p className="text-sm text-gray-600">
                                <strong>De :</strong> {emailData.sender}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Sujet :</strong> {emailData.subject}
                            </p>
                            <div className="text-sm text-gray-600 mt-2">
                                {emailData.body.map((paragraph, index) => (
                                    <p key={index} className="mb-2">{paragraph}</p>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 italic mt-2">{emailData.signature}</p>
                        </div>
                        <textarea
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Rédigez votre réponse ici..."
                            value={emailResponse}
                            onChange={(e) => setEmailResponse(e.target.value)}
                        />
                    </div>

                    {/* Video/Audio Response Section */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                            Réponse vidéo ou audio
                        </h3>
                        <p className="text-gray-600 mb-4 text-center">{predefinedQuestion}</p>
                        <p className="text-gray-500 text-sm mb-4 text-center">
                            (Durée maximale : {MAX_DURATION} secondes)
                        </p>

                        <div className="flex justify-center mb-4">
                            <label className="mr-4">
                                <input
                                    type="radio"
                                    value="video"
                                    checked={mediaType === "video"}
                                    onChange={() => setMediaType("video")}
                                    className="mr-1"
                                />
                                Vidéo
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="audio"
                                    checked={mediaType === "audio"}
                                    onChange={() => setMediaType("audio")}
                                    className="mr-1"
                                />
                                Audio
                            </label>
                        </div>

                        <div className="flex justify-center mb-4">
                            <label className="mr-4">
                                <input
                                    type="radio"
                                    value="record"
                                    checked={!useUpload}
                                    onChange={() => setUseUpload(false)}
                                    className="mr-1"
                                />
                                Enregistrer
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="upload"
                                    checked={useUpload}
                                    onChange={() => setUseUpload(true)}
                                    className="mr-1"
                                />
                                Importer
                            </label>
                        </div>

                        <div className="flex flex-col items-center">
                            {!useUpload ? (
                                <>
                                    {mediaType === "video" && (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="w-full max-w-md h-48 bg-black rounded-lg mb-4"
                                        />
                                    )}
                                    {mediaBlob && (
                                        <div className="mb-4">
                                            {mediaType === "video" ? (
                                                <video
                                                    src={URL.createObjectURL(mediaBlob)}
                                                    controls
                                                    className="w-full max-w-md h-48 rounded-lg"
                                                />
                                            ) : (
                                                <audio
                                                    src={URL.createObjectURL(mediaBlob)}
                                                    controls
                                                    className="w-full max-w-md"
                                                />
                                            )}
                                        </div>
                                    )}
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`${
                                            isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                        } text-white px-6 py-2 rounded-lg transition font-semibold mb-4`}
                                        disabled={(!isRecording && !permissionsChecked) || (isRecording && !mediaRecorderRef.current)}
                                    >
                                        {isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                                    </button>
                                    {!permissionsChecked && !isRecording && (
                                        <p className="text-red-500 text-sm mt-2 text-center">
                                            L'accès à la caméra ou au microphone est bloqué. Veuillez vérifier les permissions dans les paramètres de votre navigateur et de votre système. Si l'option est grisée, contactez votre administrateur système.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        accept={mediaType === "video" ? "video/mp4,video/webm" : "audio/mp3,audio/webm,audio/mpeg"}
                                        onChange={handleFileUpload}
                                        ref={fileInputRef}
                                        className="mb-4"
                                    />
                                    {uploadError && (
                                        <p className="text-red-500 text-sm mb-4 text-center">{uploadError}</p>
                                    )}
                                    {mediaBlob && (
                                        <div className="mb-4">
                                            {mediaType === "video" ? (
                                                <video
                                                    src={URL.createObjectURL(mediaBlob)}
                                                    controls
                                                    className="w-full max-w-md h-48 rounded-lg"
                                                />
                                            ) : (
                                                <audio
                                                    src={URL.createObjectURL(mediaBlob)}
                                                    controls
                                                    className="w-full max-w-md"
                                                />
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
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

export default CommunicationTest;