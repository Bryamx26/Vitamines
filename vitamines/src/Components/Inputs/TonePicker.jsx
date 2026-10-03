import { TONES } from "../Vitamines/vitamineMeta.js";
import { CheckIcon } from "../Icons.jsx";

// Choix de la couleur d'une vitamine parmi les accents du design system
function TonePicker({ value, onChange, name = "tone" }) {
    return (
        <fieldset className="vt-tones">
            <legend>Couleur</legend>
            <div className="vt-tones-list">
                {TONES.map((t) => (
                    <label key={t.value} className={`vt-tone tone-${t.value}`}>
                        <input
                            type="radio"
                            name={name}
                            value={t.value}
                            checked={value === t.value}
                            onChange={() => onChange(t.value)}
                        />
                        <span className="vt-tone-swatch" aria-hidden="true">
                            {value === t.value && <CheckIcon size={18} />}
                        </span>
                        <span className="vt-tone-label">{t.label}</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

export default TonePicker;
