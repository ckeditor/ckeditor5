---
category: features
---

# Image upload

Inserting images into content created with CKEditor is a very common task. In a properly configured editor, there are several ways for the end user to insert images:

* Pasting it from the clipboard.
* Dragging a file from the file system.
* Selecting it through a file system dialog.
* Selecting it from a media management tool in your application.

Excluding the last option, all other ways require the image to be uploaded to a server, which will be the one responsible for providing the image URL used by CKEditor to display the image in the document.

<info-box>
	If you want to get a better look under the hood and learn more about the upload process, you can check out the {@link framework/guides/deep-dive/upload-adapter deep dive guide} covering that topic.
</info-box>

The software that makes the image upload possible is called an **upload adapter**. And there are two main strategies of getting the image upload work you can adopt in your project:

* [**Official upload adapters**](#official-upload-adapters): There are several features providing upload adapters developed and maintained by the CKEditor team. Pick the best one for your integration and let it handle the image upload in your project.
* [**Custom upload adapters**](#implementing-your-own-upload-adapter): Create your own upload adapter from scratch using the open API architecture CKEditor 5 provides.

## Official upload adapters

### Easy Image

CKEditor 5 introduces a totally new way of handling images, with strong focus on the end–user experience. It is called {@link features/easy-image Easy Image} and its goal is to make the image upload as effortless and intuitive as possible.

Easy Image is part of the [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/) offer. It is a <abbr title="Software as a service">SaaS</abbr> product which:

* securely uploads images,
* takes care of rescaling and optimizing them as well as providing various image sizes (responsive images),
* delivers uploaded images through a blazing-fast CDN.

All that, with virtually zero server setup.

{@link features/easy-image **Learn how to use Easy Image in your project**}.

### CKFinder

The {@link features/ckfinder CKFinder feature} provides a bridge between the editor and [CKFinder](https://ckeditor.com/ckfinder/), a browser-based file manager and a server-side connectors (PHP and .NET).

There are two ways you can integrate CKEditor 5 with the CKFinder file manager:

* **With the server-side connector only**: In this scenario, images which are dropped or pasted into the editor are uploaded to a CKFinder server-side connector running on your server.
* **With both the server and client-side file manager**: This also allows uploading the images via dropping and pasting them directly into the editor like in the first option. Additionally, it allows uploading images via the CKFinder UI, choosing previously uploaded images, editing images (cropping, resizing, etc.), organizing or deleting images.

{@link features/ckfinder **Learn how to integrate CKEditor 5 with CKFinder in your project**}.

## Implementing your own upload adapter

CKEditor 5 provides an open API that allows you to develop your own upload adapters. Tailored to  your project, a custom adapter will allow you to take the **full control** over the process of sending the files to the server as well as passing the response from the server (e.g. the URL to the saved file) back to the editor.

{@link framework/guides/deep-dive/upload-adapter **Learn how to develop your own upload adapter for CKEditor 5**}.
