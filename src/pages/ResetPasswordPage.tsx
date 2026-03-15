import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import { resetPassword, verifyResetToken } from "../services/authService";
import { ApiClientError } from "../utils/apiClient";

function ResetPasswordPage() {
    const navigate = useNavigate();
    const token = useMemo(
        () => new URLSearchParams(window.location.search).get("token") || "",
        [],
    );

    const [tempPassword, setTempPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isVerifyingToken, setIsVerifyingToken] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const verifyToken = async () => {
            if (!token) {
                if (!isMounted) {
                    return;
                }

                setIsTokenValid(false);
                setErrorMessage("Reset token is missing.");
                setIsVerifyingToken(false);
                return;
            }

            try {
                await verifyResetToken(token);
                if (!isMounted) {
                    return;
                }

                setIsTokenValid(true);
                setErrorMessage("");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                const message =
                    error instanceof ApiClientError
                        ? error.message
                        : "Reset token is invalid or expired.";

                setIsTokenValid(false);
                setErrorMessage(message);
            } finally {
                if (isMounted) {
                    setIsVerifyingToken(false);
                }
            }
        };

        verifyToken();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const validateForm = (): string => {
        if (!tempPassword.trim()) {
            return "Temporary Password is required.";
        }

        if (!newPassword.trim()) {
            return "New Password is required.";
        }

        if (newPassword.length < 8) {
            return "New password must be at least 8 characters long.";
        }

        if (!confirmPassword.trim()) {
            return "Confirm Password is required.";
        }

        if (confirmPassword !== newPassword) {
            return "Confirm password must match new password.";
        }

        return "";
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const validationMessage = validateForm();
        if (validationMessage) {
            setErrorMessage(validationMessage);
            return;
        }

        if (!token) {
            setErrorMessage("Reset token is missing.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await resetPassword(token, tempPassword, newPassword);
            setSuccessMessage(response.message || "Password changed successfully");
            setTempPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        } catch (error) {
            const message =
                error instanceof ApiClientError
                    ? error.message
                    : "Unable to reset password. Please try again.";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            component="main"
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 4,
                        border: "1px solid rgba(125, 211, 252, 0.25)",
                        backgroundColor: "rgba(15, 23, 42, 0.82)",
                        color: "#e2e8f0",
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Reset Password
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1, color: "#94a3b8" }}>
                        Enter your temporary password and choose a new password.
                    </Typography>

                    {isVerifyingToken ? (
                        <Box
                            sx={{
                                mt: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <CircularProgress size={20} />
                            <Typography variant="body2">Verifying reset token...</Typography>
                        </Box>
                    ) : null}

                    {!isVerifyingToken ? (
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ mt: 2, display: "grid", gap: 1.5 }}
                        >
                            <PasswordInput
                                label="Temporary Password"
                                fullWidth
                                value={tempPassword}
                                onChange={(event) => setTempPassword(event.target.value)}
                                disabled={!isTokenValid || isSubmitting}
                            />

                            <PasswordInput
                                label="New Password"
                                fullWidth
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                disabled={!isTokenValid || isSubmitting}
                            />

                            <PasswordInput
                                label="Confirm Password"
                                fullWidth
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                disabled={!isTokenValid || isSubmitting}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!isTokenValid || isSubmitting}
                                sx={{ justifySelf: "start", minWidth: 190 }}
                            >
                                {isSubmitting ? "Updating..." : "Reset Password"}
                            </Button>
                        </Box>
                    ) : null}

                    {errorMessage ? (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Alert>
                    ) : null}

                    {successMessage ? (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            {successMessage}
                        </Alert>
                    ) : null}
                </Paper>
            </Container>
        </Box>
    );
}

export default ResetPasswordPage;
