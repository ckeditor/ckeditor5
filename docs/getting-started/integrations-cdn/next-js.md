---
menu-title: Next.js
meta-title: Using CKEditor 5 with Next.js from CDN | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with the Next.js framework using both routing strategies (App Router or Pages Router) and CDN.
category: cloud
order: 40
modified_at: 2023-11-14
---

# Integrating CKEditor&nbsp;5 with Next.js from CDN

[Next.js](https://nextjs.org/) is a React meta-framework that helps create full-stack web applications. It offers different rendering strategies like server-side rendering (SSR), client-side rendering (CSR), or static site generation (SSG). Additionally, it provides file-based routing, automatic code splitting, and other handy features out of the box.

Next.js 13 introduced a new App Router as an alternative to the previous Pages Router. App Router supports server components and is more server-centric than Pages Router, which is client-side oriented.

CKEditor&nbsp;5 does not support server-side rendering, but you can integrate it with the Next.js framework. In this guide, you will add the editor to a Next.js project using both routing paradigms. For this purpose, you will need [Next.js CLI](https://nextjs.org/docs/app/api-reference/create-next-app), and the official {@link getting-started/integrations/react-default-npm CKEditor&nbsp;5 React component}.

{@snippet getting-started/use-builder}

## Setting up the project

This guide assumes you already have a Next project. To create such a project, you can use CLI like `create-next-app`. Refer to the [Next.js documentation](https://nextjs.org/docs/app/api-reference/create-next-app) to learn more.

## Using from CDN

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

Next.js is based on React, so we need to install the [CKEditor 5 WYSIWYG editor component for React](https://www.npmjs.com/package/@ckeditor/ckeditor5-react):

```bash
npm install @ckeditor/ckeditor5-react
```

You will use the installed dependency in a React component. Create a new component in the components directory, for example, `components/custom-editor.js`. Inside the component file, import all necessary dependencies. Then, create a functional component that returns the CKEditor&nbsp;5 React component. The example below shows how to use the component with both open-source and premium plugins.

The App Router, by default, uses server components. It means you need to mark a component as client-side explicitly. You can achieve that by using the `'use client'` directive at the top of the file, above your imports. You do not need the directive if you use the Pages Router.

In the below example, the `useCKEditorCloud` hook is used to load the editor code and plugins from CDN. To use premium plugins, set the `premium` property to `true` and provide your license key in the configuration. For more information about the `useCKEditorCloud` helper, see the {@link getting-started/setup/loading-cdn-resources Loading CDN resources} guide.

```jsx
// components/custom-editor.js
'use client' // Required only in App Router.

import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CustomEditor = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
		premium: true
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor,
		Essentials,
		Paragraph,
		Bold,
		Italic
	} = cloud.CKEditor;

	const { FormatPainter } = cloud.CKEditorPremiumFeatures;

	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ '<p>Hello world!</p>' }
			config={ {
				licenseKey: '<YOUR_LICENSE_KEY>',
				plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ]
			} }
		/>
	);
};

export default CustomEditor;
```

The `CustomEditor` component is ready to be used inside a page. The page's directory will differ depending on the selected routing strategy.

CKEditor&nbsp;5 is a client-side text editor and relies on the browser APIs, so you need to disable server-side rendering for our custom component. You can lazily load the component using the `dynamic()` function built into Next.js.

Prepare a wrapper for the `CustomEditor` component to load it on the client side.

```jsx
// components/client-side-custom-editor.js
'use client' // Required only in App Router.

import dynamic from 'next/dynamic';

const ClientSideCustomEditor = dynamic( () => import( '@/components/custom-editor' ), { ssr: false } );

export default ClientSideCustomEditor;
```

And then use it in your application.

```jsx
// app/page.js (App Router)
// pages/index.js (Pages Router)

import ClientSideCustomEditor from '@/components/client-side-custom-editor';

function Home() {
  return (
    <ClientSideCustomEditor />
  );
}

export default Home;
```

You can run your project now. If you chose `create-next-app`, type `npm run dev` to see your application in the browser.

<info-box warning>
If you have trouble seeing the editor, remember that the Next.js project ships with CSS files that can interfere with the editor. You can remove them or add your styling.
</info-box>

Also, pay attention to the import path &ndash; this guide uses the [default import alias](https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases) (@). If you did not configure it, change the path

In the example above, we only used basic features of the `<CKEditor>` component. To learn more about additional features and configuration options, refer to the {@link getting-started/integrations-cdn/react-default-cdn React integration guide}.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
