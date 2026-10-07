# Privacy

The fence has two redaction passes and a preview.

1. `redactLocal` runs on the device. It replaces names, emails, phones, dates, addresses, and labeled identifiers with placeholders such as `[name]`, `[email]`, and `[school]`.
2. `previewPayload` holds the original and the redacted text. `approved` starts false. `runFence` in `src/privacy/fence.ts` refuses to continue unless the caller passes `approved: true`. There is no default.
3. `workerRedactor` runs a second pass for leftover identifiers, clinical terms, and prohibited content. Engines see this text only.

The preview modal can show both texts. Approve and cancel are callbacks. The original is not rendered in the tool result panels.

Official NDIS terms such as "Improved Daily Living" and "Support Coordination" are shielded before the rules run, so plan language survives. Capitalised runs made only of everyday words, such as "Mental Health" or "Student Support Officer", are left alone.

## AI drafting

AI drafting is optional and is not part of the Free plan. Before anything is sent, the panel shows exactly the worker-redacted text and the short findings that will leave the device, with two choices: Send to AI, or Keep it on this device. The original note is never sent.

The server at `/api/ai` refuses requests from other sites, runs the worker redaction pass again, and never logs the text. The draft is written by Claude, an AI model by Anthropic.

## People, patterns, and documents

Profiles, pattern history, and documents are saved in this browser only. A person's name and nicknames never leave the device: they are swapped for [name] before the tool preview, in the pattern history, and in every document request. A document request contains the redacted profile fields, pattern counts without dates, and recent redacted notes. It is shown in full before anything is sent, and the server redacts every field again. Deleting a person deletes their history and documents too.

A behaviour support plan from this app is a draft for discussion. It never suggests restrictive practices, and any plan that involves one must come from a registered NDIS behaviour support practitioner.

## Saved drafts

Drafts live in this browser's local storage. They keep the redacted text, the results, and any AI draft. The original note is removed before saving. Delete drafts one at a time on the Drafts page, or all at once in Settings.

## Known gaps

Known gaps: a name with no title, label, verb, or action word near it can still pass. A capitalised common word before an action word, such as "Sleep was poor", can be over-redacted. The preview shows both. Do not treat the fence as complete.
