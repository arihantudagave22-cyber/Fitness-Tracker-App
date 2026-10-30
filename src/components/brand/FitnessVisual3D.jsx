import "./FitnessVisual3D.css";

export default function FitnessVisual3D({ icon: Icon, variant = "violet", className = "" }) {
    return (
        <span className={`fitness-visual3d fitness-visual3d--${variant} ${className}`.trim()} aria-hidden="true">
            <span className="fitness-visual3d__orbit" />
            <span className="fitness-visual3d__base" />
            <span className="fitness-visual3d__object">
                <Icon size={34} strokeWidth={1.8} />
            </span>
            <span className="fitness-visual3d__spark fitness-visual3d__spark--one" />
            <span className="fitness-visual3d__spark fitness-visual3d__spark--two" />
        </span>
    );
}
