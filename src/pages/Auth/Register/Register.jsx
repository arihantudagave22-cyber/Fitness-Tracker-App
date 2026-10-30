import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    User,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../../components/common/Button/Button";
import FitTrackLogo from "../../../components/brand/FitTrackLogo";
import { apiRequest, saveAuthToken } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext.js";

import "./Register.css";

const Register = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormError("");

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setFormError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setFormError("");

        try {
            const result = await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
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
        <main className="register-page">
            <div className="register-page__background" />

            <div className="register-container">

                {/* BRAND */}

                <Link
                    to="/login"
                    className="register-brand"
                >
                    <FitTrackLogo />

                    <div>
                        <h1>FitTrack</h1>
                        <span>Fitness Tracker</span>
                    </div>
                </Link>

                {/* REGISTER CARD */}

                <section className="register-card">

                    <div className="register-card__header">
                        <span className="register-card__eyebrow">
                            GET STARTED
                        </span>

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Start building better habits and
                            tracking your fitness journey.
                        </p>
                    </div>

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        {formError && (
                            <p className="register-form__error" role="alert">
                                {formError}
                            </p>
                        )}

                        {/* NAME */}

                        <div className="register-field">
                            <label htmlFor="name">
                                Full name
                            </label>

                            <div className="register-input">
                                <User size={18} />

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        {/* EMAIL */}

                        <div className="register-field">
                            <label htmlFor="register-email">
                                Email address
                            </label>

                            <div className="register-input">
                                <Mail size={18} />

                                <input
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}

                        <div className="register-field">
                            <label htmlFor="register-password">
                                Password
                            </label>

                            <div className="register-input">
                                <LockKeyhole size={18} />

                                <input
                                    id="register-password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
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

                            <span className="register-field__hint">
                                Use at least 8 characters.
                            </span>
                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div className="register-field">
                            <label htmlFor="confirm-password">
                                Confirm password
                            </label>

                            <div className="register-input">
                                <LockKeyhole size={18} />

                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
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
                            Create Account
                        </Button>
                    </form>

                    <div className="register-divider">
                        <span>Already have an account?</span>
                    </div>

                    <Link
                        to="/login"
                        className="register-login"
                    >
                        Sign in to FitTrack
                        <ArrowRight size={16} />
                    </Link>
                </section>

                <p className="register-footer">
                    © 2026 FitTrack. Your journey, your progress.
                </p>
            </div>
        </main>
    );
};

export default Register;