---
category: examples-builds-custom
order: 30
classes: main__content--no-toc
menu-title: Formatting options
modified_at: 2021-12-09
---

# Editor with formatting options dropdown

The following showcases the editor with the main toolbar displayed at the bottom. To make it possible, the {@link module:editor-decoupled/decouplededitor~DecoupledEditor `DecoupledEditor`} was used with the {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar main toolbar} injected after the editing root into DOM ({@link framework/guides/document-editor learn more about the decoupled UI in CKEditor 5}).

Additionally, thanks to the flexibility offered by the {@link framework/guides/architecture/ui-library UI framework} of CKEditor 5, the main toolbar has been uncluttered by moving buttons related to text formatting under the custom "Formatting options" dropdown. All remaining dropdowns and (button) tooltips have been tuned to open upward for the best user experience.

The presented combination of the UI and editors features works best for integrations where text editing comes first and formatting is applied occasionally such as e-mail applications, (forum) post editors, or instant messaging.

{@snippet examples/formatting-options}
