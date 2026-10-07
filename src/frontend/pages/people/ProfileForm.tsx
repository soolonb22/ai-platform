/**
 * ProfileForm.tsx
 * Getting to know the person. Saved on this device only.
 */

import { useState } from "react";
import { PROFILE_FIELDS, savePerson, type PersonProfile } from "../../../data/people";

export function ProfileForm({ person }: { person: PersonProfile }) {
  const [draft, setDraft] = useState<PersonProfile>(person);
  const [note, setNote] = useState("");

  function update(key: keyof PersonProfile, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setNote("");
  }

  function save() {
    savePerson(draft);
    setNote("Saved on this device.");
  }

  return (
    <section className="ai-box">
      <h2>About {draft.name || "this person"}</h2>
      <p className="hint">Fill in what you know. Skip anything you are unsure of. You can come back and add more.</p>
      <label className="field">
        <span className="field-label">Name</span>
        <input className="text-line" value={draft.name} onChange={(event) => update("name", event.target.value)} />
        <span className="hint">Stays on this device. It is replaced with [name] before anything is previewed or sent.</span>
      </label>
      <label className="field">
        <span className="field-label">Other names or nicknames</span>
        <input
          className="text-line"
          value={draft.otherNames}
          placeholder="Separate with commas"
          onChange={(event) => update("otherNames", event.target.value)}
        />
      </label>
      {PROFILE_FIELDS.map((field) => (
        <label key={field.key} className="field">
          <span className="field-label">{field.label}</span>
          <textarea
            className="text-input short"
            value={draft[field.key]}
            placeholder={field.hint}
            onChange={(event) => update(field.key, event.target.value)}
          />
        </label>
      ))}
      <div className="row">
        <button type="button" className="primary" onClick={save}>
          Save profile
        </button>
        {note ? <span className="hint">{note}</span> : null}
      </div>
    </section>
  );
}
