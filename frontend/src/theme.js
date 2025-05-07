import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Forest Green for primary color (button and key elements)
    },
    secondary: {
      main: '#388E3C', // A slightly lighter shade for secondary actions
    },
    background: {
      default: '#FFFFFF', // Clean white background for the app
      paper: '#F4F6F8', // Slightly off-white for paper components
    },
    text: {
      primary: '#333333', // Charcoal for main text
      secondary: '#666666', // Lighter gray for secondary text
    },
  },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "system-ui", sans-serif',
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Keep button text as-is
          borderRadius: 8, // Slightly rounded corners for modern look
          transition: 'all 0.3s ease', // Smooth transition for background and color changes
        },
        contained: {
          backgroundColor: '#2E7D32', // Forest green for contained buttons
          color: '#FFFFFF', // White text
          '&:hover': {
            backgroundColor: '#FFFFFF', // Invert background to white on hover
            color: '#2E7D32', // Change text to forest green on hover
            border: '1px solid #2E7D32', // Add border to match the forest green color on hover
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Slight shadow effect on hover
          },
          '&:active': {
            backgroundColor: '#2C6B2F', // Even darker green on active state
          },
        },
        outlined: {
          borderColor: '#2E7D32', // Forest green for outlined buttons
          color: '#2E7D32', // Forest green text
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.1)', // Light green background on hover
            color: '#FFFFFF', // Change text to white on hover
            borderColor: '#2E7D32', // Keep border color on hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // Ensuring white background for Paper components
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Light shadow for paper components for a modern touch
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // White background for the app bar
          color: '#2E7D32', // Forest green text/icons on app bar
        },
      },
    },
  },
});

export default theme;
