'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Scanner as ScannerIcon,
  Close as CloseIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';
import { PRODUCT_NAME } from '@/lib/constants';

interface NavItem {
  icon: React.ReactNode;
  text: string;
  href: string;
}

const navigationItems: NavItem[] = [
  { icon: <HomeIcon />, text: 'Home', href: '/' },
  { icon: <ScannerIcon />, text: 'Property Scanner', href: '/property-scanner' },
  { icon: <EditIcon />, text: 'Bulk Edit', href: '/bulk-edit' },
  { icon: <SettingsIcon />, text: 'Settings', href: '/settings' },
  { icon: <HelpIcon />, text: 'Support', href: '/support' },
];

export default function MuiNavigationBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { theme: appTheme, toggleTheme } = useAppTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {PRODUCT_NAME}
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flex: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={handleDrawerToggle}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={appTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          onClick={toggleTheme}
        >
          {appTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Image
              src="/reactor-query.svg"
              alt={PRODUCT_NAME}
              width={32}
              height={32}
              style={{ marginRight: 12 }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {PRODUCT_NAME}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && (
            <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  sx={{
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Stack>
          )}

          <IconButton
            onClick={toggleTheme}
            color="inherit"
            sx={{
              ml: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(180deg)',
              },
            }}
          >
            {appTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}