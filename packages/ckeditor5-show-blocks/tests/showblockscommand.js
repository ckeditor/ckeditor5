/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import { Command } from 'ckeditor5/src/core.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import MultiRootEditor from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';

import ShowBlocksCommand from '../src/showblockscommand.js';

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
		command.isEnabled = true;
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

		it( 'should set "#affectsData" property to false', () => {
			expect( command.affectsData ).to.be.false;
		} );

		it( 'should set "#value" property to false', () => {
			expect( command.value ).to.be.false;
		} );
	} );

	describe( '#execute()', () => {
		it( 'should set "ck-show-blocks" class on the root when executed for the first time', () => {
			editor.execute( 'showBlocks' );

			expect( editor.editing.view.document.roots.get( 'main' ).hasClass( 'ck-show-blocks' ) ).to.be.true;
		} );

		it( 'should remove "ck-show-blocks" class on the root when executed for the second time', () => {
			editor.execute( 'showBlocks' );
			editor.execute( 'showBlocks' );

			expect( editor.editing.view.document.roots.get( 'main' ).hasClass( 'ck-show-blocks' ) ).to.be.false;
		} );

		it( 'should set value to true when executed for the first time', () => {
			editor.execute( 'showBlocks' );

			expect( command.value ).to.be.true;
		} );

		it( 'should set value to false when executed for the second time', () => {
			editor.execute( 'showBlocks' );
			editor.execute( 'showBlocks' );

			expect( command.value ).to.be.false;
		} );

		describe( 'in multiroot editor', () => {
			let multirootEditor, domHeaderElement, domMainElement, multirootCommand;

			beforeEach( async () => {
				domHeaderElement = global.document.createElement( 'div', { id: 'header' } );
				domMainElement = global.document.createElement( 'div', { id: 'main' } );
				global.document.body.appendChild( domHeaderElement );
				global.document.body.appendChild( domMainElement );

				multirootEditor = await MultiRootEditor
					.create(
						// Define roots / editable areas:
						{
							header: domHeaderElement,
							content: domMainElement
						},
						{
							plugins: [
								Paragraph,
								Heading,
								Essentials
							]
						} );

				multirootCommand = new ShowBlocksCommand( multirootEditor );
				multirootCommand.isEnabled = true;
				multirootEditor.commands.add( 'showBlocks', multirootCommand );
			} );

			afterEach( async () => {
				domHeaderElement.remove();
				domMainElement.remove();
				await multirootEditor.destroy();
			} );

			it( 'should apply class to all roots', () => {
				multirootEditor.execute( 'showBlocks' );

				for ( const root of multirootEditor.editing.view.document.roots ) {
					expect( root.hasClass( 'ck-show-blocks' ), `Class was not set properly on ${ root.rootName } root` ).to.be.true;
				}
			} );

			it( 'should remove class from all roots', () => {
				multirootEditor.execute( 'showBlocks' );
				multirootEditor.execute( 'showBlocks' );

				for ( const root of multirootEditor.editing.view.document.roots ) {
					expect( root.hasClass( 'ck-show-blocks' ), `Class was not set properly on ${ root.rootName } root` ).to.be.false;
				}
			} );
		} );
	} );
} );
