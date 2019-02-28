---
title: Multiple root editor
category: examples-framework
order: 5
---

CKEditor 5 supports multiple roots (multiple editable areas) by default. Creating such editor, however, requires a custom editor creator which will take care of gluing multiple editable areas and exposing easy to use and integrate with API.

The main difference between multiple root editor and builds like {@link examples/builds/inline-editor inline editor} is the fact that all editable areas belongs to the same editor instance, shares the same toolbar and has one undo stack. The {@link framework/guides/custom-editor-creator multiple root editor creator} can be customised in many ways to fit the variety of cases.

{@snippet examples/multiroot-editor}
