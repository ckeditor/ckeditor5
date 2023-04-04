---
# Scope:
# * Introduction to TypeScript in CKEditor 5
# * List and clarify the things that need attention when using TypeScript.

category: installation
order: 29
menu-title: TypeScript support
modified_at: 2023-04-03
---

# TypeScript support in CKEditor 5

CKEditor 5 is built using TypeScript and so has native types definition. All the official packages and builds distributed using NPM and CDN contain type definitions but their DLL versions aren't supported yet.

<info-box hint>
Using TypeScript is just an option. If you don't need its features, you can continue using CKEditor 5 in JavaScript.
</info-box>

## Why use CKEditor 5 with TypeScript?

Using TypeScript comes with some advantages:

* It helps produce clean and maintainable code
* It introduces code autocompletion and type suggestions for CKEditor 5 APIs
* If you are developing custom plugins and using CKEditor 5 Framework intensively, the TypeScript compiler will help you catch common type errors and increase the code quality

## CKEditor 5 TypeScript setup

Running CKEditor 5 doesn't differ much when using Typescript compared to the JavaScript environment. You may consider using type assertion or type casting to satisfy the TypeScript compiler.

### Running the editor
Here is an example of the classic editor build initialization:

```ts
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const editorPlaceholder = document.querySelector( '#editor' ) as HTMLElement;

ClassicEditor.create( editorPlaceholder ).catch( error => {
	console.error( error );
} );
```

<info-box warning>
Custom builds produced by online builder do not provide built-in type definitions yet.
</info-box>

### Integrating CKEditor 5 from source in your TypeScript project

If you want to integrate CKEditor 5 directly in your TypeScript project, follow the instructions for integrating from source using webpack and Vite:

* {@link installation/advanced/integrating-from-source-webpack Integration from source using webpack}
* {@link installation/advanced/integrating-from-source-vite Integration from source using Vite}

## Developing plugins using TypeScript

CKEditor 5's API is extensive and complex, but using TypeScript can make it easier to work with.

You can use {@link framework/package-generator/typescript-package package generator} to scaffold TypeScript-based plugins.
