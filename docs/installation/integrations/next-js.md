---
menu-title: Next.js
meta-title: Integration with Next.js | CKEditor 5 documentation
meta-description: Learn how to integrate the rich text editor - CKEditor 5 - with the Next.js framework using the App Router or Pages Router routing strategies.
category: integrations
order: 100
modified_at: 2023-11-14
---

# Integrate CKEditor 5 with Next.js

[Next.js](https://nextjs.org/) is a React meta-framework that helps create full-stack web applications. It offers different rendering strategies like server-side rendering (SSR), client-side rendering (CSR), or static site generation (SSG). Additionally, it provides file-based routing, automatic code splitting, and other handy features out of the box.

Next.js 13 introduced a new App Router as an alternative to the previous Pages Router. App Router supports server components and is more server-centric than Pages Router, which is client-side oriented.

CKEditor&nbsp;5 does not support server-side rendering yet, but you can integrate it with the Next.js framework. In this guide, you will add the editor to a Next.js project using both routing paradigms. For this purpose, you will need [Next.js CLI](https://nextjs.org/docs/pages/api-reference/create-next-app), [CKEditor&nbsp;5 online builder](https://ckeditor.com/ckeditor-5/online-builder/), and the official {@link installation/integrations/react CKEditor&nbsp;5 React component}.

## Preparing a build

First, you will use the [online builder](https://ckeditor.com/ckeditor-5/online-builder/). It is a web UI that lets you create a custom build of CKEditor&nbsp;5 and download the code as a `.zip` package.

The online builder is a powerful tool that lets you effortlessly create a rich text editor tailored to your needs. With the online builder, you can choose the desired editor type and plugins, configure the toolbar, and choose the UI language for your editor.

You can learn more about creating custom builds of CKEditor&nbsp;5 with the online builder in the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Customized installation} guide.

## Setting up the project

This guide assumes you will use the official CLI tool for Next.js &ndash; `create-next-app`. Refer to the [Next.js documentation](https://nextjs.org/docs/pages/api-reference/create-next-app) to learn how to set up your project.

The CLI will ask you some questions. Depending on your choices, the folder structure in your project may differ.

## Integrating the build in your Next.js project

With the Next.js setup done, move to the actual integration. First, put your unzipped custom build at the project root in the `ckeditor5` folder.

### Page Router

If you chose the Page Router, your final folder structure should look like the one below.

```plain
├── ckeditor5
├── components
│      └── custom-editor.js
├── pages
│   ├── api
│      └── hello.js
│   ├── _app.js
│   ├── _document.js
│   └── index.js
├── public
│   ├── favicon.ico
│   ├── next.svg
│   └── vercel.svg
├── styles
│   ├── globals.css
│   └── Home.module.css
├── jsconfig.json
├── next.config.js
├── package.json
└── ...
```

### App Router

If you chose the App Router, your final folder structure should look like the one below.

```plain
├── ckeditor5
├── components
│      └── custom-editor.js
├── app
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   └── page.module.css
├── public
│   ├── next.svg
│   └── vercel.svg
├── jsconfig.json
├── next.config.js
├── package.json
└── ...
```

Then, add the folder as a local dependency using the Yarn command:

```bash
yarn add file:./ckeditor5 # or npm install file:./ckeditor5
```

The dependency should be visible in the `package.json` file as `ckeditor5-custom-build`. Additionally, you need an external dependency &ndash; the CKEditor&nbsp;5 React component. Next.js extends React, and hence, the component is valid here. You can install it using the following command:

```bash
yarn add @ckeditor/ckeditor5-react # or npm install @ckeditor/ckeditor5-react
```

Next, you will use the installed dependencies in a React component. Create a new component in the components directory, for example, `components/custom-editor.js`. Inside the component file, import all necessary dependencies. Then, create a functional component that returns the CKEditor&nbsp;5 React component. The custom build ships with a default configuration, but you can customize it to your needs, as shown in the snippet below.

```jsx
// components/custom-editor.js

import React from 'react';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build";

const editorConfiguration = {
    toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
        '|',
        'imageUpload',
        'blockQuote',
        'insertTable',
        'mediaEmbed',
        'undo',
        'redo'
    ]
};

function CustomEditor( props ) {
		return (
			<CKEditor
				editor={ Editor }
				config={ editorConfiguration }
				data={ props.initialData }
				onChange={ (event, editor ) => {
					const data = editor.getData();
					console.log( { event, editor, data } );
				} }
			/>
		)
}

export default CustomEditor;
```

The `CustomEditor` component is ready to be used inside a page. The usage will differ depending on the chosen routing strategy.

You can either create a second page inside the `pages` directory or replace the content of the existing `index.js` page. You will go with the second option. CKEditor&nbsp;5 is a client-side text editor and relies on the browser APIs, so you need to disable server-side rendering for the custom component. You can lazily load the component using the `dynamic()` function built into Next.js.

App Router, by default, uses server components. It means you need to mark a component as client-side explicitly. You can achieve that by using the `'use client'` directive at the top of a file, above your imports. Also, pay attention to the folder structure, which is different now. The `page.js` file should go into the `app` directory.

```jsx
// app/page.js (App Router)
// pages/index.js (Pages Router)
'use client' // only in App Router

import React from 'react';
import dynamic from 'next/dynamic';

const CustomEditor = dynamic( () => {
  return import( '../components/custom-editor' );
}, { ssr: false } );

function Home() {
  return (
    <CustomEditor
      initialData='<h1>Hello from CKEditor in Next.js!</h1>'
    />
  );
}

export default Home;
```

You can run your project now. Regardless of your router choice, type `npm run dev` or `yarn run dev` to see your application in the browser. If you have trouble seeing the editor, remember that the Next.js project ships with CSS files that can interfere with the editor. You can remove them or add your styling.
