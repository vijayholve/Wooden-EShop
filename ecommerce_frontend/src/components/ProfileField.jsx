
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Container, Box, Typography, Button, TextField, Grid, Card, CardContent, 
    CardMedia, CircularProgress, IconButton, Alert, AppBar, Toolbar 
} from '@mui/material';
import { 
    Login as LogInIcon, PersonAdd as UserPlusIcon, Logout as LogOutIcon, 
    Home as HomeIcon, Person as UserIcon, ShoppingCart as ShoppingCartIcon, 
    ArrowRight as ArrowRightIcon, Edit as EditIcon, Save as SaveIcon, 
    Cancel as CancelIcon
} from '@mui/icons-material';
const PRIMARY_COLOR = '#9e6a3c';
const HOVER_COLOR = '#b6835a';
const ProfileField = ({ label, value, name, isEditing, onChange, type = 'text' }) => (
    <Box sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
        {isEditing ? (
            <TextField
                fullWidth
                multiline={type === 'textarea'}
                rows={type === 'textarea' ? 2 : 1}
                name={name}
                value={value}
                onChange={onChange}
                size="small"
                required
                disabled={name === 'username'}
            />
        ) : (
            <Box sx={{ p: 1.5, bgcolor: '#fafafa', border: '1px solid #eee', borderRadius: 1 }}>
                <Typography sx={{ wordBreak: 'break-word', color: 'text.primary' }}>{value || 'N/A'}</Typography>
            </Box>
        )}
    </Box>
);

export default ProfileField;