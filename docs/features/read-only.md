---
category: features
---

# Read-only support

{@snippet build-classic-source}

The editor can be set into a read-only mode by changing the value of the {@link module:core/editor/editor~Editor#isReadOnly `Editor#isReadOnly`} property. The read-only mode may have several applications. It may be used to view contents that should not be edited, like financial reports, software logs or reprinted stories. It may also be used to impose user-based access restriction, where a selected user or a group of users may only access the content for evaluation purposes but not change it.

See the demo below:

{@snippet features/read-only}

<info-box>
	See also the {@link features/restricted-editing restricted editing feature} that lets you define which parts of a document can be editable for a group of users with limited editing rights, leaving the rest of the content non-editable to them.
</info-box>
