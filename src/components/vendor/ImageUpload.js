import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, IconButton, ImageList, ImageListItem, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import uploadImage from '../../utils/imageUpload';
import { useNotification } from '../../context/NotificationContext';

const ImageUpload = ({ images = [], onChange, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState(images);
  const { showNotification } = useNotification();

  useEffect(() => {
    setImageUrls(images);
  }, [images]);

  const getFullImageUrl = useCallback((imageUrl) => {
    if (!imageUrl) return '/placeholder-image.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('blob:')) return imageUrl;
    const cleanUrl = imageUrl.replace(/^\/+/, '');
    return `${process.env.REACT_APP_API_URL}/${cleanUrl}`;
  }, []);

  const handleUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    if (imageUrls.length + files.length > maxImages) {
      showNotification(`Maximum ${maxImages} images allowed`, 'error');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(file => {
        const tempUrl = URL.createObjectURL(file);
        return uploadImage(file).then(url => {
          URL.revokeObjectURL(tempUrl);
          return url;
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('Uploaded URLs:', uploadedUrls);
      
      const validUrls = uploadedUrls.filter(url => url);
      if (validUrls.length > 0) {
        const newUrls = [...imageUrls, ...validUrls];
        setImageUrls(newUrls);
        onChange(newUrls);
        showNotification('Images uploaded successfully', 'success');
      } else {
        throw new Error('No valid images were uploaded');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      showNotification('Failed to upload images', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [imageUrls, maxImages, onChange, showNotification]);

  const handleDelete = useCallback((index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    onChange(newUrls);
  }, [imageUrls, onChange]);

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        multiple
        type="file"
        onChange={handleUpload}
        disabled={uploading}
      />
      <label htmlFor="image-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={uploading || imageUrls.length >= maxImages}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
      </label>

      {imageUrls.length > 0 && (
        <ImageList sx={{ mt: 2 }} cols={3} rowHeight={200}>
          {imageUrls.map((image, index) => (
            <ImageListItem key={`${image}-${index}`}>
              <img
                src={getFullImageUrl(image)}
                alt={`Upload ${index + 1}`}
                loading="lazy"
                style={{ height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  console.error('Image load error:', image);
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' }
                }}
                onClick={() => handleDelete(index)}
              >
                <DeleteIcon />
              </IconButton>
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
};

export default React.memo(ImageUpload); 