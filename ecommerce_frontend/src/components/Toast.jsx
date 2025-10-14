import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Reusable Toast component for displaying notifications.
 * @param {string} message - The message to display.
 * @param {('success'|'error'|'warning'|'info')} severity - The alert type.
 * @param {function} onClose - Function to call when the toast is closed.
 */
export const Toast = ({ message, severity, onClose }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (message) {
            setOpen(true);
        }
    }, [message]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        if (onClose) {
            onClose();
        }
    };

    if (!message) return null;

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};
