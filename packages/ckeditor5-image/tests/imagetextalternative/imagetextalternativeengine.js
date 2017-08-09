/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ImageTextAlternativeEngine from '../../src/imagetextalternative/imagetextalternativeengine';
import ImageTextAlternativeCommand from '../../src/imagetextalternative/imagetextalternativecommand';

describe( 'ImageTextAlternativeEngine', () => {
	let editor;
	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageTextAlternativeEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	it( 'should register ImageAlteranteTextCommand', () => {
		expect( editor.commands.get( 'imageTextAlternative' ) ).to.be.instanceOf( ImageTextAlternativeCommand );
	} );
} );
