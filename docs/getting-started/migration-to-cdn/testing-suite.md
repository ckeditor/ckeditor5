---
menu-title: Migrate testing suite from NPM to CDN in Vanilla JS
meta-title: Vanilla JS CKEditor 5 - migrate testing suite from NPM to CDN | CKEditor 5 documentation
meta-description: Migrate CKEditor 5 testing suite from NPM to CDN in a few simple steps. Learn how to install CKEditor 5 testing suite in your project using the CDN.
category: cloud
order: 22
---

# Migrating CKEditor&nbsp;5 testing suite from NPM to CDN

This guide will help you migrate CKEditor&nbsp;5 testing suite from an NPM-based installation to a CDN-based installation.

## Prerequisites

Ensure that your testing suite uses real web browser environments for testing. If you are using `jsdom` or any other environment without a real DOM, you may need to adjust the testing suite configuration to use a real browser because CDN scripts injection might be not recognized properly in such environments.

## Migration steps

### Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor 5 imports in your test files, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, ... } from 'ckeditor5';
import { EasyImage, ... } from 'ckeditor5-premium-features';
```

### Step 2: Update your test files to use CDN

**Before:**

```javascript
import { ClassicEditor, ... } from 'ckeditor5';

it( 'ClassicEditor test', () => {
	// Your test that use CKEditor 5 object.
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
	const { ClassicEditor } = cloud;

	// Your test that use CKEditor 5 object.
} );
```

### Step 3 (Optional): Clean up the head entries before each test

If you are using a testing suite that does not clean up the head entries before each test, you may need to do it manually. This is important because the CKEditor&nbsp;5 CDN script will inject the editor into the head section of your HTML file and you need to ensure that the head section is clean before each test.

However, there is one downside to this approach. Cleaning up the head entries before each test may slow down the test execution because the browser will need to download the CKEditor&nbsp;5 script each time. In most of the cases, this should not be a problem, but if you notice that your tests are running slower, you may need to consider other solutions.

Here is an example of how you can clean up the head entries before each test:

```javascript
import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';

let cloud;

beforeEach( () => {
	removeAllCkCdnResources();
} );
```

Code above will remove all CKEditor&nbsp;5 CDN scripts, stylesheets and Window objects from the head section of your HTML file before each test.
