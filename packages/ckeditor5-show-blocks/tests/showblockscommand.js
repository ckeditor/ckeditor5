/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { global } from '@ckeditor/ckeditor5-utils';
import { Command } from '@ckeditor/ckeditor5-core';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';

import { ShowBlocksCommand } from '../src/showblockscommand.js';

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
			expect( command ).toBeInstanceOf( Command );
		} );

		it( 'should set "#affectsData" property to false', () => {
			expect( command.affectsData ).toBe( false );
		} );

		it( 'should set "#value" property to false', () => {
			expect( command.value ).toBe( false );
		} );
	} );

	describe( '#execute()', () => {
		it( 'should set "ck-show-blocks" class on the root when executed for the first time', () => {
			editor.execute( 'showBlocks' );

			expect( editor.editing.view.document.roots.get( 'main' ).hasClass( 'ck-show-blocks' ) ).toBe( true );
		} );

		it( 'should set block label styles on the root when executed for the first time', () => {
			editor.execute( 'showBlocks' );

			const root = editor.editing.view.document.roots.get( 'main' );
			const paragraphLabelLtr = root.getStyle( '--ck-show-blocks-label-p-ltr' );
			const headingLabelRtl = root.getStyle( '--ck-show-blocks-label-h2-rtl' );

			expect( paragraphLabelLtr ).toContain( 'data:image/svg+xml;utf8' );
			expect( paragraphLabelLtr ).toContain( '>P</text></svg>' );
			expect( headingLabelRtl ).toContain( '>H2</text></svg>' );
		} );

		it( 'should not overwrite existing block label styles', () => {
			const root = editor.editing.view.document.roots.get( 'main' );

			editor.editing.view.change( writer => {
				writer.setStyle( '--ck-show-blocks-label-address-ltr', 'preset-address-label', root );
			} );

			editor.execute( 'showBlocks' );

			expect( root.getStyle( '--ck-show-blocks-label-address-ltr' ) ).toBe( 'preset-address-label' );
		} );

		it( 'should remove "ck-show-blocks" class on the root when executed for the second time', () => {
			editor.execute( 'showBlocks' );
			editor.execute( 'showBlocks' );

			expect( editor.editing.view.document.roots.get( 'main' ).hasClass( 'ck-show-blocks' ) ).toBe( false );
		} );

		it( 'should set value to true when executed for the first time', () => {
			editor.execute( 'showBlocks' );

			expect( command.value ).toBe( true );
		} );

		it( 'should set value to false when executed for the second time', () => {
			editor.execute( 'showBlocks' );
			editor.execute( 'showBlocks' );

			expect( command.value ).toBe( false );
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
					expect( root.hasClass( 'ck-show-blocks' ), `Class was not set properly on ${ root.rootName } root` ).toBe( true );
				}
			} );

			it( 'should apply block label styles to all roots', () => {
				multirootEditor.execute( 'showBlocks' );

				for ( const root of multirootEditor.editing.view.document.roots ) {
					expect(
						root.getStyle( '--ck-show-blocks-label-blockquote-ltr' ),
						`Label style was not set properly on ${ root.rootName } root`
					).toContain( '>BLOCKQUOTE</text></svg>' );
				}
			} );

			it( 'should remove class from all roots', () => {
				multirootEditor.execute( 'showBlocks' );
				multirootEditor.execute( 'showBlocks' );

				for ( const root of multirootEditor.editing.view.document.roots ) {
					expect( root.hasClass( 'ck-show-blocks' ), `Class was not set properly on ${ root.rootName } root` ).toBe( false );
				}
			} );
		} );
	} );

	describe( 'inline roots', () => {
		describe( 'editor with only inline roots', () => {
			let inlineEditor, domInlineElement, inlineCommand;

			beforeEach( async () => {
				domInlineElement = global.document.createElement( 'div' );
				global.document.body.appendChild( domInlineElement );

				inlineEditor = await MultiRootEditor.create( {
					plugins: [
						Paragraph,
						Heading,
						Essentials
					],
					roots: {
						inline: { modelElement: '$inlineRoot', element: domInlineElement }
					}
				} );

				inlineCommand = new ShowBlocksCommand( inlineEditor );
				inlineEditor.commands.add( 'showBlocks', inlineCommand );
			} );

			afterEach( async () => {
				domInlineElement.remove();
				await inlineEditor.destroy();
			} );

			it( 'should set "isEnabled" to false when all roots are inline', () => {
				inlineCommand.refresh();

				expect( inlineCommand.isEnabled ).toBe( false );
			} );

			it( 'should not apply "ck-show-blocks" class to an inline root', () => {
				inlineCommand.isEnabled = true;
				inlineEditor.execute( 'showBlocks' );

				const inlineRoot = inlineEditor.editing.view.document.roots.get( 'inline' );

				expect( inlineRoot.hasClass( 'ck-show-blocks' ) ).toBe( false );
			} );

			it( 'should not apply block label styles to an inline root', () => {
				inlineCommand.isEnabled = true;
				inlineEditor.execute( 'showBlocks' );

				const inlineRoot = inlineEditor.editing.view.document.roots.get( 'inline' );

				expect( inlineRoot.getStyle( '--ck-show-blocks-label-p-ltr' ) ).toBeUndefined();
			} );
		} );

		describe( 'editor with mixed block and inline roots', () => {
			let mixedEditor, domBlockElement, domInlineElement, mixedCommand;

			beforeEach( async () => {
				domBlockElement = global.document.createElement( 'div' );
				domInlineElement = global.document.createElement( 'div' );
				global.document.body.appendChild( domBlockElement );
				global.document.body.appendChild( domInlineElement );

				mixedEditor = await MultiRootEditor.create( {
					plugins: [
						Paragraph,
						Heading,
						Essentials
					],
					roots: {
						block: { element: domBlockElement },
						inline: { modelElement: '$inlineRoot', element: domInlineElement }
					}
				} );

				mixedCommand = new ShowBlocksCommand( mixedEditor );
				mixedEditor.commands.add( 'showBlocks', mixedCommand );
			} );

			afterEach( async () => {
				domBlockElement.remove();
				domInlineElement.remove();
				await mixedEditor.destroy();
			} );

			it( 'should set "isEnabled" to true when at least one block root is present', () => {
				mixedCommand.refresh();

				expect( mixedCommand.isEnabled ).toBe( true );
			} );

			it( 'should apply "ck-show-blocks" class only to block roots', () => {
				mixedCommand.isEnabled = true;
				mixedEditor.execute( 'showBlocks' );

				const blockRoot = mixedEditor.editing.view.document.roots.get( 'block' );
				const inlineRoot = mixedEditor.editing.view.document.roots.get( 'inline' );

				expect( blockRoot.hasClass( 'ck-show-blocks' ) ).toBe( true );
				expect( inlineRoot.hasClass( 'ck-show-blocks' ) ).toBe( false );
			} );

			it( 'should apply block label styles only to block roots', () => {
				mixedCommand.isEnabled = true;
				mixedEditor.execute( 'showBlocks' );

				const blockRoot = mixedEditor.editing.view.document.roots.get( 'block' );
				const inlineRoot = mixedEditor.editing.view.document.roots.get( 'inline' );

				expect( blockRoot.getStyle( '--ck-show-blocks-label-p-ltr' ) ).toContain( '>P</text></svg>' );
				expect( inlineRoot.getStyle( '--ck-show-blocks-label-p-ltr' ) ).toBeUndefined();
			} );

			it( 'should remove "ck-show-blocks" class only from block roots on second execute', () => {
				mixedCommand.isEnabled = true;
				mixedEditor.execute( 'showBlocks' );
				mixedEditor.execute( 'showBlocks' );

				const blockRoot = mixedEditor.editing.view.document.roots.get( 'block' );
				const inlineRoot = mixedEditor.editing.view.document.roots.get( 'inline' );

				expect( blockRoot.hasClass( 'ck-show-blocks' ) ).toBe( false );
				expect( inlineRoot.hasClass( 'ck-show-blocks' ) ).toBe( false );
			} );
		} );
	} );
} );
