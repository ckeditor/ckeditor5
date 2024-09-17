---
menu-title: Next.js
meta-title: Integration with Next.js using CDN | CKEditor 5 documentation
meta-description: Integrate CKEditor 5 with the Next.js framework using both routing strategies (App Router or Pages Router) and CDN.
category: cloud
order: 40
modified_at: 2023-11-14
---

# Integrate CKEditor 5 with Next.js using CDN

[Next.js](https://nextjs.org/) is a React meta-framework that helps create full-stack web applications. It offers different rendering strategies like server-side rendering (SSR), client-side rendering (CSR), or static site generation (SSG). Additionally, it provides file-based routing, automatic code splitting, and other handy features out of the box.

Next.js 13 introduced a new App Router as an alternative to the previous Pages Router. App Router supports server components and is more server-centric than Pages Router, which is client-side oriented.

CKEditor&nbsp;5 does not support server-side rendering yet, but you can integrate it with the Next.js framework. In this guide, you will add the editor to a Next.js project using both routing paradigms. For this purpose, you will need [Next.js CLI](https://nextjs.org/docs/app/api-reference/create-next-app), and the official {@link getting-started/integrations/react-default-npm CKEditor&nbsp;5 React component}.

{@snippet getting-started/use-builder}

## Setting up the project

This guide assumes you already have a Next project. To create such a project, you can use CLI like `create-next-app`. Refer to the [Next.js documentation](https://nextjs.org/docs/app/api-reference/create-next-app) to learn more.

## Using from CDN

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

In the below example, the `useCKEditorCloud` hook is used to load the editor code and plugins from CDN. To use premium plugins, set the `premium` property to `true` and provide your license key in the configuration. For more information about the `loadCKEditorCloud` helper, see the {@link getting-started/setup/loading-cdn-resources Loading CDN resources} guide.

```jsx
// components/custom-editor.js
'use client' // only in App Router

import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CustomEditor = () => {
    const cloud = useCKEditorCloud( {
        version: '43.1.0',
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
        Italic,
        Mention
    } = cloud.CKEditor;

    const { SlashCommand } = cloud.CKEditorPremiumFeatures;

    return (
        <CKEditor
            editor={ ClassicEditor }
            data={ '<p>Hello world!</p>' }
            config={ {
                licenseKey: '<YOUR_LICENSE_KEY>', // Or "GPL"
                toolbar: {
                    items: [ 'undo', 'redo', '|', 'bold', 'italic' ],
                },
                plugins: [ Essentials, Paragraph, Bold, Italic, Mention, SlashCommand ],
            } }
        />
    );
};

export default CustomEditor;
```

The `CustomEditor` component is ready to be used inside a page. The page's directory will differ depending on the chosen routing strategy.

CKEditor&nbsp;5 is a client-side text editor and relies on the browser APIs, so you need to disable server-side rendering for our custom component. You can lazily load the component using the `dynamic()` function built into Next.js.

```jsx
// app/page.js (App Router)
// pages/index.js (Pages Router)

import dynamic from 'next/dynamic';

const CustomEditor = dynamic( () => import( '@/components/custom-editor' ), { ssr: false } );

function Home() {
  return (
	<CustomEditor />
  );
}

export default Home;
```

You can run your project now. If you chose `create-next-app`, type `npm run dev` to see your application in the browser.

<info-box warning>
If you have trouble seeing the editor, remember that the Next.js project ships with CSS files that can interfere with the editor. You can remove them or add your styling.
</info-box>

Also, pay attention to the import path &ndash; this guide uses the [default import alias](https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases) (@). If you did not configure it, change the path 