---
category: features
---

# Read-only support

{@snippet build-classic-source}

The editor can be set into a read-only mode by changing the value of the {@link module:core/editor/editor~Editor#isReadOnly `Editor#isReadOnly`} property. The read-only mode may have several applications. It may be used to view contents that should not be edited, like financial reports, software logs or reprinted stories. While not editable, it is still accessible for copying or for screen readers.

The feature may be used to impose user-based access restriction, where a selected user or a group of users may only access the content for evaluation purposes but not change it.

<info-box>
	See also the {@link features/restricted-editing restricted editing feature} that lets you define which parts of a document can be editable for a group of users with limited editing rights, leaving the rest of the content non-editable to them.
</info-box>

## Demo

{@snippet features/read-only}

## Related features

There are more features that help control user permissions in the WYSIWYG editor:

* {@link features/restricted-editing Restricted editing} &ndash; Define editable areas of the document for users with restricted editing rights.
* [Track changes](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html) &ndash; User changes are marked and shown in the sidebar for acceptance or deletion.
* [Comments](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments.html) &ndash; Users can add comments to any part of the content.
