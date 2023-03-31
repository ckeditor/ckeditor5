---
# Scope:
# * Introduction to TypeScript in CKEditor 5
# * List and clarify the things that need attention when using TypeScript.


category: installation
order: 29
menu-title: TypeScript support
modified_at: 2023-03-29
---

# TypeScript support in CKEditor 5

CKEditor 5 is built using TypeSript and so has native types definition.

<info-box hint>
Using TypeScript is just an option. If you don't need its features, you can continue using CKEditor 5 in JavaScript.
</info-box>

## Why to use CKEditor 5 with TypeScript?

Using TypeScript you're getting autocomplete for CKEditor 5 APIs. It helps to produce clean and maintainable code. It may be especially beneficial if you're developing your plugins and using CKEditor 5 Framework intensively.

## Setup

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
Custom builds produced by online builder do not provide types yet.
</info-box>


### Integrating CKEditor 5 from source in your TypeScript project

If you want to integrate CKEditor 5 directly in your TypeScript project then please follow the instructions for integrating from source using webpack and Vite.

* {@link installation/advanced/integrating-from-source-webpack Integration from source using webpack}
* {@link installation/advanced/integrating-from-source-vite Integrarion from source using Vite}


## Developing plugins using TypeScript

CKEditor 5's API can be quite extensive and complex, but using TypeScript can make it easier to work with.

You can use {@link framework/package-generator/typescript-package package generator} to scaffold TypeScript-based plugins.








