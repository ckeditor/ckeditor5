---
menu-title: Multi-root integration
meta-title: Using CKEditor 5 with Angular multi-root component from CDN | CKEditor 5 Documentation
meta-description: Install, integrate, and configure CKEditor 5 using the Angular multi-root component with CDN.
category: angular-cdn
order: 20
modified_at: 2026-11-05
---

# Integrating CKEditor&nbsp;5 with Angular multi-root editor component from CDN

This page focuses on describing the usage of the multi-root editor in Angular applications. For other editor types, see the {@link getting-started/integrations-cdn/angular-default-cdn default Angular integration}.

<info-box experimental>
	The Angular multi-root editor integration is in early access. Its API is not stable and may change in any release without a major version bump.
</info-box>

<info-box hint>
	The multi-root editors in Angular are supported since version 13.1.0 of this package.
</info-box>

## Quick start

This guide assumes you already have an Angular project. To create such a project, you can use Angular CLI. Refer to the [Angular documentation](https://angular.dev/tools/cli) to learn more.

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

First, install the [CKEditor&nbsp;5 WYSIWYG editor component for Angular](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular):

```bash
npm install @ckeditor/ckeditor5-angular
```

Angular is a TypeScript-first environment, so you may need to import TypeScript types for CKEditor. Depending on the plugins and features you use, you may also need to install the required open-source and premium packages:

```bash
npm install --save-dev ckeditor5 # Open-source plugin types.
npm install --save-dev ckeditor5-premium-features # Premium features plugin types.
```

Use the `loadCKEditorCloud` helper to load the editor code and plugins from CDN, and pass the `MultiRootEditor` class it returns to the `<ckeditor-multi-root>` component. For more information about the `loadCKEditorCloud` helper, see the {@link getting-started/setup/loading-cdn-resources Loading CDN resources} guide.

```angular-ts
// app.component.ts

import { Component, type OnInit } from '@angular/core';
import {
	CKEditorMultiRootComponent,
	loadCKEditorCloud,
	type CKEditorCloudResult,
	type MultiRootEditorData
} from '@ckeditor/ckeditor5-angular';
import type { EditorConfig, MultiRootEditor } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

@Component( {
	selector: 'app-root',
	imports: [ CKEditorMultiRootComponent ],
	template: `
		@if ( Editor && config ) {
			<ckeditor-multi-root
				[editor]="Editor"
				[config]="config"
				[(data)]="data"
			/>
		}
	`
} )
export class AppComponent implements OnInit {
	public Editor: typeof MultiRootEditor | null = null;

	public config: EditorConfig | null = null;

	public data: MultiRootEditorData = {
		intro: '<h1>Angular multi-root editor</h1>',
		content: '<p>Hello from CKEditor&nbsp;5 multi-root!</p>'
	};

	public ngOnInit(): void {
		loadCKEditorCloud( {
			version: '{@var ckeditor5-version}',
			premium: true
		} ).then( this._setupEditor.bind( this ) );
	}

	private _setupEditor( cloud: CKEditorCloudResult<{ version: '{@var ckeditor5-version}', premium: true }> ) {
		const { MultiRootEditor, Essentials, Paragraph, Bold, Italic } = cloud.CKEditor;
		const { FormatPainter } = cloud.CKEditorPremiumFeatures;

		this.Editor = MultiRootEditor;
		this.config = {
			licenseKey: '<YOUR_LICENSE_KEY>',
			plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
			toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ]
		};
	}
}
```

Without any content inside, the `<ckeditor-multi-root>` component renders the toolbar followed by the editables of all roots. When `config.menuBar.isVisible` is set to `true`, it renders the menu bar above the toolbar, too.

To build a custom layout, put the `<ckeditor-multi-root-toolbar>`, `<ckeditor-multi-root-menu-bar>`, and `<ckeditor-multi-root-editable>` components inside the `<ckeditor-multi-root>` component. The {@link getting-started/integrations/angular-multiroot-npm#custom-layout npm guide} shows how.

## Component API

The component works the same regardless of the distribution. See the {@link getting-started/integrations/angular-multiroot-npm npm guide} for:

* The {@link getting-started/integrations/angular-multiroot-npm#supported-input-properties supported `@Input` properties}.
* The {@link getting-started/integrations/angular-multiroot-npm#supported-output-properties supported `@Output` properties}.
* The {@link getting-started/integrations/angular-multiroot-npm#component-api `addRoot()` and `removeRoot()` methods, and the `roots()` signal}.
* {@link getting-started/integrations/angular-multiroot-npm#two-way-data-binding Two-way data binding}.

## Contributing and reporting issues

The source code of rich text editor component for Angular is available on GitHub in [https://github.com/ckeditor/ckeditor5-angular](https://github.com/ckeditor/ckeditor5-angular).

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
