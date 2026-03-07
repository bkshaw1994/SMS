import React, { useState } from 'react';
import { Alert, Box, CircularProgress, IconButton, TextField } from '@mui/material';
import { SendHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useValidateCodeMutation } from '../services/schoolApi';

function SchoolCodeForm() {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');
    const [apiError, setApiError] = useState('');
    const [validateCode, { isLoading, reset }] = useValidateCodeMutation();

    const validateInput = (value: string): string => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            return 'Enter school Code is required field.';
        }

        if (!/^[A-Z0-9]+$/.test(trimmedValue)) {
            return 'School code must contain only uppercase letters and numbers.';
        }

        if (trimmedValue.length < 3) {
            return 'School code must be at least 3 characters long.';
        }

        return '';
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const normalizedValue = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setInputValue(normalizedValue);

        if (error) {
            setError(validateInput(normalizedValue));
        }

        if (apiError) {
            setApiError('');
            reset();
        }
    };

    const handleApiCall = async () => {
        const validationError = validateInput(inputValue);

        if (validationError) {
            setError(validationError);
            setApiError('');
            return;
        }

        setError('');
        setApiError('');

        try {
            await validateCode({ schoolCode: inputValue }).unwrap();
            navigate(`/school/${inputValue}`);
        } catch (requestError: any) {
            if (requestError?.status === 304) {
                setApiError('');
                return;
            }

            setApiError(requestError?.data?.message || 'Unable to connect to API server.');
        }
    };

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: { xs: 'stretch', sm: 'flex-start' },
                    flexDirection: { xs: 'column', sm: 'row' },
                }}
            >
                <TextField
                    id="schoolCode"
                    label="Enter School Code"
                    fullWidth
                    value={inputValue}
                    onChange={handleInputChange}
                    variant="outlined"
                    required
                    inputProps={{
                        style: { textTransform: 'uppercase' },
                        pattern: '[A-Za-z0-9]*',
                        inputMode: 'text',
                    }}
                    sx={{
                        flex: 1,
                        '& .MuiInputLabel-root': { color: '#cbd5e1' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                        '& .MuiInputLabel-asterisk': { color: '#ef4444' },
                        '& .MuiInputBase-input': { color: '#f8fafc' },
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(2, 6, 23, 0.65)',
                            '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
                            '&:hover fieldset': { borderColor: 'rgba(125, 211, 252, 0.6)' },
                            '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                        },
                    }}
                />

                <IconButton
                    type="button"
                    onClick={handleApiCall}
                    disabled={isLoading}
                    aria-label="Call API"
                    sx={{
                        width: { xs: '100%', sm: 56 },
                        height: { xs: 46, sm: 56 },
                        backgroundColor: 'transparent',
                        color: '#67e8f9',
                        border: 'none',
                        boxShadow: 'none',
                        borderRadius: 1.5,
                        transition: 'transform 220ms ease, background-color 220ms ease, box-shadow 220ms ease',
                        '&:hover': {
                            backgroundColor: 'rgba(103, 232, 249, 0.12)',
                            transform: 'translateX(4px) scale(1.05)',
                            boxShadow: '0 0 18px rgba(103, 232, 249, 0.35)',
                        },
                        '&.Mui-disabled': {
                            color: 'rgba(103, 232, 249, 0.5)',
                        },
                    }}
                >
                    {isLoading ? <CircularProgress size={22} sx={{ color: '#67e8f9' }} /> : <SendHorizontal size={18} aria-hidden="true" />}
                </IconButton>
            </Box>

            {error ? (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                </Alert>
            ) : null}

            {!error && apiError ? (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {apiError}
                </Alert>
            ) : null}
        </Box>
    );
}

export default SchoolCodeForm;
