---
menu-title: Next.js
meta-title: Integration with Next.js with CDN | CKEditor 5 documentation
meta-description: Learn how to integrate CKEditor 5 with the Next.js framework using the App Router or Pages Router routing strategies
category: cloud
order: 40
modified_at: 2023-11-14
---

# Integrate CKEditor 5 with Next.js

[Next.js](https://nextjs.org/) is a React meta-framework that helps create full-stack web applications. It offers different rendering strategies like server-side rendering (SSR), client-side rendering (CSR), or static site generation (SSG). Additionally, it provides file-based routing, automatic code splitting, and other handy features out of the box.

Next.js 13 introduced a new App Router as an alternative to the previous Pages Router. App Router supports server components and is more server-centric than Pages Router, which is client-side oriented.

CKEditor&nbsp;5 does not support server-side rendering yet, but you can integrate it with the Next.js framework. In this guide, you will add the editor to a Next.js project using both routing paradigms. For this purpose, you will need [Next.js CLI](https://nextjs.org/docs/app/api-reference/create-next-app), and the official {@link getting-started/integrations/react-default-npm CKEditor&nbsp;5 React component}.

## Using CKEditor&nbsp;5 Builder

The easiest way to use CKEditor&nbsp;5 in your Next.js application is configuring it with [CKEditor&nbsp;5 Builder](https://ckeditor.com/builder?redirect=docs) and integrating it with your project. Builder offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:

* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs! You can take the output from the builder, specifically the npm React snippet, and follow the npm path below. Just replace the content of the `components/custom-editor.js` file. The snippet may contain client-side hooks, so do not forget about adding the `'use client'` directive in the case of the App Router.

## Setting up the project

This guide assumes you already have a Next project. To create such a project, you can use CLI like `create-next-app`. Refer to the [Next.js documentation](https://nextjs.org/docs/app/api-reference/create-next-app) to learn more.
