---
category: features-image-upload
menu-title: Custom upload adapter
meta-title: Custom upload adapter | CKEditor 5 Documentation
meta-description: Learn how to create your own image upload adapter for CKEditor 5 to better suit your specific needs.
order: 40
modified_at: 2025-07-28
---

# Custom upload adapter

There are several reasons why developers choose to implement custom upload adapters in CKEditor&nbsp;5. These may include server integration requirements (dependent on the existing architecture where the editor is deployed), local security and authentication rules, or business logic.

The CKEditor&nbsp;5 Framework offers an open API with a set of classes for upload adapters that handle the entire upload process from when a user adds a file (for example, by dragging an image) to when the server responds, acting as a bridge between the editor and your server.

Check out this dedicated {@link framework/deep-dive/upload-adapter Custom Upload Adapter} guide, which explains how to create custom file upload functionality for the editor. 

## What's next

Check out the comprehensive {@link features/image-upload Image upload overview} to learn more about different ways of uploading images in CKEditor&nbsp;5.

See the {@link features/images-overview Image feature guide} to find out more about handling images in CKEditor&nbsp;5 WYSIWYG editor.
