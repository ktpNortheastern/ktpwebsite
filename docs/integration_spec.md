# KTP Website — Interaction Spec

Pulled from handwritten annotations on the Figma wireframes. Figma MCP will give
accurate structure/layout/styles for each frame, but won't surface any of this —
feed this doc alongside the MCP output when implementing each section.

---

## Home Page

### Hero ("we are Kappa Theta Pi")
- Background is a swappable img or video (not a static color/gradient).
- Custom cursor: shrinks to a small circle while in this section.
- Section uses snap scroll.

### Presidential Welcome
- Snap scroll section.
- Left image block, right text block — straightforward, no special animation noted.

### "We are the first professional, co-ed technology fraternity" statement
- Snap scroll section.
- Text has a scramble/decode effect (letters resolve into place, likely on scroll-into-view).

### Pillars (Academic Support / Alumni Connections / Professional Development)
- Snap scroll section.
- Horizontal scroll effect across the three pillar cards.

### "Why Rush?" / Reasons
- Snap scroll section.
- "Why Rush?" header stays pinned/sticky on the left while the "Reasons" column
  scrolls vertically on the right (pinned-left, scrolling-right pattern).
- On transition into the next section (Network), "Why Rush?" slides and shrinks
  upward as the incoming content takes over.
- Reference for the scroll/transition feel: https://www.rekorderstudios.com/

### Network (companies table)
- Snap scroll section.
- Simple table, no animation noted beyond the entry transition above.

### FAQ preview ("Common Questions")
- Snap scroll section.
- Appears to be a shortened preview of the full FAQ page, expand/collapse rows.

---

## Members Page

- Header: "Meet Our Brothers" intro copy + a "Select Class" dropdown filter.
- Classes, in order: Executive Board, Delta, Gamma, Beta, Alpha, Founding, Alumni.
- Executive Board grid shows role titles per card (Co-President, VP Tech Dev,
  VP Finance, VP Membership, VP Engagement, VP Marketing, VP Prof Dev,
  VP Philanthropy, VP Internal Ops).
- Other class grids (e.g. Delta) show photo + name only, no role.
- Note: three near-duplicate wireframe variants exist for this page — looks like
  the dropdown UI is still being iterated on. Worth confirming with designer which
  variant (or if a different one entirely) is final before building the filter UI.

---

## Rush Page

- "Fall 2026 Rush Schedule" header, "Applications are due 9/16," Apply Now CTA.
- Event cards: title, order number, description, date/time/location tags, image.
- Cards shown: Meet The Brothers, Info Session, Co-op Panel (more may exist off-frame).
- No animation/scroll notes on this page — treat as standard layout unless told otherwise.

---

## Gallery Page

- Scattered/masonry grid of photos on dark background, images vary in size.
- On hover over an image: custom cursor swaps to show the image's caption
  (this is the same custom-cursor system as the Hero — build it once, reuse
  with a couple of states rather than as separate implementations).
- Caption text uses the same scramble effect as the homepage statement —
  confirms scramble should be a shared component (e.g. `<ScrambleText>`), not
  a one-off.
- A tag/label shown at the bottom (e.g. "KTP F25 RETREAT") — likely an
  album/event grouping for the currently visible set of photos.

---

## FAQ Page

- Simple numbered list, accordion expand (+) per question.
- No animation notes.

---

## Contact Page

- Standard contact form: name, reason for reaching out, email, message, submit.
- No animation notes.

---

## Projects Page

- Tabbed/selectable list on the right (KTP Life App, Website Redesign, Philanthropy)
  driving a featured display on the left.
- Below the featured project: merch grid (Fall 26 Collection, Summer 26 Collection,
  Fall 25 Collection).
- Annotation on this frame just says "reach" with no other context — unclear what
  this refers to (a reach/analytics feature? "reach out" CTA? mislabeled note?).
  **Flag for the designer / screenshot the full context before building this page.**

---

## Data architecture note: extensible taxonomies

Member classes (currently Executive Board / Delta / Gamma / Beta / Alpha /
Founding / Alumni) and project types are NOT hardcoded lists — they're modeled
as their own CMS collections ("Member Classes", "Project Types") that Members
and Projects reference. This means adding a new pledge class each year, or a
new project type, is a CMS action, not a code change.

**Dev-side implication:** the Members page and its "Select Class" filter must
render sections dynamically by querying the Classes collection (sorted by its
`order` field), not from a hardcoded array of class names in the component.
Same for any place Project Type is used to group/filter. Build this from the
start rather than hardcoding and refactoring later.

---

## Open questions to confirm before/while building

1. Members page — which dropdown/filter variant is final (see note above).
2. Projects page — what "reach" annotation refers to.
3. Rush page — any snap-scroll or entry animation intended, or is it a standard page?
4. Scramble text effect — confirm trigger (on scroll-into-view vs. on load) and hover behavior.
