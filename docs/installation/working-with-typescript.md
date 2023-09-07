---
# Scope:
# * Introduction to TypeScript in CKEditor&nbsp;5
# * List and clarify the things that need attention when using TypeScript.

category: installation
order: 29
menu-title: TypeScript support
meta-title: TypeScript support | CKEditor 5 documentation
modified_at: 2023-04-03
---

# TypeScript support in CKEditor&nbsp;5

CKEditor&nbsp;5 is built using TypeScript and has native type definitions. All the official packages and builds distributed using NPM and CDN contain type definitions. Custom builds produced by the **online builder** and **DLL** versions of packages provided by CKEditor&nbsp;5 do not provide built-in typings yet.

<info-box hint>
	Using TypeScript is just an option. If you don't need its features, you can continue using CKEditor&nbsp;5 in JavaScript.
</info-box>

<info-box warning>
	Starting with the v37.0.0 release, CKEditor&nbsp;5 has built-in type definitions. If you used type definitions created by the community, you will need to replace them with native types. Check the {@link updating/update-to-37 Update to v37.0.0} guide.

	The minimal TypeScript version required to run CKEditor&nbsp;5 is v4.8.4.
</info-box>

## Why use CKEditor&nbsp;5 with TypeScript?

Using TypeScript comes with some advantages:

* It helps produce clean and maintainable code
* It introduces code autocompletion and type suggestions for CKEditor&nbsp;5 APIs
* If you are developing custom plugins and using CKEditor&nbsp;5 Framework intensively, the TypeScript compiler will help you catch common type errors and increase the code quality

## CKEditor&nbsp;5 TypeScript setup

Running CKEditor&nbsp;5 doesn't differ much when using Typescript compared to the JavaScript environment. You may consider using type assertion or type casting to satisfy the TypeScript compiler.

### Running the editor

Here is an example of the classic editor build initialization:

```ts
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const editorPlaceholder = document.querySelector( '#editor' ) as HTMLElement;

ClassicEditor.create( editorPlaceholder ).catch( error => {
	console.error( error );
} );
```

### Installing plugins

When using TypeScript you need to import all modules provided by CKEditor&nbsp;5 using a package entry point instead of a path to a module.

```ts
// Instead of:
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

// Do:
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
```

This approach ensures that TypeScript correctly loads all module augmentation code necessary to make certain types work. The previous method (importing via `@ckeditor/ckeditor5-*/src/*`) still works in most cases, but [it may randomly break](https://github.com/ckeditor/ckeditor5/issues/13433).

### Integrating CKEditor&nbsp;5 from source in your TypeScript project

If you want to integrate CKEditor&nbsp;5 directly in your TypeScript project, follow the instructions for integrating from source using webpack and Vite:

* {@link installation/advanced/integrating-from-source-webpack Integration from source using webpack}
* {@link installation/advanced/integrating-from-source-vite Integration from source using Vite}

### Typings for Angular, React, and Vue 3 components

The latest versions of our official components for Angular, React, and Vue 3 are migrated to TypeScript and use native CKEditor&nbsp;5's type definitions. You don't need to provide custom definitions anymore. You can use the following guides:

* {@link installation/integrations/angular Angular component}
* {@link installation/integrations/react React component}
* {@link installation/integrations/vuejs-v3 Vue.js 3+ component}

## Developing plugins using TypeScript

CKEditor&nbsp;5's API is extensive and complex, but using TypeScript can make it easier to work with.

You can use {@link framework/development-tools/package-generator/typescript-package package generator} to scaffold TypeScript-based plugins.
