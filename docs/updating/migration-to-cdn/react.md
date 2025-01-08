---
menu-title: React
meta-title: React CKEditor 5 - migrate integration from npm to CDN | CKEditor 5 Documentation
meta-description: Migrate React CKEditor 5 integration from npm to CDN in a few simple steps. Learn how to install React CKEditor 5 integration in your project using the CDN.
category: migrations
order: 30
---

# Migrating CKEditor&nbsp;5 React integration from npm to CDN

This guide will help you migrate CKEditor&nbsp;5 React integration from an NPM-based installation to a CDN-based one.

## Prerequisites

Remove the existing CKEditor&nbsp;5 packages from your project. If you are using the NPM-based installation, you can remove it by running the following command:

```bash
npm uninstall ckeditor5 ckeditor5-premium-features
```

Upgrade the CKEditor&nbsp;5 React integration to the latest version. You can find the latest version in the {@link getting-started/integrations-cdn/react-default-cdn React integration} documentation.

Ensure that your testing suite uses real web browser environments for testing. If you are using `jsdom` or any other environment without a real DOM, you may need to adjust the testing suite configuration to use a real browser because CDN script injection might not be recognized properly in such environments.

## Migration steps

### Migrate `CKEditor` component

#### Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor&nbsp;5 imports in your test files, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, /* ... other imports */ } from 'ckeditor5';
import { AIAdapter, /* ... other imports */ } from 'ckeditor5-premium-features';
```

#### Step 2: Use `useCKEditorCloud` hook to load CKEditor&nbsp;5 from CDN

The `useCKEditorCloud` function is a hook that allows you to load CKEditor&nbsp;5 from the CDN. It returns an object with the `CKEditor` and `CKEditorPremiumFeatures` properties. Here is an example of migrating the basic CKEditor&nbsp;5 React component:

**Before:**

```jsx
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';
import { SlashCommand } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

function App() {
	return (
		<CKEditor
			editor={ ClassicEditor }
			config={ {
				licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
				toolbar: {
					items: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				},
				plugins: [
					Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo
				],
				mention: {
					// Mention configuration
				},
				initialData: '<p>Hello from CKEditor 5 in React!</p>',
			} }
		/>
	);
}

export default App;
```

**After:**

```jsx
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

function App() {
	// Load CKEditor 5 from the CKEditor Cloud, using the `useCKEditorCloud` hook.
	// It'll inject the CKEditor 5 scripts and styles into your document head and after
	// successful loading, it'll return the `CKEditor` and `CKEditorPremiumFeatures` objects.
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}', // Required. The version of CKEditor 5 to load.
		premium: true // Optional. Set to `true` if you want to use premium features.
	} );

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	if ( cloud.status === 'error' ) {
		console.error( cloud.error );

		return <div>Error!</div>;
	}

	// Pick the CKEditor 5 plugins you want to use.
	const {
		ClassicEditor, Bold, Essentials, Italic,
		Mention, Paragraph, SlashCommand, Undo
	} = cloud.CKEditor;

	const { SlashCommand } = cloud.CKEditorPremiumFeatures;

	return (
		<CKEditor
			editor={ ClassicEditor }
			config={ {
				toolbar: {
					items: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				},
				plugins: [
					Bold,
					Essentials,
					Italic,
					Mention,
					Paragraph,
					SlashCommand,
					Undo
				],
				licenseKey: '<YOUR_LICENSE_KEY>',
				initialData: '<p>Hello from CKEditor 5 in React!</p>',
			} }
		/>
	);
}
```

#### Step 3 (Optional): Migrate the CKEditor&nbsp;5 React testing suite

If you have any tests that use CKEditor&nbsp;5 objects, you need to update them to use the  `loadCKEditorCloud` function. Here is an example of migrating a test that uses the `ClassicEditor` object:

**Before:**

```javascript
import { ClassicEditor, /* ... other imports */ } from 'ckeditor5';
import { AIAdapter, /* ... other imports */ } from 'ckeditor5-premium-features';

it( 'ClassicEditor test', () => {
	render(
		<CKEditor
			editor={ ClassicEditor }
			// ... other props
		/>
	);
} );
```

**After:**

```javascript
// It may be counterintuitive that in tests you need to use `loadCKEditorCloud` instead of `useCKEditorCloud`.
// The reason for this is that `useCKEditorCloud` is a React hook and can only be used in React components,
// while tests are typically written as functions in testing suites. Therefore, in tests, you should use
// the `loadCKEditorCloud` function to load CKEditor 5 from the CKEditor Cloud and obtain the necessary
// CKEditor 5 objects. This allows you to properly test your CKEditor 5 integration without any issues.

