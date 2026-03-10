# Feedback Game Plan — March 8, 2026

Source: Judah + Katie field feedback (3/8/2026 evening)

## 1) What Is Already Built vs Missing

### Already Built (but not obvious enough)
1. Start-over logic exists.
- `resetForm()` fully clears most scope state and is called after submit.
- A confirmation flow already exists via `startNewForm()` (browser `confirm()`), but it is only exposed through the small `Saved Forms > New` button.

2. Web/PC refresh compatibility exists.
- App is browser-hosted and can be refreshed on desktop, but refresh behavior is not guided in UI.

3. Hood notes field exists.
- `hood_notes` textarea is already present in the Hood panel.

### Missing or Incomplete
1. Post-submit visual cleanup is incomplete.
- Blue "filled" highlights can persist because `.has-valid-value` classes are not explicitly cleared during reset.
- Photo upload status text can persist ("Photos uploaded successfully!") because progress UI is not reset/hidden in `resetForm()`.

2. Hood part row is missing in Hood R&I/R&R table.
- Code mappings already expect `hood_ri_hood` / `hood_rr_hood`, but no checkbox row is rendered.

3. Start-over affordance is not obvious in the main scoping flow.
- No clear "Start Over" button near submit area where users expect it.

4. Final panel order changes are pending user-confirmed order list.

## 2) Prioritized Execution Plan

## Phase A — Critical UX Clarity (ship first)
Goal: make reset/start-over behavior obvious and safe.

1. Add explicit "Start Over" action in submit zone.
- Add secondary button next to `Save PDF / Export CSV / Share`.
- Label: `Start Over` (not `New`) to match field language.
- Behavior: open confirmation dialog with clear warning (unsaved data will be cleared).

2. Unify reset entry points.
- Route all reset triggers through one function: `confirmStartOver()` -> `resetForm()`.
- Replace scattered direct calls where appropriate (except auto-reset after successful submit).

3. Improve desktop refresh confidence.
- Add helper text near Start Over: "On PC, browser refresh also clears current draft after confirmation."
- Optional: intercept `beforeunload` when unsaved edits exist to reduce accidental loss.

Acceptance criteria:
- Technician can find Start Over without opening Saved Forms.
- Confirmation appears every manual reset.
- Users understand web refresh behavior on PC.

## Phase B — Reset Polish (fix stale UI state)
Goal: after submit/reset, screen must look fully fresh.

1. Clear all validation + "filled" highlighting on reset.
- Call `clearValidationErrors()` inside `resetForm()`.
- Run `updateAllFieldBackgrounds()` after values are cleared.

2. Reset photo upload status block.
- Call `hidePhotoUploadProgress()` in reset.
- Reset progress width to `0%` and default status copy.

3. Verify post-submit visual baseline.
- No blue highlights on email/phone unless user has entered new values.
- No stale "Photos uploaded successfully" message after reset.

Acceptance criteria:
- New scope opens with neutral, un-highlighted input states.
- Photo section shows zero/idle state only.

## Phase C — Content Completeness
Goal: align parts checklist with expected hood workflow.

1. Add Hood row in Hood R&I/R&R table.
- New row with `hood_ri_hood` and `hood_rr_hood` checkboxes.
- Keep existing windshield/cowl rows unchanged.

2. Validate downstream mapping.
- Confirm Parts dashboard label and exported summaries already render "Hood" correctly (mapping already exists).

Acceptance criteria:
- Hood can be marked as R&I or R&R directly in UI.
- Data appears correctly in record detail and exports.

## Phase D — Panel Order Update (after Judah provides final order)
Goal: implement preferred scoping sequence without churn.

1. Wait for final panel order from Judah.
2. Move panel boxes and quick-nav/interactive jump order together.
3. Run a full pass to ensure order is consistent in:
- visual layout,
- jump links,
- any summary ordering shown to users.

Acceptance criteria:
- Panel traversal order matches approved list in all places.

## 3) QA Checklist (for sign-off)

1. Start scope, type customer/email/phone, add photos, click Start Over:
- confirmation appears,
- all fields clear,
- no blue highlights,
- photo upload status hidden,
- counts reset.

2. Submit a scope, then start next scope:
- same clean state as above,
- no stale success messaging in photo area.

3. Hood test:
- check Hood R&I and R&R,
- submit,
- verify values persist in Airtable/record detail.

4. PC browser test:
- manual refresh behavior is predictable,
- no confusing stale states after refresh.

## 4) Rollout Order

1. Phase A + B together (single UX patch release).
2. Phase C immediately after (small content patch).
3. Phase D only after approved order list arrives.

## 5) Notes From Feedback to Preserve

1. Keep current visual style direction.
- Katie feedback: current look is easier on the eyes.
- Apply functional clarity changes without major visual redesign.

2. Prioritize desktop clarity.
- Judah noted parts managers on PC; reset/refresh cues should be clear in web workflow.
