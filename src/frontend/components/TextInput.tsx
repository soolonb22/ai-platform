/**
 * TextInput.tsx
 * Controlled field. The caption prop is not named label: React 19
 * would otherwise treat the <label> element as a child.
 */

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  caption?: string;
  placeholder?: string;
}

export function TextInput({ value, onChange, caption = "Text", placeholder = "" }: TextInputProps) {
  return (
    <div className="field">
      <span className="field-label">{caption}</span>
      <textarea
        className="text-input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
