'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Stack,
  Chip
} from '@mui/material';
import { ReactorQueryApplet } from '@/components/ReactorQueryApplet';

/**
 * Example component showing how to integrate the ReactorQueryApplet
 * into an existing application with other content.
 */
export function AppletExample() {
  const [currentView, setCurrentView] = React.useState<'search' | 'scanner' | 'settings'>('search');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Adobe Launch Management Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This demonstrates how to embed the ReactorQuery Applet alongside your existing content.
      </Typography>

      <Grid container spacing={3}>
        {/* Left column - Your existing content */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => setCurrentView('search')}
                  >
                    Search Tools
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => setCurrentView('scanner')}
                  >
                    Property Scanner
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => setCurrentView('settings')}
                  >
                    Settings
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Stack spacing={1}>
                  <Chip label="Property scan completed" size="small" />
                  <Chip label="5 rules updated" size="small" color="success" />
                  <Chip label="API keys configured" size="small" color="info" />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Features
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The applet includes:
                  <br />• Advanced search tools
                  <br />• Property analysis
                  <br />• Bulk editing
                  <br />• Secure API management
                  <br />• Dark/light theme support
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right column - ReactorQuery Applet */}
        <Grid item xs={12} md={8}>
          <ReactorQueryApplet 
            title="Adobe Launch Tools"
            maxHeight="85vh"
            initialView={currentView}
          />
        </Grid>
      </Grid>
    </Box>
  );
}