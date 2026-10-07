# Privacy

The fence has two redaction passes and a preview.

1. `redactLocal` runs on the device. It replaces names, emails, phones, dates, addresses, and labeled identifiers with placeholders such as `[name]`, `[email]`, and `[school]`.
2. `previewPayload` holds the original and the redacted text. `approved` starts false. The workflows currently simulate approval so a local run can finish.
3. `workerRedactor` runs a second pass for leftover identifiers, clinical terms, and prohibited content. Engines see this text only.

The preview modal can show both texts. Approve and cancel are callbacks. The original is not rendered in the tool result panels.

Known gaps: a bare name can pass, and a word such as "Participant" can be over-redacted. Do not treat the fence as complete.
