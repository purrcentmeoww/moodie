// /frontend/src/pages/EmpathyWallPage.jsx
import React, { useState, useEffect } from "react";
import "./EmpathyWallPage.css";
import BubbleBackground from "../components/ui/BubbleBackground.jsx";
// Import service ทั้งหมดที่เราต้องการ
import {
  getPosts,
  createPost,
  getComments,
  createComment,
  deletePost,
  deleteComment,
} from "../services/postService";

const avatars = [
  {
    name: "anonymous",
    avatar: "https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=Felix",
  },
  {
    name: "anonymous",
    avatar: "https://api.dicebear.com/9.x/big-ears-neutral/svg?flip=false",
  },
  {
    name: "anonymous",
    avatar:
      "https://api.dicebear.com/9.x/big-ears-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9",
  },
  {
    name: "anonymous",
    avatar:
      "https://api.dicebear.com/9.x/big-ears-neutral/svg?backgroundType=gradientLinear,solid",
  },
  {
    name: "anonymous",
    avatar: "https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=Aneka",
  },
];

const timeAgo = (timestamp) => {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  if (diff < 60) return `${diff} วินาทีที่แล้ว`;
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
};

function EmpathyWallPage({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const dataFromApi = await getPosts();
      const postsWithExtras = dataFromApi.map((post) => ({
        ...post,
        // ถ้า username เป็น null (กรณี user ถูกลบไปแล้ว) ให้แสดงเป็น "Unknown"
        username: post.username || "Unknown User",
        ...avatars[Math.floor(Math.random() * avatars.length)],
        comments: [],
        commentsLoaded: false,
      }));
      setPosts(postsWithExtras);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      await createPost(newPost, currentUser.id);
      fetchPosts();
      setNewPost("");
      setShowModal(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleCommentSubmit = async (e, postId, commentText) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    try {
      await createComment(postId, commentText, currentUser.id);
      // โหลดคอมเมนต์ใหม่ทั้งหมดเพื่อให้เห็นคอมเมนต์ล่าสุด
      toggleShowAllComments(postId, true); // true บังคับให้โหลดใหม่และเปิด
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!currentUser) return; // ต้องล็อกอินก่อน
    try {
      await deletePost(postId, currentUser.id);
      // ลบโพสต์ออกจาก State เพื่อให้หน้าเว็บอัปเดตทันที
      setPosts(posts.filter((p) => p.id !== postId));
    } catch (error) {
      // ถ้าเกิดข้อผิดพลาด เช่น พยายามลบโพสต์ของคนอื่น

      console.error(error);
      alert(error.message); // แสดงข้อความเตือนถ้าพยายามลบโพสต์คนอื่น
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!currentUser) return;
    try {
      await deleteComment(commentId, currentUser.id);
      // อัปเดต State โดยการลบคอมเมนต์ออกจาก list
      setPosts(
        posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.filter((c) => c.id !== commentId),
              comment_count: p.comment_count - 1,
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const toggleShowAllComments = async (postId, forceOpen = false) => {
    const post = posts.find((p) => p.id === postId);
    const isCurrentlyExpanded = expandedComments.includes(postId);

    // ถ้ากด "ซ่อน" ก็แค่ปิดไป ไม่ต้องโหลดใหม่
    if (isCurrentlyExpanded && !forceOpen) {
      setExpandedComments((prev) => prev.filter((id) => id !== postId));
      return;
    }

    // ถ้ากด "แสดง" หรือถูกบังคับให้เปิด
    try {
      const commentsData = await getComments(postId);
      const commentsWithAvatars = commentsData.map((comment) => ({
        ...comment,
        username: comment.username || "Anonymous",
        ...avatars[Math.floor(Math.random() * avatars.length)],
      }));
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, comments: commentsWithAvatars, commentsLoaded: true }
            : p
        )
      );
      // เปิด section คอมเมนต์
      if (!isCurrentlyExpanded) {
        setExpandedComments((prev) => [...prev, postId]);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
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
                {/* ... ส่วน header ของ post ... */}
                <div className="post-header">
                  <img
                    className="avatar"
                    src={post.avatar}
                    alt={post.username}
                  />
                  <div>
                    <strong>{post.username}</strong>
                    <div className="post-time">
                      {timeAgo(new Date(post.created_at).getTime())}
                    </div>
                  </div>
                  {/* --- จุดที่แก้ไข 2: แสดงปุ่มลบเฉพาะเจ้าของโพสต์ --- */}
                  {currentUser && currentUser.id === post.user_id && (
                    <button
                      className="delete-post-btn"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      ลบโพสต์
                    </button>
                  )}
                </div>
                <p className="post-text">{post.text_content}</p>
                <div className="comments-section">
                  <div
                    className={`comments-wrapper ${
                      isExpanded ? "expanded" : "collapsed"
                    }`}
                  >
                    {visibleComments.map((comment) => (
                      <div className="comment" key={comment.id}>
                        <img
                          className="avatar small"
                          src={comment.avatar}
                          alt={comment.username}
                        />
                        <div>
                          <strong>{comment.username}</strong>
                          <div>{comment.text_content}</div>
                        </div>
                        {/* --- จุดที่แก้ไข --- */}
                        {/* เงื่อนไข: แสดงปุ่มต่อเมื่อ currentUser มีอยู่ และ id ตรงกับ user_id ของคอมเมนต์ */}
                        {currentUser && currentUser.id === comment.user_id && (
                          <button
                            className="delete-comment-btn"
                            onClick={() =>
                              handleDeleteComment(post.id, comment.id)
                            }
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* --- จุดที่แก้ไข: เงื่อนไขและ UI ของปุ่มคอมเมนต์ --- */}
                  {/* เราจะใช้ comment_count ที่ได้จาก Back-end มาเป็นตัวตัดสิน */}
                  {/* เงื่อนไขใหม่: ถ้ามีคอมเมนต์มากกว่า 0 คอมเมนต์ ให้แสดงปุ่มนี้ */}
                  {post.comment_count > 0 && (
                    <button
                      className={`show-more-comments-btn ${
                        isExpanded ? "expanded" : ""
                      }`}
                      onClick={() => toggleShowAllComments(post.id)}
                    >
                      {isExpanded ? (
                        <>
                          🔼 <span>ซ่อนคอมเมนต์</span>
                        </>
                      ) : (
                        <>
                          🔽{" "}
                          <span>
                            {/* ใช้ comment_count ที่ได้จาก API เพื่อแสดงจำนวนที่ถูกต้องเสมอ */}
                            ดูคอมเมนต์ทั้งหมด ({post.comment_count})
                          </span>
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
                    <input
                      type="text"
                      name={`comment-${post.id}`}
                      placeholder="พิมพ์ข้อความให้กำลังใจ..."
                      required
                    />
                    <button type="submit">ส่ง</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
        <div className="floating-post-wrapper">
          <button
            className="floating-post-button"
            onClick={() => setShowModal(true)}
          >
            โพสต์
          </button>
        </div>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>📝 เขียนโพสต์ของคุณ</h2>
              <form onSubmit={handlePostSubmit} className="post-form">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="แชร์ความรู้สึกของคุณ..."
                  required
                  autoFocus
                />
                <div className="modal-buttons">
                  <button type="submit">โพสต์</button>
                  <button type="button" onClick={() => setShowModal(false)}>
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EmpathyWallPage;
