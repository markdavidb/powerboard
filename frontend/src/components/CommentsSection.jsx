// src/components/CommentsSection.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    Avatar,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { Send, Edit3, Trash2, Save, X } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { API } from '../api/axios';

const accent = '#6C63FF';

const inputSx = {
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        '& fieldset': {
            borderColor: 'rgba(108,99,255,0.3)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(108,99,255,0.5)',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#6C63FF',
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input, & textarea': {
        color: '#fff',
    },
    '& .MuiInputLabel-root': {
        color: '#bbb',
        '&.Mui-focused': {
            color: '#6C63FF',
        },
    },
};

const buttonStyles = {
    submit: {
        background: `linear-gradient(135deg, ${accent}, #887CFF)`,
        boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
        '&:hover': {
            background: 'linear-gradient(135deg, #5a50e0, #7b6ae0)',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 16px rgba(108,99,255,0.4)',
        },
    },
    edit: {
        border: '1px solid #60a5fa',
        color: '#60a5fa',
        '&:hover': {
            backgroundColor: 'rgba(96,165,250,0.1)',
            borderColor: '#93c5fd',
        },
    },
    delete: {
        border: '1px solid #f87171',
        color: '#f87171',
        '&:hover': {
            backgroundColor: 'rgba(248,113,113,0.1)',
            borderColor: '#fca5a5',
        },
    },
    save: {
        border: '1px solid #facc15',
        color: '#facc15',
        '&:hover': {
            backgroundColor: 'rgba(250,204,21,0.1)',
            borderColor: '#fde047',
        },
    },
    cancel: {
        border: `1px solid ${accent}`,
        color: accent,
        '&:hover': {
            backgroundColor: `rgba(108,99,255,0.1)`,
            borderColor: '#887CFF',
        },
    },
};

const baseButton = {
    fontSize: { xs: '0.75rem', md: '0.8rem' },
    fontWeight: 500,
    px: { xs: 1.5, md: 2 },
    py: { xs: 0.5, md: 0.75 },
    textTransform: 'none',
    borderRadius: 2,
    transition: 'all 0.2s ease-in-out',
    minHeight: { xs: '28px', md: '32px' },
};

