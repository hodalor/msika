const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Image upload failed');
    }

    const data = await response.json();
    console.log('Upload response:', data);
    return data.imageUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

export default uploadImage; 