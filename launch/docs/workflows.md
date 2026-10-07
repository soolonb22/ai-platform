# Workflows

Each workflow redacts, builds a preview, then runs engines on the worker text only. Approval is simulated in this build.

## Trauma

`runTraumaWorkflow` detects pattern cues, maps them to needs, drafts interventions, builds a regulation plan, and writes a plain explanation. Cues only. Not a diagnosis.

## NDIS

`runNDISWorkflow` extracts funding category cues, explains those rules in plain language, drafts goals, builds an evidence pack, and drafts a service agreement. No hours, price, or funding result.

## School

`runSchoolWorkflow` maps the note to a need, then builds a support plan, a regulation menu, executive-function strategies, and a staff note. The plan uses the first need. It is not a behaviour rating.

## Provider

`runProviderWorkflow` rewrites the progress note, drafts goals from behaviour cues, and links them into an evidence pack. Planning notes only. Not evidence the NDIA must accept.
