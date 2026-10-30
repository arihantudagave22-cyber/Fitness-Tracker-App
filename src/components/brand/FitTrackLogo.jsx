import { Dumbbell } from "lucide-react";
import "./FitTrackLogo.css";

export default function FitTrackLogo({ className = "" }) {
    return (
        <span className={`fittrack-logo ${className}`.trim()} aria-hidden="true">
            <span className="fittrack-logo__layer fittrack-logo__layer--back" />
            <span className="fittrack-logo__layer fittrack-logo__layer--middle" />
            <span className="fittrack-logo__face">
                <Dumbbell size={23} strokeWidth={2.5} />
            </span>
        </span>
    );
}
