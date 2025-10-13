
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
import ProfileField from './ProfileField';
const PRIMARY_COLOR = '#9e6a3c';
const HOVER_COLOR = '#b6835a';
const ProfileView = ({ user, apiFetch, setMessage, fetchUserProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        if (user) {
            setEditData({
                first_name: user.firstName || '',
                last_name: user.lastName || '',
                email: user.email || '',
                customer_profile: {
                    phone_number: user.profile?.phone_number || '',
                    street_address: user.profile?.street_address || '',
                }
            });
        }
    }, [user, isEditing]);

    if (!user) return <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress sx={{ color: PRIMARY_COLOR }} size={40} /><Typography>Loading Profile...</Typography></Box>;

    const profile = user.profile || {};
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('profile_')) {
            setEditData(prev => ({
                ...prev,
                customer_profile: {
                    ...prev.customer_profile,
                    [name.replace('profile_', '')]: value
                }
            }));
        } else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        setIsEditing(false);
        setIsLoading(true);

        try {
            const response = await apiFetch('/users/me/', {
                method: 'PATCH',
                body: JSON.stringify(editData)
            });

            if (response.ok) {
                setMessage('Profile updated successfully!');
                fetchUserProfile();
            } else {
                const errorData = await response.json();
                console.error("Update failed:", errorData);
                setMessage('Profile update failed. Check console for details.');
            }
        } catch (error) {
            setMessage('Network error during profile update.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Box
            component="form"
            onSubmit={handleSave}
            sx={{
                maxWidth: 600, mx: 'auto', bgcolor: 'white', p: 4, 
                borderRadius: 3, boxShadow: 6, border: `1px solid ${PRIMARY_COLOR}30`
            }}
        >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'extrabold', color: PRIMARY_COLOR, mb: 3, display: 'flex', alignItems: 'center' }}>
                <UserIcon sx={{ mr: 1 }} /> Your Profile
            </Typography>
            
            {isLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: `${PRIMARY_COLOR}10`, borderRadius: 1, mb: 2 }}>
                    <CircularProgress size={20} sx={{ color: PRIMARY_COLOR, mr: 1 }} />
                    <Typography color={PRIMARY_COLOR}>Saving changes...</Typography>
                </Box>
            )}
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><ProfileField label="First Name" value={isEditing ? editData.first_name : user.firstName} name="first_name" isEditing={isEditing} onChange={handleChange}/></Grid>
                <Grid item xs={12} sm={6}><ProfileField label="Last Name" value={isEditing ? editData.last_name : user.lastName} name="last_name" isEditing={isEditing} onChange={handleChange}/></Grid>
                <Grid item xs={12}><ProfileField label="Username" value={user.username} name="username" isEditing={false} /></Grid>
                <Grid item xs={12}><ProfileField label="Email" value={isEditing ? editData.email : user.email} name="email" isEditing={isEditing} onChange={handleChange} type="email" /></Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ color: 'text.secondary', pt: 3, borderTop: '1px solid #eee', mt: 3, mb: 2 }}>Contact Information</Typography>
            
            <Grid container spacing={2}>
                <Grid item xs={12}><ProfileField label="Phone Number" value={isEditing ? editData.customer_profile.phone_number : profile.phone_number} name="profile_phone_number" isEditing={isEditing} onChange={handleChange}/></Grid>
                <Grid item xs={12}><ProfileField label="Street Address" value={isEditing ? editData.customer_profile.street_address : profile.street_address} name="profile_street_address" isEditing={isEditing} onChange={handleChange} type="textarea"/></Grid>
            </Grid>

            <Box sx={{ pt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                {isEditing ? (
                    <>
                        <Button variant="outlined" onClick={() => { setIsEditing(false); setEditData({}); }} startIcon={<CancelIcon />}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} sx={{ bgcolor: 'green', '&:hover': { bgcolor: 'darkgreen' } }}>Save Changes</Button>
                    </>
                ) : (
                    <Button type="button" variant="contained" onClick={() => setIsEditing(true)} startIcon={<EditIcon />} sx={{ bgcolor: PRIMARY_COLOR, '&:hover': { bgcolor: HOVER_COLOR } }}>Edit Profile</Button>
                )}
            </Box>
        </Box>
    );
};
export default ProfileView;


