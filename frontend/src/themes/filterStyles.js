// Glass-style inputs used in TaskBoard & BigTasksPage
export const filterTextFieldSx = {
    width: 210,
    height: 40,
    borderRadius: 2.5,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: '0.3s ease',
    '& .MuiOutlinedInput-root': {
        height: 40,
        borderRadius: 2.5,
        px: 1,
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: '#8ab4f8' },
        '&.Mui-focused fieldset': { borderColor: '#8ab4f8' },
        input: {
            color: '#fff',
            fontSize: '0.95rem',
            padding: '10px 8px',
        },
    },
    '& .MuiInputAdornment-root': { mr: 1 },
};

export const filterSelectBoxSx = {
    minWidth: 160,
    height: 40,
    borderRadius: 2.5,
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: '0.3s ease',
};

export const filterSelectSx = {
    color: '#fff',
    height: 40,
    borderRadius: 2.5,
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255,255,255,0.1)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8ab4f8' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8ab4f8' },
    '& .MuiSvgIcon-root': { color: '#ccc' },
    '& .MuiSelect-select': {
        padding: '10px 8px',
        display: 'flex',
        alignItems: 'center',
        height: '20px',
    },
    px: 1,
};


// src/theme/filterStyles.js
export const dueButtonSx = {
    height: 40,
    color: '#fff',
    borderColor: 'rgba(255,255,255,0.12)',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.85rem',
    borderRadius: '10px',
    px: 2,
    minWidth: 160,
    bgcolor: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(8px)',
    '&:hover': {
        borderColor: '#6C63FF',
        bgcolor: 'rgba(108,99,255,0.08)',
    },
};  // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

export const dueMenuPaperSx = {
    bgcolor: 'rgba(24,24,35,0.95)',
    borderRadius: 3,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.05)',
};

export const dueMenuItemSx = {
    fontSize: '0.875rem',
    color: '#eee',
    '&.Mui-selected': {
        backgroundColor: 'rgba(108,99,255,0.2)',
    },
    '&:hover': {
        backgroundColor: 'rgba(108,99,255,0.1)',
    },
};

export const dueDividerSx = {
    borderColor: 'rgba(255,255,255,0.1)',
    my: 1,
};

export const dueInputBoxSx = {
    px: 2.5,
    pt: 1.5,
    pb: 2.5,
    borderRadius: 3,
    background: 'rgba(255,255,255,0.02)',
    backdropFilter: 'blur(8px)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
};

export const dueTypographySx = {
    mb: 1,
    fontSize: '0.85rem',
    fontWeight: 500,
    letterSpacing: '0.3px',
    color: '#bbb',
};

export const dueTextFieldSx = {
    width: '100%',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 500,
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
    transition: 'all 0.3s ease',
    '& input': {
        color: '#fff',
        fontFamily: 'inherit',
        padding: '10px 12px',
    },
    '&:hover': {
        background: 'rgba(255,255,255,0.07)',
        borderColor: '#6C63FF',
    },
    '&:focus-within': {
        background: 'rgba(255,255,255,0.08)',
        borderColor: '#7E76FF',
        boxShadow: '0 0 0 2px rgba(124,108,255,0.2)',
    },
};

export const dueApplyButtonSx = {
    mt: 1.5,
    py: 1,
    fontWeight: 600,
    fontSize: '0.85rem',
    borderRadius: 2,
    color: '#fff',
    background: 'linear-gradient(135deg, #6C63FF, #8F83FF)',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
    textTransform: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a50e0, #7b6df0)',
        boxShadow: '0 6px 20px rgba(108,99,255,0.4)',
    },
    '&:disabled': {
        background: 'rgba(255,255,255,0.05)',
        color: '#888',
        boxShadow: 'none',
    },
};
