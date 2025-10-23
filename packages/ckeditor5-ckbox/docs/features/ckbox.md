---
category: features-file-management
menu-title: CKBox
meta-title: CKBox file manager | CKEditor 5 Documentation
meta-description: Learn all about using the CKBox asset manager and service with CKEditor 5.
modified_at: 2022-06-20
order: 10
badges: [ premium ]
---

# CKBox file manager

CKBox is a dedicated asset manager and management platform service that provides a comprehensive digital asset management experience for CKEditor 5. 

It handles file uploads and significantly reduces the effort required to build a complete modern editing solution that supports optimized and {@link features/images-responsive responsive images}. Functionally, CKBox replaces the basic CKEditor&nbsp;5 image upload feature by integrating a comprehensive file manager.

{@snippet getting-started/unlock-feature}

## How CKBox enhances CKEditor&nbsp;5

CKBox streamlines the entire media content lifecycle from uploading and storing to management and display. By integrating CKBox, you enhance editing and accelerate content creation for your team.

CKBox works natively with CKEditor&nbsp;5. Implementation is straightforward, saving you time and money.

### Before you start

<info-box>
	This is a premium feature. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs.
	You can also sign up for the [CKEditor Premium Features 14-day free trial](https://portal.ckeditor.com/checkout?plan=free) to test the feature.
	If you already have a valid license, please log into your [Customer Portal](https://portal.ckeditor.com/) to access the feature settings.
</info-box>

### Key features 

<table>
	<thead>
		<tr>
			<th width="30%">CKEditor&nbsp;5 Integration Capabilities</th>
			<th width="70%">Details</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Effortless Uploads</td>
			<td>
                Enables drag and drop uploads of images and files directly into CKEditor&nbsp;5, as well as image pasting from the clipboard, Word, and Google Docs.
            </td>
		</tr>
		<tr>
			<td>Image Editing</td>
			<td>
                Provides an intuitive image editor for basic operations such as cropping, resizing, and rotating. Basic editing capabilities (crop, resize, rotate, flip) are available directly from the image contextual toolbar for CKBox-served images. 
            </td>
		</tr>
		<tr>
			<td>Management UI</td>
			<td>
                Adds a dedicated toolbar button to open the CKBox UI for managing and reusing uploaded files. Non-embeddable files (such as PDFs) are inserted as links automatically.
            </td>
		</tr>
		<tr>
			<td>Asset Separation</td>
			<td>
                Supports multi-tenant workspaces to separate assets per user, document, or customer.
            </td>
		</tr>
        <tr>
            <td>User Experience and SEO</td>
            <td>
                CKBox simplifies the use of responsive images served from a CDN, improving loading times, boosting SEO, and increasing conversions.
            </td>
        </tr>
        <tr>
            <td>Bandwidth Savings</td>
            <td>
                Out-of-the-box support for the most modern image formats, CKBox can save up to 90% of bandwidth if your application doesn't yet support responsive images, or up to 34% compared to relying on responsive JPG/PNG images.
            </td>
        </tr>
        <tr>
            <td>Security and Administration</td>
            <td>
                Manage asset security and compliance using configurable permissions across workspaces, categories, and user groups.
            </td>
        </tr>
    </tbody>
</table>

With CKBox you no longer need to write server-side code to upload and scale images or manage uploaded files.

## Hosting options

CKBox offers significant architectural flexibility, providing users with full control of their data by supporting diverse deployment scenarios. CKBox is available for both cloud (SaaS) and on-premises (self-hosted) installation:

<table>
    <thead>
		<tr>
			<th style="width: 30%;">Option</th>
			<th style="width: 70%;">Benefits</th>
		</tr>
	</thead>
    <tbody>
        <tr>
			<td>SaaS</td>
			<td>
                Offers hassle-free, maintenance-free usage. We manage the cloud infrastructure to keep it secure and up-to-date, perform regular backups of your files, ensure automatic scaling, and guarantee maximum security and high availability. Assets are served via a secure and blazing-fast CDN.
            </td>
		</tr>
        <tr>
			<td>On-premises Option (Self-Hosted)</td>
			<td>
                Allows you to host CKBox yourself. It can be installed anywhere, including AWS, Azure, Google Cloud, or your own data center. It runs with any Open Container runtime tool (e.g., Kubernetes, Docker, OpenShift, Podman) and supports various storage types like S3, Azure Blob Storage, MySQL, Postgres, and local filesystem.
            </td>
		</tr>
    </tbody>
</table>

To find out more about CKBox, the brand-new file manager and image editor, visit the [CKBox website](https://ckeditor.com/ckbox/) and read the dedicated [CKBox documentation page](https://ckeditor.com/docs/ckbox/latest/guides/index.html). 

You can read more about the storage options in the dedicated [CKBox Deployment](https://ckeditor.com/docs/cs/latest/onpremises/ckbox-onpremises/deployment.html) guide.

## Demo

To upload a file using CKBox, use the open file manager toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/browse-files.svg Open file manager}. You can choose more than one file at a time. Use the edit image button {@icon @ckeditor/ckeditor5-icons/theme/icons/ckbox-image-edit.svg} from either the main toolbar or the image contextual toolbar to edit the selected image.

Note that the image toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/image-upload.svg Image upload} will now also upload images right into the CKBox file manager and you can {@link features/drag-drop drag and drop} them, too. You can then access the files from the management panel.

{@snippet features/ckbox}

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

Image files are inserted into the content as images that you can drag around and resize. Non-embeddable files (like PDF files) are inserted as links.

You can also upload images by dragging them into your content. After you drag an image into the editor, it gets uploaded into the CKBox cloud storage and inserted into the content.

## Installation

CKBox offers two primary methods for loading the library: using a Content Delivery Network (CDN) for fast, script-based integration, or using a Package Manager (npm/yarn) for modern application bundles.

### Method 1: Installation from CDN

The easiest way to load the CKBox library is by including a `<script>` tag in your HTML header that points to the CKBox CDN. You must include the script tag loading the ckbox.js file first:

```html
<script src="https://cdn.ckbox.io/ckbox/{%CKBOX_VERSION%}/ckbox.js"></script>
```

When referencing the CKBox library via CDN, you must specify the version number (e.g., `{%CKBOX_VERSION%}` or `latest`).

<info-box>
**Important note on versioning**
While the ability to use the shorthand `latest` tag instead of a specific version number is available, it is strongly advised against. The use of the latest tag may inadvertently introduce breaking changes into your application, which could cause your CKBox integration to stall unexpectedly.
</info-box>

Suppose you wish to change the default language of the CKBox, which supports over 40 official translations. In that case, you must ensure you load the corresponding translation file after loading the main CKBox library. For example, to load the Spanish translation (es):

```html
<script src="https://cdn.ckbox.io/ckbox/{%CKBOX_VERSION%}/ckbox.js"></script>
<script src="https://cdn.ckbox.io/ckbox/{%CKBOX_VERSION%}/translations/es.js"></script>
```

Once imported, you can use it within your application:

```html
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{%CKBOX_VERSION%}/ckeditor5.css">
	</head>
	<body>
		<div id="editor"></div>
        <script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
        <script src="https://cdn.ckbox.io/ckbox/{%CKBOX_VERSION%}/ckbox.js"></script>
		<script>
			const { ClassicEditor, LinkEditing, Image, ImageUpload, PictureEditing, CKBox, CKBoxImageEdit, CloudServices } = CKEDITOR;

			ClassicEditor
				.create( document.querySelector( '#editor' ), {
					licenseKey: '<YOUR_LICENSE_KEY>',
					plugins: [ LinkEditing, Image, PictureEditing, ImageUpload, CloudServices, CKBox, CKBoxImageEdit, /* ... */ ],
					toolbar: ['imageUpload', 'ckbox', 'ckboxImageEdit', /* ... */ ], // Depending on your preference.
					ckbox: {
						// Configuration.
					}
				} )
				.then( /* ... */ )
				.catch( /* ... */ );
		</script>
	</body>
</html>
```

### Method 2: Installation from npm

For applications using modern bundling tools (such as Webpack or Vite) and package managers (npm, yarn, pnpm), CKBox components should be installed as dependencies and imported into your CKEditor 5 build.

<info-box>
**Licensing Requirement**

CKBox is a premium feature. Using the npm/yarn distribution channel (Self-hosted) requires having an appropriate commercial plan or a Custom plan that permits the use of the editor via npm or a ZIP package.

You can [sign up](https://portal.ckeditor.com/checkout?plan=free) for the CKEditor Premium Features 14-day free trial to test the feature. If you already have a license, you should log in to your Customer Portal Dashboard to access feature settings and credentials.
</info-box>

First, install the necessary dependencies:

```bash
npm install ckeditor5 ckbox
```

Once the packages are installed, you can import the necessary modules directly into your application code and use them within your application:

```js
import { ClassicEditor, Image, ImageUpload, PictureEditing, CKBox, CKBoxImageEdit, CloudServices } from 'ckeditor5';
import * as ckbox from 'ckbox';
import 'ckbox/dist/styles/ckbox.css';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ LinkEditing, Image, PictureEditing, ImageUpload, CloudServices, CKBox, CKBoxImageEdit, /* ... */ ],
		toolbar: [ 'imageUpload', 'ckbox', 'ckboxImageEdit', /* ... */ ], // Depending on your preference.
		ckbox: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Configuration

The feature can be configured via the {@link module:ckbox/ckboxconfig~CKBoxConfig `config.ckbox`} object.

### Defining upload categories

By default, the CKBox feature maps the uploaded image type to the category configured on the cloud service. You can override this behavior and provide your own mappings via the {@link module:ckbox/ckboxconfig~CKBoxConfig#defaultUploadCategories `config.ckbox.defaultUploadCategories`} configuration option. It is an object, where the keys define categories and their values are the types of images that will be uploaded to these categories. The categories might be referenced either by their name or by their ID. Referencing by ID is future-proof because it will not require configuration changes when a category name changes.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			defaultUploadCategories: {
				Bitmaps: [ 'bmp' ],
				Pictures: [ 'jpg', 'jpeg' ],
				Scans: [ 'png', 'tiff' ],
				// The category below is referenced by its ID.
				'fdf2a647-b67f-4a6c-b692-5ba1dc1ed87b': [ 'gif' ]
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

If you define your own upload category mappings for a particular image type, only your first found category will be taken into account while finding the appropriate category for the uploaded image. Category mappings configured on the server will not be searched in that case. The image will not be uploaded (and hence inserted into the editor) in the following cases:

* If you have defined your own category mapping in `defaultUploadCategories` for the uploaded image type:
   * The category does not exist on the server.
   * The category exists on the server, but the server configuration does not allow the uploaded image type.
* If you have not defined your own category mapping in `defaultUploadCategories` for the uploaded image type:
   * There is no category mapping for the uploaded image type on the server.

### Defining default upload workspace

The [CKBox workspaces](https://ckeditor.com/docs/ckbox/latest/features/file-management/workspaces.html) provide a convenient solution for achieving data isolation and user separation within CKBox. With workspaces, you can easily create separate storage and data spaces, giving you precise control over assigning specific users, user groups, or tenants to each workspace.

If the user is assigned to more than one workspace, by default all the files uploaded directly from CKEditor are located in the first workspace in the list of workspaces allowed in the user's JWT token. This corresponds to uploads through drag and drop into the editor area, pasting images from the clipboard, or images uploaded using the Image {@icon @ckeditor/ckeditor5-icons/theme/icons/image-upload.svg Image} feature. If you would like to define a specific workspace for files uploaded this way, you can define its ID in the `defaultUploadWorkspaceId` option. After that, all the files uploaded directly from CKEditor will be placed in the specified workspace.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			tokenUrl: 'https://your.token.url',
			// Sample workspace referenced by its ID.
			defaultUploadWorkspaceId: [ 'pHUSQFj_QIvc' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

You can obtain the list of available workspaces using the [Workspaces REST API](https://ckeditor.com/docs/ckbox/latest/features/file-management/workspaces.html#managing-workspaces-with-the-rest-api).

### Adding the ID for inserted assets

After choosing an asset from the CKBox dialog, it is inserted into the editor content with a unique `data-ckbox-resource-id` attribute. If you want to disable it and do not want to add this attribute, set the {@link module:ckbox/ckboxconfig~CKBoxConfig#ignoreDataId `config.ckbox.ignoreDataId`} option to `true`:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			ignoreDataId: true
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Changing the language

By default, the CKBox dialog takes the current language from the editor. If you want to use a different language, you can set the language code in the {@link module:ckbox/ckboxconfig~CKBoxConfig#language `config.ckbox.language`} option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			language: 'es'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

Also, make sure to include the translation file after loading the CKBox library:

```html
<script src="https://cdn.ckbox.io/ckbox/{%CKBOX_VERSION%}/ckbox.js"></script>
<script src="https://cdn.ckbox.io/ckbox/{%CKBOX_VERSION%}/translations/es.js"></script>
```

### Providing the token URL

The CKBox feature requires the token endpoint URL configured in the {@link module:ckbox/ckboxconfig~CKBoxConfig#tokenUrl `config.ckbox.tokenUrl`} key. If not explicitly provided, the token URL from {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`} is used instead. If both are provided, the token URL defined in `config.ckbox.tokenUrl` takes precedence over the `config.cloudServices.tokenUrl`.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			tokenUrl: 'https://example.com/cs-token-endpoint'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Configuring the API service

If you host the cloud service in your environment, you should configure the base URL of the API service via the {@link module:ckbox/ckboxconfig~CKBoxConfig#serviceOrigin `config.ckbox.serviceOrigin`} option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			serviceOrigin: 'https://example.com/'
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Editing external images

If you want to allow CKBox to edit external images, not hosted by the file manager (for example, pasted via URL) you need to whitelist the URLs of the images. You can do this using the {@link module:ckbox/ckboxconfig~CKBoxConfig#allowExternalImagesEditing `config.ckbox.allowExternalImagesEditing`} option:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		ckbox: {
			allowExternalImagesEditing: [ 'origin', /^cksource.com/ ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

The image is editable if this option is:

* a regular expression and it matches the image URL, or
* a custom function that returns true for the image URL, or
* `origin` literal and the image URL is from the same origin, or
* an array of the above and the image URL matches one of the array elements.

<info-box warning>
	Make sure that the domains you whitelist have <acronym title="Cross-origin resource sharing">CORS</acronym> enabled, allowing to fetch the images from that domain. If you whitelist a domain without proper CORS configuration, you will get errors from the editor.
</info-box>

## Common API

The {@link module:ckbox/ckbox~CKBox} plugin registers:

* The `'ckbox'` UI button component for CKBox asset manager.
* The `'ckbox'` command implemented by the {@link module:ckbox/ckboxcommand~CKBoxCommand}.

You can open CKBox by executing the following code:

```js
editor.execute( 'ckbox' );
```

If you want to use the CKBox editing capabilities straight from the editor, the plugin will also register the following:

* The `'ckboxImageEdit'` UI button component for the CKBox image editor.
* The `'ckboxImageEdit'` command implemented by the {@link module:ckbox/ckboximageedit~CKBoxImageEdit}.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## REST API

The CKBox REST API allows managing files and configuration of the drive. Read the [REST API documentation](https://api.ckbox.io/api/docs) to find out how to employ it in your implementation.

## What's next

Be sure to check out the comprehensive {@link features/image-upload Image upload overview} guide to learn more about different ways of uploading images in CKEditor&nbsp;5.

See the {@link features/images-overview image feature} guide to find out more about handling images in CKEditor&nbsp;5 in general.

<info-box warning>
	Need more functionality? [Take a survey and help us develop CKBox to suit your needs better!](https://www.surveymonkey.com/r/MG97W8S)
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckbox](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-ckbox).
