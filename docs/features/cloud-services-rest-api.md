---
category: cloud-services
meta-title: Cloud Services REST API | CKEditor 5 Documentation
meta-description: Available RESTful APIs of the Cloud Services platfrom.
menu-title: REST API
modified_at: 2025-05-20
order: 20
badges: [ premium ]
---

# Cloud Services RESTful APIs

CKEditor Cloud Services offer several REST APIs that can be used for server integration. They provide a lot of powerful methods that make it possible to control and manage data.

The APIs currently include:

* **CKEditor Cloud Services Restful APIs** &ndash; Provides a full-featured RESTful API that you can use to create a server-to-server integration. The API documentation is available at [https://help.cke-cs.com/api/docs/](https://help.cke-cs.com/api/docs/). It is an aggregator of all Restful APIs currently available.
* **CKBox Restful API** &ndash; Provides an API for managing data stored in the CKBox. The API documentation is available at [https://api.ckbox.io/api/docs](https://api.ckbox.io/api/docs).
* **HTML to PDF Converter API** &ndash; Provides an API for converting HTML/CSS documents to PDF format. The API documentation is available at [https://pdf-converter.cke-cs.com/docs](https://pdf-converter.cke-cs.com/docs).
* **HTML to DOCX Converter API** &ndash; Provides an API for converting HTML documents to Microsoft Word `.docx` files. The API documentation is available at [https://docx-converter.cke-cs.com/docs#section/Export-to-Word](https://docx-converter.cke-cs.com/docs#section/Export-to-Word)
* **DOCX to HTML Converter API** &ndash; Provides an API for converting Microsoft Word `.docx`/`.dotx` files to HTML documents. The API documentation is available at [https://docx-converter.cke-cs.com/docs#section/Import-from-Word](https://docx-converter.cke-cs.com/docs#section/Import-from-Word).

## Usage

Each method can be used for different purposes. For example, the REST API methods for comments allow for synchronizing comments between CKEditor Cloud Services and another system. In addition to that, CKEditor Cloud Services can be used as a database for comments because it is possible to download them via the REST API at the time they are being displayed.

An example of using another API method is getting the content of the document from a collaborative editing session. This feature can be used to build an autosave mechanism for the document, which should reduce transfer costs &ndash; autosave requests are not executed by each connected user but only by the system once at a time.

<info-box warning>
When using REST APIs, data can be removed or modified via DELETE or PUT/PATCH methods. These operations cannot be reversed.
</info-box>

## Webhooks

Webhooks resemble a notification mechanism that can be used to build integrations with CKEditor Cloud Services. CKEditor Cloud Services sends an HTTP POST request to a configured URL when specified events are triggered.

Webhooks can be used for data synchronization between CKEditor Cloud Services and another system or to build a notifications system. For example, thanks to webhooks, the system might notify the users via email about changes made in the document.

To learn more about CKEditor Environment webhooks, refer to the [Webhooks guide](https://ckeditor.com/docs/cs/latest/developer-resources/webhooks/overview.html) in the Cloud Services documentation.
