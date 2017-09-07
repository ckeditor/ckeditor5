---
# Scope:
# * Highlight new things when compared to CKEditor 4.
# * Emphasize cool new stuff we are bringing, for those learning about CKEditor 5.

title: What's new in CKEditor 5?
menu-title: What's new?
category: builds-guides
order: 20
---

## Enhanced UX

CKEditor 5 strives to provide a truly seamless, distraction-free editing experience to allow the users to focus on creating great content.

### Better images

Inserting images into the content is now very intuitive, with all technical aspects (uploading, resizing) hidden from the user experience. No more complex dialogs!

[ TODO Animated GIF of pasting ]

[ TODO Animated GIF of DnD ]

The outdated concept of image alignment was dropped in favor of {@link features/image#Image-styles image styles}:

[ TODO Animated GIF of styles ]

<!-- TODO 2 -->

### Simple linking

No more complex dialogs for links.

{@img assets/img/feature-link.png 503 Simplified link dialog.}

### Autoformatting

Start lists, headings and even bold text by typing, without the need to use toolbar buttons. See {@link features/autoformat Autoformatting feature} for more details.

[ TODO Animated GIF with auto formatting in action ]

## Enhanced classic editor

For CKEditor 5 we reinvented the concept of the "boxed" editor.

### New toolbar

The toolbar is now always visible when the user scrolls the page down.

[ TODO Animated GIF with scrolling and toolbar ]

### Inlined content

The editor content is now placed inline in the page &mdash; it is now much easier to style it. Additionally, the editor grows with the content (or not, it is up to you!).

[ TODO Animated GIF of the editor growing when typing ]

## Fewer features == better content

We focused on creating a tool for writing quality content. At the same time, we simplified the integration of the editor into your system.

We feel that in previous editor versions we had way too many features and configurations. This was confusing developers and at the same time negatively impacting the end user experience.

In CKEditor 5 misleading formatting tools were removed, dialogs were stripped out or simplified in favor of well-designed features that require no configuration.

{@img assets/img/feature-toolbar.png 610 Simplified toolbar with features designed for writing quality content.}

## Lightweight

The editor is much more lightweight and fast. It brings a fantastic user experience on both desktop and mobile devices.

## Highly customizable

CKEditor 5 Builds are based on the {@link framework/index CKEditor 5 Framework}, which gives powerful customizability and extensibility.

## Custom data model

A much more efficient data model was designed for CKEditor 5. This makes the development of features a much more creative experience and improves features such as undo and redo.

## Collaborative editing

Another important benefit of the custom data model is that it enables the possibility of real-time collaborative editing inside CKEditor by introducing the concepts of "operations" and "operational transformations".

<!--
 Read more about {@linkTODO collaboration in the CKEditor 5 Framework documentation}.
 -->

<!-- TODO 3 -->

## Modern

CKEditor 5 has been totally rewritten in ES6, using the power of modules. It provides all the necessary tools to easily integrate it with modern applications and technologies.
