import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import WeatherWidget from "../components/WeatherWidget";
import MapComponent from "../components/MapComponent";
import SimpleImageViewer from "react-simple-image-viewer";
import { BASE_URL } from "../api";

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const [trip, setTrip] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState("");

  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { "x-auth-token": token } }
          : undefined;

        // Fetch trip and comments concurrently
        const [tripRes, commentsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/roadtrips/${id}`, config),
          axios.get(`${BASE_URL}/api/comments/${id}`, config),
        ]);

        const tripData = tripRes.data;
        setTrip(tripData);
        setComments(commentsRes.data.comments || commentsRes.data);

        // Fetch route information if user logged in and route present
        if (token && tripData.route && tripData.route.length >= 2) {
          const startDest = tripData.route[0].locationName;
          const finalDest = tripData.route[1].locationName;

          axios
            .post(
              `${BASE_URL}/api/route`,
              { startLocationName: startDest, endLocationName: finalDest },
              config
            )
            .then((res) => setRouteData(res.data))
            .catch(() => setError("Failed to load route data"));

          axios
            .get(
              `${BASE_URL}/api/places?location=${encodeURIComponent(finalDest)}`,
              config
            )
            .then((res) => setPlaces(res.data.places || []))
            .catch(() => setError("Failed to load nearby places"));
        }
      } catch (err) {
        setError("Failed to load trip details. Please try again.");
        console.error("Error fetching trip details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!auth.isAuthenticated) {
      alert("Please login to comment.");
      return navigate("/login");
    }

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      const res = await axios.post(
        `${BASE_URL}/api/comments/${id}`,
        { text: newComment.trim() },
        config
      );
      const populatedComment = {
        ...res.data,
        user: { username: auth.user?.username || "User" },
      };
      setComments([populatedComment, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment.");
    }
  };

  const openImageViewer = useCallback((index) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center text-gray-700 font-bold">
          Loading trip details...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-red-600 font-semibold">{error}</div>
      </div>
    );

  if (!trip)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-gray-700 font-semibold">Trip not found.</div>
      </div>
    );

  const startDest = trip.route[0]?.locationName;
  const finalDest = trip.route[1]?.locationName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-blue-700 mb-4">
              {trip.title}
            </h1>
            <p className="text-gray-700 mb-8 whitespace-pre-line">
              {trip.description}
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Route Details
            </h2>
            {routeData ? (
              <>
                <div className="bg-gray-100 p-4 rounded-lg mb-6 grid grid-cols-2 text-center gap-4 text-gray-800">
                  <div>
                    <p className="font-bold text-blue-600">Distance</p>
                    <p>{routeData.distance} km</p>
                  </div>
                  <div>
                    <p className="font-bold text-purple-600">Duration</p>
                    <p>{routeData.duration} hours</p>
                  </div>
                </div>
                <MapComponent routeData={routeData} className="mb-8" />
              </>
            ) : (
              <p className="text-gray-500">Login to view the route map.</p>
            )}
          </div>

          <div>
            {trip.coverImage && (
              <img
                src={trip.coverImage}
                alt={trip.title}
                className="w-full h-48 object-cover rounded-lg shadow-md mb-6"
                loading="lazy"
              />
            )}

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Weather Forecast
            </h2>
            <div className="space-y-6">
              {startDest && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Start: {startDest}
                  </h3>
                  <WeatherWidget location={startDest} />
                </div>
              )}
              {finalDest && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Destination: {finalDest}
                  </h3>
                  <WeatherWidget location={finalDest} />
                </div>
              )}
            </div>
          </div>
        </div>

        {trip.images && trip.images.length > 0 && (
          <>
            <hr className="my-10" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {trip.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Trip image ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                  loading="lazy"
                  onClick={() => openImageViewer(index)}
                />
              ))}
            </div>
          </>
        )}

        {places.length > 0 && (
          <>
            <hr className="my-10" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Nearby Attractions in {finalDest}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <p className="font-bold text-blue-700">{place.name}</p>
                  <p className="text-sm text-gray-600">{place.category}</p>
                  <p className="text-xs mt-1 text-gray-400">{place.address}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <hr className="my-10" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Comments ({comments.length})
        </h2>

        {auth.isAuthenticated && (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              rows={3}
              placeholder="Add a public comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="mt-3 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Comment
            </button>
          </form>
        )}

        <div className="space-y-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-webkit pr-2">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-gray-100 rounded-lg p-4 border border-gray-200"
            >
              <p className="font-semibold text-gray-700">
                {comment.user?.username || "User"}
              </p>
              <p className="mt-1 text-gray-800 whitespace-pre-line">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isViewerOpen && trip.images && (
        <SimpleImageViewer
          src={trip.images}
          currentIndex={currentImage}
          onClose={closeImageViewer}
          backgroundStyle={{ backgroundColor: "rgba(0,0,0,0.9)" }}
        />
      )}
    </div>
  );
};

export default TripDetailPage;
