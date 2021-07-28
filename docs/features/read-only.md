---
category: features
---

# Read-only support

{@snippet build-classic-source}

The editor can be set into a read-only mode by changing the value of the {@link module:core/editor/editor~Editor#isReadOnly `Editor#isReadOnly`} property.

The read-only mode may have several applications. It may be used to impose user-based access restriction, where a selected user or a group of users is only allowed to access the content for evaluation purposes but not change it.

The feature may also be used to view content that should not be edited, like financial reports, software logs or reprinted stories. While not editable, this content will still be accessible for copying or for screen readers.

<info-box>
	See also the {@link features/restricted-editing restricted editing feature} that lets you define which parts of a document can be editable for a group of users with limited editing rights, leaving the rest of the content non-editable to them.
</info-box>

## Demo

Use the demo below to toggle between editing modes and test the feature.

{@snippet features/read-only}

## Related features

There are more features that help control user permissions in the WYSIWYG editor:

* {@link features/restricted-editing Restricted editing} &ndash; Define editable areas of the document for users with restricted editing rights.
* {@link features/track-changes Track changes} &ndash; User changes are marked in the content and shown as suggestions in the sidebar for acceptance or rejection.
* {@link features/comments Comments} &ndash; Users can add comments to any part of the content instead of editing it directly.
