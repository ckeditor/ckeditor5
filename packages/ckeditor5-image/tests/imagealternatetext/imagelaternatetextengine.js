/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from 'ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageAlternateTextEngine from 'ckeditor5-image/src/imagealternatetext/imagealternatetextengine';
import ImageAlternateTextCommand from 'ckeditor5-image/src/imagealternatetext/imagealternatetextcommand';

describe( 'ImageAlternateTextEngine', () => {
	let editor;
	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ ImageAlternateTextEngine ]
		} )
		.then( newEditor => {
			editor = newEditor;
		} );
	} );

	it( 'should register ImageAlteranteTextCommand', () => {
		expect( editor.commands.get( 'imageAlternateText' ) ).to.be.instanceOf( ImageAlternateTextCommand );
	} );
} );
