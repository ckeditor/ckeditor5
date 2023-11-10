---
menu-title: Next.js
meta-title: Compatibility with Next.js | CKEditor 5 documentation
meta-description: Learn how to set up real-time collaboration in the Drupal editing platform with the CKEditor 5 Premium Features module.
category: integrations
order: 100
modified_at: 2023-11-10
---

# Compatibility with Next.js

Next.js is a React meta-framework that helps create full-stack web apps for production. It offers different rendering strategies like server-side rendering (SSR), client-side rendering (CSR), or static site generation (SSG). Additionally, it provides file-based routing, automatic code splitting, and other handy features out of the box.

Next.js 13 introduced a new App Router as an alternative to the previous Pages Router. App Router supports server components and is more server-centric than Pages Router, which is client-side oriented.

CKEditor 5 doesn't support server-side rendering yet, but it's possible to integrate it with the Next.js framework. In this guide, we will add the editor to the Next.js project using both routing paradigms.

## Setting up the project

* Assume that the user will use `create-next-app`
* Link to the Next.js CLI
* We will use the online builder to create a custom build
* Link to the online builder
* Link to the online builder guide

### Page Router

* Show snippet with `create-next-app` options
* Show generated file structure

### App Router

* Show snippet with `create-next-app` options
* Show generated file structure

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
