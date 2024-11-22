import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaRegThumbsUp, FaComment } from 'react-icons/fa';

function Home() {
  const [posts, setPosts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showMoreComments, setShowMoreComments] = useState({});
  const [modalComments, setModalComments] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/allpost", {
      headers: {
        Authorization: `bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("Expected an array but got:", data);
          setPosts([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setPosts([]);
      });
  }, [navigate, refresh]);

  const handleLike = (postId) => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/like", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ postId }),
    })
      .then((res) => res.json())
      .then((updatedPost) => {
        if (updatedPost && updatedPost.likes) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === updatedPost._id ? updatedPost : post
            )
          );
          setRefresh(!refresh);
        } else {
          console.error("Error updating post likes:", updatedPost);
        }
      })
      .catch((err) => console.error("Error liking post:", err));
  };

  const handleUnlike = (postId) => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/unlike", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ postId }),
    })
      .then((res) => res.json())
      .then((updatedPost) => {
        if (updatedPost && updatedPost.likes) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post._id === updatedPost._id ? updatedPost : post
            )
          );
          setRefresh(!refresh);
        } else {
          console.error("Error updating post likes:", updatedPost);
        }
      })
      .catch((err) => console.error("Error unliking post:", err));
  };

  const handleComment = (postId) => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/comment", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ postId, comment: newComment }),
    })
      .then((res) => res.json())
      .then((res) => {
        setRefresh(!refresh);
        setNewComment('');
      })
      .catch((err) => console.error("Error commenting on post:", err));
  };

  const toggleShowMore = (postId) => {
    setShowMoreComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const openCommentsModal = (comments) => {
    setModalComments(comments);
  };

  const closeCommentsModal = () => {
    setModalComments(null);
  };

  return (
    <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen px-4 py-6">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6 mx-auto max-w-lg p-4 transform transition-all duration-500 hover:scale-105"
        >
          <div className="flex items-center justify-between mb-3 p-3 bg-gray-100 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-white">
                {post.postedBy?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-800">
                {post.postedBy?.name || "Anonymous"}
              </h2>
            </div>
            {JSON.parse(localStorage.getItem("user"))._id !== post.postedBy?._id ? (
              <button
                onClick={() => navigate(`/userprofile/${post.postedBy._id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md shadow-md"
              >
                View Profile
              </button>
            ) : null}
          </div>

          <div className="mb-4">
            <img
              src={post.image}
              alt="Post"
              className="w-full h-96 object-contain rounded-md shadow-lg"
            />
          </div>

          <div className="px-2 py-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Caption: </span>
              {post.body}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 px-2 py-1">
            <div className="flex items-center space-x-2">
              {post.likes.includes(JSON.parse(localStorage.getItem("user"))._id) ? (
                <button onClick={() => handleUnlike(post._id)} className="text-blue-600">
                  <FaThumbsUp className="text-xl" />
                </button>
              ) : (
                <button onClick={() => handleLike(post._id)} className="text-gray-500">
                  <FaRegThumbsUp className="text-xl" />
                </button>
              )}
              <span className="text-gray-700 text-xs ml-4">{post.likes.length} Likes</span>
            </div>

            <div className="flex items-center space-x-2">
              <FaComment className="text-gray-500" />
              <span className="text-gray-700 text-xs">{post.comments?.length} Comments</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center mb-3 px-2 py-1 border rounded-md bg-gray-50 shadow-sm">
              <FaComment className="text-gray-500 mr-2" />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border-none outline-none text-sm text-gray-700"
              />
              <button
                onClick={() => handleComment(post._id)}
                className="ml-2 bg-blue-500 text-white text-xs px-4 py-1 rounded-md hover:bg-blue-600 transition-all"
              >
                Post
              </button>
            </div>

            <div className="text-xs text-gray-600">
              {post.comments?.slice(0, 2).map((comment, index) => (
                <div key={index} className="flex justify-start items-start mb-1">
                  <span className="font-medium">{comment.postedBy?.name || "Anonymous"}</span>
                  <span>: {comment.text}</span>
                </div>
              ))}

              {post.comments?.length > 2 && !showMoreComments[post._id] && (
                <button
                  onClick={() => toggleShowMore(post._id)}
                  className="text-blue-500 text-xs"
                >
                  Show More
                </button>
              )}

              <button
                onClick={() => openCommentsModal(post.comments)}
                className="text-blue-500 text-xs mt-2"
              >
                Show All Comments
              </button>
            </div>
          </div>
        </div>
      ))}

{modalComments && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto transition-all duration-300 transform scale-105">
      <h3 className="text-lg font-semibold mb-4">All Comments</h3>
      <div className="max-h-72 overflow-y-scroll">
        {modalComments.length > 0 ? (
          modalComments.map((comment, index) => (
            <div key={index} className="flex mb-3 text-sm">
              <div className="mr-2">
                <span className="font-medium">{comment.postedBy?.name || "Anonymous"}</span>
              </div>
              <div className="flex-1">{comment.text}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No comments available</p>
        )}
      </div>
      <button
        onClick={closeCommentsModal}
        className="mt-4 bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
}

export default Home;
