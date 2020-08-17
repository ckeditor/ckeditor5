/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';

import IndentEditing from '../src/indentediting';
import IndentBlock from '../src/indentblock';
import IndentBlockCommand from '../src/indentblockcommand';

describe( 'IndentBlock', () => {
	let editor, model, doc;

	testUtils.createSinonSandbox();

	afterEach( () => {
		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( IndentBlock.pluginName ).to.equal( 'IndentBlock' );
	} );

	it( 'should be loaded', () => {
		return createTestEditor()
			.then( newEditor => {
				expect( newEditor.plugins.get( IndentBlock ) ).to.be.instanceOf( IndentBlock );
			} );
	} );

	it( 'should set proper schema rules', () => {
		return createTestEditor()
			.then( newEditor => {
				model = newEditor.model;

				expect( model.schema.checkAttribute( [ 'paragraph' ], 'blockIndent' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ 'heading1' ], 'blockIndent' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ 'heading2' ], 'blockIndent' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ 'heading3' ], 'blockIndent' ) ).to.be.true;

				expect( model.schema.getAttributeProperties( 'blockIndent' ) ).to.deep.equal( { isFormatting: true } );
			} );
	} );

	it( 'should register indent block command', () => {
		return createTestEditor()
			.then( newEditor => {
				const command = newEditor.commands.get( 'indentBlock' );

				expect( command ).to.be.instanceof( IndentBlockCommand );
			} );
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				return createTestEditor().then( editor => {
					expect( editor.config.get( 'indentBlock' ) ).to.deep.equal( { offset: 40, unit: 'px' } );
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

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '50px' );

					expect( editor.getData() ).to.equal( '<p style="margin-left:50px;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-left:50px">foo</p>' );
				} );

				it( 'should convert margin-left to indent attribute (any offset)', () => {
					editor.setData( '<p style="margin-left:42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-left:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (one entry)', () => {
					editor.setData( '<p style="margin:42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-left:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (two entries)', () => {
					editor.setData( '<p style="margin:24em 42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-left:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (three entries)', () => {
					editor.setData( '<p style="margin:24em 42em 20em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-left:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (four entries)', () => {
					editor.setData( '<p style="margin:24em 40em 24em 42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-left:42em">foo</p>' );
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

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '50px' );

					expect( editor.getData() ).to.equal( '<p style="margin-right:50px;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-right:50px">foo</p>' );
				} );

				it( 'should convert margin-right to indent attribute (any offset)', () => {
					editor.setData( '<p style="margin-right:42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-right:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-right:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (one entry)', () => {
					editor.setData( '<p style="margin:42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-right:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-right:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (two entries)', () => {
					editor.setData( '<p style="margin:24em 42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-right:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-right:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (three entries)', () => {
					editor.setData( '<p style="margin:24em 42em 20em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '42em' );

					expect( editor.getData() ).to.equal( '<p style="margin-right:42em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-right:42em">foo</p>' );
				} );

				it( 'should convert margin shortcut to indent attribute (four entries)', () => {
					editor.setData( '<p style="margin:24em 40em 24em 42em">foo</p>' );

					const paragraph = doc.getRoot().getChild( 0 );

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
					expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '40em' );

					expect( editor.getData() ).to.equal( '<p style="margin-right:40em;">foo</p>' );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
						.to.equal( '<p style="margin-right:40em">foo</p>' );
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

					expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.false;

					const expectedView = '<p>foo</p>';

					expect( editor.getData() ).to.equal( expectedView );
					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
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

				expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( 'indent-1' );

				const expectedView = '<p class="indent-1">foo</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );

			it( 'should not convert unknown class to indent attribute', () => {
				editor.setData( '<p class="indent-7">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.false;

				const expectedView = '<p>foo</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );

			it( 'should not convert margin-left to indent attribute (known offset)', () => {
				editor.setData( '<p style="margin-left:50px">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.false;

				const expectedView = '<p>foo</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
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