import { loadCKEditorCloud } from '@ckeditor/ckeditor5-react';

let cloud;

beforeEach( async () => {
	cloud = await loadCKEditorCloud( {
		version: '{@var ckeditor5-version}',
	} );
} );

it( 'ClassicEditor test', () => {
	const { ClassicEditor } = cloud.CKEditor;

	render(
		<CKEditor
			editor={ ClassicEditor }
			// ... other props
		/>
	);

	// Rest of your test.
} );
```

#### Step 4 (Optional): Clean up the document head entries before each test

The `useCKEditorCloud` hook under the hood injects the CKEditor&nbsp;5 scripts and styles into your document head. If you use a testing suite that does not Clean up the document head entries before each test, you may need to do it manually. This is important because the `useCKEditorCloud` hook might reuse the same head entries for each test, which can lead to skipping the `loading` state and directly going to the `success` state. It may cause some tests that rely on the `loading` state to fail.

However, there is one downside to this approach. Cleaning up the head entries before each test may slow down the test execution because the browser needs to download the CKEditor&nbsp;5 script each time. In most cases, this should not be a problem, but if you notice that your tests are running slower, you may need to consider other solutions.

Here is an example of how you can Clean up the document head entries before each test:

```javascript
import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';

beforeEach( () => {
	removeAllCkCdnResources();
} );
```

The code above will remove all CKEditor&nbsp;5 CDN scripts, style sheets, and Window objects from the head section of your HTML file before each test, making sure that the `useCKEditorCloud` hook will inject the CKEditor&nbsp;5 scripts and styles again.

### Migrate `CKEditorContext` component

#### Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor&nbsp;5 imports in your test files, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, /* ... other imports */ } from 'ckeditor5';
import { AIAdapter, /* ... other imports */ } from 'ckeditor5-premium-features';
```

#### Step 2: Use `useCKEditorCloud` hook to load CKEditor&nbsp;5 Context from CDN

If you use the `CKEditorContext` component, you need to update it to use the `useCKEditorCloud` hook. Here is an example of migrating the `CKEditorContext` component:

**Before:**

```jsx
import { ClassicEditor, Context, Bold, Essentials, Italic, Paragraph, ContextWatchdog } from 'ckeditor5';
import { CKEditor, CKEditorContext } from '@ckeditor/ckeditor5-react';

import 'ckeditor5/ckeditor5.css';

function App() {
  return (
	<CKEditorContext context={ Context } contextWatchdog={ ContextWatchdog }>
	  <CKEditor
		editor={ ClassicEditor }
		config={ {
			licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
			plugins: [ Essentials, Bold, Italic, Paragraph ],
			toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		} }
		data='<p>Hello from the first editor working with the context!</p>'
		onReady={ ( editor ) => {
			// You can store the "editor" and use when it is needed.
			console.log( 'Editor 1 is ready to use!', editor );
		} }
	  />

	  <CKEditor
		editor={ ClassicEditor }
		config={ {
			licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
			plugins: [ Essentials, Bold, Italic, Paragraph ],
			toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		} }
		data='<p>Hello from the second editor working with the context!</p>'
		onReady={ ( editor ) => {
			// You can store the "editor" and use when it is needed.
			console.log( 'Editor 2 is ready to use!', editor );
		} }
	  />
	</CKEditorContext>
  );
}

export default App;
```

**After:**

```javascript
import { CKEditor, CKEditorContext, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

function App() {
	// Load CKEditor 5 from the CKEditor Cloud, using the `useCKEditorCloud` hook.
	// It'll inject the CKEditor 5 scripts and styles into your document head and after
	// successful loading, it'll return the `CKEditor` and `CKEditorPremiumFeatures` objects.
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}', // Required. The version of CKEditor 5 to load.
		premium: true // Optional. Set to `true` if you want to use premium features.
	} );

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	if ( cloud.status === 'error' ) {
		console.error( cloud.error );

		return <div>Error!</div>;
	}

	// Pick the CKEditor 5 plugins you want to use.
	const {
		ClassicEditor, Bold, Essentials, Italic, Paragraph,
		Context, ContextWatchdog
	} = cloud.CKEditor;

	return (
		<CKEditorContext
			context={ Context }
			contextWatchdog={ ContextWatchdog }
		>
			<CKEditor
				editor={ ClassicEditor }
				config={ {
					licenseKey: '<YOUR_LICENSE_KEY>',
					plugins: [ Essentials, Bold, Italic, Paragraph ],
					toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				} }
				data='<p>Hello from the first editor working with the context!</p>'
				onReady={ ( editor ) => {
					// You can store the "editor" and use when it is needed.
					console.log( 'Editor 1 is ready to use!', editor );
				} }
			/>

			<CKEditor
				editor={ ClassicEditor }
				config={ {
					licenseKey: '<YOUR_LICENSE_KEY>',
					plugins: [ Essentials, Bold, Italic, Paragraph ],
					toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				} }
				data='<p>Hello from the second editor working with the context!</p>'
				onReady={ ( editor ) => {
					// You can store the "editor" and use when it is needed.
					console.log( 'Editor 2 is ready to use!', editor );
				} }
			/>
		</CKEditorContext>
	);
}
```

