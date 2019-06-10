/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MultiCommand from '@ckeditor/ckeditor5-core/src/multicommand';

import IndentBlock from '../src/indentblock';
import IndentBlockCommand from '../src/indentblockcommand';

class Indent extends Plugin {
	init() {
		const editor = this.editor;

		editor.commands.add( 'indent', new MultiCommand( editor ) );
		editor.commands.add( 'outdent', new MultiCommand( editor ) );
	}
}

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

				expect( model.schema.checkAttribute( [ 'heading1' ], 'indent' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ 'paragraph' ], 'indent' ) ).to.be.true;
			} );
	} );

	it( 'should register indent block command', () => {
		return createTestEditor()
			.then( newEditor => {
				const command = newEditor.commands.get( 'indentBlock' );

				expect( command ).to.be.instanceof( IndentBlockCommand );
			} );
	} );

	describe( 'conversion', () => {
		describe( 'using offset', () => {
			beforeEach( () => {
				return createTestEditor( { indentBlock: { offset: 50, unit: 'px' } } )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
					} );
			} );

			it( 'should convert margin-left to indent attribute', () => {
				editor.setData( '<p style="margin-left:50px">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( '50px' );

				expect( editor.getData() ).to.equal( '<p style="margin-left:50px;">foo</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p style="margin-left:50px">foo</p>' );
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

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( 'indent-1' );

				const expectedView = '<p class="indent-1">foo</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );
		} );
	} );

	function createTestEditor( extraConfig = {} ) {
		return VirtualTestEditor
			.create( Object.assign( {
				plugins: [ Paragraph, HeadingEditing, Indent, IndentBlock ]
			}, extraConfig ) );
	}
} );
