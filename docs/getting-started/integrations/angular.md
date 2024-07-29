---
menu-title: Angular
meta-title: Angular rich text editor component | CKEditor 5 documentation
category: self-hosted
order: 30
---

{@snippet installation/integrations/framework-integration}

# Angular rich text editor component

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-angular" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-angular.svg" alt="npm version" loading="lazy">
	</a>
</p>

Angular is a TypeScript-based, open-source, single-page web application framework. The CKEditor 5 component for Angular supports integrating different editor types.

<info-box hint>
	Starting from version 6.0.0 of this package, you can use native type definitions provided by CKEditor&nbsp;5. Check the details about {@link getting-started/setup/typescript-support TypeScript support}.
</info-box>

## Supported Angular versions

Because of the breaking changes in the Angular library output format, the `@ckeditor/ckeditor5-angular` package is released in the following versions to support various Angular ecosystems:

<table>
  <thead>
	<tr>
	 <th>CKEditor&nbsp;5&nbsp; Angular component version</th>
	 <th>Angular&nbsp;version</th>
	 <th>Details</th>
	</tr>
  </thead>
  <tbody>
	<tr>
	 <td colspan="3">Actively supported versions</td>
	</tr>
	<tr>
	 <td><code>^8</code></td>
	 <td><code>13+</code></td>
	 <td>Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v42.0.0">42</a> or higher.</td>
	</tr>
	<tr>
	 <td colspan="3">Past releases (no longer maintained)</td>
	</tr>
	<tr>
	 <td><code>^7</code></td>
	 <td><code>13+</code></td>
	 <td>Changes in peer dependencies (<a href="https://github.com/ckeditor/ckeditor5-angular/issues/376">issue</a>). Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v37.0.0">37</a> or higher.</td>
	</tr>
	<tr>
	 <td><code>^6</code></td>
	 <td><code>13+</code></td>
	 <td>Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v37.0.0">37</a> or higher.</td>
	</tr>
	<tr>
	 <td><code>^5</code></td>
	 <td><code>13+</code></td>
	 <td>Requires Angular in version 13+ or higher. Lower versions are no longer maintained.</td>
	</tr>
	<tr>
	 <td><code>^5</code></td>
	 <td><code>13+</code></td>
	 <td>Requires Angular in version 13+ or higher. Lower versions are no longer maintained.</td>
	</tr>
	<tr>
	 <td><code>^4</code></td>
	 <td><code>9.1+</code></td>
	 <td>Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v34.0.0">34</a> or higher.</td>
	</tr>
	<tr>
	 <td><code>^3</code></td>
	 <td><code>9.1+</code></td>
	 <td>Requires Node.js in version 14 or higher.</td>
	</tr>
	<tr>
	 <td><code>^2</code></td>
	 <td><code>9.1+</code></td>
	 <td>Migration to TypeScript&nbsp;4. Declaration files are not backward compatible.</td>
	</tr>
	<tr>
	 <td><code>^1</code></td>
	 <td><code>5.x&nbsp;-&nbsp;8.x</code></td>
	 <td>Angular versions no longer maintained.</td>
	</tr>
  </tbody>
</table>

All available Angular versions are [listed on npm](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular), where they can be pulled from.

## Quick start

### Using CKEditor&nbsp;5 Builder

The easiest way to use CKEditor 5 in your Angular application is by configuring it with [CKEditor&nbsp;5 Builder](https://ckeditor.com/builder?redirect=docs) and integrating it with your application. Builder offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:

* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs!

### Setting up the project

This guide assumes you already have a Angular project. To create such a project, you can use Angular CLI. Refer to the [Angular documentation](https://angular.io/cli) to learn more.

### Installing from npm

First, install the CKEditor 5 packages:

* `ckeditor5` &ndash; package with open-source plugins and features.
* `ckeditor5-premium-features` &ndash; package with premium plugins and features.

Depending on your configuration and chosen plugins, you may need to install the first or both packages.

```bash
npm install ckeditor5 ckeditor5-premium-features
```

Then, install the [CKEditor&nbsp;5 WYSIWYG editor component for Angular](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular):

```bash
npm install @ckeditor/ckeditor5-angular
```

The following setup differs depending on the type of components you use.

#### Standalone components

Standalone components provide a simplified way to build Angular applications. They are enabled in Angular 17 by default. Standalone components aim to simplify the setup and reduce the need for `NGModules`. That is why you do not need such a module in this case.

Instead, add the `CKEditorModule` to the imports in your app component. The component needs the `standalone` option set to `true`. The example below shows how to use the component with open-source and premium plugins.

```ts
// app.component.ts

import { Component, ViewEncapsulation } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';
import { SlashCommand } from 'ckeditor5-premium-features';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	encapsulation: ViewEncapsulation.None,
	imports: [ CKEditorModule ],
	standalone: true
} )
export class AppComponent {
	title = 'angular';

	public Editor = ClassicEditor;
	public config = {
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		plugins: [
			Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo
		],
		licenseKey: '<YOUR_LICENSE_KEY>',
		// mention: {
		//     Mention configuration
		// }
	}
}
```

Depending on the plugins used (open source only or premium too), you may need to import the first or both CSS files. Angular, by default, scopes styles to a particular component. Because of that, the editor may not detect attached styles. You must set the encapsulation option to `ViewEncapsulation.None` to turn this scoping off.

```css
/* app.component.css */

@import 'ckeditor5/ckeditor5.css';
@import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
```

Then, use the `<ckeditor>` tag in the template to run the rich text editor:

```html
<!-- app.component.html -->

<ckeditor [editor]="Editor" [config]="config" data="<p>Hello, world!</p>"></ckeditor>
```

#### NGModule components

If you want to use NGModule components, add the `CKEditorModule` to the `imports` array. It will make the CKEditor&nbsp;5 component available in your Angular application.

```ts
// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { AppComponent } from './app.component';

@NgModule( {
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		CKEditorModule
	],
	providers: [],
	bootstrap: [ AppComponent ]
} )
export class AppModule { }
```

Then, import the editor in your Angular component and assign it to a `public` property to make it accessible from the template. The below example shows how to use the component with open-source and premium plugins.

```ts
// app.component.ts

import { Component, ViewEncapsulation } from '@angular/core';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';
import { SlashCommand } from 'ckeditor5-premium-features';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ],
	encapsulation: ViewEncapsulation.None
} )
export class AppComponent {
	title = 'angular';

	public Editor = ClassicEditor;
	public config = {
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		plugins: [
			Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo
		],
		licenseKey: '<YOUR_LICENSE_KEY>',
		// mention: {
		//     Mention configuration
		// }
	}
}
```

Depending on the plugins you used, you may need to import the first or both CSS files. Angular, by default, scope styles to a particular component. Because of that, the editor may not detect attached styles. You must set the encapsulation option to `ViewEncapsulation.None` to turn this scoping off.

```css
/* app.component.css */

@import 'ckeditor5/ckeditor5.css';
@import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
```

Finally, use the `<ckeditor>` tag in the template to run the rich text editor:

```html
<!-- app.component.html -->

<ckeditor [editor]="Editor" [config]="config" data="<p>Hello, world!</p>"></ckeditor>
```
