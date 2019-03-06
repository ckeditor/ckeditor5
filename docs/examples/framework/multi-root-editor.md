---
category: examples-framework
order: 30
---

# Multi-root editor

The main difference between a multi-root editor and using multiple separate editors (like in the {@link examples/builds/inline-editor inline editor demo}) is the fact that in a multi-root editor all editable areas belong to the same editor instance, share the same toolbar and create one undo stack.

Out of the box, CKEditor 5 does not offer a ready-to-use multi-root editor yet. However, such an editor can be implemented by using the {@link framework/guides/overview CKEditor 5 Framework}.

Check out the {@link framework/guides/custom-editor-creator "Implementing a custom editor creator" guide} which contains the source code of the demo below.

{@snippet examples/multi-root-editor}
