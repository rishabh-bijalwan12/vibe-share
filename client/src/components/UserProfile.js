import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLink, FaLocationArrow, FaHeart, FaRegHeart } from 'react-icons/fa';

function UserProfile() {
    const { userId } = useParams();
    const [data, setData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const navigate = useNavigate();
    

    // Fetching user data including followers and posts
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            return;
        }

        fetch(`/userprofile/${userId}`, {
            headers: {
                Authorization: `bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((response) => {
                const userData = response.data;
                setData(userData);
                setPosts(response.posts || []);
                const currentUser = JSON.parse(localStorage.getItem("user"));
                setIsFollowing(userData.followers.includes(currentUser._id));
            })
            .catch((err) => console.error("Error fetching user data:", err));
    }, [userId, isFollowing]);

    // Handle follow action
    const handleFollow = () => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("/login");
            return;
        }

        fetch("/follow", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `bearer ${token}`,
            },
            body: JSON.stringify({ followId: userId }),
        })
            .then((res) => res.json())
            .then((response) => {
                setIsFollowing(true);
                setData((prevData) => ({
                    ...prevData,
                    followers: [...prevData.followers, userId],
                }));
            })
            .catch((err) => console.error("Error following user:", err));
    };

    // Handle unfollow action
    const handleUnfollow = () => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            navigate("/login");
            return;
        }

        fetch("/unfollow", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `bearer ${token}`,
            },
            body: JSON.stringify({ followId: userId }),
        })
            .then((res) => res.json())
            .then((response) => {
                setIsFollowing(false);
                setData((prevData) => ({
                    ...prevData,
                    followers: prevData.followers.filter((follower) => follower !== userId),
                }));
            })
            .catch((err) => console.error("Error unfollowing user:", err));
    };

    // If data is not available yet, show loading state
    if (!data) return <div className="text-center py-12 text-lg text-gray-600">Loading...</div>;

    return (
        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen flex justify-center py-12">
            <div className="bg-white w-full max-w-5xl shadow-xl rounded-lg p-8 transform transition-all duration-500 hover:scale-105">
                {/* Profile Section */}
                <div className="flex flex-col lg:flex-row items-center justify-between border-b pb-6 mb-8">
                    <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl transform transition-transform hover:scale-110">
                            {data.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-gray-800">
                            <h1 className="text-3xl lg:text-4xl font-semibold">{data.name}</h1>
                            <p className="text-lg text-gray-500">Total Posts: {posts.length}</p>
                            <div className="flex mt-3 space-x-6">
                                {data.location && (
                                    <div className="flex items-center space-x-2 text-sm">
                                        <FaLocationArrow className="text-gray-600" />
                                        <span>{data.location}</span>
                                    </div>
                                )}
                                {data.website && (
                                    <div className="flex items-center space-x-2 text-sm">
                                        <FaLink className="text-gray-600" />
                                        <a href={data.website} className="text-blue-600" target="_blank" rel="noopener noreferrer">
                                            {data.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Followers, Following, and Button */}
                    <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
                        {/* Followers and Following Count */}
                        <div className="flex space-x-6">
                            <div>
                                <h1 className="text-xl font-medium text-gray-700">Followers: {data.followers.length}</h1>
                            </div>
                            <div>
                                <h1 className="text-xl font-medium text-gray-700">Following: {data.following.length}</h1>
                            </div>
                        </div>

                        {/* Follow/Unfollow Button */}
                        <div>
                            <button
                                onClick={isFollowing ? handleUnfollow : handleFollow}
                                className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 transform ${isFollowing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} hover:scale-105`}
                            >
                                {isFollowing ? <FaHeart className="inline mr-2" /> : <FaRegHeart className="inline mr-2" />}
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>
                    </div>

                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post._id} className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
                                <img
                                    src={post.image || "https://via.placeholder.com/300"}
                                    alt={post.body}
                                    className="w-full h-64 object-cover rounded-lg transition-transform transform group-hover:scale-110"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-3">
                                    <p className="text-sm font-semibold">{post.body || "Untitled Post"}</p>
                                    <div className="flex items-center space-x-2">
                                        <FaHeart className="text-red-500" />
                                        <span className="text-sm">{post.likes.length || 0} likes</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center text-gray-600">No posts to display</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
