/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import { Command } from 'ckeditor5/src/core';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';

import ShowBlocksCommand from '../src/showblockscommand';

describe( 'ShowBlocksCommand', () => {
	let editor, domElement, command;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials
			]
		} );

		command = new ShowBlocksCommand( editor );
		editor.commands.add( 'showBlocks', command );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should be a command instance', () => {
			expect( command ).to.be.instanceOf( Command );
		} );
	} );

	describe( '#execute()', () => {} );
} );
