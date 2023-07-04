/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

import ShowBlocksEditing from '../src/showblocksediting';
import ShowBlocksCommand from '../src/showblockscommand';

describe( 'ShowBlocksEditing', () => {
	let editor, domElement;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials,
				ShowBlocksEditing
			]
		} );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( ShowBlocksEditing.pluginName ).to.equal( 'ShowBlocksEditing' );
	} );

	it( 'should register the "showBlocks" command', () => {
		const command = editor.commands.get( 'showBlocks' );

		expect( command ).to.be.instanceOf( ShowBlocksCommand );
	} );
} );
