---
category: examples-builds-custom
order: 30
classes: main__content--no-toc
menu-title: Formatting options
modified_at: 2021-12-09
---

# Editor with formatting options dropdown

The following custom editor example showcases an editor instance with the main toolbar displayed at the bottom of the editing window. To make it possible, the {@link module:editor-decoupled/decouplededitor~DecoupledEditor `DecoupledEditor`} was used with the {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar main toolbar} injected after the editing root into DOM. Learn more about the {@link framework/guides/document-editor decoupled UI in CKEditor 5}) to find out the details of this process.

Additionally, thanks to the flexibility offered by the {@link framework/guides/architecture/ui-library CKEditor 5 UI framework}, the main toolbar has been uncluttered by moving buttons related to text formatting into the custom "Formatting options" dropdown. All remaining dropdowns and (buttons) tooltips have been tuned to open upward for the best user experience.

The presented combination of the UI and editor's features works best for integrations, where text editing comes first and formatting is applied occasionally, such as e-mail applications, (forum) post editors, or instant messaging.

{@snippet examples/formatting-options}
