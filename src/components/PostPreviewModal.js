import React from 'react';
import { X } from 'lucide-react';

const PostPreviewModal = ({ post, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4 z-[101]">
        <div className="relative bg-white dark:bg-[#080808] dim:bg-[#1f2937] gold:bg-[#F9E5C9] blue:bg-[#c2d3e0] w-full max-w-4xl overflow-hidden">
          <div className="flex justify-between items-center p-4">
            <p className="text-black dark:text-white dim:text-white gold:text-black blue:text-black">
              {post.title}
            </p>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 dim:text-gray-400 hover:text-black dark:hover:text-white dim:hover:text-white transition-colors duration-200"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6">
            {(post.mediaUrl || post.imageUrl) && (
              <div className="mb-4 overflow-hidden rounded-none">
                {post.mediaType === 'image' || !post.mediaType ? (
                  <img
                    src={post.mediaUrl || post.imageUrl}
                    alt={post.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                ) : post.mediaType === 'audio' ? (
                  <div className="w-full p-6 bg-gray-100 dark:bg-[#111111] dim:bg-[#374151] gold:bg-[#E4B678] blue:bg-[#a3b9cc] flex items-center justify-center">
                    <audio
                      src={post.mediaUrl || post.imageUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <video
                      src={post.mediaUrl || post.imageUrl}
                      controls
                      className="w-full max-h-[70vh] object-contain"
                    />
                  </div>
                )}
              </div>
            )}
            <div className="prose dark:prose-invert max-w-none text-black dark:text-white dim:text-white gold:text-black blue:text-black text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
          <div className="p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-black dark:text-white dim:text-white gold:text-black blue:text-black border border-gray-300 dark:border-gray-700 dim:border-gray-600 gold:border-[#D6A756] blue:border-[#8aa5b9] hover:text-gray-500 dark:hover:text-gray-400 dim:hover:text-gray-400 gold:hover:text-[#D6A756] blue:hover:text-[#8aa5b9] transition-colors duration-200 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreviewModal;
