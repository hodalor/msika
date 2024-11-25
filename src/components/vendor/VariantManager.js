import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  Paper,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,

  TableRow,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, TableChart, LocalShipping } from '@mui/icons-material';
import ImageUpload from './ImageUpload';
import BarcodeScanner from './BarcodeScanner';
import { calculateShippingCost, generateBulkSKUs } from '../../utils/productUtils';
import BatchVariantOperations from './BatchVariantOperations';
import { shippingZones, calculateZoneRate } from '../../utils/shippingZones';

const generateSKU = (productName, variantType, optionName) => {
  const prefix = productName.slice(0, 3).toUpperCase();
  const typeCode = variantType.slice(0, 2).toUpperCase();
  const optionCode = optionName.slice(0, 2).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${typeCode}${optionCode}-${random}`;
};

const defaultVariantOption = { 
  name: '', 
  price: '', 
  stock: '', 
  image: '',
  sku: '',
  barcode: '',
  shippingRules: {
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    specialHandling: false,
    additionalCost: '',
  }
};

const VariantManager = ({ variants, onChange }) => {
  const [bulkDialog, setBulkDialog] = useState(false);
  const [combinationsDialog, setCombinationsDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [shippingDialog, setShippingDialog] = useState(false);
  const [barcodeDialog, setBarcodeDialog] = useState(false);
  const [currentOption, setCurrentOption] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [shippingCalculator, setShippingCalculator] = useState(false);
  const [distance, setDistance] = useState('');
  const [batchOperationsOpen, setBatchOperationsOpen] = useState(false);

  const handleAddVariantType = () => {
    onChange([...variants, { type: '', options: [defaultVariantOption] }]);
  };

  const handleRemoveVariantType = (typeIndex) => {
    const newVariants = variants.filter((_, index) => index !== typeIndex);
    onChange(newVariants);
  };

  const handleAddOption = (typeIndex) => {
    const newVariants = [...variants];
    newVariants[typeIndex].options.push({ ...defaultVariantOption });
    onChange(newVariants);
  };

  const handleRemoveOption = (typeIndex, optionIndex) => {
    const newVariants = [...variants];
    newVariants[typeIndex].options = newVariants[typeIndex].options.filter(
      (_, index) => index !== optionIndex
    );
    onChange(newVariants);
  };

  const handleVariantTypeChange = (typeIndex, value) => {
    const newVariants = [...variants];
    newVariants[typeIndex].type = value;
    onChange(newVariants);
  };

  const handleOptionChange = (typeIndex, optionIndex, field, value) => {
    const newVariants = [...variants];
    newVariants[typeIndex].options[optionIndex][field] = value;
    onChange(newVariants);
  };

  const handleBulkUpdate = (values) => {
    const newVariants = [...variants];
    const [typeIndex] = values;
    
    // Parse CSV or spreadsheet data
    const rows = values.split('\n').map(row => row.split(','));
    const options = rows.map(([name, price, stock]) => ({
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      image: '',
    }));

    newVariants[typeIndex].options = options;
    onChange(newVariants);
    setBulkDialog(false);
  };

  const generateCombinations = () => {
    const options = variants.map(variant => 
      variant.options.map(opt => ({
        type: variant.type,
        ...opt
      }))
    );

    const combinations = options.reduce((acc, curr) => {
      if (!acc.length) return curr;
      return acc.flatMap(a => 
        curr.map(b => ({
          ...a,
          [`${b.type}`]: b.name,
          price: parseFloat(a.price) + parseFloat(b.price),
          stock: Math.min(parseInt(a.stock), parseInt(b.stock)),
        }))
      );
    }, []);

    return combinations;
  };

  const handleImageUpload = (typeIndex, optionIndex, imageUrl) => {
    const newVariants = [...variants];
    newVariants[typeIndex].options[optionIndex].image = imageUrl;
    onChange(newVariants);
  };

  const handleGenerateSKU = (typeIndex, optionIndex) => {
    const newVariants = [...variants];
    const variant = newVariants[typeIndex];
    const option = variant.options[optionIndex];
    
    option.sku = generateSKU(
      formik.values.name, // You'll need to pass product name as a prop
      variant.type,
      option.name
    );
    
    onChange(newVariants);
  };

  const handleGenerateBarcode = (typeIndex, optionIndex) => {
    const newVariants = [...variants];
    const option = newVariants[typeIndex].options[optionIndex];
    option.barcode = option.sku; // Use SKU as barcode or generate a unique one
    onChange(newVariants);
  };

  const handleBulkSKUGeneration = () => {
    const newVariants = generateBulkSKUs(formik.values.name, variants);
    onChange(newVariants);
  };

  const handleBarcodeScan = (code) => {
    if (currentOption) {
      const newVariants = [...variants];
      newVariants[currentOption.typeIndex]
        .options[currentOption.optionIndex].barcode = code;
      onChange(newVariants);
      setScannerOpen(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">Product Variants</Typography>
        <Box>
          <Button
            startIcon={<TableChart />}
            onClick={() => setCombinationsDialog(true)}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            View Combinations
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddVariantType}
            variant="outlined"
            size="small"
          >
            Add Variant Type
          </Button>
          <Button
            onClick={handleBulkSKUGeneration}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            Generate All SKUs
          </Button>
          <Button
            onClick={() => setBatchOperationsOpen(true)}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          >
            Batch Operations
          </Button>
        </Box>
      </Box>

      {variants.map((variant, typeIndex) => (
        <Paper key={typeIndex} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Variant Type"
                  value={variant.type}
                  onChange={(e) => handleVariantTypeChange(typeIndex, e.target.value)}
                >
                  <MenuItem value="size">Size</MenuItem>
                  <MenuItem value="color">Color</MenuItem>
                  <MenuItem value="material">Material</MenuItem>
                  <MenuItem value="style">Style</MenuItem>
                </TextField>
                <Button
                  onClick={() => {
                    setSelectedVariant(typeIndex);
                    setBulkDialog(true);
                  }}
                >
                  Bulk Update
                </Button>
                <IconButton 
                  color="error"
                  onClick={() => handleRemoveVariantType(typeIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>

            {variant.options.map((option, optionIndex) => (
              <Grid item xs={12} key={optionIndex}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 50, 
                      height: 50, 
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedVariant(typeIndex);
                      setSelectedOption(optionIndex);
                    }}
                  >
                    {option.image ? (
                      <img 
                        src={option.image} 
                        alt={option.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5'
                      }}>
                        <AddIcon />
                      </Box>
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    label="Name"
                    value={option.name}
                    onChange={(e) => 
                      handleOptionChange(typeIndex, optionIndex, 'name', e.target.value)
                    }
                    placeholder={`Enter ${variant.type}`}
                  />
                  <TextField
                    label="Price"
                    type="number"
                    value={option.price}
                    onChange={(e) => 
                      handleOptionChange(typeIndex, optionIndex, 'price', e.target.value)
                    }
                    sx={{ width: '150px' }}
                  />
                  <TextField
                    label="Stock"
                    type="number"
                    value={option.stock}
                    onChange={(e) => 
                      handleOptionChange(typeIndex, optionIndex, 'stock', e.target.value)
                    }
                    sx={{ width: '150px' }}
                  />
                  <IconButton 
                    color="error"
                    onClick={() => handleRemoveOption(typeIndex, optionIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleGenerateSKU(typeIndex, optionIndex)}
                    title="Generate SKU"
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setCurrentOption({ typeIndex, optionIndex });
                      setBarcodeDialog(true);
                    }}
                    title="View Barcode"
                  >
                    <Barcode />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setCurrentOption({ typeIndex, optionIndex });
                      setShippingDialog(true);
                    }}
                    title="Shipping Rules"
                  >
                    <LocalShipping />
                  </IconButton>
                  <TextField
                    size="small"
                    value={option.sku || ''}
                    disabled
                    sx={{ width: '150px' }}
                    placeholder="SKU"
                  />
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                startIcon={<AddIcon />}
                onClick={() => handleAddOption(typeIndex)}
                size="small"
              >
                Add Option
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ))}

      {/* Bulk Update Dialog */}
      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Update Variants</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Paste your data in CSV format (name, price, stock)
          </Typography>
          <TextField
            multiline
            rows={10}
            fullWidth
            placeholder="Small, 10.99, 100&#13;Medium, 12.99, 100&#13;Large, 14.99, 100"
            onChange={(e) => handleBulkUpdate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setBulkDialog(false)}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Combinations Dialog */}
      <Dialog 
        open={combinationsDialog} 
        onClose={() => setCombinationsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Variant Combinations</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {variants.map(variant => (
                    <TableCell key={variant.type}>{variant.type}</TableCell>
                  ))}
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generateCombinations().map((combination, index) => (
                  <TableRow key={index}>
                    {variants.map(variant => (
                      <TableCell key={variant.type}>
                        {combination[variant.type]}
                      </TableCell>
                    ))}
                    <TableCell>{combination.price}</TableCell>
                    <TableCell>{combination.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCombinationsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog
        open={selectedVariant !== null && selectedOption !== null}
        onClose={() => {
          setSelectedVariant(null);
          setSelectedOption(null);
        }}
      >
        <DialogTitle>Upload Variant Image</DialogTitle>
        <DialogContent>
          <ImageUpload
            images={[variants[selectedVariant]?.options[selectedOption]?.image].filter(Boolean)}
            onChange={(urls) => {
              if (urls.length > 0) {
                handleImageUpload(selectedVariant, selectedOption, urls[0]);
              }
              setSelectedVariant(null);
              setSelectedOption(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Shipping Rules Dialog */}
      <Dialog
        open={shippingDialog}
        onClose={() => setShippingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Shipping Rules</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={currentOption ? 
                  variants[currentOption.typeIndex]
                    .options[currentOption.optionIndex]
                    .shippingRules.weight : ''
                }
                onChange={(e) => {
                  if (currentOption) {
                    const newVariants = [...variants];
                    newVariants[currentOption.typeIndex]
                      .options[currentOption.optionIndex]
                      .shippingRules.weight = e.target.value;
                    onChange(newVariants);
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Length (cm)"
                type="number"
                value={currentOption ? 
                  variants[currentOption.typeIndex]
                    .options[currentOption.optionIndex]
                    .shippingRules.dimensions.length : ''
                }
                onChange={(e) => {
                  if (currentOption) {
                    const newVariants = [...variants];
                    newVariants[currentOption.typeIndex]
                      .options[currentOption.optionIndex]
                      .shippingRules.dimensions.length = e.target.value;
                    onChange(newVariants);
                  }
                }}
              />
            </Grid>
            
            {/* Add similar fields for width and height */}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Shipping Cost"
                type="number"
                value={currentOption ? 
                  variants[currentOption.typeIndex]
                    .options[currentOption.optionIndex]
                    .shippingRules.additionalCost : ''
                }
                onChange={(e) => {
                  if (currentOption) {
                    const newVariants = [...variants];
                    newVariants[currentOption.typeIndex]
                      .options[currentOption.optionIndex]
                      .shippingRules.additionalCost = e.target.value;
                    onChange(newVariants);
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shipping Distance (km)"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (currentOption) {
                    const variant = variants[currentOption.typeIndex]
                      .options[currentOption.optionIndex];
                    const cost = calculateShippingCost(
                      variant.shippingRules.weight,
                      variant.shippingRules.dimensions,
                      parseFloat(distance)
                    );
                    const newVariants = [...variants];
                    newVariants[currentOption.typeIndex]
                      .options[currentOption.optionIndex]
                      .shippingRules.calculatedCost = cost;
                    onChange(newVariants);
                  }
                }}
                variant="contained"
                sx={{ mt: 2 }}
              >
                Calculate Shipping Cost
              </Button>
              {currentOption && variants[currentOption.typeIndex]
                .options[currentOption.optionIndex]
                .shippingRules.calculatedCost && (
                <Typography sx={{ mt: 2 }}>
                  Estimated Shipping Cost: $
                  {variants[currentOption.typeIndex]
                    .options[currentOption.optionIndex]
                    .shippingRules.calculatedCost}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShippingDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Barcode Dialog */}
      <Dialog
        open={barcodeDialog}
        onClose={() => setBarcodeDialog(false)}
      >
        <DialogTitle>Barcode</DialogTitle>
        <DialogContent>
          {currentOption && variants[currentOption.typeIndex]
            .options[currentOption.optionIndex].sku && (
            <Box sx={{ p: 2 }}>
              <Barcode 
                value={variants[currentOption.typeIndex]
                  .options[currentOption.optionIndex].sku}
                width={1.5}
                height={50}
              />
            </Box>
          )}
          <Button
            onClick={() => setScannerOpen(true)}
            variant="outlined"
          >
            Scan Barcode
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBarcodeDialog(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              if (currentOption) {
                handleGenerateBarcode(
                  currentOption.typeIndex,
                  currentOption.optionIndex
                );
              }
            }}
          >
            Generate New
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scanner Dialog */}
      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Scan Barcode</DialogTitle>
        <DialogContent>
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={(error) => console.error('Scanning error:', error)}
          />
        </DialogContent>
      </Dialog>

      <BatchVariantOperations
        open={batchOperationsOpen}
        onClose={() => setBatchOperationsOpen(false)}
        variants={variants}
        onUpdate={onChange}
      />
    </Box>
  );
};

export default VariantManager; 