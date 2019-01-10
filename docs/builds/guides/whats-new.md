---
# Scope:
# * Highlight new things when compared to CKEditor 4.
# * Emphasize cool new stuff we are bringing, for those learning about CKEditor 5.

menu-title: What's new?
category: builds-guides
order: 20
---

# What's new in CKEditor 5?

## Enhanced UX

CKEditor 5 strives to provide a truly seamless, distraction-free editing experience to allow the users to focus on creating great content.

### Better images

Inserting images into the content is now very intuitive, with all technical aspects (uploading, resizing) hidden from the user experience. No more complex dialogs!

<iframe width="600" height="337" src="https://www.youtube.com/embed/MRnYtmPAJ30?rel=0&amp;" frameborder="0" allowfullscreen></iframe>

<iframe width="600" height="337" src="https://www.youtube.com/embed/WWT9pkPZSnI?rel=0&amp;" frameborder="0" allowfullscreen></iframe>

The outdated concept of image alignment was dropped in favor of {@link features/image#image-styles image styles}:

{@img assets/img/builds-image-styles.png 736 Image styles toolbar.}

CKEditor 5 supports several different image upload strategies. Check out the {@link features/image-upload comprehensive "Image upload" guide} to find out the best option for your project.

### Simple linking

No more complex dialogs for links. When you click a link, first you will see a balloon with an option to either edit the link or open it in a new tab.

{@img assets/img/feature-link-balloon.gif Simplified link balloon.}

### Caret movement around links

Typing text around links was never easier. Move the caret using your keyboard to switch between typing a link and a plain text.

{@img assets/img/feature-link-two-step.gif Two–step caret movement around links.}

### Autoformatting

Start lists, headings and even bold text by typing, without the need to use toolbar buttons. See {@link features/autoformat Autoformatting feature} for more details.

<iframe width="600" height="337" src="https://www.youtube.com/embed/ZmMMyvGiI5A?rel=0" frameborder="0" allowfullscreen></iframe>

## Enhanced classic editor

For CKEditor 5 we reinvented the concept of the "boxed" editor.

### New toolbar

The toolbar is now always visible when the user scrolls the page down.

<iframe width="600" height="337" src="https://www.youtube.com/embed/rLZe37MXzHE?rel=0" frameborder="0" allowfullscreen></iframe>

### Inlined content

The editor content is now placed inline in the page &mdash; it is thus much easier to style it. Additionally, the editor grows with the content (or not, it is up to you!).

<iframe width="600" height="337" src="https://www.youtube.com/embed/igoI02wBykA?rel=0" frameborder="0" allowfullscreen></iframe>

## Fewer features == better content

We focused on creating a tool for writing quality content. At the same time, we simplified the integration of the editor into your system.

We feel that in previous editor versions we had way too many features and configurations. This was confusing developers and at the same time negatively impacting the end user experience.

In CKEditor 5 misleading formatting tools were removed, dialogs were stripped out or simplified in favor of well-designed features that require no configuration.

## Lightweight

The editor is much more lightweight and fast. It brings a fantastic user experience on both desktop and mobile devices.

## Highly customizable

CKEditor 5 Builds are based on {@link framework/index CKEditor 5 Framework}, which gives powerful customizability and extensibility.

## Custom data model

A much more efficient data model was designed for CKEditor 5. This makes the development of features a much more creative experience and improves features such as undo and redo.

## Collaborative editing

Another important benefit of the custom data model is that it enables the possibility of real-time collaborative editing inside CKEditor by introducing the concepts of "operations" and "operational transformations".

<!--
Read more about {@linkTODO collaboration in the CKEditor 5 Framework documentation}.
-->

With [collaboration services provided by CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/) it is now extremely easy to provide collaboration features inside your application.

Check the {@link @ckeditor5 features/real-time-collaboration collaboration demo} and read how to enable features such as comments, user presence list or showing the selection of other users in your editor.

[Letters](https://ckeditor.com/letters/) is an example of an application using the power of CKEditor 5 for collaboration.

[{@img assets/img/letters-collab.jpg 1440 Letters uses CKEditor 5 to allow users collaborate.}](%BASE_PATH%/assets/img/letters-collab.jpg)

## Modern

CKEditor 5 has been totally rewritten in ECMAScript 2015 (also called ES6), using the power of modules. It provides all the necessary tools to easily integrate it with modern applications and technologies.
