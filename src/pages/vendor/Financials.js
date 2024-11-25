import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Financials = () => {
  // Dummy data for charts
  const salesData = [
    { month: 'Jan', sales: 4000, expenses: 2400 },
    { month: 'Feb', sales: 3000, expenses: 1398 },
    { month: 'Mar', sales: 2000, expenses: 9800 },
    { month: 'Apr', sales: 2780, expenses: 3908 },
    { month: 'May', sales: 1890, expenses: 4800 },
    { month: 'Jun', sales: 2390, expenses: 3800 },
  ];

  // Dummy transactions data
  const transactions = [
    { id: 1, date: '2024-01-15', type: 'Sale', amount: 120.00, status: 'Completed' },
    { id: 2, date: '2024-01-14', type: 'Refund', amount: -50.00, status: 'Processed' },
    { id: 3, date: '2024-01-13', type: 'Sale', amount: 85.50, status: 'Completed' },
    { id: 4, date: '2024-01-12', type: 'Sale', amount: 200.00, status: 'Pending' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Financial Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">$12,500</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Monthly Revenue
              </Typography>
              <Typography variant="h4">$2,300</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Payouts
              </Typography>
              <Typography variant="h4">$850</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales vs Expenses
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>
                        <Typography
                          color={transaction.amount < 0 ? 'error' : 'success.main'}
                        >
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>{transaction.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Financials; 