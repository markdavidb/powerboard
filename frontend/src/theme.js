// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ffffff',
        },
        background: {
            default: '#181926',
            paper: 'rgba(255,255,255,0.05)',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#181926',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                },
            },
        },
        MuiMenu: {
            defaultProps: {
                TransitionProps: { timeout: 0 },
                disableScrollLock: true,
            },
        },
        MuiSelect: {
            defaultProps: {
                MenuProps: {
                    transitionDuration: 0,
                    disableScrollLock: true,
                    disableAutoFocusItem: true,
                    getContentAnchorEl: null,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' },
                },
            },
        },
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
            },
        },
    },

    MuiInputLabel: {
        defaultProps: {
            shrink: false,
        },
        styleOverrides: {
            root: {
                transition: 'none !important',   // no movement animation
            },
        },
    },

    // 2️⃣ Never notch the outline...
    MuiOutlinedInput: {
        defaultProps: {
            notched: false,
        },
        styleOverrides: {
            notchedOutline: {
                // collapse the legend element to zero width so no gap appears
                '& legend': {
                    display: 'none',
                },
            },
        },
    },

    // 3️⃣ (Optional) Turn off ripple, transitions, etc.
    MuiSelect: {
        defaultProps: {
            MenuProps: { transitionDuration: 0, disableScrollLock: true },
        },
    },
    MuiMenu: {
        defaultProps: {
            TransitionProps: { timeout: 0 },
        },
    },
    MuiButtonBase: {
        defaultProps: {
            disableRipple: true,
        },
    },
});

export default theme;