#### Next steps

Now that you have migrated your CKEditor&nbsp;5 React Context integration to use the CDN, you can continue with the next steps, such as the migration testing suite. It is identical to the steps described in the previous section.

### Migrate `useMultiRootEditor` hook

#### Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor&nbsp;5 imports in your test files, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, /* ... other imports */ } from 'ckeditor5';
import { AIAdapter, /* ... other imports */ } from 'ckeditor5-premium-features';
```

#### Step 2: Use `withCKEditorCloud` HOC to load CKEditor&nbsp;5 from CDN

If you use the `useMultiRootEditor` hook, you need to update it to use the `withCKEditorCloud` HOC. Here is an example of migrating the `useMultiRootEditor` hook:

**Before:**

```jsx
import { MultiRootEditor, Bold, Essentials, Italic, Paragraph } from 'ckeditor5';
import { useMultiRootEditor } from '@ckeditor/ckeditor5-react';

import 'ckeditor5/ckeditor5.css';

const App = () => {
	const editorProps = {
		editor: MultiRootEditor,
		data: {
			intro: '<h1>React multi-root editor</h1>',
			content: '<p>Hello from CKEditor&nbsp;5 multi-root!</p>'
		},
		config: {
			plugins: [ Essentials, Bold, Italic, Paragraph ],
			toolbar: {
				items: [ 'undo', 'redo', '|', 'bold', 'italic' ]
			},
		}
	};

	const {
		editor,
		toolbarElement,
		editableElements,
		data,
		setData,
		attributes,
		setAttributes
	} = useMultiRootEditor( editorProps );

	return (
		<div className="App">
			{ toolbarElement }
			{ editableElements }
		</div>
	);
}

export default App;
```

**After:**

```jsx
import { withCKEditorCloud } from '@ckeditor/ckeditor5-react';

/**
 * The `withCKEditorCloud` HOC allows you to load CKEditor 5 from the CKEditor Cloud and inject loaded data
 * as `cloud` property into your component. Configuration of the `cloud` passed to `withCKEditorCloud` is
 * the same as for the `useCKEditorCloud` hook and you can specify the version of CKEditor 5 to load and
 * optionally enable premium features.
 */
const withCKCloud = withCKEditorCloud( {
	cloud: {
		version: '43.0.0',
		languages: [ 'en', 'de' ]
	},

	// Optional. Render error when loading CKEditor 5 from the CKEditor Cloud fails.
	renderError: ( error ) => {
		console.error( error );

		return <div>Error!</div>;
	},

	// Optional: Render loading state when CKEditor 5 is being loaded from the CKEditor Cloud.
	renderLoader: () => <div>Loading...</div>,
} );

const App = withCKCloud( ( { cloud } ) => {
	const {
		MultiRootEditor,
		Bold,
		Essentials,
		Italic,
		Paragraph
	} = cloud.CKEditor;

	const editorProps = {
		editor: MultiRootEditor,
		data: {
			intro: '<h1>React multi-root editor</h1>',
			content: '<p>Hello from CKEditor&nbsp;5 multi-root!</p>'
		},
		config: {
			plugins: [ Essentials, Bold, Italic, Paragraph ],
			toolbar: {
				items: [ 'undo', 'redo', '|', 'bold', 'italic' ]
			},
		}
	};

	const {
		editor,
		toolbarElement,
		editableElements,
		data,
		setData,
		attributes,
		setAttributes
	} = useMultiRootEditor( editorProps );

	return (
		<div className="App">
			{ toolbarElement }
			{ editableElements }
		</div>
	);
} );
```
