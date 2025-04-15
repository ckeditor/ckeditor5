---
menu-title: Salesforce
meta-title: Salesforce integration using a ZIP archive | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with Salesforce using a ZIP archive
category: self-hosted
order: 100
modified_at: 2025-04-04
---

# Integrate CKEditor&nbsp;5 with Salesforce

Salesforce is a cloud-based Customer Relationship Management (CRM) platform that enables organizations to manage customer interactions, sales processes, and business operations. The platform supports custom development through its Lightning Platform (formerly Force.com), allowing developers to create custom objects, fields, pages, and components. While [CKEditor&nbsp;5 does not support Shadow DOM yet](https://github.com/ckeditor/ckeditor5/issues/3891), which is required by Lightning modules, it can be integrated into Salesforce using [Visualforce pages](https://help.salesforce.com/s/articleView?id=platform.pages_pages.htm&type=5). This integration approach enables rich text editing capabilities within Salesforce applications.

{@snippet getting-started/use-builder}

## Prerequisites

This section assumes you are working within the [Salesforce development platform](https://www.salesforce.com/form/developer-signup). We will guide you through creating a new Visualforce page that incorporates CKEditor&nbsp;5. Visualforce pages provide a way to create custom user interfaces in Salesforce using a markup language similar to HTML, making it an ideal solution for integrating third-party components like CKEditor&nbsp;5.

## Creating a Visualforce page

<info-box>
	The Visualforce page with CKEditor&nbsp;5 will be displayed in an iframe after embedding it in your Lightning page.
</info-box>

To start the integration, you need to create a new Visualforce page that will be used for the CKEditor&nbsp;5 integration. Navigate to the *Setup* page of your development platform and use the search input to find *Visualforce pages*.

{@img assets/img/salesforce-integration-1.png Screenshot of the Salesforce setup page.}

Enter the Visualforce pages tab and add a new page by clicking the *New* button. You should see a form that allows adding new pages, along with a code editor containing the default page markup.

{@img assets/img/salesforce-integration-2.png Screenshot of the new Visualforce page form.}

Fill out the required fields in the form, check the *Available for Lightning Experience, Experience Builder sites, and the mobile app* checkbox, then save the page. You are now ready to integrate the editor.

## Integrating CKEditor&nbsp;5 in Visualforce page using a ZIP archive

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from ZIP:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

### Preparing the ZIP package with CKEditor&nbsp;5

Before starting the Salesforce integration, you need to prepare a ZIP package with CKEditor&nbsp;5 that will be used inside your Visualforce page. CKEditor&nbsp;5 offers an Online Builder that allows you to easily configure your editor through a user-friendly interface. The Online Builder provides a convenient way to select features, plugins, and customize the toolbar according to your specific requirements without writing any code.

To create your custom CKEditor&nbsp;5 build, visit the [CKEditor&nbsp;5 Online Builder](https://ckeditor.com/ckeditor-5/online-builder/). After configuring all the desired features and settings for your editor, you will reach the final step where you can choose your preferred technology and integration method. For Salesforce integration, select "Vanilla JavaScript" as your technology and "Self-hosted (ZIP)" as your integration method. This selection will generate and download a ZIP archive containing your customized editor.

The downloaded ZIP archive includes all the necessary files for integrating CKEditor&nbsp;5 into your Salesforce Visualforce page, including the main JavaScript file, CSS styles, and sample implementation code. This package is ready for integration and does not require any additional build steps. Once you have your custom CKEditor&nbsp;5 build, you can proceed with uploading these resources to Salesforce as static resources, which we will cover in the next section.

{@snippet getting-started/use-builder}

### Uploading CKEditor&nbsp;5 files as static resources

To use CKEditor&nbsp;5 in your Visualforce page, you need to upload the editor files as static resources in Salesforce. Static resources allow you to store assets like JavaScript files, CSS files, images, and other web resources that can be referenced in your Visualforce pages.

First, extract the downloaded ZIP package to access the `ckeditor5` directory containing `ckeditor5.umd.js` and `ckeditor5.css` files. After extraction, navigate to the Salesforce Setup page and search for "Static Resources" in the Quick Find box.

{@img assets/img/salesforce-integration-sh-1.png Screenshot of searching for Static Resources in Salesforce setup.}

Click on "Static Resources" to open the Static Resources page. From there, click the "New" button to create a new static resource.

{@img assets/img/salesforce-integration-sh-2.png Screenshot of the Static Resources page with New button.}

When creating a static resource for the JavaScript file, fill in the form with a name such as "CKEditor5JS" and an optional description like "CKEditor&nbsp;5 JavaScript file". Click "Choose File" to select the `ckeditor5.umd.js` file from your extracted package. For Cache Control, select "Public" to allow the browser to cache the resource. Click "Save" to upload the JavaScript file.

You will need to repeat this process for the CSS file. Create another static resource with a name like "CKEditor5CSS" and a description such as "CKEditor&nbsp;5 CSS file". Select the `ckeditor5.css` file and set Cache Control to "Public" before saving.

After uploading both files, they will appear in your Static Resources list and can be referenced in your Visualforce page.

{@img assets/img/salesforce-integration-sh-3.png Screenshot of static resources in Salesforce.}

<info-box>
	If you are using premium features, you will need to upload those files as separate static resources as well.
</info-box>

Once your static resources are uploaded, you can reference them in your Visualforce page using the `$Resource` global variable with the `<apex:includeScript>` and `<apex:stylesheet>` tags, as shown in the next section.

### Setting up the page structure

Visualforce pages use a markup language similar to HTML, but with special tags prefixed with `apex:`. Every Visualforce page must be wrapped in an `<apex:page>` tag, which serves as the root element. This tag can include various attributes to control the page's behavior, such as `docType`, `showHeader`, and `standardStylesheets`. Inside this wrapper, you can use standard HTML elements along with Visualforce-specific components to build your page layout and functionality.

For our CKEditor&nbsp;5 integration, we will use a basic page structure that includes necessary JavaScript and CSS resources, along with a container for the editor. The page markup will look similar to this:

```html
<apex:page showHeader="false" standardStylesheets="false" docType="html-5.0">
	<head>
		<!-- Resources will be added here -->
	</head>
	<body>
		<!-- Editor container will be added here -->
	</body>
</apex:page>
```

### Adding CKEditor&nbsp;5 static resources

We will start from adding resources required for running CKEditor&nbsp;5 (CSS and JavaScript) to the `<head>` tag using the static resources we uploaded in the previous step. We will use Visualforce's `<apex:includeScript>` and `<apex:stylesheet>` tags to reference these resources:

```html
<apex:page showHeader="false" standardStylesheets="false" docType="html-5.0">
	<head>
		<!-- Load CKEditor&nbsp;5 JavaScript and CSS from static resources -->
		<apex:includeScript value="{!$Resource.CKEditor5JS}"/>
		<apex:stylesheet value="{!$Resource.CKEditor5CSS}"/>
	</head>
	<body>
		<!-- Editor container will be added here -->
	</body>
</apex:page>
```

### Initializing the editor

Now, we can add the container that will hold our editor and introduce an initialization script with the basic editor configuration:

```html
<apex:page showHeader="false" standardStylesheets="false" docType="html-5.0">
	<head>
		<!-- JavaScript and CSS resources-->
	</head>
	<body>
		<!-- Editor container -->
		 <div id="editor" style="min-height: 300px; border: 1px solid #ccc;"></div>

		 <!-- Initialization script -->
		  <script type="module">
			const {
				ClassicEditor,
				Essentials,
				Bold,
				Italic,
				Font,
				Paragraph
			} = CKEDITOR;

			ClassicEditor
				.create( document.querySelector( '#editor' ), {
					licenseKey: '<YOUR-LICENSE-KEY>' // Or 'GPL',
					plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
					toolbar: [
						'undo', 'redo', '|', 'bold', 'italic', '|',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
					]
				} )
				.then( /* ... */ )
				.catch( /* ... */ );
	   </script>
	</body>
</apex:page>
```

### Complete integration code

Putting everything together, the full integration code looks as follows (remember to insert your license key in the editor configuration):

```html
<apex:page showHeader="false" standardStylesheets="false" docType="html-5.0">
	<head>
		<!-- Load CKEditor&nbsp;5 JavaScript and CSS from static resources -->
		<apex:includeScript value="{!$Resource.CKEditor5JS}"/>
		<apex:stylesheet value="{!$Resource.CKEditor5CSS}"/>
	</head>
	<body>
		<!-- Editor container -->
		 <div id="editor" style="min-height: 300px; border: 1px solid #ccc;">CKEditor&nbsp;5 integration with Salesforce.</div>

		 <!-- Initialization script -->
		  <script type="module">
			const {
				ClassicEditor,
				Essentials,
				Bold,
				Italic,
				Font,
				Paragraph
			} = CKEDITOR;

			ClassicEditor
				.create( document.querySelector( '#editor' ), {
					licenseKey: '<YOUR-LICENSE-KEY>' // Or 'GPL',
					plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
					toolbar: [
						'undo', 'redo', '|', 'bold', 'italic', '|',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
					]
				} )
				.then( /* ... */ )
				.catch( /* ... */ );
		</script>
	</body>
</apex:page>
```

Now, you can save your component and click the *Preview* button to see it live. A new page should open in your browser, and you should see the CKEditor&nbsp;5 instance:

{@img assets/img/salesforce-integration-sh-4.png Screenshot of CKEditor&nbsp;5 inside the Visualforce component.}

## Using CKEditor&nbsp;5 Visualforce component in Lightning page

Now that we have created our CKEditor&nbsp;5 Visualforce page, we can embed it into a Lightning page. This process involves adding the Visualforce page as a component within your Lightning page layout. To do this, navigate to the Lightning App Builder, where you can drag and drop the Visualforce page component onto your desired location in the page layout. The editor will be displayed within an iframe, maintaining its full functionality while being seamlessly integrated into your Lightning page.

Let's go through the steps to add our CKEditor&nbsp;5 component to a Lightning page:

To add your CKEditor&nbsp;5 component to a Lightning page, first navigate to the Lightning App Builder. Once there, either select an existing Lightning page or create a new one where you want to incorporate the editor. Next, locate the Visualforce page component in the components panel and add it to your desired position in the layout. After adding the component, configure its settings and specifically select your CKEditor&nbsp;5 component from the available options. Finally, save your changes and activate the Lightning page to make it available to users.

You should end up with something similar to this:

{@img assets/img/salesforce-integration-sh-5.png Screenshot of Lightning App builder.}

Now, you can view your Lightning page and use your editor:

{@img assets/img/salesforce-integration-sh-6.png Screenshot of CKEditor&nbsp;5 inside a Lightning page.}

## Distributing your CKEditor&nbsp;5 component

To make your CKEditor&nbsp;5 Visualforce component available to other Salesforce users, you can create a package. This allows you to distribute your component as a standalone solution that can be easily installed in other Salesforce environments.

### Creating a package

To create a package, navigate to the Salesforce Setup page and use the Quick Find box to search for *Packages*. Click the *New* button to start creating your package. In the package creation form, provide a meaningful name like "CKEditor&nbsp;5 Integration" and a clear description that explains the purpose of your component. Set the initial version to "1.0" and consider selecting "Managed Package" if you want to maintain control over future updates. This option allows you to push updates to all installations of your package.

### Adding components to the package

After creating the package, you will need to add your CKEditor&nbsp;5 Visualforce page to it. In the package details page, use the *Add* button to include new components. Select "Visualforce Page" from the component type dropdown and choose your CKEditor&nbsp;5 Visualforce page from the list. This will include all the necessary code and resources in your package.

### Uploading the package

Once you have added all required components, you can upload your package. The upload process involves choosing whether to make the package public or private. Public packages are visible in the Salesforce AppExchange, while private packages are only accessible via direct installation links. After selecting the visibility option and accepting the terms and conditions, click *Upload* to make your package available for distribution.

### Installing the package

After the upload is complete, you will receive an installation URL that looks like this:

```
https://login.salesforce.com/packaging/installPackage.apexp?p0=04td20000002WVF&isdtp=p1
```

Users can install your package by logging into their Salesforce account and visiting this URL. The installation process will guide them through granting necessary permissions and configuring the component in their environment.

<info-box>
	The package installation requires a production Salesforce account. Users installing the package will need appropriate permissions in their Salesforce environment.
</info-box>

After installation, users can add the CKEditor&nbsp;5 component to their Lightning pages following the steps described in the [Using CKEditor&nbsp;5 Visualforce component in Lightning page](#using-ckeditor-5-visualforce-component-in-lightning-page) section.