import React, { useState } from 'react';
import './EmpathyWallPage.css';

const avatars = [
  { name: "anonymous", avatar: "https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=Felix" },
  { name: "anonymous", avatar: "https://api.dicebear.com/9.x/big-ears-neutral/svg?flip=false" },
  { name: "anonymous", avatar: "https://api.dicebear.com/9.x/big-ears-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9" },
  { name: "anonymous", avatar: "https://api.dicebear.com/9.x/big-ears-neutral/svg?backgroundType=gradientLinear,solid" },
  { name: "anonymous", avatar: "https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=Aneka" },
];

const timeAgo = (timestamp) => {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  if (diff < 60) return `${diff} วินาทีที่แล้ว`;
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
};

const EmpathyWallPage = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState([]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const randomProfile = avatars[Math.floor(Math.random() * avatars.length)];

    const post = {
      id: Date.now(),
      text: newPost,
      comments: [],
      createdAt: Date.now(),
      username: randomProfile.name,
      avatar: randomProfile.avatar,
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setShowModal(false);
  };

  const handleCommentSubmit = (e, postId, commentText) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const randomProfile = avatars[Math.floor(Math.random() * avatars.length)];

    const newComment = {
      id: Date.now(),
      text: commentText,
      username: randomProfile.name,
      avatar: randomProfile.avatar,
    };

    const updatedPosts = posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [...post.comments, newComment],
          }
        : post
    );

    setPosts(updatedPosts);
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handleDeleteComment = (postId, commentId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId),
        };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  const toggleShowAllComments = (postId) => {
    setExpandedComments(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div className="wall-container">
      <h1>🧡 Empathy Wall</h1>

      <div className="posts-section">
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-header">
              <img className="avatar" src={post.avatar} alt={post.username} />
              <div>
                <strong>{post.username}</strong>
                <div className="post-time">{timeAgo(post.createdAt)}</div>
              </div>
              <button className="delete-post-btn" onClick={() => handleDeletePost(post.id)}>ลบโพสต์</button>
            </div>

            <p className="post-text">{post.text}</p>

            <div className="comments-section">
              {(expandedComments.includes(post.id)
                ? post.comments
                : post.comments.slice(0, 2)
              ).map((comment) => (
                <div className="comment" key={comment.id}>
                  <img className="avatar small" src={comment.avatar} alt={comment.username} />
                  <div>
                    <strong>{comment.username}</strong>
                    <div>{comment.text}</div>
                  </div>
                  <button className="delete-comment-btn" onClick={() => handleDeleteComment(post.id, comment.id)}>ลบ</button>
                </div>
              ))}

              {post.comments.length > 5 && !expandedComments.includes(post.id) && (
                <button className="show-more-comments-btn" onClick={() => toggleShowAllComments(post.id)}>
                  แสดงคอมเมนต์เพิ่มเติม...
                </button>
              )}

              {expandedComments.includes(post.id) && post.comments.length > 5 && (
                <button className="show-more-comments-btn" onClick={() => toggleShowAllComments(post.id)}>
                  ซ่อนคอมเมนต์
                </button>
              )}

              <form
                onSubmit={(e) => {
                  const form = e.target;
                  const commentInput = form.elements[`comment-${post.id}`];
                  const commentText = commentInput.value;
                  handleCommentSubmit(e, post.id, commentText);
                  commentInput.value = '';
                }}
                className="comment-form"
              >
                <input
                  type="text"
                  name={`comment-${post.id}`}
                  placeholder="พิมพ์ข้อความให้กำลังใจ..."
                />
                <button type="submit">ส่ง</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <button className="floating-post-button" onClick={() => setShowModal(true)}>
        ➕ โพสต์
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📝 เขียนโพสต์ของคุณ</h2>
            <form onSubmit={handlePostSubmit} className="post-form">
              <textareas
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="แชร์ความรู้สึกของคุณ..."
              />
              <div className="modal-buttons">
                <button type="submit">โพสต์</button>
                <button type="button" onClick={() => setShowModal(false)}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpathyWallPage;
