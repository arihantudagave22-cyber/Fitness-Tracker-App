import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../../components/common/Button/Button";
import FitTrackLogo from "../../../components/brand/FitTrackLogo";
import { apiRequest, saveAuthToken } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext.js";

import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
        setFormError("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email
            )
        ) {
            newErrors.email =
                "Enter a valid email address.";
        }

        if (!formData.password) {
            newErrors.password =
                "Password is required.";
        } else if (formData.password.length < 8) {
            newErrors.password =
                "Password must be at least 8 characters.";
        }

        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setFormError("");

        try {
            const result = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify(formData),
            });
            saveAuthToken(result.token);
            signIn(result.user);
            navigate("/");
        } catch (error) {
            setFormError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-page__background" />

            <div className="login-container">

                <div className="login-brand">
                    <FitTrackLogo />

                    <div>
                        <h1>FitTrack</h1>
                        <span>Fitness Tracker</span>
                    </div>
                </div>

                <section className="login-card">

                    <div className="login-card__header">
                        <span className="login-card__eyebrow">
                            WELCOME BACK
                        </span>

                        <h2>
                            Sign in to your account
                        </h2>

                        <p>
                            Continue your fitness journey
                            and stay consistent with your goals.
                        </p>
                    </div>

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >

                        {formError && (
                            <p className="login-form__error" role="alert">
                                {formError}
                            </p>
                        )}

                        {/* EMAIL */}

                        <div className="login-field">
                            <label htmlFor="email">
                                Email address
                            </label>

                            <div
                                className={`login-input ${
                                    errors.email
                                        ? "login-input--error"
                                        : ""
                                }`}
                            >
                                <Mail size={18} />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@gmail.com"
                                    autoComplete="email"
                                />
                            </div>

                            {errors.email && (
                                <span className="login-error">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        {/* PASSWORD */}

                        <div className="login-field">
                            <div className="login-field__label">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="login-forgot"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div
                                className={`login-input ${
                                    errors.password
                                        ? "login-input--error"
                                        : ""
                                }`}
                            >
                                <LockKeyhole size={18} />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <span className="login-error">
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        {/* SUBMIT */}

                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            loading={isLoading}
                            icon={<ArrowRight size={18} />}
                            iconPosition="right"
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="login-divider">
                        <span>New to FitTrack?</span>
                    </div>

                    <Link
                        to="/register"
                        className="login-register"
                    >
                        Create your account
                        <ArrowRight size={16} />
                    </Link>

                </section>

                <p className="login-footer">
                    © 2026 FitTrack. Your journey, your progress.
                </p>

            </div>
        </main>
    );
};

export default Login;