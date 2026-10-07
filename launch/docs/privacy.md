# Privacy

The fence has two redaction passes and a preview.

1. `redactLocal` runs on the device. It replaces names, emails, phones, dates, addresses, and labeled identifiers with placeholders such as `[name]`, `[email]`, and `[school]`.
2. `previewPayload` holds the original and the redacted text. `approved` starts false. `runFence` in `src/privacy/fence.ts` refuses to continue unless the caller passes `approved: true`. There is no default.
3. `workerRedactor` runs a second pass for leftover identifiers, clinical terms, and prohibited content. Engines see this text only.

The preview modal can show both texts. Approve and cancel are callbacks. The original is not rendered in the tool result panels.

Official NDIS terms such as "Improved Daily Living" and "Support Coordination" are shielded before the rules run, so plan language survives. Capitalised runs made only of everyday words, such as "Mental Health" or "Student Support Officer", are left alone.

Known gaps: a name with no title, label, verb, or action word near it can still pass. A capitalised common word before an action word, such as "Sleep was poor", can be over-redacted. The preview shows both. Do not treat the fence as complete.
