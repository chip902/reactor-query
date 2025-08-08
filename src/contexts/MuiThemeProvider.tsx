'use client';

import React, { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '@/app/theme';
import { useTheme } from '@/contexts/ThemeContext';

export function MaterialThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  
  const theme = useMemo(
    () => createAppTheme(resolvedTheme),
    [resolvedTheme]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}