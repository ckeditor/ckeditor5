---
category: examples-framework
order: 30
---

# Multi-root editor

{@link framework/guides/overview CKEditor 5 Framework} supports creating multi-root editors. The main difference between multi-root editor and using multiple separate editors (like in the {@link examples/builds/inline-editor inline editor} demo) is the fact that in a multi-root editor all editable areas belong to the same editor instance, share the same toolbar and create to one undo stack.

CKEditor 5 does not offer a ready-to-use multi-root editor yet. Such an editor has to be implemented by using the {@link framework/guides/overview CKEditor 5 Framework}.

Check out the {@link framework/guides/custom-editor-creator guide on creating custom editors} which contains the source code of the demo below.

{@snippet examples/multiroot-editor}
