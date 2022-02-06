/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import DocumentListPropertiesEditing from '../../src/documentlistproperties/documentlistpropertiesediting';

describe( 'DocumentListPropertiesEditing', () => {
	let editor, model;

	it( 'should have pluginName', () => {
		expect( DocumentListPropertiesEditing.pluginName ).to.equal( 'DocumentListPropertiesEditing' );
	} );

	describe( 'config', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ DocumentListPropertiesEditing ]
			} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should have default values', () => {
			expect( editor.config.get( 'list' ) ).to.deep.equal( {
				properties: {
					styles: true,
					startIndex: false,
					reversed: false
				}
			} );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( DocumentListPropertiesEditing ) ).to.be.instanceOf( DocumentListPropertiesEditing );
		} );
	} );

	describe( 'listStyle', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, DocumentListPropertiesEditing, UndoEditing ],
				list: {
					properties: { styles: true, startIndex: false, reversed: false }
				}
			} );

			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should allow set `listStyle` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStyle' ) ).to.be.true;
			} );

			it( 'should not allow set `listReversed` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listReversed' ) ).to.be.false;
			} );

			it( 'should not allow set `listStart` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStart' ) ).to.be.false;
			} );
		} );
	} );

	describe( 'listReversed', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, DocumentListPropertiesEditing, UndoEditing ],
				list: {
					properties: { styles: false, startIndex: false, reversed: true }
				}
			} );

			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should not allow set `listStyle` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStyle' ) ).to.be.false;
			} );

			it( 'should not allow set `listReversed` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listReversed' ) ).to.be.true;
			} );

			it( 'should allow set `listStart` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStart' ) ).to.be.false;
			} );
		} );
	} );

	describe( 'listStart', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, DocumentListPropertiesEditing, UndoEditing ],
				list: {
					properties: { styles: false, startIndex: true, reversed: false }
				}
			} );

			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should allow set `listStyle` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStyle' ) ).to.be.false;
			} );

			it( 'should not allow set `listReversed` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listReversed' ) ).to.be.false;
			} );

			it( 'should not allow set `listStart` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStart' ) ).to.be.true;
			} );
		} );
	} );
} );
