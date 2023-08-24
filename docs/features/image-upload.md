---
category: features-image-upload
menu-title: Overview
meta-title: Image upload overview | CKEditor 5 Documentation
order: 10
---

{@snippet features/build-ckbox-source}

# Image upload overview

Inserting {@link features/images-overview images} into content created with CKEditor&nbsp;5 is a very common task. In a properly configured rich-text editor, there are several ways for the end user to insert images:

* **Pasting** an image from the clipboard.
* **Dragging** a file from the file system.
* Selecting an image through the **file system dialog**.
* Selecting an image from the **media management tool** in your application.
* **Pasting** a URL to an image, either into the editor dialog or directly into the content.

Except for pasting URLs, all other solutions require the image to be uploaded to a server. The server will then be responsible for providing the image URL used by CKEditor&nbsp;5 to display the image in the document.

The software that makes the image upload possible is called an **upload adapter**. It is a callback that tells the WYSIWYG editor how to send the file to the server. There are two main strategies for getting the image upload to work that you can adopt in your project:

* [**Official upload adapters**](#official-upload-adapters) &ndash; There are several features like CKBox providing upload adapters developed and maintained by the CKEditor team. Pick the best one for your integration and let it handle the image upload in your project.
* [**Custom upload adapters**](#implementing-your-own-upload-adapter) &ndash; You can also create your upload adapter from scratch using the open API architecture of CKEditor&nbsp;5.

Read our comprehensive blog post about [Managing images with CKEditor&nbsp;5](https://ckeditor.com/blog/managing-images-with-ckeditor-5/) to find out more details about image upload and management, and to compare the available options.

<info-box>
	If you want to get a better look under the hood and learn more about the upload process, you can check out the {@link framework/deep-dive/upload-adapter "Custom image upload adapter" deep dive guide} covering this topic.
</info-box>

## Demo

The demo below is configured to use {@link features/ckbox CKBox} for image upload and management. It also includes the `AutoImage` plugin, which lets you {@link features/images-inserting#inserting-images-via-pasting-a-url-into-the-editor paste image URLs directly}.

{@snippet features/ckbox}

## Official upload adapters

### CKBox

CKBox is the most complete solution for not just image upload but also file management in CKEditor&nbsp;5.

It is a modern file uploader with a clean interface, automatic support for responsive images, and top-notch UX.

Thanks to the native CKEditor&nbsp;5 integration, CKBox supports drag&drop file upload as well as pasting images from the clipboard, Microsoft Word, or Google Docs.

With CKBox, users can upload files and categorize them into different groups. They can also change the way the files are displayed, for example, by setting the image thumbnail size or deciding how many files are shown on one page. Files can be uploaded, deleted, renamed, and tagged. File properties like dimensions, upload date, or size are also easily accessible and can be used to sort the files view alongside a regular search.

{@link features/ckbox **Learn how to use CKBox in your project**}.

### CKFinder

The {@link features/ckfinder CKFinder feature} provides a bridge between the rich-text editor and [CKFinder](https://ckeditor.com/ckfinder/), a browser-based file uploader with server-side connectors (PHP, Java, and ASP.NET).

There are two ways you can integrate CKEditor&nbsp;5 with CKFinder:

* **With the server-side connector only** &ndash; In this scenario, images dropped or pasted into the editor are uploaded to the CKFinder server-side connector running on your server.
* **With both the server-side connector and the client-side file manager** (recommended) &ndash; Images dropped and pasted into the editor are uploaded to the server (like in the first option). With access to the file manager, you can browse previously uploaded images, organize them, or edit them.

{@link features/ckfinder **Learn how to integrate CKEditor&nbsp;5 with CKFinder in your project**}.

### Simple adapter

The {@link features/simple-upload-adapter simple upload adapter} allows uploading images to your server using the [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) API with a minimal editor configuration.

{@link features/simple-upload-adapter **Learn how to use the simple upload adapter in CKEditor&nbsp;5**}.

### Base64 adapter

The {@link features/base64-upload-adapter Base64 upload feature} converts images inserted into the editor into [Base64 strings](https://en.wikipedia.org/wiki/Base64) in the {@link installation/getting-started/getting-and-setting-data editor output}.

<info-box warning>
	Please remember that while `Base64` upload is a very easy solution, it is also highly inefficient. The image file itself is kept as data in the database, generating a much heavier data load and higher transfer. We recommend using alternative ways to upload images into CKEditor&nbsp;5.
</info-box>

{@link features/base64-upload-adapter **Learn how to use Base64–encoded images in CKEditor&nbsp;5**}.

## Implementing your own upload adapter

CKEditor&nbsp;5 provides an open API that allows you to develop your upload adapters. Tailored to your project, a custom adapter will allow you to take full control over the process of sending the files to the server as well as passing the response from the server (e.g. the URL to the saved file) back to the WYSIWYG editor.

{@link framework/deep-dive/upload-adapter **Learn how to develop a custom upload adapter for CKEditor&nbsp;5**}.