export default function CommentsSection({ taskId, onCommentAdded }) {
    const { user } = useAuth0();
    const [myProfile, setMyProfile] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditing] = useState(null);
    const [editedText, setEdited] = useState('');

    /* get my profile once */
    useEffect(() => {
        API.user
            .get('/users/users/me')
            .then(({ data }) => setMyProfile(data))
            .catch(err => console.error(err));
    }, []);

    /* fetch comments */
    const fetchComments = async () => {
        setLoading(true);
        try {
            const { data } = await API.project.get(
                `/projects/task_comments/task/${taskId}`,
            );
            const withAvatars = data.map(c => ({
                ...c,
                avatar_url:
                    myProfile &&
                    (c.username === myProfile.username || c.username === myProfile.email)
                        ? myProfile.avatar_url
                        : null,
            }));
            setComments(withAvatars);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId && myProfile) fetchComments();
    }, [taskId, myProfile]);

    const canModify = c =>
        c.username === user.email || c.username === user.nickname;

    /* add comment */
    const handleAdd = async () => {
        if (submitting || !newComment.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await API.project.post('/projects/task_comments/', {
                task_id: taskId,
                content: newComment,
            });
            setComments([
                {
                    ...data,
                    avatar_url: myProfile?.avatar_url || null,
                },
                ...comments,
            ]);
            setNewComment('');
            onCommentAdded?.(data);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    /* edit / save */
    const handleSave = async () => {
        if (!editedText.trim()) return;
        try {
            const { data } = await API.project.put(
                `/projects/task_comments/${editingId}`,
                { content: editedText },
            );
            setComments(
                comments.map(c =>
                    c.id === editingId ? { ...data, avatar_url: c.avatar_url } : c,
                ),
            );
            setEditing(null);
            setEdited('');
        } catch (err) {
            console.error(err);
        }
    };

    /* delete */
    const handleDelete = async id => {
        try {
            await API.project.delete(`/projects/task_comments/${id}`);
            setComments(comments.filter(c => c.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{
                fontWeight: 600,
                color: '#fff',
                mb: 3,
                fontSize: { xs: '1rem', md: '1.125rem' }
            }}>
                Comments
            </Typography>

            {/* Add comment input */}
            <Box sx={{
                display: 'flex',
                gap: { xs: 1, md: 1.5 },
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' }
            }}>
                <TextField
                    placeholder="Write a comment…"
                    variant="outlined"
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    sx={inputSx}
                />
                <Button
                    onClick={handleAdd}
                    startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <Send size={16} />}
                    disabled={submitting || !newComment.trim()}
                    variant="contained"
                    sx={{
                        ...baseButton,
                        ...buttonStyles.submit,
                        alignSelf: { xs: 'stretch', sm: 'flex-start' },
                        minWidth: { xs: 'auto', sm: '100px' }
                    }}
                >
                    {submitting ? 'Posting…' : 'Post'}
                </Button>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} sx={{ color: accent }} />
                </Box>
            ) : comments.length ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {comments.map(c => (
                        <Box
                            key={c.id}
                            sx={{
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 2,
                                p: { xs: 2, md: 2.5 },
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: 'rgba(108,99,255,0.2)',
                                    backgroundColor: 'rgba(255,255,255,0.03)'
                                },
                            }}
                        >
                            {/* Comment header */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: editingId === c.id ? 0 : 1.5
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar
                                        src={c.avatar_url || undefined}
                                        alt={c.username}
                                        sx={{
                                            width: { xs: 28, md: 32 },
                                            height: { xs: 28, md: 32 },
                                            bgcolor: accent
                                        }}
                                    />
                                    <Typography sx={{
                                        fontWeight: 600,
                                        color: '#fff',
                                        fontSize: { xs: '0.85rem', md: '0.9rem' }
                                    }}>
                                        {c.username}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" sx={{
                                    color: '#888',
                                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                                }}>
                                    {new Date(c.created_at).toLocaleString()}
                                </Typography>
                            </Box>

                            {/* Comment content / edit form */}
                            {editingId === c.id ? (
                                <Box sx={{ mt: 2 }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        size="small"
                                        value={editedText}
                                        onChange={e => setEdited(e.target.value)}
                                        sx={{ ...inputSx, mb: 2 }}
                                    />
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 1,
                                        flexDirection: { xs: 'column', sm: 'row' }
                                    }}>
                                        <Button
                                            onClick={handleSave}
                                            startIcon={<Save size={16} />}
                                            variant="outlined"
                                            sx={{ ...baseButton, ...buttonStyles.save }}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setEditing(null);
                                                setEdited('');
                                            }}
                                            startIcon={<X size={16} />}
                                            variant="outlined"
                                            sx={{ ...baseButton, ...buttonStyles.cancel }}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <Typography sx={{
                                        color: '#e0e0e0',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.6,
                                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                                        mb: canModify(c) ? 2 : 0
                                    }}>
                                        {c.content}
                                    </Typography>
                                    {canModify(c) && (
                                        <Box sx={{
                                            display: 'flex',
                                            gap: 1,
                                            flexDirection: { xs: 'column', sm: 'row' }
                                        }}>
                                            <Button
                                                startIcon={<Edit3 size={16} />}
                                                onClick={() => {
                                                    setEditing(c.id);
                                                    setEdited(c.content);
                                                }}
                                                variant="outlined"
                                                size="small"
                                                sx={{ ...baseButton, ...buttonStyles.edit }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                startIcon={<Trash2 size={16} />}
                                                onClick={() => handleDelete(c.id)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ ...baseButton, ...buttonStyles.delete }}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <Typography sx={{
                        color: '#888',
                        fontSize: { xs: '0.85rem', md: '0.9rem' }
                    }}>
                        No comments yet. Be the first to comment!
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
