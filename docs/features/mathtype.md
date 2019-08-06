---
category: features
---

# MathType Web

<info-box>
	The MathType Web for CKEditor 5 is a commercial solution provided by our partner, [WIRIS](http://www.wiris.com), and is in beta version. You can report any issues in CKEditor5 [GitHub repository](https://github.com/ckeditor/ckeditor5). The license can be purchased [here](https://ckeditor.com/contact/).
</info-box>

MathType Web is a WYSIWYG formula editor (equation editor), with classical and handwriting input modes. You can choose from a large collection of symbols and templates organized in thematic tabs in order to create formulas for CKEditor5 content. It is possible to edit many types of content: mathematics, physics, and science in general. Editing inorganic chemistry can be done thanks to the dedicated chemistry toolbar. To start using MathType Web in the editor, you need to follow the {@link features/mathtype#installation installation steps} described below.

## Demo

Click on the square root or chemistry icon in editor's toolbar below to enable the MathType Web formula editor. The web component window should show up on the screen.

{@snippet features/math-type}

## Usage

The MathType Web window is split into two main areas: a tabbed toolbar that contains a large number of icons, and an editing area where you can see your current formula, the location of the cursor, and the text currently selected (if any). When you are done, click OK (or Accept, or Insert) to save changes, or click Cancel to exit without making modifications. For more detailed information about creating and editing equations, please see [Using MathType Web page](https://docs.wiris.com/en/mathtype/mathtype_web/using_mathtype).

## Editing modes

MathType Web lets you choose between two editing modes:
* Classic input mode providing options to choose symbols and templates from MathType's toolbar, combining them to build the equation.
* Handwritten input mode lets you write the equation in your own handwriting. After checking the equation preview to ensure its accuracy, you can insert the equation or switch to classic input for further editing.

If you visit a page using MathType Web with your mobile device, the handwriting interface will appear by default. However, if you visit the same page with a laptop or desktop computer the classic input will show. The user is always free to change between the two interfaces.

## Installation

To add MathType Web features to your editor, install the [`@wiris/mathtype-ckeditor5`](https://www.npmjs.com/package/@wiris/mathtype-ckeditor5) package:
```js
npm install --save @wiris/mathtype-ckeditor5
```

Then add it to your plugin list and the toolbar configuration:
```js
import MathType from '@wiris/mathtype-ckeditor5';

ClassicEditor
	.create( document.querySelector( '#math-type-editor' ), {
		plugins: [ MathType, ... ],
		toolbar: [ 'MathType', 'ChemType', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>
