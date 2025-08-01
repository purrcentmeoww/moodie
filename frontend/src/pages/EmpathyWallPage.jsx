// /frontend/src/pages/EmpathyWallPage.jsx
import React, { useState, useEffect } from "react";
import "./EmpathyWallPage.css";
import BubbleBackground from "../components/ui/BubbleBackground.jsx";
// Import service ทั้งหมดที่เราต้องการ
import { getPosts, createPost, getComments, createComment, deletePost, deleteComment } from "../services/postService";

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
  const [newPost, setNewPost] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const dataFromApi = await getPosts();
      const postsWithExtras = await Promise.all(
        dataFromApi.map(async (post) => {
          const commentsData = await getComments(post.id);
          const commentsWithAvatars = commentsData.map(comment => ({
            ...comment,
            ...avatars[Math.floor(Math.random() * avatars.length)],
          }));
          return {
            ...post,
            ...avatars[Math.floor(Math.random() * avatars.length)],
            comments: commentsWithAvatars,
            commentsLoaded: true,
          };
        })
      );
      setPosts(postsWithExtras);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      await createPost(newPost);
      fetchPosts();
      setNewPost("");
      setShowModal(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };
  
  const handleCommentSubmit = async (e, postId, commentText) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
        await createComment(postId, commentText);
        const commentsData = await getComments(postId);
        const commentsWithAvatars = commentsData.map(comment => ({
            ...comment,
            ...avatars[Math.floor(Math.random() * avatars.length)]
        }));
        setPosts(posts.map(p => p.id === postId ? {...p, comments: commentsWithAvatars} : p));
    } catch (error) {
        console.error("Failed to submit comment:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?")) {
        try {
            await deletePost(postId);
            // ลบโพสต์ออกจาก State เพื่อให้หน้าเว็บอัปเดตทันที
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    }
  };
  
  const handleDeleteComment = async (postId, commentId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคอมเมนต์นี้?")) {
        try {
            await deleteComment(commentId);
            // ลบคอมเมนต์ออกจาก State ของโพสต์นั้นๆ
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    return {...p, comments: p.comments.filter(c => c.id !== commentId)};
                }
                return p;
            }));
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    }
  };

  const toggleShowAllComments = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post.commentsLoaded) {
        try {
            const commentsData = await getComments(postId);
            const commentsWithAvatars = commentsData.map(comment => ({
                ...comment,
                ...avatars[Math.floor(Math.random() * avatars.length)]
            }));
            setPosts(posts.map(p => p.id === postId ? {...p, comments: commentsWithAvatars, commentsLoaded: true} : p));
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
    }
    setExpandedComments((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <>
      <BubbleBackground />
      <div className="wall-container">
        <h1> Empathy Wall</h1>
        <div className="posts-section">
          {posts.map((post) => {
            const isExpanded = expandedComments.includes(post.id);
            const visibleComments = isExpanded
              ? post.comments
              : post.comments.slice(0, 2);

            return (
              <div className="post-card" key={post.id}>
                <div className="post-header">
                  <img className="avatar" src={post.avatar} alt={post.username} />
                  <div>
                    <strong>{post.username}</strong>
                    <div className="post-time">{timeAgo(new Date(post.created_at).getTime())}</div>
                  </div>
                  <button className="delete-post-btn" onClick={() => handleDeletePost(post.id)}>
                    ลบโพสต์
                  </button>
                </div>
                <p className="post-text">{post.text_content}</p>
                <div className="comments-section">
                  <div className={`comments-wrapper ${isExpanded ? "expanded" : "collapsed"}`}>
                    {visibleComments.map((comment) => (
                      <div className="comment" key={comment.id}>
                        <img className="avatar small" src={comment.avatar} alt={comment.username} />
                        <div>
                          <strong>{comment.username}</strong>
                          <div>{comment.text_content}</div>
                        </div>
                        <button className="delete-comment-btn" onClick={() => handleDeleteComment(post.id, comment.id)}>
                          ลบ
                        </button>
                      </div>
                    ))}
                  </div>
                  {(post.comments.length > 0 && (post.comments.length > 2 || !post.commentsLoaded)) && (
  <button
    className={`show-more-comments-btn ${isExpanded ? "expanded" : ""}`}
    onClick={() => toggleShowAllComments(post.id)}
  >
    {isExpanded ? (
      <>
        🔼 <span>ซ่อนคอมเมนต์</span>
      </>
    ) : (
      <>
        🔽 <span>ดูคอมเมนต์ทั้งหมด ({post.comments.length})</span>
      </>
    )}
  </button>
)}


                  <form
                    onSubmit={(e) => {
                      const form = e.target;
                      const commentInput = form.elements[`comment-${post.id}`];
                      const commentText = commentInput.value;
                      handleCommentSubmit(e, post.id, commentText);
                      commentInput.value = "";
                    }}
                    className="comment-form"
                  >
                    <input type="text" name={`comment-${post.id}`} placeholder="พิมพ์ข้อความให้กำลังใจ..." required />
                    <button type="submit">ส่ง</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
        <div className="floating-post-wrapper">
          <button className="floating-post-button" onClick={() => setShowModal(true)}>
            โพสต์
          </button>
        </div>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>📝 เขียนโพสต์ของคุณ</h2>
              <form onSubmit={handlePostSubmit} className="post-form">
                <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="แชร์ความรู้สึกของคุณ..." required autoFocus />
                <div className="modal-buttons">
                  <button type="submit">โพสต์</button>
                  <button type="button" onClick={() => setShowModal(false)}>ยกเลิก</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmpathyWallPage;
