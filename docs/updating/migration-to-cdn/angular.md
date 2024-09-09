---
menu-title: Angular
meta-title: Angular CKEditor 5 - migrate integration from NPM to CDN | CKEditor 5 documentation
meta-description: Migrate Angular CKEditor 5 integration from NPM to CDN in a few simple steps. Learn how to install Angular CKEditor 5 integration in your project using the CDN.
category: migrations
order: 50
---

# Migrating Angular CKEditor&nbsp;5 integration from NPM to CDN

This guide will help you migrate Angular CKEditor&nbsp;5 integration from an NPM-based installation to a CDN-based installation.

## Prerequisites

Remove the existing CKEditor&nbsp;5 packages from your project. If you are using the NPM-based installation, you can remove it by running the following command:

```bash
npm uninstall ckeditor5 ckeditor5-premium-features
```

Upgrade the CKEditor&nbsp;5 Angular integration to the latest version. You can find the latest version in the [CKEditor&nbsp;5 Builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/angular.html) documentation.

Ensure that your testing suite uses real web browser environments for testing. If you are using `jsdom` or any other environment without a real DOM, you may need to adjust the testing suite configuration to use a real browser because CDN scripts injection might be not recognized properly in such environments.

## Migration steps

### Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor 5 imports in your Angular components, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, ... } from 'ckeditor5';
import { EasyImage, ... } from 'ckeditor5-premium-features';
```

### Step 2: Update your Angular components to use CDN

Replace the CKEditor&nbsp;5 NPM package imports with the CDN script imports and use the `loadCKEditorCloud` function to load the CKEditor&nbsp;5 scripts. The `loadCKEditorCloud` function is a part of the `@ckeditor/ckeditor5-angular` package and is used to load CKEditor&nbsp;5 scripts from the CKEditor Cloud service.

**Before:**

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
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		// mention: {
		//     Mention configuration
		// }
	}
}
```

**After:**

```ts
// app.component.ts

import { Component, ViewEncapsulation } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

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

	public Editor;
	public config;

	public ngOnInit() {
		loadCKEditorCloud( {
			version: '43.0.0'
		} )
			.then( this._setupEditor.bind( this ) );
	}

	private _setupEditor( cloud ) {
		const {
			ClassicEditor, Bold, Essentials, Italic,
			Mention, Paragraph, SlashCommand, Undo
		} = cloud.CKEditor;

		this.Editor = ClassicEditor;
		this.config = {
			licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
			plugins: [ Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo ],
			toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
			// mention: {
			//     Mention configuration
			// }
		}
	}
}
```

```html
// app.component.html

<ckeditor
	*ngIf="Editor"
	[editor]="Editor"
	[config]="config"
	...
</ckeditor>
```

### Step 3 (Optional): Migrate the CKEditor&nbsp;5 Angular integration testing suite

If you have any tests that use CKEditor&nbsp;5 objects, you need to update them to use the  `loadCKEditorCloud` function. Here is an example of migrating a test that uses the `ClassicEditor` object:

**Before:**

```javascript
import { ClassicEditor, ... } from 'ckeditor5';

it( 'ClassicEditor test', () => {
	// Your test that uses the CKEditor 5 object.
} );
```

**After:**

```javascript
import { loadCKEditorCloud } from '@ckeditor/ckeditor5-integrations-common';

let cloud;

beforeEach( async () => {
	cloud = await loadCKEditorCloud( {
		version: '{@var ckeditor5-version}',
	} );
} );

it( 'ClassicEditor test', () => {
	const { ClassicEditor, ... } = cloud.CKEditor;

	// Your test that uses the CKEditor 5 object.
} );
```

### Step 4 (Optional): Clean up the head entries before each test

If you are using a testing suite that does not clean up the head entries before each test, you may need to do it manually. This is important because the CKEditor&nbsp;5 CDN script will inject the editor into the head section of your HTML file and you need to ensure that the head section is clean before each test.

However, there is one downside to this approach. Cleaning up the head entries before each test may slow down the test execution because the browser will need to download the CKEditor&nbsp;5 script each time. In most of the cases, this should not be a problem, but if you notice that your tests are running slower, you may need to consider other solutions.

Here is an example of how you can clean up the head entries before each test:

```javascript
import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';

beforeEach( () => {
	removeAllCkCdnResources();
} );
```
