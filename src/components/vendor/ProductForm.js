import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import { useNotification } from '../../context/NotificationContext';
import { useApi } from '../../hooks/useApi';
import { productAPI } from '../../services/api';
import ImageUpload from './ImageUpload';
import VariantManager from './VariantManager';

const validationSchema = Yup.object({
  name: Yup.string().required('Product name is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number()
    .positive('Price must be positive')
    .required('Price is required'),
  stock: Yup.number()
    .integer('Stock must be an integer')
    .min(0)
    .required('Stock is required'),
  category: Yup.string().required('Category is required'),
  status: Yup.string().required('Status is required'),
});

const ProductForm = ({ product, onClose, onSubmitSuccess }) => {
  const { showNotification } = useNotification();
  const createProduct = useApi(productAPI.createProduct);
  const updateProduct = useApi(productAPI.updateProduct);

  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || '',
      stock: product?.stock || '',
      category: product?.category || '',
      status: product?.status || 'draft',
      images: product?.images || [],
      variants: product?.variants || [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (product) {
          await updateProduct.execute(product._id, values);
          showNotification('Product updated successfully', 'success');
        } else {
          await createProduct.execute(values);
          showNotification('Product created successfully', 'success');
        }
        onSubmitSuccess();
      } catch (error) {
        showNotification(error.message || 'Failed to save product', 'error');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="name"
            label="Product Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="description"
            label="Description"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="price"
            label="Price"
            type="number"
            value={formik.values.price}
            onChange={formik.handleChange}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="stock"
            label="Stock"
            type="number"
            value={formik.values.stock}
            onChange={formik.handleChange}
            error={formik.touched.stock && Boolean(formik.errors.stock)}
            helperText={formik.touched.stock && formik.errors.stock}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="category"
            label="Category"
            select
            value={formik.values.category}
            onChange={formik.handleChange}
            error={formik.touched.category && Boolean(formik.errors.category)}
            helperText={formik.touched.category && formik.errors.category}
          >
            <MenuItem value="electronics">Electronics</MenuItem>
            <MenuItem value="clothing">Clothing</MenuItem>
            <MenuItem value="books">Books</MenuItem>
            <MenuItem value="home">Home & Garden</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="status"
            label="Status"
            select
            value={formik.values.status}
            onChange={formik.handleChange}
            error={formik.touched.status && Boolean(formik.errors.status)}
            helperText={formik.touched.status && formik.errors.status}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="outOfStock">Out of Stock</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Product Images
          </Typography>
          <ImageUpload
            images={formik.values.images}
            onChange={(newImages) => formik.setFieldValue('images', newImages)}
          />
        </Grid>

        <Grid item xs={12}>
          <VariantManager
            productName={formik.values.name}
            variants={formik.values.variants}
            onChange={(newVariants) => formik.setFieldValue('variants', newVariants)}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProductForm; 