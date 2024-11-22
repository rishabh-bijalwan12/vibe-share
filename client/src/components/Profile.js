import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaUserMinus } from "react-icons/fa";

function Profile() {
  const [data, setData] = useState([]); // for user posts
  const [userdata, setUserdata] = useState({}); // for user data (followers, following)
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followingNames, setFollowingNames] = useState({});
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    setUserName(user.name);
    setUserId(user._id);

    // Fetch user's posts and user data simultaneously
    const fetchData = async () => {
      try {
        const postsResponse = await fetch("/mypost", {
          headers: { Authorization: `bearer ${token}` },
        });
        const postsData = await postsResponse.json();

        const userDetailsResponse = await fetch("/userdetails", {
          headers: { Authorization: `bearer ${token}` },
        });
        const userDetailsData = await userDetailsResponse.json();

        setData(postsData);
        setUserdata(userDetailsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (isFollowingModalOpen) {
      userdata.following.forEach((userId) => {
        if (!followingNames[userId]) {
          showUserName(userId);
        }
      });
    }
  }, [isFollowingModalOpen, userdata.following, followingNames]);

  useEffect(() => {
    if (!isFollowingModalOpen) {
      setFollowingNames({});
    }
  }, [isFollowingModalOpen]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleDeletePost = (postId) => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsDeleting(true);

    fetch(`/deletepost/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
    })
      .then(() => {
        setData((prevData) => prevData.filter((post) => post._id !== postId));
        setIsDeleting(false);
        setIsDeleteConfirmOpen(false);
        handleCloseModal();
      })
      .catch(() => setIsDeleting(false));
  };

  const openDeleteConfirmBox = (postId) => {
    setPostToDelete(postId);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmBox = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleUnfollow = (followedUserId) => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch('/unfollow', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ followId: followedUserId }),
    })
      .then(() => {
        // Immediately update the state after unfollow
        setUserdata(prev => ({
          ...prev,
          following: prev.following.filter(followingId => followingId !== followedUserId),
          followers: prev.followers.filter(followerId => followerId !== userId)
        }));

        // Remove the user from followingNames (if used)
        setFollowingNames(prev => {
          const newNames = { ...prev };
          delete newNames[followedUserId];
          return newNames;
        });
      })
      .catch((err) => console.error("Error unfollowing user:", err));
  };

  const showUserName = (id) => {
    const token = localStorage.getItem("jwt");
    fetch(`/userdetails/${id}`, {
      headers: { Authorization: `bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setFollowingNames((prevNames) => ({
          ...prevNames,
          [id]: res.name,
        }));
      })
      .catch((err) => console.error(err));
  };

  if (isLoading) {
    return (
      <div className="text-center text-xl text-gray-600 mt-20">Loading...</div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen flex justify-center py-12">
      <div className="bg-white w-full max-w-5xl shadow-xl rounded-lg p-8 transform transition-all duration-500 hover:scale-105">
        {/* Profile header */}
        <div className="flex flex-col lg:flex-row items-center justify-between border-b pb-6 mb-8">
          <div className="flex items-center space-x-6 mb-6 lg:mb-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="font-bold text-4xl text-gray-800 mb-1">{userName}</h2>
              <h3 className="text-lg text-gray-600">Welcome back!</h3>
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="text-lg font-medium text-gray-800">
              <span className="font-bold">{userdata.followers?.length}</span> Followers
            </div>
            <div onClick={() => setIsFollowingModalOpen(true)} className="text-lg font-medium text-gray-800 cursor-pointer">
              <span className="font-bold">{userdata.following?.length}</span> Following
            </div>
          </div>
        </div>

        {/* User's posts */}
        <div className="w-full max-w-10xl mx-auto mt-8 px-4">
          <h3 className="text-4xl font-semibold text-gray-800 text-center mb-8">Your Posts</h3>
          {data.length === 0 ? (
            <p className="text-center text-xl text-gray-600">No posts available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {data.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform transform hover:scale-101 hover:shadow-2xl"
                  onClick={() => handlePostClick(post)}
                >
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-xl text-gray-800 mb-4">{post.body}</h3>
                    <div className="mt-4 flex items-center justify-between">
                      {/* Likes section */}
                      <div className="flex space-x-2 items-center">
                        <FaHeart className="text-red-600" />
                        <span className="text-gray-600">{post.likes.length}</span>
                      </div>
                      {/* Delete section */}
                      <div className="flex space-x-4 items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirmBox(post._id);
                          }}
                          className="text-red-500 text-xl font-medium border border-red-500 px-3 py-1 rounded-md hover:bg-red-500 transition-all hover:text-white"
                        >
                          Delete Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for following */}
      {isFollowingModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-11/12 sm:w-8/12 lg:w-6/12">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Following</h3>
              <button
                onClick={() => setIsFollowingModalOpen(false)}
                className="text-xl text-gray-600"
              >
                X
              </button>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              {userdata.following.map((userId) => (
                <li key={userId} className="flex justify-between items-center">
                  <span>{followingNames[userId] || "Loading..."}</span>
                  <button
                    onClick={() => handleUnfollow(userId)}
                    className="text-red-500 text-xl"
                  >
                    Unfollow
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-11/12 sm:w-8/12 lg:w-6/12">
            <h3 className="text-2xl font-bold mb-4">Are you sure you want to delete this post?</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDeletePost(postToDelete)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={closeDeleteConfirmBox}
                className="bg-gray-500 text-white p-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
