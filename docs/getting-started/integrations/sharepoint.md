---
menu-title: SharePoint (SPFx)
meta-title: Using the CKEditor 5 WYSIWYG editor with SharePoint SPFx | CKEditor 5 Documentation
meta-description: Integrate the CKEditor 5 rich-text editor with SharePoint SPFx using npm. Follow step-by-step instructions for fast installation and setup.
category: self-hosted
order: 120
modified_at: 2026-01-28
---

# Integrating CKEditor&nbsp;5 rich-text editor with SharePoint SPFx from npm

[The SharePoint Framework (SPFx)](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview) is Microsoft's modern, client-side development model for building custom experiences that run in the SharePoint Online, Microsoft Teams, Viva Connections, Outlook, and the Microsoft 365 applications.

## Prerequisites

Before integrating CKEditor&nbsp;5 rich-text editor with SharePoint, make sure you have the following installed:

1. [Node.js](https://nodejs.org/) (LTS version)
2. [Yeoman generator](https://yeoman.io/) and SharePoint generator plugin:

```bash
npm install -g yo @microsoft/generator-sharepoint
```
3. [Gulp](https://gulpjs.com/) (for building the project):

```bash
npm install -g gulp
```

## Creating a new web part project

First, create a new folder and navigate into it:

```bash
mkdir my-spfx-app
cd my-spfx-app
```

Generate a new SPFx web part project:

```bash
yo @microsoft/sharepoint
```

When prompted for:
* **Which type of client-side component to create?** &ndash; choose WebPart
* **Which template would you like to use?** &ndash; choose React


You will be also prompted for names for the application and the web part, for example:

{@img assets/img/sharepoint-integration_01.png Screenshot of prompts from SharePoint app generator.}


## Running the web part project

After the project is created, go to `config/serve.json` file and update the `initialPage` property with your SharePoint tenant URL:

```js
"initialPage": "https://your-tenant.sharepoint.com/_layouts/workbench.aspx"
```

At this point you should be able to run the project by executing:

```bash
gulp serve
```

A new browser tab with SPFx app should open automatically. You might be prompted to log in to your Microsoft account at this point.

If the page does not open automatically, navigate to the following URL:

```
https://your-tenant.sharepoint.com/_layouts/workbench.aspx
```

If everything went fine, you should see a screen similar to this one:
{@img assets/img/sharepoint-integration_02.png Screenshot of SharePoint application.}

## CKEditor 5 web part integration

### Installing dependencies

Now it is time to add CKEditor&nbsp;5 to the application. First, install CKEditor&nbsp;5 and React integration packages:

```bash
npm install --save @ckeditor/ckeditor5-react ckeditor5 ckeditor5-premium-features
```

In `tsconfig.json` file add:

```js
...
"allowSyntheticDefaultImports": true
...
```

### Creating CKEditor 5 web part component

Assuming you named your web part "RichTextEditor", open the `src/webparts/richTextEditor/components/RichTextEditor.tsx` file and modify it to include CKEditor&nbsp;5:

```typescript
import * as React from 'react';
import type { IRichTextEditorProps } from './IRichTextEditorProps';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import {
	ClassicEditor,
	Bold,
	Essentials,
	Italic,
	Paragraph,
	Font,
	Heading,
	Table,
	List,
	TableCellProperties,
	TableProperties,
	TableToolbar,
	Autoformat
} from 'ckeditor5';

import { FormatPainter } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

export default class RichTextEditor extends React.Component<IRichTextEditorProps> {
	public render(): React.ReactElement<IRichTextEditorProps> {
		return (
				<CKEditor
						editor={ ClassicEditor }
						config={ {
								licenseKey: '<YOUR_LICENSE_KEY>',
								plugins: [
									Bold, Essentials, Italic, Paragraph, Font, Heading,
									Table, TableCellProperties, TableProperties, TableToolbar, List,
									Autoformat, FormatPainter
								],
								toolbar: [
									'undo', 'redo', '|', 'bold', 'italic', '|',
									'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
									'formatPainter', 'insertTable', 'bulletedList', 'numberedList'
								],
								initialData: '<p>Hello from CKEditor 5 in SPFX React app!</p>',
								table: {
									contentToolbar: [
										'tableColumn', 'tableRow', 'mergeTableCells',
										'tableProperties', 'tableCellProperties'
									]
								}
						} }
				/>
		);
	}
}
```

Restart the server and then refresh the page.

```bash
gulp serve
```

### Adding the editor web part on page

You should be now able to add CKEditor&nbsp;5 HTML editor	to your SharePoint application by clicking the plus icon on the main page:

{@img assets/img/sharepoint-integration_03.png Screenshot of SharePoint application.}

Then choose CKEditor&nbsp;5 component:

{@img assets/img/sharepoint-integration_04.png Screenshot of SharePoint application.}

You should now be able to use the rich-text editor with SharePoint:

{@img assets/img/sharepoint-integration_05.png Screenshot of SharePoint application.}

## Known issues

* When using Rooster JS React in SharePoint with the SPFx Framework, after inserting a link, the <kbd>Enter</kbd> key may stop working. Adding `data-sp-a11y-skipkeys='all'` in the div wrapping the editor should fix the problem. (See [issue](https://github.com/SharePoint/sp-dev-docs/issues/9438)).
* When using CKEditor&nbsp;5 inside a Fluent UI `Dialog` or `Modal` component, image resizing handles might not work because the `Layer` component captures mouse events. To fix this, enable event bubbling in the `modalProps`:

```typescript
<Dialog
	modalProps={ {
		layerProps: {
			// Enable event bubbling to allow CKEditor 5 resize handles to work.
			eventBubblingEnabled: true
		}
	} }
>
	{/* ... */}
</Dialog>
```

* SharePoint overrides the table border styles. This is a problem since SharePoint uses the following style:

```css
.ck-content .table > table {
	border: unset !important;
}
```

The `!important` rule overrides any styles generated by the editor, so setting them through table properties brings no effect. To fix it, you need to make sure CKEditor&nbsp;5's internal styles take precedence before SharePoint's global styles. This can be achieved by introducing the following workaround, in the form of a custom plugin:

```js
/**
* CKEditor 5 Plugin defined as a simple function.
* Forces !important on table border styles to override SharePoint CSS.
*/

const ForceTableBorderImportant = ( editor: Editor ) => {
	const { view } = editor.editing;
	const modifiedElements = new Set<ViewElement>();

	const BORDER_ATTRIBUTES = [
		'borderColor', 'borderWidth', 'borderStyle',
		'tableBorderColor', 'tableBorderWidth', 'tableBorderStyle'
	];

	/**
	 * Resolves the actual DOM element that needs styling.
	 */
	const resolveTargetDomElement = ( viewElement: ViewElement, domConverter: ViewDomConverter ): HTMLElement | null | undefined => {
		const domElement = domConverter.mapViewToDom( viewElement );
		return domElement?.matches( 'table' ) ? domElement : domElement?.querySelector( 'table' );
	};

	/**
	* Extracts default border properties from the editor configuration.
	*/
	const getDefaultBorderConfig = () => {
		const config = editor.config.get( 'table.tableProperties.defaultProperties' );
		return {
			width: config?.borderWidth || '1px',
			style: config?.borderStyle || 'double',
			color: config?.borderColor || '#b3b3b3'
		};
	};

	/**
	* Applies default border values if missing and enforces !important on all border styles.
	*/
	const enforceBorderStyles = ( domElement: HTMLElement, defaults: { width: string, style: string, color: string } ) => {
	// Skip layout tables (used for positioning, not data)
	if ( 
		domElement.closest('figure')?.classList.contains( 'layout-table' ) || 
		domElement.classList.contains( 'layout-table' ) 
	) {
		return;
	}

	const style = domElement.style;

	// 1. Apply default values only if specific properties are missing.
	if ( !style.getPropertyValue( 'border-width' ) ) style.setProperty( 'border-width', defaults.width, 'important' );
	if ( !style.getPropertyValue( 'border-style' ) ) style.setProperty( 'border-style', defaults.style, 'important' );
	if ( !style.getPropertyValue( 'border-color' ) ) style.setProperty( 'border-color', defaults.color, 'important' );

	// 2. Iterate through ALL active border-related properties and enforce !important.
	Array.from( style )
		.filter( propName => propName.includes( 'border' ) )
		.forEach( propName => {
			if ( style.getPropertyPriority( propName ) !== 'important' ) {
				style.setProperty( propName, style.getPropertyValue( propName ), 'important' );
			}
		} );
	};

	// 1. Collection Phase (Downcast)
	editor.conversion.for( 'editingDowncast' ).add( ( dispatcher: any ) => {
		const addToCollection = ( evt: unknown, data: any, { mapper }: any ) => {
			const viewElement = mapper.toViewElement( data.item );
			if ( viewElement ) {
				modifiedElements.add( viewElement );
			}
	};

	BORDER_ATTRIBUTES.forEach( attr =>
		dispatcher.on( `attribute:${ attr }`, addToCollection, { priority: 'lowest' } )
	);
	} );

	// 2. Execution Phase (Render)
	view.on( 'render', () => {
		if ( !modifiedElements.size ) return;

		const defaultBorder = getDefaultBorderConfig();

		modifiedElements.forEach( viewElement => {
			const domElement = resolveTargetDomElement( viewElement, view.domConverter );
			if ( domElement ) {
				enforceBorderStyles( domElement, defaultBorder );
			}
		} );

		modifiedElements.clear();
	} );
};
```

<info-box important>
	The internal `StylesMap` utility used by the editor's conversion system does not natively support the `!important` flag during style normalization.
	
	The provided workaround, therefore, performs low-level DOM manipulation during the render cycle instead of relying solely on `StylesMap`. By applying these styles directly to the DOM elements after they are mapped, we ensure the priority flag remains intact and is correctly interpreted by the browser.
</info-box>

## Additional resources

* [SharePoint Framework Documentation](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
* {@link getting-started/integrations/react-default-npm React integration documentation}

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
