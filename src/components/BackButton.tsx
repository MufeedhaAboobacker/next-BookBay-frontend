'use client';

import { useRouter, usePathname } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Tooltip } from '@mui/material';

// List of routes where back button should be hidden
const HIDDEN_PATHS = ['/', '/login', '/register', '/seller', '/dashboard'];

const BackButton = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Trim any trailing spaces
  const cleanPath = pathname.trim();

  if (HIDDEN_PATHS.includes(cleanPath)) {
    return null;
  }

  return (
    <Tooltip title="Go back">
      <IconButton
        onClick={() => router.back()}
        sx={{ position: 'fixed', top: 16, left: 16, zIndex: 50 }}
      >
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );
};

export default BackButton;
