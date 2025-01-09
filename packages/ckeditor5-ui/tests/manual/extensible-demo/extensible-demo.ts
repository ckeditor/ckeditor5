/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document */

import { type Locale } from 'ckeditor5/src/utils.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { ButtonView, createLabeledInputText, LabeledFieldView, View, type ViewCollection } from 'ckeditor5/src/ui.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

class DemoFormView extends View {
	public children: ViewCollection;

	constructor( locale: Locale ) {
		super( locale );

		const labeledInputView = new LabeledFieldView( locale, createLabeledInputText );
		labeledInputView.set( { label: 'URL' } );
		const saveButtonView = new ButtonView( locale );
		saveButtonView.set( { label: 'Save', withText: true } );
		const cancelButtonView = new ButtonView( locale );
		cancelButtonView.set( { label: 'Cancel', withText: true } );

		this.children = this.createCollection( [
			labeledInputView,
			saveButtonView,
			cancelButtonView
		] );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck', 'ck-reset_all' ],
				dir: 'ltr',
				style: {
					border: '1px solid #000',
					padding: '20px'
				}
			},
			children: this.children
		} );
	}
}

class DemoPlugin extends Plugin {
	public static get pluginName() {
		return 'DemoPlugin';
	}

	constructor( editor: Editor ) {
		super( editor );

		console.log( 'DemoPlugin()' );

		editor.ui.components.set( 'DemoFormView', DemoFormView );
	}

	public init() {
		const editor = this.editor;
		const DemoFormViewClassConstructor = editor.ui.components.get<DemoFormView>( 'DemoFormView' );

		if ( DemoFormViewClassConstructor ) {
			const demoFormView = new DemoFormViewClassConstructor( editor.locale );

			demoFormView.render();

			document.body.appendChild( demoFormView.element! );
		}
	}
}

// -------------------------------------------------------------------------------------------------------------------------------
// ------------------------------- View replacement case-study -------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------

class ReplacedFormView extends View {
	constructor( locale: Locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'form',
			attributes: {
				class: [ 'ck', 'ck-reset_all' ],
				dir: 'ltr',
				style: {
					border: '1px solid #000',
					padding: '20px'
				}
			},
			children: [
				{ text: 'This is ReplacedFormView. It replaced DemoFormView' }
			]
		} );
	}
}

class IntegratorsViewReplacement extends Plugin {
	public static get requires() {
		return [ 'DemoPlugin' ];
	}

	constructor( editor ) {
		super( editor );

		console.log( 'IntegratorsViewReplacement()' );

		editor.ui.components.set( 'DemoFormView', ReplacedFormView );
	}
}

console.log( 'Starting editor -1' );
ClassicEditor.create( '', {
	plugins: [ DemoPlugin ]
} );

console.log( 'Starting editor 0' );
ClassicEditor.create( '', {
	plugins: [ DemoPlugin, IntegratorsViewReplacement ]
} );

// -------------------------------------------------------------------------------------------------------------------------------
// --------------------------------------------- View customization study --------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------

class IntegratorsViewCustomization extends Plugin {
	public static get requires() {
		return [ 'DemoPlugin' ];
	}

	constructor( editor ) {
		super( editor );

		console.log( 'IntegratorsViewCustomization()' );

		const DemoFormViewClassConstructor = this.editor.ui.components.get<DemoFormView>( 'DemoFormView' );

		if ( DemoFormViewClassConstructor ) {
			class CustomizedDemoFormView extends DemoFormViewClassConstructor {
				constructor( locale: Locale ) {
					super( locale );

					this.template!.attributes!.style[ 0 ]!.background = 'orange';

					const text = new View();

					text.setTemplate( {
						tag: 'div',
						children: [
							{ text: 'This is CustomizedDemoFormView. It extends DemoFormView' }
						]
					} );

					this.children.add( text );
				}
			}

			this.editor.ui.components.set( 'DemoFormView', CustomizedDemoFormView );
		} else {
			console.error( 'DemoFormView not found' );
		}
	}
}

console.log( 'Starting editor 1' );
ClassicEditor.create( '', {
	plugins: [ DemoPlugin, IntegratorsViewCustomization ]
} );

console.log( 'Starting editor 2' );
ClassicEditor.create( '', {
	plugins: [ IntegratorsViewCustomization, DemoPlugin ]
} );

