---
menu-title: Vanilla JS testing suite
meta-title: Vanilla JS CKEditor 5 - migrate testing suite from npm to CDN | CKEditor 5 Documentation
meta-description: Migrate CKEditor 5 testing suite from npm to CDN in a few simple steps. Learn how to install CKEditor 5 testing suite in your project using the CDN.
category: migrations
order: 20
---

# Migrating CKEditor&nbsp;5 testing suite from npm to CDN

This guide will help you migrate the CKEditor&nbsp;5 testing suite from an NPM-based installation to a CDN-based one.

## Prerequisites

Ensure that your testing suite uses real web browser environments for testing. If you are using `jsdom` or any other environment without a real DOM, you may need to adjust the testing suite configuration to use a real browser because CDN script injection might not be recognized properly in such environments.

## Migration steps

### Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor&nbsp;5 imports in your test files, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, /* ... other imports */ } from 'ckeditor5';
import { AIAdapter, /* ... other imports */ } from 'ckeditor5-premium-features';
```

### Step 2: Update your test files to use CDN

**Before:**

```javascript
import { ClassicEditor, /* ... other imports */ } from 'ckeditor5';

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

### Step 3 (Optional): Clean up the document head entries before each test

If you use a testing suite that does not clean up the document head entries before each test, you may need to do it manually. It is essential because the CKEditor&nbsp;5 CDN script will inject the editor into the head section of your HTML file, and you need to ensure that the head section is clean before each test.

However, there is one downside to this approach. Cleaning up the head entries before each test may slow down the test execution because the browser needs to download the CKEditor&nbsp;5 script each time. In most cases, this should not be a problem, but if you notice that your tests are running slower, you may need to consider other solutions.

Here is an example of how you can clean up the document head entries before each test:

```javascript
import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';

beforeEach( () => {
	removeAllCkCdnResources();
} );
```

The code above will remove all CKEditor&nbsp;5 CDN scripts, style sheets, and Window objects from the head section of your HTML file before each test.

## Known issues

### Slow test execution

If you notice that your tests are running slower after migrating to CDN, it may be caused by the browser downloading the CKEditor&nbsp;5 script each time the test is executed. While it is not recommended to disable the head cleanup before each test, you may disable it if you notice a significant slowdown in your test execution and your code handles the CKEditor&nbsp;5 script async injection properly.

### Script injection issues

If you notice that the CKEditor&nbsp;5 script is not injected properly, ensure that your testing suite uses a real browser environment for testing. If you use `jsdom` or any other environment without a real DOM, you may need to adjust the testing suite configuration to use a real browser. Consider using tools like:

* [Vitest](https://vitest.dev/)
* [Playwright](https://playwright.dev/)
* [Cypress](https://www.cypress.io/)
