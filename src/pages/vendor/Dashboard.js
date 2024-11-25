import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  MonetizationOn,
} from '@mui/icons-material';
import { useRealTimeData } from '../../hooks/useRealTimeData';

const DashboardCard = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: `${color}.light`,
          borderRadius: '50%',
          p: 1,
          display: 'flex',
        }}
      >
        {icon}
      </Box>
    </Box>
  </Paper>
);

const VendorDashboard = () => {
  const { data: stats = {}, loading: statsLoading } = useRealTimeData('/orders/stats/overview');
  const { data: recentOrders = [], loading: ordersLoading } = useRealTimeData('/orders/recent');

  // Initialize default values
  const {
    totalSales = 0,
    totalOrders = 0,
    pendingOrders = 0,
    totalRevenue = 0
  } = stats || {};

  const orders = Array.isArray(recentOrders) ? recentOrders : [];

  if (statsLoading || ordersLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Sales"
            value={`$${Number(totalSales).toFixed(2)}`}
            icon={<TrendingUp />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Orders"
            value={totalOrders}
            icon={<ShoppingCart />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Pending Orders"
            value={pendingOrders}
            icon={<Inventory />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Revenue"
            value={`$${Number(totalRevenue).toFixed(2)}`}
            icon={<MonetizationOn />}
            color="error"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              {orders.length > 0 ? (
                <List>
                  {orders.map((order) => (
                    <React.Fragment key={order?._id || Math.random()}>
                      <ListItem>
                        <ListItemText
                          primary={order?.customer?.name || 'Unknown Customer'}
                          secondary={`Amount: $${order?.totalAmount?.toFixed(2) || 0} • Status: ${order?.status || 'N/A'}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent orders
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sales data visualization will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorDashboard; 