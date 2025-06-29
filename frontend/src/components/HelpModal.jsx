import React from 'react';
import {
  Modal,
  Fade,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Stack,
  Tooltip,
} from '@mui/material';
import { X as CloseIcon, Mail, Linkedin, Github } from 'lucide-react';

const paperSx = {
  bgcolor: 'rgba(30,32,40,0.96)',
  borderRadius: 3,
  border: '1.8px solid rgba(122,103,255,0.51)',
  boxShadow: '0 8px 56px 0 rgba(40,30,70,0.23)',
  p: 0,
  minWidth: { xs: 320, sm: 380 },
  width: '96vw',
  maxWidth: 390,
  outline: 'none',
};

export default function HelpModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box sx={{
          ...paperSx,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.7, pt: 2.5, pb: 2.1,
          }}>
            <Typography fontWeight={600} fontSize={19} sx={{ letterSpacing: 0.1 }}>
              Contact the Developer
            </Typography>
            <IconButton onClick={onClose} size="small" sx={{ color: '#b7b7c8' }}>
              <CloseIcon size={21} />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 0.5, borderColor: 'rgba(120,120,140,0.10)' }} />

          {/* Content */}
          <Box sx={{ px: 3, pt: 0.5, pb: 2.2 }}>
            <Stack alignItems="center" mb={1.5} mt={1.6} spacing={1}>
              <AvatarWithInitials name="Mark David" />
              <Typography fontWeight={600} fontSize={18} sx={{ letterSpacing: 0.1, color: '#eee' }}>
                Mark David
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2.8} justifyContent="center" alignItems="center" mb={2.3}>
              <Tooltip title="Email" arrow>
                <IconButton
                  component="a"
                  href="mailto:markdavidb@gmail.com"
                  target="_blank"
                  rel="noopener"
                  sx={iconBtnSx}
                >
                  <Mail size={26} />
                </IconButton>
              </Tooltip>
              <Tooltip title="LinkedIn" arrow>
                <IconButton
                  component="a"
                  href="https://linkedin.com/in/markdavidb"
                  target="_blank"
                  rel="noopener"
                  sx={iconBtnSx}
                >
                  <Linkedin size={26} />
                </IconButton>
              </Tooltip>
              <Tooltip title="GitHub" arrow>
                <IconButton
                  component="a"
                  href="https://github.com/markdavidb"
                  target="_blank"
                  rel="noopener"
                  sx={iconBtnSx}
                >
                  <Github size={26} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Box mt={1.5}>
              <Typography variant="body2" sx={{ color: '#9090af', textAlign: 'center', fontSize: 13 }}>
                Have a question, feedback, or want to connect?<br />Feel free to reach out!
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mt: 1, borderColor: 'rgba(120,120,140,0.10)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, py: 2 }}>
            <Button
              onClick={onClose}
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg,#6C63FF 10%,#5a69f8 90%)',
                color: '#fff',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                borderRadius: 2,
                boxShadow: '0 1px 16px 0 rgba(120,110,255,0.11)',
                '&:hover': { background: 'linear-gradient(90deg,#7d77fc 0%,#6474fb 100%)' },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

const iconBtnSx = {
  color: '#adafff',
  bgcolor: 'rgba(122,103,255,0.09)',
  borderRadius: '50%',
  p: 1,
  transition: 'background 0.15s, color 0.15s',
  '&:hover': {
    bgcolor: 'rgba(122,103,255,0.22)',
    color: '#7a67ff',
  },
};

function AvatarWithInitials({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <Box
      sx={{
        width: 48, height: 48, borderRadius: '50%',
        bgcolor: 'rgba(122,103,255,0.21)',
        color: '#7a67ff',
        fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
        boxShadow: '0 2px 12px 0 rgba(122,103,255,0.10)'
      }}
    >
      {initials}
    </Box>
  );
}
