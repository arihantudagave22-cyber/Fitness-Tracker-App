import { useEffect, useMemo, useState } from "react";
import { Accessibility, Plus, Ruler, Scale } from "lucide-react";
import FitnessVisual3D from "../../components/brand/FitnessVisual3D";
import { apiRequest } from "../../lib/api.js";
import "./Measurements.css";

const initialForm = { metric: "Weight", value: "", unit: "kg" };

export default function Measurements() {
    const [measurements, setMeasurements] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let isCurrent = true;
        apiRequest("/measurements")
            .then((result) => {
                if (isCurrent) setMeasurements(result.measurements);
            })
            .catch((requestError) => {
                if (isCurrent) setError(requestError.message);
            })
            .finally(() => {
                if (isCurrent) setIsLoading(false);
            });
        return () => { isCurrent = false; };
    }, []);

    const latestByMetric = useMemo(() => {
        const latest = new Map();
        for (const measurement of measurements) {
            if (!latest.has(measurement.metric)) latest.set(measurement.metric, measurement);
        }
        return [...latest.values()];
    }, [measurements]);

    const addMeasurement = async (event) => {
        event.preventDefault();
        setError("");
        setIsSaving(true);
        try {
            const result = await apiRequest("/measurements", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    value: Number(form.value),
                    recordedAt: new Date().toISOString(),
                }),
            });
            setMeasurements((current) => [result.measurement, ...current]);
            setForm(initialForm);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="measurements page">
            <header className="measurements__header">
                <div>
                    <span className="measurements__eyebrow">YOUR BODY DATA</span>
                    <h1>Measurements</h1>
                    <p>Record measurements and follow your changes over time.</p>
                </div>
                <FitnessVisual3D icon={Ruler} variant="cyan" />
            </header>

            {error && <p className="app-error" role="alert">{error}</p>}

            <form className="measurement-form" onSubmit={addMeasurement}>
                <h2><Plus size={18} /> Add a measurement</h2>
                <label>
                    Measurement
                    <input
                        name="metric"
                        value={form.metric}
                        onChange={(event) => setForm((current) => ({ ...current, metric: event.target.value }))}
                        maxLength={80}
                        required
                    />
                </label>
                <label>
                    Value
                    <input
                        name="value"
                        type="number"
                        min="0.01"
                        max="100000"
                        step="any"
                        value={form.value}
                        onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                        required
                    />
                </label>
                <label>
                    Unit
                    <select
                        name="unit"
                        value={form.unit}
                        onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                    >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                        <option value="%">%</option>
                    </select>
                </label>
                <button type="submit" disabled={isSaving}>
                    <Plus size={17} /> {isSaving ? "Saving..." : "Save"}
                </button>
            </form>

            {isLoading ? (
                <p className="app-loading" role="status">Loading measurements...</p>
            ) : latestByMetric.length ? (
                <section className="measurements__grid" aria-label="Latest measurements">
                    {latestByMetric.map((measurement, index) => {
                        const Icon = index % 2 === 0 ? Scale : Ruler;
                        return (
                            <article className="measurement-card" key={measurement.id}>
                                <span className="measurement-card__icon"><Icon size={20} /></span>
                                <span className="measurement-card__label">{measurement.metric}</span>
                                <strong>{Number(measurement.value).toLocaleString()} <small>{measurement.unit}</small></strong>
                                <time dateTime={measurement.recordedAt}>
                                    {new Date(measurement.recordedAt).toLocaleDateString()}
                                </time>
                            </article>
                        );
                    })}
                </section>
            ) : (
                <div className="measurements__empty">
                    <Accessibility size={24} />
                    <h2>No measurements yet</h2>
                    <p>Add your first entry above to begin tracking.</p>
                </div>
            )}

            {!!measurements.length && (
                <section className="measurement-history">
                    <h2>Measurement history</h2>
                    <div className="measurement-history__list">
                        {measurements.map((measurement) => (
                            <article key={measurement.id}>
                                <strong>{measurement.metric}</strong>
                                <span>{Number(measurement.value).toLocaleString()} {measurement.unit}</span>
                                <time dateTime={measurement.recordedAt}>
                                    {new Date(measurement.recordedAt).toLocaleString()}
                                </time>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </section>
    );
}
