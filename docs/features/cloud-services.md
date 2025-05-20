---
category: cloud-services
meta-title: Cloud Services | CKEditor 5 Documentation
meta-description: Cloud platform with document conversion, editing features and real-time collaboration services.
menu-title: Overview
modified_at: 2025-05-20
order: 10
---

# Cloud Services Overview

The CKEditor Cloud Services is a cloud platform that provides editing and real-time collaboration services. The platform comprises of several services, each of which can connect to CKEditor 5 using dedicated plugins. Additionally, each service has a REST API for synchronizing the data, utilizing, configuring, and managing features.

The platform primarily focuses on providing a backend for the CKEditor 5 features, although some features can also be used directly through REST APIs.

## Real-time collaboration

CKEditor Cloud Services offers a fast and highly scalable service for real-time collaboration, compatible with rich text editors built on top of CKEditor 5 Framework. It is capable of handling real-time collaboration on text documents and tracking users connected to the document. It also serves as a storage for comments, suggestions, and revisions added to the document.

Apart from having a supporting backend to transmit operations, resolve conflicts, and apply changes between users connected to the same document, some features are needed on the client side to offer a full real-time collaboration experience:

 * Showing multiple cursors and selections coming from other users.
 * Showing users connecting to and disconnecting from the document.
 * Offering the UI for managing comments and markers in the document.

The CKEditor Ecosystem offers a collection of plugins that can be integrated with any CKEditor 5 build to provide a fully flexible and customizable experience &ndash; the {@link features/collaboration CKEditor 5 Collaboration Features}.

### CKEditor 5 Real-time collaboration features

{@link features/real-time-collaboration CKEditor 5 Real-time collaboration features} let you customize any CKEditor 5 build to include real-time collaborative editing, commenting, and track changes features and tailor them to your needs.

Real-time collaboration consists of four features delivered as separate plugins that can be used with any CKEditor 5 build:

* {@link features/real-time-collaboration Real-time collaborative editing} &ndash; Allows for editing the same document by multiple users simultaneously. It also automatically solves all conflicts if users make changes at the same time.
* {@link features/comments Real-time collaborative comments} &ndash; Makes it possible to add comments to any part of the content in the editor.
* {@link features/track-changes Real-time collaborative track changes} &ndash; Changes to the content are saved as suggestions that can be accepted or discarded later.
* {@link features/revision-history Real-time collaborative revision history} &ndash; Multiple versions of the document are available, an older version can be restored.
* {@link features/users Users selection and presence list} &ndash; Shows the selection of other users and lets you view the list of users currently editing the content in the editor.

All of the above features are customizable. This makes implementing real-time collaborative editing within your application a highly customizable out-of-the-box experience.

{@img assets/img/features-collaboration.png 800 CKEditor&nbsp;5 collaboration features.}

For an in-depth introduction to CKEditor 5 Collaboration Features refer to the {@link features/real-time-collaboration Collaboration overview}.

## Export features

CKEditor Cloud Services offers a fast and highly scalable service enabling the user to export documents either to a Microsoft Word document or to a PDF document. Both of these are available as a service, making it possible to feed the data straight into the Cloud Services server for more advanced use or as convenient WYSIWYG editor plugins for ease of use in less demanding cases.

### Export to PDF

The {@link features/export-pdf Export to PDF} converter provides an API for converting HTML documents to PDF files. The service generates a file and returns it to the user so they can save it in the `.pdf` format on their disk. This allows you to easily turn your content into the portable final PDF format file collection. Available both as a service endpoint (a premium feature) and as a plugin (needs to be added to the editor build separately).

{@img assets/img/export-to-pdf-sample.png 700 Export to PDF feature in the CKEditor 5 WYSIWYG editor toolbar.}

### Export to Word

The {@link features/export-word Export to Word} converter provides an API for converting HTML documents to Microsoft Word `.docx` files. The service generates a Word file and returns it to the user so they can save it in the `.docx` format on their disk. This allows you to easily export your content to the Microsoft Word format. Available both as a service endpoint (a premium feature) and as a plugin (needs to be added to the editor build separately).

{@img assets/img/export-to-word-sample.png 700 Export to Word feature in the CKEditor 5 WYSIWYG editor toolbar.}

## Import from Word

The {@link features/import-word Import from Word} converter is a fast and highly scalable service enabling the user to import documents from a Microsoft Word `.docx` file. The feature is available as a service, making it possible to send a `.docx` file straight into the Cloud Services server for more advanced use or as a convenient {@link features/import-word CKEditor 5 WYSIWYG editor plugin} for the ease of use in less demanding cases.

The DOCX to HTML converter provides an API for converting Microsoft Word `.docx` files to HTML documents. The service generates HTML data and returns it to the user so they can save it in the HTML format on their disk.

## CKBox

[CKBox](https://ckeditor.com/docs/ckbox/latest/guides/index.html) is a service that manages document assets and images. It allows for seamless uploading and management of assets within a document. The service stores them in persistent storage and provides tools to optimize image size and manage attributes, such as alternative text. Once an asset is stored, it can be reused in multiple documents.

Refer to the {@link features/ckbox CKBox plugin documentation} for details.

{@img assets/img/ckbox-sample.png 770 CKBox management modal.}

## Next steps

* If you already use collaboration features without Real-time Collaboration you can refer to our dedicated guide about [migration of data between asynchronous and RTC editors](https://ckeditor.com/docs/cs/latest/guides/collaboration/migrating-to-rtc.html).

* If you need to save your documents in portable file formats, check out the {@link features/export-pdf Export to PDF} or {@link features/export-word Export to Word} feature guides.

* If you need to import your documents from the `.docx` format, learn more about the {@link features/import-word Import from Word} feature.

* If you are interested in the CKBox asset manager, check the [CKBox quick start](https://ckeditor.com/docs/ckbox/latest/guides/quick-start.html) guide for a short instruction on how to start using CKBox.
