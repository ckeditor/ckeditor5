/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ParagraphCommand from '../src/paragraphcommand';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ParagraphCommand', () => {
	let editor, document, command, root, schema;

	beforeEach( () => {
		return ModelTestEditor.create().then( newEditor => {
			editor = newEditor;
			document = editor.document;
			schema = document.schema;
			command = new ParagraphCommand( editor );
			root = document.getRoot();

			editor.commands.add( 'paragraph', command );
			schema.registerItem( 'paragraph', '$block' );
			schema.registerItem( 'heading1', '$block' );

			schema.registerItem( 'notBlock' );
			schema.allow( { name: 'notBlock', inside: '$root' } );
			schema.allow( { name: '$text', inside: 'notBlock' } );
		} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'value', () => {
		it( 'responds to changes in selection (collapsed selection)', () => {
			setData( document, '<heading1>foo[]bar</heading1>' );
			expect( command.value ).to.be.false;

			setData( document, '<paragraph>foo[]bar</paragraph>' );
			expect( command.value ).to.be.true;
		} );

		it( 'responds to changes in selection (non–collapsed selection)', () => {
			setData( document, '<heading1>[foo]</heading1><paragraph>bar</paragraph>' );
			expect( command.value ).to.be.false;

			setData( document, '<heading1>[foo</heading1><paragraph>bar]</paragraph>' );
			expect( command.value ).to.be.false;

			setData( document, '<heading1>foo</heading1>[<paragraph>bar]</paragraph>' );
			expect( command.value ).to.be.true;

			setData( document, '<heading1>foo</heading1><paragraph>[bar]</paragraph>' );
			expect( command.value ).to.be.true;

			setData( document, '<paragraph>[bar</paragraph><heading1>foo]</heading1>' );
			expect( command.value ).to.be.true;
		} );

		it( 'has proper value when inside non-block element', () => {
			setData( document, '<notBlock>[foo]</notBlock>' );

			expect( command.value ).to.be.false;
		} );

		it( 'has proper value when moved from block to element that is not a block', () => {
			setData( document, '<paragraph>[foo]</paragraph><notBlock>foo</notBlock>' );
			const element = document.getRoot().getChild( 1 );

			document.enqueueChanges( () => {
				document.selection.setRanges( [ Range.createIn( element ) ] );
			} );

			expect( command.value ).to.be.false;
		} );

		it( 'should be refreshed after calling refresh()', () => {
			setData( document, '<paragraph>[foo]</paragraph><notBlock>foo</notBlock>' );
			const element = document.getRoot().getChild( 1 );

			// Purposely not putting it in `document.enqueueChanges` to update command manually.
			document.selection.setRanges( [ Range.createIn( element ) ] );

			expect( command.value ).to.be.true;
			command.refresh();
			expect( command.value ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should update value after execution', () => {
			setData( document, '<heading1>[]</heading1>' );
			command.execute();

			expect( getData( document ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( command.value ).to.be.true;
		} );

		// https://github.com/ckeditor/ckeditor5-paragraph/issues/24
		it( 'should not rename blocks which cannot become paragraphs', () => {
			document.schema.registerItem( 'restricted' );
			document.schema.allow( { name: 'restricted', inside: '$root' } );
			document.schema.disallow( { name: 'paragraph', inside: 'restricted' } );

			document.schema.registerItem( 'fooBlock', '$block' );
			document.schema.allow( { name: 'fooBlock', inside: 'restricted' } );

			setData(
				document,
				'<heading1>a[bc</heading1>' +
				'<restricted><fooBlock></fooBlock></restricted>' +
				'<heading1>de]f</heading1>'
			);

			command.execute();

			expect( getData( document ) ).to.equal(
				'<paragraph>a[bc</paragraph>' +
				'<restricted><fooBlock></fooBlock></restricted>' +
				'<paragraph>de]f</paragraph>'
			);
		} );

		it( 'should not rename blocks which already are pargraphs', () => {
			const batch = editor.document.batch();

			setData( document, '<paragraph>foo[</paragraph><heading1>bar]</heading1>' );
			expect( batch.deltas.length ).to.equal( 0 );

			command.execute( { batch } );
			expect( batch.deltas.length ).to.equal( 1 );
		} );

		describe( 'custom options', () => {
			it( 'should use provided batch', () => {
				const batch = editor.document.batch();

				setData( document, '<heading1>foo[]bar</heading1>' );
				expect( batch.deltas.length ).to.equal( 0 );

				command.execute( { batch } );
				expect( batch.deltas.length ).to.be.above( 0 );
			} );

			it( 'should use provided selection', () => {
				setData( document, '<heading1>foo[]bar</heading1><heading1>baz</heading1><heading1>qux</heading1>' );

				const secondToLastHeading = root.getChild( 1 );
				const lastHeading = root.getChild( 2 );
				const selection = new Selection();
				selection.addRange( Range.createFromParentsAndOffsets( secondToLastHeading, 0, lastHeading, 1 ) );

				command.execute( { selection } );
				expect( getData( document ) ).to.equal(
					'<heading1>foo[]bar</heading1><paragraph>baz</paragraph><paragraph>qux</paragraph>'
				);
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'does nothing when executed with already applied', () => {
				setData( document, '<paragraph>foo[]bar</paragraph>' );
				command.execute();

				expect( getData( document ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			it( 'converts topmost blocks', () => {
				schema.registerItem( 'inlineImage', '$inline' );
				schema.allow( { name: '$text', inside: 'inlineImage' } );

				setData( document, '<heading1><inlineImage>foo[]</inlineImage>bar</heading1>' );
				command.execute();

				expect( getData( document ) ).to.equal( '<paragraph><inlineImage>foo[]</inlineImage>bar</paragraph>' );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'converts all elements where selection is applied', () => {
				schema.registerItem( 'heading2', '$block' );

				setData( document, '<heading1>foo[</heading1><heading2>bar</heading2><heading2>baz]</heading2>' );

				command.execute();
				expect( getData( document ) ).to.equal(
					'<paragraph>foo[</paragraph><paragraph>bar</paragraph><paragraph>baz]</paragraph>'
				);
			} );

			it( 'converts all elements even if already anchored in paragraph', () => {
				schema.registerItem( 'heading2', '$block' );

				setData( document, '<paragraph>foo[</paragraph><heading2>bar]</heading2>' );

				command.execute();
				expect( getData( document ) ).to.equal( '<paragraph>foo[</paragraph><paragraph>bar]</paragraph>' );
			} );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled when inside another block', () => {
			setData( document, '<heading1>f{}oo</heading1>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be disabled if inside non-block', () => {
			setData( document, '<notBlock>f{}oo</notBlock>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be disabled if selection is placed on non-block element', () => {
			setData( document, '[<notBlock>foo</notBlock>]' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );
} );
