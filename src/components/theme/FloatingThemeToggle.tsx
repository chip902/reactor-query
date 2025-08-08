'use client';

import React from 'react';
import { Fab, Tooltip, useTheme } from '@mui/material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';
import { useTheme as useAppTheme } from '@/contexts/ThemeContext';

export function FloatingThemeToggle() {
  const theme = useTheme();
  const { resolvedTheme, toggleTheme } = useAppTheme();

  return (
    <Tooltip title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}>
      <Fab
        onClick={toggleTheme}
        size="small"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[6],
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1) rotate(180deg)',
            boxShadow: theme.shadows[12],
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {resolvedTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </Fab>
    </Tooltip>
  );
}