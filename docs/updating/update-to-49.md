---
category: update-guides
meta-title: Update to version 49.x | CKEditor 5 Documentation
menu-title: Update to v49.x
order: 75
modified_at: 2026-09-07
---

# Update to CKEditor&nbsp;5 v49.x

## Update to CKEditor&nbsp;5 v49.0.0

### The Watchdog is removed

The Watchdog is gone in v49. That removes the `@ckeditor/ckeditor5-watchdog` package, the `EditorWatchdog` and `ContextWatchdog` classes, and the static fields that exposed them on every editor class. Nothing restarts a crashed editor anymore, and no editor content is saved or restored for you.

In its place, `onEditorError()` reports the errors that escape a running editor, together with the editor or context they were attributed to, and your application decides what happens next. The {@link getting-started/setup/error-handling error handling} guide covers the options; the {@link updating/migration-from-watchdog migrating from the Watchdog} guide covers the move in plain JavaScript and in each of the framework integrations.

<info-box warning>
	This changes the default behavior for everyone using the React, Vue, or Angular integrations, not only for those who configured a watchdog. All three attached one on your behalf. An editor that used to be rebuilt after a crash now stays as it is, with its content and undo history intact. They also now require CKEditor&nbsp;5 in version 49 or higher.
</info-box>

`ActionsRecorder` was not removed with the package. It moved to `@ckeditor/ckeditor5-core`, so change the specifier if you imported it from the Watchdog package. Importing it from `ckeditor5` keeps working unchanged.
