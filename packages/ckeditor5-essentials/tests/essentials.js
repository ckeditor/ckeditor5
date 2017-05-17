/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import EssentialsPreset from '../src/essentials';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

describe( 'Essentials preset', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, { plugins: [ EssentialsPreset ] } )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editor.destroy();

		editorElement.remove();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( EssentialsPreset ) ).to.be.instanceOf( EssentialsPreset );
	} );

	it( 'should load all its dependencies', () => {
		expect( editor.plugins.get( Clipboard ) ).to.be.instanceOf( Clipboard );
		expect( editor.plugins.get( Enter ) ).to.be.instanceOf( Enter );
		expect( editor.plugins.get( Typing ) ).to.be.instanceOf( Typing );
		expect( editor.plugins.get( Undo ) ).to.be.instanceOf( Undo );
	} );
} );
