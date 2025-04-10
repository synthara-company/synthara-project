import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Edit2, Trash2, Eye, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingAnimation from './LoadingAnimation';

const PostList = ({ posts, onEdit, onDelete, onPreview, onReorder, loading }) => {
  const [draggedPostId, setDraggedPostId] = useState(null);
  const [dragOverPostId, setDragOverPostId] = useState(null);
  const dragCounter = useRef({});
  if (loading) {
    return <LoadingAnimation />;
  }

  if (!posts.length) {
    return (
      <div className="text-center py-8 px-6">
        <p className="text-black dark:text-white dim:text-white gold:text-black blue:text-black mb-2">No posts yet</p>
        <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] max-w-md mx-auto">Be the first to create a post and share your thoughts with the Synthara community.</p>
      </div>
    );
  }

  // Handle drag start
  const handleDragStart = (e, post) => {
    // Log the post data being dragged
    console.log('Dragging post with media:', {
      id: post.id,
      mediaUrl: post.mediaUrl || post.imageUrl,
      mediaType: post.mediaType || 'image'
    });

    // Set the dragged post ID
    setDraggedPostId(post.id);

    // Set the drag data
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'post',
      id: post.id,
      title: post.title,
      content: post.content,
      mediaUrl: post.mediaUrl || post.imageUrl,
      mediaType: post.mediaType || 'image'
    }));

    // Set the drag image
    if (e.dataTransfer.setDragImage) {
      const dragPreview = document.createElement('div');
      dragPreview.style.width = '100px';
      dragPreview.style.height = '100px';
      dragPreview.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
      dragPreview.style.borderRadius = '4px';
      dragPreview.style.display = 'flex';
      dragPreview.style.alignItems = 'center';
      dragPreview.style.justifyContent = 'center';
      dragPreview.style.color = '#000';
      dragPreview.style.fontSize = '12px';
      dragPreview.style.padding = '8px';
      dragPreview.style.boxSizing = 'border-box';
      dragPreview.style.overflow = 'hidden';
      dragPreview.style.whiteSpace = 'nowrap';
      dragPreview.style.textOverflow = 'ellipsis';
      dragPreview.textContent = post.title;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 50, 50);
      setTimeout(() => {
        document.body.removeChild(dragPreview);
      }, 0);
    }
  };

  // Handle drag over
  const handleDragOver = (e, postId) => {
    e.preventDefault();
    
    // Initialize the counter for this post if it doesn't exist
    if (!dragCounter.current[postId]) {
      dragCounter.current[postId] = 0;
    }
    
    // Increment the counter
    dragCounter.current[postId]++;
    
    // Set the drag over post ID
    setDragOverPostId(postId);
  };

  // Handle drag leave
  const handleDragLeave = (e, postId) => {
    e.preventDefault();
    
    // Decrement the counter
    dragCounter.current[postId]--;
    
    // If the counter is 0, clear the drag over post ID
    if (dragCounter.current[postId] === 0) {
      setDragOverPostId(null);
    }
  };

  // Handle drop
  const handleDrop = (e, targetPostId) => {
    e.preventDefault();
    
    // Clear the drag over post ID
    setDragOverPostId(null);
    
    // If the dragged post ID is the same as the target post ID, do nothing
    if (draggedPostId === targetPostId) {
      return;
    }
    
    // Reorder the posts
    onReorder(draggedPostId, targetPostId);
    
    // Clear the dragged post ID
    setDraggedPostId(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    // Clear the dragged post ID
    setDraggedPostId(null);
    
    // Clear the drag over post ID
    setDragOverPostId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {posts.map((post) => (
        <div
          key={post.id}
          draggable
          onDragStart={(e) => handleDragStart(e, post)}
          onDragOver={(e) => handleDragOver(e, post.id)}
          onDragLeave={(e) => handleDragLeave(e, post.id)}
          onDrop={(e) => handleDrop(e, post.id)}
          onDragEnd={handleDragEnd}
          className={`bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] p-4 ${dragOverPostId === post.id ? 'border-l-2 border-blue-500 dark:border-blue-400 dim:border-blue-400 gold:border-[#D6A756] blue:border-[#8aa5b9]' : ''} h-full flex flex-col transition-colors duration-200 cursor-grab active:cursor-grabbing relative group`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <div className="flex items-center">
                <div className="cursor-grab">
                  <GripVertical size={16} className="text-gray-400 drag-handle group-hover:text-black dark:group-hover:text-white dim:group-hover:text-white gold:group-hover:text-black blue:group-hover:text-black" />
                </div>
                <div className="absolute -top-2 -right-2 bg-black dark:bg-gray-700 dim:bg-gray-600 gold:bg-[#D6A756] blue:bg-[#8aa5b9] text-white gold:text-black blue:text-black text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Drag to reorder
                </div>
              </div>
              <p className="text-base text-black dark:text-white dim:text-white gold:text-black blue:text-black">
                {post.title}
              </p>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => onPreview(post)}
                className="p-1.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white dim:text-gray-400 dim:hover:text-white gold:text-[#D6A756] gold:hover:text-black blue:text-[#8aa5b9] blue:hover:text-black transition-colors duration-200"
                aria-label="Preview post"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onEdit(post)}
                className="p-1.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white dim:text-gray-400 dim:hover:text-white gold:text-[#D6A756] gold:hover:text-black blue:text-[#8aa5b9] blue:hover:text-black transition-colors duration-200"
                aria-label="Edit post"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="p-1.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white dim:text-gray-400 dim:hover:text-white gold:text-[#D6A756] gold:hover:text-black blue:text-[#8aa5b9] blue:hover:text-black transition-colors duration-200"
                aria-label="Delete post"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex flex-col">
                <button
                  onClick={() => onReorder(post.id, 'up')}
                  className="p-1.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white dim:text-gray-400 dim:hover:text-white gold:text-[#D6A756] gold:hover:text-black blue:text-[#8aa5b9] blue:hover:text-black transition-colors duration-200"
                  aria-label="Move post up"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => onReorder(post.id, 'down')}
                  className="p-1.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white dim:text-gray-400 dim:hover:text-white gold:text-[#D6A756] gold:hover:text-black blue:text-[#8aa5b9] blue:hover:text-black transition-colors duration-200"
                  aria-label="Move post down"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          </div>

          {post.mediaUrl && (
            <div className="relative mb-2 overflow-hidden" style={{ height: '150px' }}>
              {post.mediaType === 'image' && (
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              )}
              {post.mediaType === 'video' && (
                <div className="relative w-full h-full">
                  <video
                    src={post.mediaUrl}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                  <div className="absolute top-0 right-0 bg-black dark:bg-white dim:bg-white gold:bg-[#D6A756] blue:bg-[#8aa5b9] text-white dark:text-black dim:text-black gold:text-black blue:text-black text-xs px-2 py-0.5 m-2">
                    Video
                  </div>
                </div>
              )}
              {post.mediaType === 'audio' && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <span className="text-gray-500">Audio: {post.title}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] text-xs line-clamp-2 flex-grow">
            {post.content}
          </p>

          <div className="mt-1 pt-1 text-xs text-gray-500 dark:text-gray-400 dim:text-gray-400 gold:text-[#D6A756] blue:text-[#8aa5b9] flex justify-between items-center">
            <span>
              By <span className="text-black dark:text-white dim:text-white gold:text-black blue:text-black">Synthara</span>
            </span>
            <span>{new Date(post.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

PostList.propTypes = {
  posts: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default PostList;
