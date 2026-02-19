# Feedback Plan V2 — Judah Video, February 18, 2026

Cross-referenced against what's already built so nothing is duplicated.

---

## ✅ Already Done (from earlier today — skip these)
- Bed Cap R&I / R&R on Left + Right Quarter/Bed
- Tonneau Cover R&I / R&R on Deck/Lid/Gate
- 📷 camera icon on every panel header
- Done logos clear on New Scope
- Dent counts clear on New Scope
- Coin sizes clear on New Scope
- Orange UPD outlines clear on New Scope
- RO number clears on New Scope
- Success modal redesigned with 3 buttons (Export PDF, View Record, New Scope)

---

## 🆕 NEW ITEMS FROM THIS VIDEO

---

### Item 1 — Auto-Generate RO Number

**Judah's quote:** *"auto-generated RO number would be a thing instead of manually entering these... I can already tell that would solve like 50 million things."*

**What to build:**
- On "New Scope" (and on first load), auto-populate the RO field with a formatted number in the pattern: `DE-YYMMDD-NNN` where NNN increments per day
  - Example: `DE-260218-001`, `DE-260218-002`, `DE-260218-003` ...
- The daily counter is stored in `localStorage` under key `ro_counter_YYMMDD`
- The counter resets to `001` each new calendar day automatically
- The field stays EDITABLE — if someone wants to override with their own RO, they can type over it
- When "New Scope" is hit, the next auto-generated number is placed in the field immediately

**Implementation:**
```js
function generateNextRO() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateKey = `ro_counter_${yy}${mm}${dd}`;
    const todayCount = parseInt(localStorage.getItem(dateKey) || '0') + 1;
    localStorage.setItem(dateKey, todayCount);
    return `DE-${yy}${mm}${dd}-${String(todayCount).padStart(3, '0')}`;
}
```
Call this in `resetForm()` immediately after clearing the field.

**Files:** `index.html` — `resetForm()` function + `initAutoSave()` for initial page load

---

### Item 2 — Estimator Stays Per Device (Sticky, Not Reset)

**Judah's quote:** *"Estimator is still the same. That's actually probably okay. Depending. I don't know. I'm gonna have four people using this app simultaneously. So that's something to take into consideration."*

**What this means:** 4 people use the app on 4 different devices. Each device should remember who that estimator is. Resetting estimator on "New Scope" is wrong for this use case — each device IS one person.

**What to change:**
- Remove `estimator` from the fields that get cleared in `resetForm()` (it's currently reset to index 0)
- Save estimator name to `localStorage` under key `device_estimator` whenever it changes
- On page load, restore estimator from `device_estimator` if present
- The estimator dropdown is still fully editable — just persists on that device

**Implementation:**
In `initAutoSave()` or `loadDropdowns()`, add:
```js
// Restore sticky estimator
const stickyEst = localStorage.getItem('device_estimator');
if (stickyEst) document.getElementById('estimator').value = stickyEst;

// Save on change
document.getElementById('estimator').addEventListener('change', function() {
    localStorage.setItem('device_estimator', this.value);
});
```
In `resetForm()`, remove `'estimator'` from the list of selects being reset.

**Files:** `index.html` — `resetForm()` + `initAutoSave()` / `loadDropdowns()`

---

### Item 3 — Post-Submit Clarity: "Where Do My Photos Go? What Do I Do Now?"

**Judah's quote:** *"Once I hit submit, it tells me it's submitted but I don't really know where to go. I don't know where the photos go... I'm thinking of this as a scoper."*

**What to build:**
Redesign the success modal body to include a clear **"What just happened"** summary and **"What to do next"** instruction. The success modal currently shows 3 buttons but no explanation. Judah thinks as a field tech, not an admin.

**Redesigned modal:**

```
✓  Scope Submitted!

DE-260218-001 — 2022 Toyota Tundra

─────────────────────────────
✅ Damage data saved to Airtable
📷 X photo(s) uploaded & attached to the record
📄 PDF ready to download and send to the writer
─────────────────────────────

[📄 Download PDF]   [📋 View Record]

[＋ Start Next Vehicle]
```

Key additions:
- Show photo count: "3 photo(s) uploaded" — if 0 photos, show "No photos attached — tap Export PDF to include damage notes only"
- Explicit instruction: **"Download the PDF and attach it to the vehicle's file in Mitchell"** (or whatever the actual next step is — Gera should confirm the writer's workflow)
- The "View Record" button takes them to Records mode filtered to this submission so they can double-check everything saved

**Implementation:** The `showSuccessModal()` (inside `submitData()`) already sets `successModalDetail` text. Expand it to also set a "what's next" steps list below the RO/vehicle line. Pass the photo count in.

**Files:** `index.html` — success modal HTML (~L5595) + `submitData()` function

---

## Implementation Order

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | Auto-generate RO number in `resetForm()` + page load | Small | ⭐⭐⭐⭐⭐ |
| 2 | Make Estimator sticky per device (don't reset, save to localStorage) | Small | ⭐⭐⭐⭐ |
| 3 | Expand success modal with photo count + "what to do next" steps | Small | ⭐⭐⭐⭐ |

All 3 changes are in `index.html` only. No backend or Airtable schema changes needed.

---

## One Question for Gera Before Item 3

The "what to do next" copy in the modal should say the actual next step in your workflow. Judah mentions going to an iPad and uploading photos to a work file. What exactly is that file / system?
- Is it Mitchell?
- A shared Google Drive folder?
- Something else?

The PDF export already works — the copy just needs to say "take this PDF and do X."
