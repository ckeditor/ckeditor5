---
menu-title: Next.js
meta-title: Compatibility with Next.js | CKEditor 5 documentation
meta-description: Learn how to set up real-time collaboration in the Drupal editing platform with the CKEditor 5 Premium Features module.
category: integrations
order: 100
modified_at: 2023-11-13
---

# Compatibility with Next.js

Next.js is a React meta-framework that helps create full-stack web apps for production. It offers different rendering strategies like server-side rendering (SSR), client-side rendering (CSR), or static site generation (SSG). Additionally, it provides file-based routing, automatic code splitting, and other handy features out of the box.

Next.js 13 introduced a new App Router as an alternative to the previous Pages Router. App Router supports server components and is more server-centric than Pages Router, which is client-side oriented.

CKEditor 5 doesn't support server-side rendering yet, but it's possible to integrate it with the Next.js framework. In this guide, we will add the editor to the Next.js project using both routing paradigms. For this purpose, we will need [Next.js CLI](https://nextjs.org/docs/pages/api-reference/create-next-app), CKEditor [online builder](https://ckeditor.com/ckeditor-5/online-builder/), and the official CKEditor {@link installation/integrations/react React component}.

## Preparing a build

In this guide, we will use the [online builder](https://ckeditor.com/ckeditor-5/online-builder/). It is a web UI that lets you create a custom build of CKEditor 5 and download the code as a zip package.

The online builder is a powerful tool that lets you effortlessly create a rich text editor personalized to your needs. With the online builder, you can choose the desired editor type and plugins, configure the toolbar, and choose the UI language for your editor.

You can learn more about creating custom builds of CKEditor 5 with the online builder in our {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder Customized installation} guide.

## Setting up the project

This guide assumes you will use the official CLI tool for Next.js - `create-next-app`. Refer to the [Next.js documentation](https://nextjs.org/docs/pages/api-reference/create-next-app) to learn how to set up your project.

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

If you chose the Page Router, your folder structure may look similar to the one below.

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

If you chose the App Router, your folder structure may look similar to the one below.

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

* Show where to put the build from the online builder - the root of the project
* Add local dependency - CKEditor 5 - using `yarn add file:./ckeditor5`
* The dependency will be visible in the `package.json` as `ckeditor-custom-build`
* Install the CKEditor React component using `yarn add @ckeditor/ckeditor5-react`
* Create a `CustomEditor` React component `src/components/custom-editor.js` (for App Router, there needs to be `use client` to define the Client component)
* Import the local CKEditor 5 build in the custom React component
* Import the CKEditor React component in the custom React component
* Pass the local build to the CKEditor React component
* Lazy load the custom editor component on the main page using `next/dynamic` (the step is different for the App router)
* Show the final file structure
* Mention that shipped CSS files can interfere with the Editor (or style it yourself)
