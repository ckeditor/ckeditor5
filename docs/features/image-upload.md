---
category: features-image-upload
menu-title: Overview
order: 10
---

# Image upload overview

Inserting {@link features/images-overview images} into content created with CKEditor 5 is a very common task. In a properly configured rich-text editor, there are several ways for the end user to insert images:

* **Pasting** an image from the clipboard
* **Dragging** a file from the file system
* Selecting an image through a **file system dialog**
* Selecting an image from a **media management tool** in your application
* **Pasting** a URL to an image, either into the editor dialog or directly into the content

With the exception of pasting URLs, all other solutions require the image to be uploaded to a server. The server will then be responsible for providing the image URL used by CKEditor 5 to display the image in the document.

The software that makes the image upload possible is called an **upload adapter**. It is a callback that tells the WYSIWYG editor how to send the file to the server. There are two main strategies of getting the image upload to work that you can adopt in your project:

* [**Official upload adapters**](#official-upload-adapters) &ndash; There are several features like CKBox providing upload adapters developed and maintained by the CKEditor team. Pick the best one for your integration and let it handle the image upload in your project.
* [**Custom upload adapters**](#implementing-your-own-upload-adapter) &ndash; Create your own upload adapter from scratch using the open API architecture of CKEditor 5.

Read our comprehensive blog post about [Managing images with CKEditor 5](https://ckeditor.com/blog/managing-images-with-ckeditor-5/) to find out more details about image upload and management and to compare the available options.

<info-box>
	If you want to get a better look under the hood and learn more about the upload process, you can check out the {@link framework/deep-dive/upload-adapter "Custom image upload adapter" deep dive guide} covering that topic.
</info-box>

## Demo

The demo below uses the {@link installation/getting-started/predefined-builds#classic-editor Classic editor} configured to use the {@link features/easy-image Easy Image} service provided by [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services) and the `AutoImage` plugin, which allows you to {@link features/images-inserting paste image URLs directly}:

{@snippet build-classic-source}

{@snippet features/easy-image}

## Official upload adapters

### CKBox

CKBox is a modern SaaS file management platform with a clean interface, responsive images, and top-notch UX. We keep expanding and updating it constantly, adding new features and functions. If you are a part of an organization with many different files to manage, such as images or documents, and regularly have issues finding the right files for the task at hand, CKBox is the right solution.

CKBox is a part of the commercial [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/) offer.

With the CKBox platform, users can upload files and categorize them into different groups. They can also change the way the files are organized as various interface modification options exist. For example, you can modify the image thumbnail sizes or decide how many files are displayed within the navigation that users can view. Files can be uploaded, deleted, renamed, and tagged. File properties like dimensions, upload date or size are also easily accessible and can be used to sort the files view alongside a regular search.

{@link features/ckbox **Learn how to use CKBox in your project**}.

### Easy Image

The {@link features/easy-image Easy Image} feature comes with a strong focus on the end–user experience. Its goal is to make the image upload as effortless and intuitive as possible.

Easy Image is part of the commercial [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/) offer. It is a <abbr title="Software as a service">SaaS</abbr> product that securely uploads images, takes care of rescaling and optimizing them as well as providing various image sizes (responsive images), and delivers uploaded images through a blazing-fast CDN. All that with virtually zero server setup.

{@link features/easy-image **Learn how to use Easy Image in your project**}.

### CKFinder

The {@link features/ckfinder CKFinder feature} provides a bridge between the rich-text editor and [CKFinder](https://ckeditor.com/ckfinder/), a browser-based commercial file uploader with its server-side connectors (PHP, Java, and ASP.NET).

There are two ways you can integrate CKEditor 5 with the CKFinder file manager:

* **With the server-side connector only** &ndash; In this scenario, images dropped or pasted into the editor are uploaded to the CKFinder server-side connector running on your server.
* **With both the server-side connector and the client-side file manager** (recommended) &ndash; Images dropped and pasted into the editor are uploaded to the server (like in the first option).

	But there are more cool features available, for instance:

	* **Uploading** using the full user interface
	* **Browsing** previously uploaded images
	* **Editing** images (cropping, resizing, etc.)
	* **Organizing** or deleting images

{@link features/ckfinder **Learn how to integrate CKEditor 5 with CKFinder in your project**}.

### Simple adapter

The {@link features/simple-upload-adapter Simple upload adapter} allows uploading images to your server using the [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) API with a minimal editor configuration.

{@link features/simple-upload-adapter **Learn how to use the Simple upload adapter in CKEditor 5**}.

### Base64 adapter

The {@link features/base64-upload-adapter Base64 upload feature} converts images inserted into the editor into [Base64 strings](https://en.wikipedia.org/wiki/Base64) in the {@link installation/getting-started/getting-and-setting-data editor output}.

<info-box warning>
	Please remember that while `Base64` upload is a very easy solution, it is also highly inefficient. The image file itself is kept as data in the database, generating a much heavier data load and higher transfer. We recommend using alternative ways to upload images into CKEditor 5.
</info-box>

{@link features/base64-upload-adapter **Learn how to use Base64–encoded images in CKEditor 5**}.

## Implementing your own upload adapter

CKEditor 5 provides an open API that allows you to develop your own upload adapters. Tailored to your project, a custom adapter will allow you to take **full control** over the process of sending the files to the server as well as passing the response from the server (e.g. the URL to the saved file) back to the WYSIWYG editor.

{@link framework/deep-dive/upload-adapter **Learn how to develop your own upload adapter for CKEditor 5**}.

## Inserting images via URL

CKEditor 5 supports inserting images into the document via pasting URLs. These may be pasted both into the image insertion dialog or, thanks to the `AutoImage` function, directly into the content.

{@link features/images-inserting **Learn how to paste images into CKEditor 5 using URLs**}.
