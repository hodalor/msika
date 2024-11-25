import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const VariantAnalytics = ({ variants, sales }) => {
  const [analytics, setAnalytics] = useState({
    variantPerformance: [],
    stockDistribution: [],
    priceRanges: [],
  });

  useEffect(() => {
    // Calculate variant performance
    const variantPerformance = variants.flatMap(variant =>
      variant.options.map(option => ({
        name: `${variant.type} - ${option.name}`,
        sales: sales.filter(sale => 
          sale.variant.type === variant.type && 
          sale.variant.option === option.name
        ).length,
        revenue: sales.filter(sale => 
          sale.variant.type === variant.type && 
          sale.variant.option === option.name
        ).reduce((sum, sale) => sum + sale.price, 0),
      }))
    );

    // Calculate stock distribution
    const stockDistribution = variants.flatMap(variant =>
      variant.options.map(option => ({
        name: `${variant.type} - ${option.name}`,
        value: option.stock,
      }))
    );

    // Calculate price ranges
    const prices = variants.flatMap(variant => 
      variant.options.map(option => option.price)
    );
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const interval = range / 4;

    const priceRanges = Array.from({ length: 4 }, (_, i) => {
      const start = minPrice + (i * interval);
      const end = start + interval;
      return {
        range: `$${start.toFixed(2)} - $${end.toFixed(2)}`,
        count: variants.flatMap(variant => 
          variant.options.filter(option => 
            option.price >= start && option.price < end
          )
        ).length,
      };
    });

    setAnalytics({ variantPerformance, stockDistribution, priceRanges });
  }, [variants, sales]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Variant Performance
          </Typography>
          <BarChart width={600} height={300} data={analytics.variantPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Sales" />
            <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
          </BarChart>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Stock Distribution
          </Typography>
          <PieChart width={400} height={300}>
            <Pie
              data={analytics.stockDistribution}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {analytics.stockDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Price Distribution
          </Typography>
          <BarChart width={400} height={300} data={analytics.priceRanges}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Number of Variants" />
          </BarChart>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default VariantAnalytics; 