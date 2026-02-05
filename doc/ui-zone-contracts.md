# UI Zone Contracts (CSS-First Patterns)

This project uses **CSS “zone contracts”** for layout patterns. The goal is to keep design control centralized and keep page code/DOM clean.

## Taxonomy

### Patterns (zone contracts)
Patterns own **layout**, **spacing**, and **structure** via:
- A root class (the pattern)
- Named inner zones (slots)

Examples:
- Sidesheet (`.sidesheet`, `.sidesheet-header`, `.sidesheet-main`, …)
- Sidesheet sections (`.sidesheet-section`)
- Footer actions (`AppSidesheetFooter`)

### Widgets (UI controls)
Widgets are interactive UI primitives (Mantine components like `Button`, `TextInput`, `Card`). Widgets should not define the page layout.

### Pages
Pages compose **patterns + widgets**. Pages should avoid inventing extra layout wrappers just for spacing/padding.

## Clean DOM Rules
1) Prefer passing fragments (`<>…</>`) into slots (`leftPane`, `rightPane`) instead of extra wrapper `<div>`s.
2) Use explicit wrappers when structure matters (e.g., `SidesheetSection`) instead of CSS selectors like `.rightPane > *`.
3) Keep wrappers semantic:
   - Sidesheet panel: `role="dialog"`, `aria-modal="true"`
   - Section blocks: `<section>` and `<header>`

## Sidesheet contract

### Slots
- Header: title + optional subtitle + close action
- Main: single-pane or two-pane (adds `.sidesheet-main--two` when `leftPane` exists)
- Footer: action pack (left area + right area)

### Recommended usage
```tsx
open({
  title: 'Resident Profile',
  subtitle: 'Resident',
  leftPane: (
    <>
      {/* left pane content */}
    </>
  ),
  rightPane: (
    <>
      <SidesheetSection title="Section title">
        {/* cards/forms */}
      </SidesheetSection>
      <SidesheetSection title="Another section">
        {/* cards/forms */}
      </SidesheetSection>
    </>
  ),
  footer: (
    <AppSidesheetFooter onCancel={close} onSave={save} />
  ),
});
```

## SidesheetSection contract
- Use `SidesheetSection` to standardize “header + body” blocks in the right pane.
- Use `actions` for right-aligned controls/meta when needed.

