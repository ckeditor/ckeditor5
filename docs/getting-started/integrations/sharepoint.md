---
menu-title: SharePoint (SPFx)
meta-title: Using CKEditor 5 with with SharePoint SPFx | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with SharePoint SPFx using npm
category: self-hosted
order: 120
modified_at: 2025-04-30
---

# Integrating CKEditor&nbsp;5 with SharePoint SPFx from npm

[The SharePoint Framework (SPFx)](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview) is Microsoft's modern, client-side development model for building custom experiences that run in the SharePoint Online, Microsoft Teams, Viva Connections, Outlook, and the Microsoft 365 applications.

## Prerequisites

Before integrating CKEditor&nbsp;5 with SharePoint, make sure you have the following installed:

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

You should be now able to add CKEditor&nbsp;5 by clicking the plus icon on the main page:

{@img assets/img/sharepoint-integration_03.png Screenshot of SharePoint application.}

Then choose CKEditor 5 component:

{@img assets/img/sharepoint-integration_04.png Screenshot of SharePoint application.}

You should now be able to use the editor:

{@img assets/img/sharepoint-integration_05.png Screenshot of SharePoint application.}

## Additional resources

* [SharePoint Framework Documentation](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
* {@link getting-started/integrations/react-default-npm React integration documentation}

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
