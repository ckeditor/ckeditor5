/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { _getViewData } from '@ckeditor/ckeditor5-engine';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading';
import { ListEditing } from '@ckeditor/ckeditor5-list';

import { IndentEditing } from '../src/indentediting.js';
import { IndentBlock } from '../src/indentblock.js';
import { IndentBlockCommand } from '../src/indentblockcommand.js';

describe( 'IndentBlock', () => {
	let editor, model, doc;

	afterEach( () => {
		vi.restoreAllMocks();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( IndentBlock.pluginName ).toEqual( 'IndentBlock' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( IndentBlock.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( IndentBlock.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		return createTestEditor()
			.then( newEditor => {
				expect( newEditor.plugins.get( IndentBlock ) ).toBeInstanceOf( IndentBlock );
			} );
	} );

	it( 'should set proper schema rules', () => {
		return createTestEditor()
			.then( newEditor => {
				model = newEditor.model;

				expect( model.schema.checkAttribute( [ 'paragraph' ], 'blockIndent' ) ).toBe( true );
				expect( model.schema.checkAttribute( [ 'heading1' ], 'blockIndent' ) ).toBe( true );
				expect( model.schema.checkAttribute( [ 'heading2' ], 'blockIndent' ) ).toBe( true );
				expect( model.schema.checkAttribute( [ 'heading3' ], 'blockIndent' ) ).toBe( true );

				expect( model.schema.getAttributeProperties( 'blockIndent' ) ).toEqual( { isFormatting: true } );
			} );
	} );

	it( 'should register indent block command', () => {
		return createTestEditor()
			.then( newEditor => {
				const command = newEditor.commands.get( 'indentBlock' );

				expect( command ).toBeInstanceOf( IndentBlockCommand );
			} );
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				return createTestEditor().then( editor => {
					expect( editor.config.get( 'indentBlock' ) ).toEqual( { offset: 40, unit: 'px' } );
				} );
			} );
		} );
	} );

	describe( 'conversion', () => {
		describe( 'using offset', () => {
			describe( 'left–to–right content', () => {
				beforeEach( () => {
					return createTestEditor( {
						indentBlock: { offset: 50, unit: 'px' }
					} ).then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
					} );
				} );

				it( 'should convert margin-left to indent attribute (known offset)', () => {
					editor.setData( '<p style="margin-left:50px">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '50px' );

					expect( editor.getData() ).toEqual( '<p style="margin-left:50px;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-left:50px">foo</p>' );
				} );

				it( 'should convert margin-left to indent attribute (any offset)', () => {
					editor.setData( '<p style="margin-left:42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-left:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-left:42em">foo</p>' );
				} );

				it( 'should not convert margin-left to blockIndent for a standalone li element', () => {
					editor.setData( '<li style="margin-left:42em">foo</li>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( false );
				} );

				it( 'should convert margin shortcut to indent attribute (one entry)', () => {
					editor.setData( '<p style="margin:42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-left:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-left:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (two entries)', () => {
					editor.setData( '<p style="margin:24em 42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-left:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-left:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (three entries)', () => {
					editor.setData( '<p style="margin:24em 42em 20em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-left:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-left:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (four entries)', () => {
					editor.setData( '<p style="margin:24em 40em 24em 42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-left:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-left:42em">foo</p>' );
				} );

				describe( 'integration with List', () => {
					beforeEach( () => {
						return VirtualTestEditor
							.create( {
								plugins: [ Paragraph, ListEditing, IndentEditing, IndentBlock ]
							} )
							.then( newEditor => {
								editor = newEditor;
								model = editor.model;
								doc = model.document;
							} );
					} );

					// Block elements in Document Lists should not use `blockIndent` (it belongs to standalone blocks).
					it( 'should not convert margin-left to blockIndent for a list item', () => {
						editor.setData( '<ul><li style="margin-left:72.0pt">foo</li></ul>' );

						const paragraph = doc.getRoot().getChild( 0 );

						expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( false );
						expect( paragraph.getAttribute( 'blockIndentListItem' ) ).toBe( '72.0pt' );
						expect( editor.getData( { skipListItemIds: true } ) )
							.toEqual( '<ul><li style="margin-left:72.0pt;">foo</li></ul>' );
					} );
				} );
			} );

			describe( 'right–to–left content', () => {
				beforeEach( () => {
					return createTestEditor( {
						indentBlock: { offset: 50, unit: 'px' },
						language: {
							content: 'ar'
						}
					} ).then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
					} );
				} );

				it( 'should convert margin-right to indent attribute (known offset)', () => {
					editor.setData( '<p style="margin-right:50px">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '50px' );

					expect( editor.getData() ).toEqual( '<p style="margin-right:50px;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-right:50px">foo</p>' );
				} );

				it( 'should convert margin-right to indent attribute (any offset)', () => {
					editor.setData( '<p style="margin-right:42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-right:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-right:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (one entry)', () => {
					editor.setData( '<p style="margin:42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-right:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-right:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (two entries)', () => {
					editor.setData( '<p style="margin:24em 42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-right:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-right:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (three entries)', () => {
					editor.setData( '<p style="margin:24em 42em 20em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '42em' );

					expect( editor.getData() ).toEqual( '<p style="margin-right:42em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-right:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (four entries)', () => {
					editor.setData( '<p style="margin:24em 40em 24em 42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
					expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( '40em' );

					expect( editor.getData() ).toEqual( '<p style="margin-right:40em;">foo</p>' );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
						.toEqual( '<p style="margin-right:40em">foo</p>' );
				} );
			} );

			it( 'should not convert class to indent attribute', () => {
				return createTestEditor( {
					indentBlock: { offset: 50, unit: 'px' }
				} ).then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;

					editor.setData( '<p class="indent-1">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( false );

					const expectedView = '<p>foo</p>';

					expect( editor.getData() ).toEqual( expectedView );
					expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( expectedView );
				} );
			} );
		} );

		describe( 'using classes', () => {
			beforeEach( () => {
				return createTestEditor( {
					indentBlock: {
						classes: [ 'indent-1', 'indent-2', 'indent-3', 'indent-4' ]
					}
				} ).then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
			} );

			it( 'should convert class to indent attribute', () => {
				editor.setData( '<p class="indent-1">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( true );
				expect( paragraph.getAttribute( 'blockIndent' ) ).toEqual( 'indent-1' );

				const expectedView = '<p class="indent-1">foo</p>';

				expect( editor.getData() ).toEqual( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( expectedView );
			} );

			it( 'should not convert unknown class to indent attribute', () => {
				editor.setData( '<p class="indent-7">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( false );

				const expectedView = '<p>foo</p>';

				expect( editor.getData() ).toEqual( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( expectedView );
			} );

			it( 'should not convert margin-left to indent attribute (known offset)', () => {
				editor.setData( '<p style="margin-left:50px">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'blockIndent' ) ).toBe( false );

				const expectedView = '<p>foo</p>';

				expect( editor.getData() ).toEqual( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( expectedView );
			} );
		} );
	} );

	function createTestEditor( extraConfig = {} ) {
		return VirtualTestEditor
			.create( Object.assign( {
				plugins: [ Paragraph, HeadingEditing, IndentEditing, IndentBlock ]
			}, extraConfig ) );
	}
} );
