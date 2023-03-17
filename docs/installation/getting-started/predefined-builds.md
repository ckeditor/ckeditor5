---
menu-title: Predefined builds
category: getting-started
order: 20
modified_at: 2022-07-12
---

# Predefined CKEditor 5 builds

## Overview

Predefined CKEditor 5 builds are a set of ready-to-use rich text editors. Every "build" provides a single type of editor with a set of features and a default configuration. They provide convenient solutions that can be installed with no effort and that satisfy the most common editing use cases.

The following CKEditor 5 builds are currently available:

 * [Classic editor](#classic-editor)
 * [Inline editor](#inline-editor)
 * [Balloon editor](#balloon-editor)
 * [Balloon block editor](#balloon-block-editor)
 * [Document editor](#document-editor)
 * [Multi-root editor](#multi-root-editor)
 * [Superbuild](#superbuild)


## Basic information

Each build was designed to satisfy as many use cases as possible. They differ in their UI, UX and features. A [full list of plugins available in each build](#list-of-plugins-included-in-the-ckeditor-5-predefined-builds) can be found in a later part of this guide.

### When NOT to use predefined builds?

{@link framework/index CKEditor 5 Framework} or a {@link installation/getting-started/quick-start-other custom build} should be used, instead of predefined builds, in the following cases:

* When you want to create your own text editor and have full control over its every aspect, from UI to features.
* When the solution proposed by the builds does not fit your specific use case.

### Download options

There are several options to download predefined CKEditor 5 builds:

* [CDN](#cdn)
* [npm](#npm)
* [Online builder](#online-builder)
* [Zip download](#zip-download)

#### CDN

Predefined CKEditor 5 builds {@link installation/getting-started/quick-start can be loaded inside pages} directly from [CKEditor CDN](https://cdn.ckeditor.com/#ckeditor5), which is optimized for worldwide super-fast content delivery. When using CDN no download is actually needed.  CKEditor is hosted on servers spread across the globe &ndash; the scripts are loaded faster because they are served from the nearest locations to the end user. If the same version of CKEditor has already been downloaded (even on a different website), it is loaded from cache. Using CDN reduces the number of HTTP requests handled by your server so it speeds it up as well.

However, CDN only offers ready-to-use, predefined packages (CKEditor 5 builds). This limits its customization capabilities.

#### npm

All predefined builds are released on npm. [Use this search link](https://www.npmjs.com/search?q=keywords%3Ackeditor5-build%20maintainer%3Ackeditor) to view all official build packages available in npm.

Installing a build with npm is as simple as calling one of the following commands in your project:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
# Or:
npm install --save @ckeditor/ckeditor5-build-inline
# Or:
npm install --save @ckeditor/ckeditor5-build-balloon
# Or:
npm install --save @ckeditor/ckeditor5-build-balloon-block
# Or:
npm install --save @ckeditor/ckeditor5-build-decoupled-document
```

CKEditor 5 will then be available at `node_modules/@ckeditor/ckeditor5-build-[name]/build/ckeditor.js`. It can also be imported directly to your code by `require( '@ckeditor/ckeditor5-build-[name]' )`.

#### Online builder

The [online builder](https://ckeditor.com/ckeditor-5/online-builder/) lets you download CKEditor 5 builds and also allows you to create your own, customized builds (with a different set of plugins) in a few easy steps, through a simple and intuitive UI.

#### Zip download

Go to the [CKEditor 5 download page](https://ckeditor.com/ckeditor-5/download/) and download your preferred build. For example, you may download the `ckeditor5-build-classic-32.0.0.zip` file for the classic editor build.

Extract the `.zip` file into a dedicated directory inside your project. It is recommended to include the editor version in the directory name to ensure proper cache invalidation once a new version of CKEditor 5 is installed.

##### Included files

* `ckeditor.js` &ndash; The ready-to-use editor bundle, containing the editor and all plugins.
* `ckeditor.js.map` &ndash; The source map for the editor bundle.
* `translations/` &ndash; The editor UI translations (see {@link features/ui-language Setting the UI language}).
* `README.md` and `LICENSE.md`

### Loading the API

After downloading and installing a predefined CKEditor 5 build in your application, it is time to make the editor API available in your pages. For that purpose, it is enough to load the API entry point script:

```html
<script src="[ckeditor-build-path]/ckeditor.js"></script>
```

Once the CKEditor script is loaded, you can {@link installation/getting-started/editor-lifecycle use the API} to create editors in your page.

<info-box>
	The `build/ckeditor.js` file is generated in the [UMD format](https://github.com/umdjs/umd) so you can also import it into your application if you use CommonJS modules (like in Node.js) or AMD modules (like in Require.js). Read more in the {@link installation/getting-started/predefined-builds#umd-support UMD support section}.
</info-box>

## Available builds

### Classic editor

Classic editor is what most users traditionally learnt to associate with a rich-text editor &mdash; a toolbar with an editing area placed in a specific position on the page, usually as a part of a form that you use to submit some content to the server.

During its initialization the editor hides the used editable element on the page and renders "instead" of it. This is why it is usually used to replace `<textarea>` elements.

In CKEditor 5 the concept of the "boxed" editor was reinvented:

 * The toolbar is now always visible when the user scrolls the page down.
 * The editor content is now placed inline in the page (without the surrounding `<iframe>` element) &mdash; it is now much easier to style it.
 * By default the editor now grows automatically with the content.

{@img assets/img/editor-classic.png 778 Screenshot of a classic editor.}

To try it out online, check the {@link examples/builds/classic-editor classic editor example}.

#### Installation example

In your HTML page add an element that CKEditor 5 should replace:

```html
<div id="editor"></div>
```

Load the classic editor build (here, the [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
```

Alternatively, you may install CKEditor 5 from `npm`:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

Then bundle it together with your app.

Call the {@link module:editor-classic/classiceditor~ClassicEditor#create `ClassicEditor.create()`} method.

```html
<script>
	ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

Full code example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Classic editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/classic/ckeditor.js"></script>
</head>
<body>
	<h1>Classic editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		ClassicEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

### Inline editor

Inline editor comes with a floating toolbar that becomes visible when the editor is focused (e.g. by clicking it). Unlike classic editor, inline editor does not render *instead* of the given element, it simply makes it editable. As a consequence the styles of the edited content will be exactly the same before and after the editor is created.

A common scenario for using inline editor is offering users the possibility to edit content in its real location on a web page instead of doing it in a separate administration section.

{@img assets/img/editor-inline.png 776 Screenshot of an inline editor.}

To try it out online, check the {@link examples/builds/inline-editor inline editor example}.

#### Installation example

In your HTML page add an element that CKEditor 5 should make editable:

```html
<div id="editor"></div>
```

Load the inline editor build (here, the [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/inline/ckeditor.js"></script>
```

Alternatively, you may install CKEditor 5 from `npm`:

```bash
npm install --save @ckeditor/ckeditor5-build-inline
```

Then bundle it together with your app.

Call the {@link module:editor-inline/inlineeditor~InlineEditor#create `InlineEditor.create()`} method.

```html
<script>
	InlineEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

Full code example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 - Inline editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/inline/ckeditor.js"></script>
</head>
<body>
	<h1>Inline editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		InlineEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

### Balloon editor

Balloon editor is very similar to inline editor. The difference between them is that the toolbar appears in a balloon next to the selection (when the selection is not empty):

{@img assets/img/editor-balloon.png 789 Screenshot of a balloon toolbar editor.}

To try it out online, check the {@link examples/builds/balloon-editor balloon editor example}.

#### Installation example

In your HTML page add an element that CKEditor 5 should make editable:

```html
<div id="editor"></div>
```

Load the balloon editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon/ckeditor.js"></script>
```

Alternatively, you may install CKEditor 5 from `npm`:

```bash
npm install --save @ckeditor/ckeditor5-build-balloon
```

Then bundle it together with your app.

Call the {@link module:editor-balloon/ballooneditor~BalloonEditor#create `BalloonEditor.create()`} method.

```html
<script>
	BalloonEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

Full example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Balloon editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon/ckeditor.js"></script>
</head>
<body>
	<h1>Balloon editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		BalloonEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

### Balloon block editor

Balloon block is essentially the [balloon editor](#balloon-editor) with an extra block toolbar which can be accessed using the button attached to the editable content area and following the selection in the document. The toolbar gives an access to additional, block–level editing features.

{@img assets/img/editor-balloon-block.png 813 Screenshot of a balloon block toolbar editor.}

To try it out online, check the {@link examples/builds/balloon-block-editor balloon block editor example}.

#### Installation example

In your HTML page add an element that CKEditor 5 should make editable:

```html
<div id="editor"></div>
```

Load the balloon block editor build (here, the [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon-block/ckeditor.js"></script>
```

Alternatively, you may install CKEditor 5 from `npm`:

```bash
npm install --save @ckeditor/ckeditor5-build-balloon-block
```

Then bundle it together with your app.

Call the {@link module:editor-balloon/ballooneditor~BalloonEditor#create `BalloonEditor.create()`} method.

```html
<script>
	BalloonEditor
		.create( document.querySelector( '#editor' ) )
		.catch( error => {
			console.error( error );
		} );
</script>
```

**Note:** You can configure the block toolbar items using the {@link module:core/editor/editorconfig~EditorConfig#blockToolbar `config.blockToolbar`} option.

Full code example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Balloon block editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/balloon-block/ckeditor.js"></script>
</head>
<body>
	<h1>Balloon editor</h1>
	<div id="editor">
		<p>This is some sample content.</p>
	</div>
	<script>
		BalloonEditor
			.create( document.querySelector( '#editor' ) )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

### Document editor

The document editor is focused on rich-text editing experience similar to the native word processors. It works best for creating documents which are usually later printed or exported to PDF files.

{@img assets/img/editor-document.png 843 Screenshot of the user interface of the document editor.}

To try it out online, check the {@link examples/builds/document-editor document editor example}.

#### Installation example

Load the document editor build (here, the [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/decoupled-document/ckeditor.js"></script>
```

Alternatively, you may install CKEditor 5 from `npm`:

```bash
npm install --save @ckeditor/ckeditor5-build-decoupled-document
```

Then bundle it together with your app.

Call the {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`} method. The decoupled editor requires you to inject the toolbar into the DOM and the best place to do that is somewhere in the promise chain (e.g. one of the `then( () => { ... } )` blocks).

<info-box>
	The following snippet will run the document editor but to make the most of it check out the {@link framework/document-editor comprehensive tutorial} which explains step—by—step how to configure and style the application for the best editing experience.
</info-box>

```html
<script>
	DecoupledEditor
		.create( document.querySelector( '#editor' ) )
		.then( editor => {
			const toolbarContainer = document.querySelector( '#toolbar-container' );

			toolbarContainer.appendChild( editor.ui.view.toolbar.element );
		} )
		.catch( error => {
			console.error( error );
		} );
</script>
```

Full code example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – Document editor</title>
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/decoupled-document/ckeditor.js"></script>
</head>
<body>
	<h1>Document editor</h1>

	<!-- The toolbar will be rendered in this container. -->
	<div id="toolbar-container"></div>

	<!-- This container will become the editable. -->
	<div id="editor">
		<p>This is the initial editor content.</p>
	</div>

	<script>
		DecoupledEditor
			.create( document.querySelector( '#editor' ) )
			.then( editor => {
				const toolbarContainer = document.querySelector( '#toolbar-container' );

				toolbarContainer.appendChild( editor.ui.view.toolbar.element );
			} )
			.catch( error => {
				console.error( error );
			} );
	</script>
</body>
</html>
```

### Multi-root editor

Multi-root editor is an editor type that features multiple, separate editable areas.

The main difference between using a multi-root editor and using multiple separate editors is the fact that in a multi-root editor all editable areas belong to the same editor instance share the same configuration, toolbar and the undo stack, and produce one document.

{@img assets/img/editor-multi-root.png 924 Screenshot of a multi-root editor.}

To try it out online, check the {@link examples/builds/multi-root-editor multi-root editor example}.

#### Installation example

In your HTML page add an element that CKEditor 5 should make editable:

```html
<div id="editor"></div>
```

Load the multi-root editor build (here, the [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/multi-root/ckeditor.js"></script>
```

Alternatively, you may install CKEditor 5 from `npm`:

```bash
npm install --save @ckeditor/ckeditor5-build-multi-root
```

Then bundle it together with your app.

Call the {@link module:editor-multi-root/multirooteditor~MultiRootEditor#create `MultiRootEditor.create()`} method.

```html
<script>
MultiRootEditor
    .create(
        // Define roots / editable areas:
        {
            header: document.querySelector( '#header' ),
            content: document.querySelector( '#content' ),
            leftSide: document.querySelector( '#left-side' ),
            rightSide: document.querySelector( '#right-side' )
        },
        // Editor configration:
        {
            cloudServices: {
                // All predefined builds include the Easy Image feature.
                // Provide correct configuration values to use it.
                tokenUrl: 'https://example.com/cs-token-endpoint',
                uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/'
                // Read more about Easy Image - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html.
                // For other image upload methods see the guide - https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html.
            }
        }
    )
    .then( editor => {
        window.editor = editor;

        // Append toolbar to a proper container.
        const toolbarContainer = document.querySelector( '#toolbar' );
        toolbarContainer.appendChild( editor.ui.view.toolbar.element );

        // Make toolbar sticky when the editor is focused.
        editor.ui.focusTracker.on( 'change:isFocused', () => {
            if ( editor.ui.focusTracker.isFocused ) {
                toolbarContainer.classList.add( 'sticky' );
            } else {
                toolbarContainer.classList.remove( 'sticky' );
            }
        } );
    } )
    .catch( error => {
        console.error( 'There was a problem initializing the editor.', error );
    } );
</script>
```

Full code example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>CKEditor 5 – multi-root editor build – development sample</title>
	<style>
		body {
			max-width: 800px;
			margin: 20px auto;
		}

		.editor {
			border: #ccced1 1px solid;
			margin-top: 10px;
		}

		.boxes {
			margin-top: 10px;
			display: flex;
		}

		.box {
			margin-top: 0px;
			width: 50%;
		}

		/*
			Make the editable "fill" the whole box.
			The box will grow if the other box grows too.
			This makes the whole box "clickable".
		 */
		.box .ck-editor__editable {
			height: 100%;
		}

		.box-left {
			margin-right: 10px;
		}

		/*
			When toolbar receives this class, it becomes sticky.
			If the toolbar would be scrolled outside of the visible area,
			instead it is kept at the top edge of the window.
		 */
		#toolbar.sticky {
			position: sticky;
			top: 0px;
			z-index: 10;
		}
	</style>
</head>
<body>
<div id="toolbar"></div>
<!--
    Wrapping the structure inside a pair of
    contenteditable="true" + contenteditable="false" elements
    is required to provide proper caret handling when
    using arrow keys at the start and end of an editable area.

    You can skip them if you don't want to move the
    caret between editable areas using arrow keys.
!-->
<div contenteditable="true">
	<div contenteditable="false">
		<div class="editor">
			<div id="header">
				<p>This is the initial editor content.</p>
			</div>
		</div>
		<div class="editor">
			<div id="content">
				<p>This is the initial editor content.</p>
			</div>
		</div>
		<div class="boxes">
			<div class="box box-left editor">
				<div id="left-side">
					<p>This is the initial editor content.</p>
				</div>
			</div>
			<div class="box box-right editor">
				<div id="right-side">
					<p>This is the initial editor content.</p>
				</div>
			</div>
		</div>
	</div>
</div>

<script src="../build/ckeditor.js"></script>
<script>
	MultiRootEditor
		.create( {
			// Define roots / editable areas:
			header: document.getElementById( 'header' ),
			content: document.getElementById( 'content' ),
			leftSide: document.getElementById( 'left-side' ),
			rightSide: document.getElementById( 'right-side' )
		} )
		.then( editor => {
			window.editor = editor;

			// Append toolbar to a proper container.
			const toolbarContainer = document.getElementById( 'toolbar' );
			toolbarContainer.appendChild( editor.ui.view.toolbar.element );

			// Make toolbar sticky when the editor is focused.
			editor.ui.focusTracker.on( 'change:isFocused', () => {
				if ( editor.ui.focusTracker.isFocused ) {
					toolbarContainer.classList.add( 'sticky' );
				} else {
					toolbarContainer.classList.remove( 'sticky' );
				}
			} );
		} )
		.catch( error => {
			console.error( 'There was a problem initializing the editor.', error );
		} );
</script>

</body>
</html>
```


### Superbuild

The superbuild, available instantly from CDN, is a preconfigured package that offers access to almost all available plugins and all predefined editor types.

<info-box>
	Please consider, that the superbuild contains a really whole lot of code. A good portion of that code may not be needed in your implementation, so using the superbuild should be considered for evaluation purposes and tests rather, than for the production environment.

	We strongly advise using the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Online builder} approach or {@link installation/getting-started/quick-start-other#building-the-editor-from-source building the editor from source} to create customized and efficient production-environment solutions. You can also try out one of the other predefined builds instead.
</info-box>

#### Installation example

Please refer to the {@link installation/getting-started/quick-start#running-a-full-featured-editor-from-cdn CDN installation quick start} to learn how to utilize the superbuild.

## List of plugins included in the CKEditor 5 predefined builds

The table below presents the list of all plugins included in various builds. <!-- update -->

<figure class="table">
	<table border="1" cellpadding="1" cellspacing="1">
		<tbody>
			<tr>
				<td style="width:70px"><strong>Plugin</strong></td>
				<td style="text-align:center; width:70px">Classic</td>
				<td style="text-align:center; width:70px">Inline</td>
				<td style="text-align:center; width:70px">Balloon</td>
				<td style="text-align:center; width:70px">Balloon block</td>
				<td style="text-align:center; width:70px">Document</td>
				<td style="text-align:center; width:70px">Multi-root</td>
				<td style="text-align:center; width:70px">Superbuild</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/text-alignment.html">Alignment</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/autoformat.html">Autoformat</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-inserting.html#inserting-images-via-pasting-a-url-into-the-editor">AutoImage</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/link.html">Autolink</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html">Base64UploadAdapter</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/block-quote.html">BlockQuote</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">Bold</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckbox.html">CKBox</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckfinder.html">CKFinder</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/cs/latest/guides/overview.html">CloudServices</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">Code</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html">CodeBlock</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments.html">Comments</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/document-lists.html">DocumentList</a> +</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html">EasyImage</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/api/essentials.html">Essentials</a> *</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/export-pdf.html">ExportPdf</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/export-word.html">ExportWord</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html">FindAndReplace</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/font.html">FontBackgroundColor, FontColor, FontFamily, FontSize</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html">GeneralHtmlSupport</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/headings.html">Heading</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/highlight.html">Highlight</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html">HorizontalLine</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#html-comments">HtmlComment</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/html-embed.html">HtmlEmbed</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html">Image</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-captions.html">ImageCaption</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-resizing.html">ImageResize</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-styles.html">ImageStyle</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html#image-contextual-toolbar">ImageToolbar</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html">ImageUpload</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-inserting.html">ImageInsert</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/import-word/import-word.html">ImportWord</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/indent.html">Indent</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/indent.html">IndentBlock</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">Italic</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/link.html">Link</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/link.html">LinkImage</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html">List</a> +</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html">ListProperties</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/math-equations.html">MathType</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html">MediaEmbed</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html">Mentions</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html">PageBreak</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/pagination/pagination.html">Pagination</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/headings.html">Paragraph</a> *</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-word.html">PasteFromOffice</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_image_pictureediting-PictureEditing.html">PictureEditing</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/users-in-real-time-collaboration.html">PresenceList</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html">RealTimeCollaborativeEditing</a>, <a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html">RealTimeCollaborativeComments</a>, <a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html">RealTimeCollaborativeRevisionHistory</a>, <a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html">RealTimeCollaborativeTrackChanges</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html">RemoveFormat</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/revision-history/revision-history.html">RevisionHistory</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/restricted-editing.html">StandardEditingMode</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/special-characters.html">SpecialCharacters</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">Strikethrough</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">Subscript</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">Superscript</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html">Table, TableToolbar</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/language.html">TextPartLanguage</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/text-transformation.html">TextTransformation</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/todo-lists.html">TodoList</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html">TrackChanges</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes-data.html">TrackChangesData</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">Underline</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_upload_filerepository-UploadAdapter.html">UploadAdapter</a></td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/word-count.html">WordCount</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
			<tr>
				<td><a href="https://ckeditor.com/docs/ckeditor5/latest/features/spelling-and-grammar-checking.html">WProofreader</a></td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">❌</td>
				<td style="text-align:center; width:70px">✅</td>
			</tr>
		</tbody>
	</table>
</figure>

**Important notes**
Plugins denoted with an asterisk (*) are essential for the editor to work and should never be removed.
The two list plugins denoted with a plus (+) can only be used separately.
The document lists feature is required by the import from Word plugin to run correctly.

## UMD support

Because builds are distributed as [UMD modules](https://github.com/umdjs/umd), editor classes can be retrieved in various ways:

* by a [CommonJS](http://wiki.commonjs.org/wiki/CommonJS)-compatible loader (e.g. [webpack](https://webpack.js.org) or [Browserify](http://browserify.org/)),
* by [RequireJS](http://requirejs.org/) (or any other AMD library),
* from the global namespace if none of the above loaders is available.

For example:

```js
// In the CommonJS environment.
const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );
ClassicEditor.create( ... ); // [Function]

// If AMD is present, you can do this.
require( [ 'path/to/ckeditor5-build-classic/build/ckeditor' ], ClassicEditor => {
	ClassicEditor.create( ... ); // [Function]
} );

// As a global variable.
ClassicEditor.create( ... ); // [Function]

// As an ES6 module (if using webpack or Rollup).
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
ClassicEditor.create( ... ); // [Function]
```
