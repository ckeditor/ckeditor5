---
menu-title: Next.js
meta-title: Compatibility with Next.js | CKEditor 5 documentation
meta-description: Learn how to integrate the Next.js framework with the rich text editor - CKEditor 5 - using both the App Router and Pages Router routing strategies.
category: integrations
order: 100
modified_at: 2023-11-14
---

# Compatibility with Next.js

Next.js is a React meta-framework that helps create full-stack web apps for production. It offers different rendering strategies like server-side rendering (SSR), client-side rendering (CSR), or static site generation (SSG). Additionally, it provides file-based routing, automatic code splitting, and other handy features out of the box.

Next.js 13 introduced a new App Router as an alternative to the previous Pages Router. App Router supports server components and is more server-centric than Pages Router, which is client-side oriented.

CKEditor&nbsp;5 does not support server-side rendering yet, but it is possible to integrate it with the Next.js framework. In this guide, we will add the editor to a Next.js project using both routing paradigms. For this purpose, we will need [Next.js CLI](https://nextjs.org/docs/pages/api-reference/create-next-app), [CKEditor&nbsp;5 online builder](https://ckeditor.com/ckeditor-5/online-builder/), and the official {CKEditor&nbsp;5 @link installation/integrations/react React component}.

## Preparing a build

First, we will use the [online builder](https://ckeditor.com/ckeditor-5/online-builder/). It is a web UI that lets you create a custom build of CKEditor&nbsp;5 and download the code as a zip package.

The online builder is a powerful tool that lets you effortlessly create a rich text editor tailored to your needs. With the online builder, you can choose the desired editor type and plugins, configure the toolbar, and choose the UI language for your editor.

You can learn more about creating custom builds of CKEditor&nbsp;5 with the online builder in the {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Customized installation} guide.

## Setting up the project

This guide assumes you will use the official CLI tool for Next.js &ndash; `create-next-app`. Refer to the [Next.js documentation](https://nextjs.org/docs/pages/api-reference/create-next-app) to learn how to set up your project.

The CLI will ask you some questions. Depending on your choices, the folder structure in your project may differ.

```plain
What is your project named?  next-ckeditor-integration
Would you like to use TypeScript?  No / Yes
Would you like to use ESLint?  No / Yes
Would you like to use Tailwind CSS?  No / Yes
Would you like to use `src/` directory?  No / Yes
Would you like to use App Router? (recommended)  No / Yes
Would you like to customize the default import alias (@/*)?  No / Yes
```

### Page Router

If you chose the Page Router, your folder structure should look similar to the one below.

```plain
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

If you chose the App Router, your folder structure should look similar to the one below.

```plain
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

## Integrating the build in your Next.js project

With the Next.js setup done, let's move to the actual integration. First, put your unzipped custom build at the project root in the `ckeditor5` folder. Then, add it as a local dependency using the yarn command:

```bash
yarn add file:./ckeditor5
```

The dependency should be visible in the `package.json` file as `ckeditor5-custom-build`. Additionally, we need an external dependency &ndash; the CKEditor&nbsp;5 React component. Next.js extends React, and hence, the component is valid here. You can install it using the following command:

```bash
yarn add @ckeditor/ckeditor5-react
```

Next, we will use the installed dependencies in a React component. Create a new component in the components directory, for example, `components/custom-editor.js`. Inside the component file, import all necessary dependencies. Then, create a functional component that returns the CKEditor&nbsp;5 React component with a proper configuration.

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

Our `CustomEditor` component is ready to be used inside a page. The usage will differ depending on the chosen routing strategy.

### Page Router

You can create a second page inside the `pages` directory or replace the content of the existing `index.js` page &ndash; we will go with the second option. CKEditor&nbsp;5 is a client-side text editor and relies on the browser APIs, so we need to disable SSR for our custom component. We can lazily load the component using the `dynamic()` function built into Next.js.

```jsx
// pages/index.js

import React from 'react';
import dynamic from 'next/dynamic';

const CustomEditor = dynamic( () => {
  return import( '../components/custom-editor' );
}, { ssr: false } );

function Home() {
  return (
    <CustomEditor 
      initialData='<h1>Hello from CKEditor in Next.js!</h1>'
      onChange={ ( e ) => console.log( e ) }
    />
  );
}

export default Home;
```

### App Router

App Router, by default, uses server components. It means we need to mark a component as client-side explicitly. We can achieve that by using the `'use client'` directive at the top of a file, above your imports. Also, pay attention to the folder structure, which is different now.

```jsx
// app/page.js

'use client'

import React from 'react';
import dynamic from 'next/dynamic';

const CustomEditor = dynamic( () => {
  return import( '../components/custom-editor' );
}, { ssr: false } );

function Home() {
  return (
    <CustomEditor 
      initialData='<h1>Hello from CKEditor in Next.js!</h1>'
      onChange={ ( e ) => console.log( e ) }
    />
  );
}

export default Home;
```

Finally, you can run your project. Regardless of your router choice, type `yarn run dev` to see your app in the browser. If you have trouble seeing the editor, remember that the Next.js project ships with CSS files that can interfere with the editor. You can remove them or add your styling.
