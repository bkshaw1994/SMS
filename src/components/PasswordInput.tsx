import React, { useState } from "react";
import {
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<TextFieldProps, "type">;

function PasswordInput(props: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TextField
            {...props}
            type={showPassword ? "text" : "password"}
            InputProps={{
                ...(props.InputProps || {}),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            type="button"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );
}

export default PasswordInput;
