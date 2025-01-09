/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';

import ShowBlocksEditing from '../src/showblocksediting.js';
import ShowBlocksCommand from '../src/showblockscommand.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ShowBlocksEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ShowBlocksEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should register the "showBlocks" command', () => {
		const command = editor.commands.get( 'showBlocks' );

		expect( command ).to.be.instanceOf( ShowBlocksCommand );
	} );
} );
