/**
 * People.tsx
 * Get to know a person once, track their patterns over time, and build documents from both.
 * Profiles, history, and documents stay on this device. Names are never sent.
 */

import { useState } from "react";
import { createPerson, deletePerson, getActivePersonId, listPeople, setActivePerson } from "../../../data/people";
import { useStoreVersion } from "../../state/useStore";
import { DocumentBuilder } from "./DocumentBuilder";
import { PatternHistory } from "./PatternHistory";
import { ProfileForm } from "./ProfileForm";

export function People() {
  useStoreVersion();
  const people = listPeople();
  const [selectedId, setSelectedId] = useState<string | null>(getActivePersonId() ?? people[0]?.id ?? null);
  const selected = people.find((person) => person.id === selectedId) ?? null;

  function select(id: string) {
    setSelectedId(id);
    setActivePerson(id);
  }

  function add() {
    const person = createPerson();
    select(person.id);
  }

  function remove() {
    if (!selected) return;
    const label = selected.name || "this person";
    if (!window.confirm(`Delete ${label}, their pattern history, and their documents from this device? This cannot be undone.`)) return;
    deletePerson(selected.id);
    setSelectedId(null);
  }

  return (
    <section className="page">
      <h1>People</h1>
      <p className="hint">
        Get to know the person once. Link tool runs to them to track patterns over time, then build full documents from
        both. Everything here is saved on this device only, and names are never sent.
      </p>
      <div className="row wrap">
        {people.map((person) => (
          <button
            key={person.id}
            type="button"
            className={person.id === selectedId ? "person-chip active" : "person-chip"}
            onClick={() => select(person.id)}
          >
            {person.name || "Unnamed person"}
          </button>
        ))}
        <button type="button" className="primary" onClick={add}>
          Add a person
        </button>
      </div>
      {selected ? (
        <>
          <ProfileForm key={selected.id} person={selected} />
          <PatternHistory personId={selected.id} />
          <DocumentBuilder person={selected} />
          <div className="row">
            <button type="button" className="ghost" onClick={remove}>
              Delete this person
            </button>
          </div>
        </>
      ) : (
        <p className="hint">Add a person to start.</p>
      )}
    </section>
  );
}
