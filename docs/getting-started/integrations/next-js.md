---
menu-title: Next.js
meta-title: Using CKEditor 5 with Next.jsfrom npm | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with the Next.js framework using both routing strategies (App Router or Pages Router) and npm.
category: self-hosted
order: 40
modified_at: 2023-11-14
---

# Integrating CKEditor&nbsp;5 with Next.js from npm

[Next.js](https://nextjs.org/) is a React meta-framework that helps create full-stack web applications. It offers different rendering strategies like server-side rendering (SSR), client-side rendering (CSR), or static site generation (SSG). Additionally, it provides file-based routing, automatic code splitting, and other handy features out of the box.

Next.js 13 introduced a new App Router as an alternative to the previous Pages Router. App Router supports server components and is more server-centric than Pages Router, which is client-side oriented.

CKEditor&nbsp;5 does not support server-side rendering, but you can integrate it with the Next.js framework. In this guide, you will add the editor to a Next.js project using both routing paradigms. For this purpose, you will need [Next.js CLI](https://nextjs.org/docs/app/api-reference/create-next-app), and the official {@link getting-started/integrations/react-default-npm CKEditor&nbsp;5 React component}.

{@snippet getting-started/use-builder}

## Setting up the project

This guide assumes you already have a Next project. To create such a project, you can use CLI like `create-next-app`. Refer to the [Next.js documentation](https://nextjs.org/docs/app/api-reference/create-next-app) to learn more.

## Installing from npm

First, install the CKEditor 5 packages:

* `ckeditor5` &ndash; package with open-source plugins and features.
* `ckeditor5-premium-features` &ndash; package with premium plugins and features.

Depending on your configuration and chosen plugins, you may need to install the first or both packages.

```bash
npm install ckeditor5 ckeditor5-premium-features
```

Next.js is based on React, so install the [CKEditor 5 WYSIWYG editor component for React](https://www.npmjs.com/package/@ckeditor/ckeditor5-react), too:

```bash
npm install @ckeditor/ckeditor5-react
```

Next, you will use the installed dependencies in a React component. Create a new component in the components directory, for example, `components/custom-editor.js`. Inside the component file, import all necessary dependencies. Then, create a functional component that returns the CKEditor&nbsp;5 React component. The below example shows how to use the component with open-source and premium plugins.

App Router, by default, uses server components. It means you need to mark a component as client-side explicitly. You can achieve that by using the `'use client'` directive at the top of a file, above your imports. You do not need the directive if you use the Pages Router.

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

```jsx
// components/custom-editor.js
'use client' // Required only in App Router.

import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

function CustomEditor() {
	return (
		<CKEditor
			editor={ ClassicEditor }
			config={ {
				licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
				plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ],
				initialData: '<p>Hello from CKEditor 5 in React!</p>'
			} }
		/>
	);
}

export default CustomEditor;
```

The `CustomEditor` component is ready to be used inside a page. The page's directory will differ depending on the chosen routing strategy.

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

Also, pay attention to the import path &ndash; this guide uses the [default import alias](https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases) (@). If you did not configure it, change the path appropriately.

In the example above, we only used basic features of the `<CKEditor>` component. To learn more about additional features and configuration options, refer to the {@link getting-started/integrations/react-default-npm React integration guide}.

## How to?

### Using the editor with collaboration plugins

We provide several **ready-to-use integrations** featuring collaborative editing in Next.js applications:

* [CKEditor&nbsp;5 with real-time collaboration features and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-next)
* [CKEditor&nbsp;5 with offline comments, track changes and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/collaboration-for-next)

It is not mandatory to build applications on top of the above samples, however, they should help you get started.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
