<!--

This repository uses Markdown files to define changelog entries. If the changes in this pull request are **user-facing**, please create a changelog entry by running the following command:

    pnpm run nice

This will generate an `*.md` file in the `.changelog/` directory for your description. You can create as many as you need.

**Note:**  
If your PR is internal-only (e.g., tests, tooling, docs), you can skip this step - just mention it below.

-->

### 🚀 Summary

*A brief summary of what this PR changes.*

---

### 📌 Related issues

<!--

Although changelog entries list connected issues, GitHub requires listing them here to automatically link and close them.

-->

* Closes #000

---

### 💡 Additional information

*Optional: Notes on decisions, edge cases, or anything helpful for reviewers.*

---

### 🧾 Checklists

Use the following checklists to ensure important areas were not overlooked.
This does not apply to feature-branch merges.
If an item is **not relevant** to this type of change, simply leave it unchecked.

#### Author checklist

- [ ] Is the changelog entry intentionally omitted?
- [ ] Is the change backward-compatible?
- [ ] Have you considered the impact on different editor setups and core interactions? _(e.g., classic/inline/multi-root/many editors, typing, selection, paste, tables, lists, images, collaboration, pagination)_
- [ ] Has the change been manually verified in the relevant setups?
- [ ] Does this change affect any of the above?
- [ ] Is performance impacted?
- [ ] Is accessibility affected?
- [ ] Have tests been added that fail without this change (against regression)?
- [ ] Have the API documentation, guides, feature digest, and related feature sections been updated where needed?
- [ ] Have metadata files (ckeditor5-metadata.json) been updated if needed?
- [ ] Are there any changes the team should be informed about (e.g. architectural, difficult to revert in future versions or having impact on other features)?
- [ ] Were these changes documented (in Logbook)?

#### Reviewer checklist

- [ ] PR description explains the changes and the chosen approach (especially when  performance, API, or UX is affected).
- [ ] The changelog entry is clear, user‑ or integrator-facing, and it describes any breaking changes.
- [ ] All new external dependencies have been approved and mentioned in LICENSE.md (if any).
- [ ] All human-readable, translateable strings in this PR been introduced using `t()` (if any).
- [ ] I manually verified the change (e.g., in manual tests or documentation).
- [ ] The target branch is correct.
