---
category: integrations
meta-title: CKEditor 5 integrations overview | CKEditor 5 documentation
order: 10
menu-title: Overview
---

# CKEditor&nbsp;5 integrations

CKEditor&nbsp;5 is framework agnostic and can be integrated with any JavaScript framework. CKEditor&nbsp;5 is a native JavaScript rich-text editing component written in TypeScript. It does not require any uncommon techniques or technologies to be used. Therefore, unless the framework you use has atypical limitations, CKEditor&nbsp;5 is compatible with it. Native integrations with the most popular libraries will save you time and effort.

## Official WYSIWYG editor integrations

There are four official integrations so far:

* {@link installation/integrations/angular CKEditor&nbsp;5 rich-text editor for Angular}
* {@link installation/integrations/react CKEditor&nbsp;5 rich-text editor for React}
* {@link installation/integrations/vuejs-v2 CKEditor&nbsp;5 rich-text editor for Vue.js 2.x}
* {@link installation/integrations/vuejs-v3 CKEditor&nbsp;5 rich-text editor for Vue.js 3.x}

Refer to their documentation to learn how to use them.

We plan to provide more integrations with time. We would like to [hear your ideas](https://github.com/ckeditor/ckeditor5/issues/1002) about what we should work on next.

## How do I use CKEditor&nbsp;5 if my framework does not have an official integration?

CKEditor&nbsp;5 should be compatible with your framework and initializing it usually requires a single method call. A tighter integration of CKEditor&nbsp;5 with your framework may require using an existing or writing a new adapter (integration layer) to communicate your framework with CKEditor&nbsp;5.

When checking how to integrate CKEditor&nbsp;5 with your framework, you can follow these steps:

1. **Check whether an [official integration](#official-wysiwyg-editor-integrations) exists.**

	There are four official integrations available so far: for {@link installation/integrations/react React}, {@link installation/integrations/angular Angular}, {@link installation/integrations/vuejs-v2 Vue.js 2.x}, and {@link installation/integrations/vuejs-v3 Vue.js 3.x}.
2. **If not, search for community-driven integrations.** Most of them are available on [npm](https://www.npmjs.com/).
3. **If none exists, integrate CKEditor&nbsp;5 with your framework by yourself.**

	CKEditor&nbsp;5 offers {@link installation/getting-started/predefined-builds predefined builds} that expose a rich JavaScript API, which you can use to {@link installation/getting-started/editor-lifecycle#creating-an-editor-with-create create editors} and {@link installation/getting-started/getting-and-setting-data#setting-the-editor-data-with-setdata control them}.

## Compatibility with CSS frameworks

CKEditor&nbsp;5 is compatible with popular CSS frameworks such as [Bootstrap](https://getbootstrap.com/) or [Foundation](https://get.foundation/). Such integrations, however, often require additional changes and adjustments that we have gathered {@link installation/integrations/css in this guide}.
