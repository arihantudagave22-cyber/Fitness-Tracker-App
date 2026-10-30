import { useEffect, useState } from "react";
import { Shield, ShieldCheck, Users } from "lucide-react";
import FitnessVisual3D from "../../components/brand/FitnessVisual3D";
import { useAuth } from "../../context/AuthContext.js";
import { apiRequest } from "../../lib/api.js";
import "./AdminUsers.css";

const roleLabels = {
    user: "User",
    admin: "Admin",
    superadmin: "Superadmin",
};

export default function AdminUsers() {
    const { user, signIn } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingUserId, setPendingUserId] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const isSuperadmin = user?.role === "superadmin";

    useEffect(() => {
        let isCurrent = true;
        apiRequest("/admin/users")
            .then((result) => {
                if (isCurrent) setUsers(result.users);
            })
            .catch((requestError) => {
                if (isCurrent) setError(requestError.message);
            })
            .finally(() => {
                if (isCurrent) setIsLoading(false);
            });
        return () => {
            isCurrent = false;
        };
    }, []);

    const updateRole = async (target, role) => {
        if (!isSuperadmin || pendingUserId) return;
        setError("");
        setMessage("");
        setPendingUserId(target.id);
        try {
            const result = await apiRequest(
                `/admin/users/${encodeURIComponent(target.id)}/role`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ role }),
                },
            );
            setUsers((current) => current.map((account) =>
                account.id === result.user.id ? { ...account, role: result.user.role } : account
            ));
            if (result.user.id === user.id) {
                signIn(result.user);
            }
            setMessage(`Updated ${result.user.name}'s role to ${roleLabels[result.user.role]}.`);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setPendingUserId("");
        }
    };

    return (
        <section className="admin-users page">
            <header className="admin-users__header">
                <div>
                    <span className="admin-users__eyebrow">ACCESS CONTROL</span>
                    <h1>User roles</h1>
                    <p>Review accounts and manage administrative access.</p>
                </div>
                <FitnessVisual3D icon={ShieldCheck} variant="violet" />
            </header>

            <div className="admin-users__notice">
                <Shield size={18} />
                <p>
                    {isSuperadmin
                        ? "You are a superadmin. You can promote users to admin or superadmin."
                        : "You can review users. Only a superadmin can change account roles."}
                </p>
            </div>

            {error && <p className="app-error" role="alert">{error}</p>}
            {message && <p className="app-success" role="status">{message}</p>}

            <section className="admin-users__panel" aria-labelledby="admin-users-title">
                <div className="admin-users__panel-header">
                    <div className="admin-users__panel-icon"><Users size={19} /></div>
                    <div>
                        <h2 id="admin-users-title">Accounts</h2>
                        <p>{users.length} registered {users.length === 1 ? "account" : "accounts"}</p>
                    </div>
                </div>

                {isLoading ? (
                    <p className="app-loading" role="status">Loading accounts...</p>
                ) : users.length ? (
                    <div className="admin-users__list">
                        {users.map((account) => (
                            <article className="admin-user" key={account.id}>
                                <div className="admin-user__identity">
                                    <span className="admin-user__avatar">
                                        {account.name.slice(0, 1).toUpperCase()}
                                    </span>
                                    <div className="admin-user__details">
                                        <strong>{account.name}</strong>
                                        <span>{account.email}</span>
                                    </div>
                                </div>
                                <label className="admin-user__role">
                                    <span>Role</span>
                                    <select
                                        value={account.role}
                                        aria-label={`Role for ${account.name}`}
                                        disabled={!isSuperadmin || Boolean(pendingUserId)}
                                        onChange={(event) => updateRole(account, event.target.value)}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        {isSuperadmin && <option value="superadmin">Superadmin</option>}
                                    </select>
                                </label>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="admin-users__empty">No accounts have been registered yet.</p>
                )}
            </section>
        </section>
    );
}
