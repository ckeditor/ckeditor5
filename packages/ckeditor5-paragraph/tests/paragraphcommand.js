/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ParagraphCommand from '@ckeditor/ckeditor5-paragraph/src/paragraphcommand';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HeadingCommand', () => {
	let editor, document, command, root, schema;

	beforeEach( () => {
		return ModelTestEditor.create().then( newEditor => {
			editor = newEditor;
			document = editor.document;
			schema = document.schema;
			command = new ParagraphCommand( editor );
			root = document.getRoot();

			editor.commands.set( 'paragraph', command );
			schema.registerItem( 'paragraph', '$block' );
			schema.registerItem( 'heading1', '$block' );
		} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'value', () => {
		it( 'has default value', () => {
			setData( document, '' );

			expect( command.value ).to.be.false;
		} );

		it( 'responds to changes in selection', () => {
			setData( document, '<heading1>foo[]bar</heading1>' );
			expect( command.value ).to.be.false;

			setData( document, '<paragraph>foo[]bar</paragraph>' );
			expect( command.value ).to.be.true;
		} );
	} );

	describe( '_doExecute', () => {
		it( 'should update value after execution', () => {
			setData( document, '<heading1>[]</heading1>' );
			command._doExecute();

			expect( getData( document ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( command.value ).to.be.true;
		} );

		describe( 'custom options', () => {
			it( 'should use provided batch', () => {
				const batch = editor.document.batch();

				setData( document, '<heading1>foo[]bar</heading1>' );
				expect( batch.deltas.length ).to.equal( 0 );

				command._doExecute( { batch } );
				expect( batch.deltas.length ).to.be.above( 0 );
			} );

			it( 'should use provided selection', () => {
				setData( document, '<heading1>foo[]bar</heading1><heading1>baz</heading1><heading1>qux</heading1>' );

				const secondTolastHeading = root.getChild( 1 );
				const lastHeading = root.getChild( 2 );
				const selection = new Selection();
				selection.addRange( Range.createFromParentsAndOffsets( secondTolastHeading, 0, lastHeading, 0 ) );

				command._doExecute( { selection } );
				expect( getData( document ) ).to.equal( '<heading1>foo[]bar</heading1><paragraph>baz</paragraph><paragraph>qux</paragraph>' );
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'does nothing when executed with already applied', () => {
				setData( document, '<paragraph>foo[]bar</paragraph>' );
				command._doExecute();

				expect( getData( document ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			it( 'converts topmost blocks', () => {
				schema.registerItem( 'inlineImage', '$inline' );
				schema.allow( { name: '$text', inside: 'inlineImage' } );

				setData( document, '<heading1><inlineImage>foo[]</inlineImage>bar</heading1>' );
				command._doExecute();

				expect( getData( document ) ).to.equal( '<paragraph><inlineImage>foo[]</inlineImage>bar</paragraph>' );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'converts all elements where selection is applied', () => {
				schema.registerItem( 'heading2', '$block' );

				setData( document, '<heading1>foo[</heading1><heading2>bar</heading2><heading2>]baz</heading2>' );
				command._doExecute();

				expect( getData( document ) ).to.equal(
					'<paragraph>foo[</paragraph><paragraph>bar</paragraph><paragraph>]baz</paragraph>'
				);
			} );
		} );
	} );
} );
