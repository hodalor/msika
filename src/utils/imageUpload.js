const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl; // URL from MongoDB/GridFS
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const deleteImage = async (imageUrl) => {
  try {
    const imageId = imageUrl.split('/').pop();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/upload/image/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export { uploadImage, deleteImage }; 