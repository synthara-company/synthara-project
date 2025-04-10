// src/firebase/posts.js
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';

const postsCollection = collection(db, 'posts');

export const fetchPosts = async () => {
  const snapshot = await getDocs(postsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createPost = async (post) => {
  // Implementation for creating a post
};

export const updatePost = async (id, post) => {
  // Implementation for updating a post
};

export const deletePost = async (id) => {
  const postDoc = doc(db, 'posts', id);
  await deleteDoc(postDoc);
};
