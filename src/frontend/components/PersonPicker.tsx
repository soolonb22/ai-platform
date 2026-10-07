/**
 * PersonPicker.tsx
 * "Who is this about?" on each tool. The chosen person is remembered on this device.
 * Their name is swapped for [name] before the preview, and the result joins their pattern history.
 */

import { getActivePersonId, listPeople, setActivePerson } from "../../data/people";
import { useStoreVersion } from "../state/useStore";

export function PersonPicker() {
  useStoreVersion();
  const people = listPeople();
  const active = getActivePersonId();

  if (!people.length) {
    return <p className="hint">Tip: add a person under People, and each run can build up their pattern history.</p>;
  }

  return (
    <label className="field">
      <span className="field-label">Who is this about?</span>
      <select className="select" value={active ?? ""} onChange={(event) => setActivePerson(event.target.value || null)}>
        <option value="">No one (not tracked)</option>
        {people.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name || "Unnamed person"}
          </option>
        ))}
      </select>
      <span className="hint">
        Their name is hidden before the preview. The result is added to their pattern history on this device.
      </span>
    </label>
  );
}
