/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageTextAlternativeEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageTextAlternativeEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should register ImageAlternativeTextCommand', () => {
		expect( editor.commands.get( 'imageTextAlternative' ) ).to.be.instanceOf( ImageTextAlternativeCommand );
	} );
} );
