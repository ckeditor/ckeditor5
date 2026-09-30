---
type: Minor breaking change
scope:
  - ckeditor5-ui
see:
  - https://github.com/ckeditor/ckeditor5/issues/3891
---

The editor's body collection (floating user interface such as balloons, dialogs, and tooltips) is no longer attached to the DOM during editor creation. It is attached once the editor's editing root is connected to the document, and `.ck-body-wrapper` is no longer a single shared element: there is one wrapper per mount target, so an editor in a shadow root or with a configured `config.ui.overlayContainer` gets a wrapper of its own.

For an editor created on a detached element, `.ck-body-wrapper` is therefore not present in the DOM immediately after `Editor.create()` resolves. Code that located it that way, for example through `document.querySelector( '.ck-body-wrapper' )`, should use `editor.ui.view.body.bodyCollectionContainer` instead. That element is created on demand and is available even before the collection is attached to the DOM.
