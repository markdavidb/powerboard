// src/components/CommentsSection.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    Avatar,
} from '@mui/material';
import { Send, Edit3, Trash2, Save, X } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { API } from '../api/axios';

const accent = '#6C63FF';

const gradientStyles = {
    submit: { border: `1px solid ${accent}`, color: accent },
    edit: { border: '1px solid #60a5fa', color: '#60a5fa' },
    delete: { border: '1px solid #f87171', color: '#f87171' },
    save: { border: '1px solid #facc15', color: '#facc15' },
    cancel: { border: `1px solid ${accent}`, color: accent },
};

const baseButton = {
    fontSize: 13,
    fontWeight: 500,
    px: 2.5,
    py: 0.75,
    textTransform: 'none',
    borderRadius: 2,
    transition: 'all 0.2s ease-in-out',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
    },
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
        <Box mt={4}>
            <Typography variant="h6" fontWeight="bold" color="#fff" gutterBottom>
                Comments
            </Typography>

            {/* input row */}
            <Box display="flex" gap={1} mb={3}>
                <TextField
                    placeholder="Write a comment…"
                    variant="outlined"
                    fullWidth
                    size="small"
                    multiline
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    sx={{
                        bgcolor: 'rgba(24,24,30,0.85)',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(108,99,255,0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(108,99,255,0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: accent,
                        },
                        '& textarea': { color: '#fff' },
                    }}
                />
                <Button
                    onClick={handleAdd}
                    startIcon={<Send size={16} />}
                    disabled={submitting || !newComment.trim()}
                    sx={{ ...baseButton, ...gradientStyles.submit }}
                >
                    {submitting ? 'Submitting…' : 'Submit'}
                </Button>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

            {loading ? (
                <Typography mt={2} color="#aaa">
                    Loading comments…
                </Typography>
            ) : comments.length ? (
                comments.map(c => (
                    <Box
                        key={c.id}
                        sx={{
                            bgcolor: 'rgba(24,24,30,0.85)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 3,
                            p: 2,
                            mb: 2,
                            border: '1px solid rgba(108,99,255,0.15)',
                            '&:hover': { borderColor: 'rgba(108,99,255,0.35)' },
                        }}
                    >
                        {/* header (avatar + user + date) */}
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar
                                    src={c.avatar_url || undefined}
                                    alt={c.username}
                                    sx={{ width: 30, height: 30 }}
                                />
                                <Typography fontWeight="bold" color="#fff">
                                    {c.username}
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="#aaa">
                                {new Date(c.created_at).toLocaleString()}
                            </Typography>
                        </Box>

                        {/* content / edit box */}
                        {editingId === c.id ? (
                            <Box mt={2}>
                                <TextField
                                    fullWidth
                                    multiline
                                    size="small"
                                    value={editedText}
                                    onChange={e => setEdited(e.target.value)}
                                    sx={{
                                        mt: 1,
                                        bgcolor: 'rgba(24,24,30,0.85)',
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(108,99,255,0.3)',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: accent,
                                        },
                                        '& textarea': { color: '#fff' },
                                    }}
                                />
                                <Box display="flex" gap={1} mt={1}>
                                    <Button
                                        onClick={handleSave}
                                        startIcon={<Save size={16} />}
                                        sx={{ ...baseButton, ...gradientStyles.save }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setEditing(null);
                                            setEdited('');
                                        }}
                                        startIcon={<X size={16} />}
                                        sx={{ ...baseButton, ...gradientStyles.cancel }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box>
                                <Typography mt={1} color="#ccc" whiteSpace="pre-wrap">
                                    {c.content}
                                </Typography>
                                {canModify(c) && (
                                    <Box display="flex" gap={1} mt={1}>
                                        <Button
                                            size="small"
                                            startIcon={<Edit3 size={16} />}
                                            onClick={() => {
                                                setEditing(c.id);
                                                setEdited(c.content);
                                            }}
                                            sx={{ ...baseButton, ...gradientStyles.edit }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<Trash2 size={16} />}
                                            onClick={() => handleDelete(c.id)}
                                            sx={{ ...baseButton, ...gradientStyles.delete }}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                ))
            ) : (
                <Typography mt={2} color="#aaa">
                    No comments yet.
                </Typography>
            )}
        </Box>
    );
}
