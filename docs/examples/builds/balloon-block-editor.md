---
category: examples-builds
meta-title: Balloon block editor example | CKEditor 5 Documentation
order: 40
toc: false
contributeUrl: false
classes: main__content--no-toc
---

# Balloon block editor

The balloon block editor type lets you create your content directly in its target location with the help of two toolbars:

* A balloon toolbar that appears next to the selected editable document element (offering inline content formatting tools).
* A {@link getting-started/setup/toolbar#block-toolbar block toolbar} accessible using the toolbar handle button {@icon @ckeditor/ckeditor5-core/theme/icons/drag-indicator.svg Drag indicator}  attached to the editable content area and following the selection in the document (bringing additional block formatting tools). The {@icon @ckeditor/ckeditor5-core/theme/icons/drag-indicator.svg Drag indicator} button is also a handle that can be used to drag and drop blocks around the content.

<info-box hint>
	Check out the [source code](https://github.com/ckeditor/ckeditor5-demos/tree/master/user-interface-balloon-block) of this editor preset or build your custom editor setup with our [interactive Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs).
</info-box>

{@snippet examples/balloon-block-editor}
