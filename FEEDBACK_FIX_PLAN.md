# Feedback Fix Plan — February 18, 2026

All issues sourced from Judah Howe's field testing session. Ordered by priority (bugs first, content second, enhancements third).

---

## 🔴 PRIORITY 1 — Form Reset Bugs (Critical UX Blockers)

These all share the same root cause: `resetForm()` calls `document.getElementById('scopeForm').reset()`, which only resets native `<input>` and `<select>` values. It does **not** clean up:
- Dynamic CSS classes added by JavaScript (`.is-complete`, `.has-upd`, `.active`, `.visible`, `.selected`, `.disabled`)
- `<div>`-based stepper display values (`_dc_display`, `_os_display`)
- Auto-save draft data in `localStorage` that gets re-applied immediately after reset

**The Fix** is a single hardened `resetForm()` function that handles all of these.

---

### Bug 1 — Done Logos Don't Reset After Submit

**What happens:** Each panel has a "Done" checkbox injected by `initPanelToggles()`. When checked, it adds `is-complete` to the `.panel-box`. `form.reset()` unchecks the hidden checkbox (since it's a real input), but the `.is-complete` CSS class is never removed.

**Fix:**
```js
// In resetForm(), after form.reset():
document.querySelectorAll('.panel-box.is-complete').forEach(box => {
    box.classList.remove('is-complete');
});
```

---

### Bug 2 — Dent Counts Don't Reset After New Scope

**What happens:** DC and OS values are displayed in `<div class="stepper-value" id="lr_quarter_dc_display">`. These are not form inputs — `form.reset()` ignores them entirely. The underlying hidden inputs reset to `""` but the visible numbers stay.

**Fix:**
```js
// In resetForm(), reset all stepper displays:
document.querySelectorAll('.stepper-value').forEach(el => {
    el.textContent = '0';
    el.classList.add('placeholder'); // restore muted styling
});
document.querySelectorAll('.stepper-input').forEach(el => {
    el.value = '';
});
// Also reset OS hidden inputs to 0:
document.querySelectorAll('[name$="_os"]').forEach(el => {
    el.value = '0';
});
```

---

### Bug 3 — Dent Sizes (Coin Size) Don't Reset

**What happens:** Coin size is stored in a `<input type="hidden">` (which `form.reset()` does reset to `"quarter"` default), but the **visual `.selected` class** on the button is not updated. The coin selector also has a `.disabled` wrapper class that should be restored when DC goes back to 0.

**Fix:**
```js
// In resetForm():
document.querySelectorAll('.coin-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.size === 'quarter');
});
document.querySelectorAll('.coin-selector').forEach(el => {
    el.classList.add('disabled');
});
```

---

### Bug 4 — Orange UPD Outlines Don't Reset

**What happens:** When UPD is toggled on, `initPanelToggles()` adds `has-upd` to `.panel-box`, `active` to `.upd-toggle`, and `visible` to `.upd-notes`. `form.reset()` unchecks the UPD checkbox but never removes these classes.

**Fix:**
```js
// In resetForm():
document.querySelectorAll('.panel-box.has-upd').forEach(box => {
    box.classList.remove('has-upd');
});
document.querySelectorAll('.upd-toggle.active').forEach(el => {
    el.classList.remove('active');
});
document.querySelectorAll('.upd-notes.visible').forEach(el => {
    el.classList.remove('visible');
});
```

---

### Bug 5 — RO Number Stays the Same After New Scope

**What happens:** `form.reset()` clears the `<input id="roNumber">` value correctly — but `initAutoSave()` restores the last saved draft from `localStorage` almost immediately (on the DOMContentLoaded handler and on `restoreDraft()`). The reset fires, then the draft restore overwrites it.

**Fix:** `resetForm()` must also clear the relevant `localStorage` draft key (or clear the specific fields) AFTER resetting, so the auto-restore doesn't re-populate RO/Estimator.

```js
// In resetForm():
localStorage.removeItem('pdr_draft'); // or whatever key auto-save uses
// Then also explicitly blank the fields:
document.getElementById('roNumber').value = '';
```
> **Note:** Estimator is the same bug — the select is reset by `form.reset()` but the draft restore re-populates it. Same `localStorage` clear fixes both.

---

### Bug 6 — Estimator Stays the Same

Same root cause as Bug 5. The `localStorage` draft restore fires after `form.reset()`. Fix is included in the `resetForm()` rewrite above — clearing the draft from storage prevents the auto-restore from re-populating the estimator dropdown.

---

## 🟡 PRIORITY 2 — Content Additions (Missing Items)

### Content 1 — Add "Bed Cap" R&I / R&R to Left Quarter/Bed

**Where:** `index.html` — Left Quarter panel checklist table (around line 4200), Right Quarter panel checklist table (around line 4915).

**Add this row to both `lr_quarter` and `rr_quarter` tables:**
```html
<tr>
    <td><input type="checkbox" name="lr_quarter_ri_bedcap"></td>
    <td>Bed Cap</td>
    <td><input type="checkbox" name="lr_quarter_rr_bedcap"></td>
</tr>
```
*(Swap `lr_` for `rr_` on the right side.)*

Also add `'bedcap': 'Bed Cap'` to the `PART_DISPLAY_NAMES` mapping (line ~11748) so it reads correctly in the Parts Tech dashboard and CSV exports.

---

### Content 2 — Add "Tonneau Cover" R&I / R&R to Deck/Lid/Gate

**Where:** `index.html` — Deck/Lid/Gate panel checklist table (around line 4620).

**Add this row:**
```html
<tr>
    <td><input type="checkbox" name="deck_ri_tonneau"></td>
    <td>Tonneau Cover</td>
    <td><input type="checkbox" name="deck_rr_tonneau"></td>
</tr>
```

Also add `'tonneau': 'Tonneau Cover'` to `PART_DISPLAY_NAMES`.

---

## 🟢 PRIORITY 3 — UX Improvements

### UX 1 — "What Do I Do After Submit?" — Improve the Success Modal

**Current:** The success modal shows `✓ Scope Saved to Airtable!` with a single "New Scope" button.

**Problem:** The user has no clear next-action path. They don't know they can export, view the record, or share the PDF.

**Fix:** Redesign the success modal to present 3 clear CTAs:

```
✓  Scope Saved!

RO #[RONUMBER] — [YEAR MAKE MODEL]

[📄 Export PDF]     [📋 View Record]

[+ New Scope]
```

- **Export PDF** → calls existing `exportPDF()` function
- **View Record** → switches to Records mode and filters by submitted RO number
- **New Scope** → existing `resetForm()` (now fixed to fully reset)

Also display the RO number and vehicle in the modal's "Scope Saved!" confirmation so the user has clear confirmation it was the right vehicle.

---

### UX 2 — Photo Icon on Every Panel (Optional but Helpful)

**Request:** Add a small  📷 camera icon to each panel header that opens the camera pre-tagged to that panel.

**Implementation approach (lightweight):**
1. In `initPanelToggles()`, after adding the "Done" toggle to the header, also append a small photo button:
   ```html
   <button class="panel-photo-btn" onclick="openPanelCamera('lr_quarter')" title="Add photo for this panel">📷</button>
   ```
2. `openPanelCamera(panelId)` sets a `currentPhotoPanel` variable and triggers `document.getElementById('cameraInput').click()`.
3. When the photo is captured via `handlePhotoSelect`, tag it with `currentPhotoPanel` so exported data associates the photo with the right panel.
4. Style: 18px, ghost/transparent button, floats right in the panel header (same row as "Done" checkbox).

---

## Implementation Order

| # | Task | Files | Effort |
|---|------|-------|--------|
| 1 | Harden `resetForm()` — fix all 5 visual reset bugs | `index.html` ~L11707 | Small |
| 2 | Add Bed Cap rows to L/R Quarter checklists + `PART_DISPLAY_NAMES` | `index.html` ~L4200, ~L4915, ~L11748 | Small |
| 3 | Add Tonneau Cover row to Deck/Lid/Gate + `PART_DISPLAY_NAMES` | `index.html` ~L4620, ~L11748 | Small |
| 4 | Improve success modal with 3 CTAs + RO/vehicle confirmation | `index.html` ~L5525 | Small |
| 5 | Panel photo icon | `index.html` `initPanelToggles()` ~L8421 | Medium |

All changes are confined to `index.html`. No backend, service worker, or config changes required.
