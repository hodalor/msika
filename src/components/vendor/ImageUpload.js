import React, { useState } from 'react';
import { Box, Button, IconButton, ImageList, ImageListItem } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const ImageUpload = ({ images = [], onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      // For now, create local URLs for the images
      const imageUrls = files.map(file => URL.createObjectURL(file));
      onChange([...images, ...imageUrls]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        multiple
        type="file"
        onChange={handleUpload}
      />
      <label htmlFor="image-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
        >
          Upload Images
        </Button>
      </label>

      <ImageList sx={{ mt: 2 }} cols={3} rowHeight={200}>
        {images.map((image, index) => (
          <ImageListItem key={index}>
            <img 
              src={image || '/placeholder-image.jpg'} 
              alt={`Product ${index + 1}`} 
              loading="lazy"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
              style={{ objectFit: 'cover', height: '100%' }}
            />
            <IconButton
              sx={{ 
                position: 'absolute', 
                top: 5, 
                right: 5, 
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'background.paper',
                }
              }}
              onClick={() => handleDelete(index)}
            >
              <DeleteIcon />
            </IconButton>
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default ImageUpload; 