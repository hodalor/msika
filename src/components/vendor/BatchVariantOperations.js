import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
  stock: Yup.number().integer('Stock must be an integer').min(0).required('Stock is required'),
});

const BatchVariantOperations = ({ open, onClose, variants, onUpdate }) => {
  const [tabValue, setTabValue] = useState(0);

  const formik = useFormik({
    initialValues: {
      name: '',
      price: '',
      stock: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      onUpdate([...variants, values]);
      resetForm();
      onClose();
    },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Batch Variant Operations</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Add Variants" />
            <Tab label="Import" />
            <Tab label="Export" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                margin="dense"
                name="name"
                label="Variant Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                margin="dense"
                name="price"
                label="Price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
              <TextField
                fullWidth
                margin="dense"
                name="stock"
                label="Stock"
                type="number"
                value={formik.values.stock}
                onChange={formik.handleChange}
                error={formik.touched.stock && Boolean(formik.errors.stock)}
                helperText={formik.touched.stock && formik.errors.stock}
              />
            </form>
          )}
          {tabValue === 1 && (
            <Typography variant="body1">
              Import functionality will be added here
            </Typography>
          )}
          {tabValue === 2 && (
            <Typography variant="body1">
              Export functionality will be added here
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {tabValue === 0 && (
          <Button onClick={formik.handleSubmit} variant="contained">
            Add Variants
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BatchVariantOperations; 