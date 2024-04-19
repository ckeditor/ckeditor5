/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import ImageTextAlternativeEditing from '../../src/imagetextalternative/imagetextalternativeediting.js';
import ImageTextAlternativeCommand from '../../src/imagetextalternative/imagetextalternativecommand.js';

describe( 'ImageTextAlternativeEditing', () => {
	let editor;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ ImageTextAlternativeEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	it( 'should have pluginName', () => {
		expect( ImageTextAlternativeEditing.pluginName ).to.equal( 'ImageTextAlternativeEditing' );
	} );

	it( 'should register ImageAlternativeTextCommand', () => {
		expect( editor.commands.get( 'imageTextAlternative' ) ).to.be.instanceOf( ImageTextAlternativeCommand );
	} );
} );
