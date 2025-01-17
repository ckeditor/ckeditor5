/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import ParagraphCommand from '../src/paragraphcommand.js';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'ParagraphCommand', () => {
	let editor, model, document, command, root, schema;

	beforeEach( () => {
		return ModelTestEditor.create().then( newEditor => {
			editor = newEditor;
			model = editor.model;
			document = model.document;
			schema = model.schema;
			command = new ParagraphCommand( editor );
			root = document.getRoot();

			editor.commands.add( 'paragraph', command );
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.register( 'heading1', { inheritAllFrom: '$block' } );

			schema.register( 'notBlock' );
			schema.extend( 'notBlock', { allowIn: '$root' } );
			schema.extend( '$text', { allowIn: 'notBlock' } );
		} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'value', () => {
		it( 'responds to changes in selection (collapsed selection)', () => {
			setData( model, '<heading1>foo[]bar</heading1>' );
			expect( command.value ).to.be.false;

			setData( model, '<paragraph>foo[]bar</paragraph>' );
			expect( command.value ).to.be.true;
		} );

		it( 'responds to changes in selection (non–collapsed selection)', () => {
			setData( model, '<heading1>[foo]</heading1><paragraph>bar</paragraph>' );
			expect( command.value ).to.be.false;

			setData( model, '<heading1>[foo</heading1><paragraph>bar]</paragraph>' );
			expect( command.value ).to.be.false;

			setData( model, '<heading1>foo</heading1>[<paragraph>bar]</paragraph>' );
			expect( command.value ).to.be.true;

			setData( model, '<heading1>foo</heading1><paragraph>[bar]</paragraph>' );
			expect( command.value ).to.be.true;

			setData( model, '<paragraph>[bar</paragraph><heading1>foo]</heading1>' );
			expect( command.value ).to.be.true;
		} );

		it( 'has proper value when inside non-block element', () => {
			setData( model, '<notBlock>[foo]</notBlock>' );

			expect( command.value ).to.be.false;
		} );

		it( 'has proper value when moved from block to element that is not a block', () => {
			setData( model, '<paragraph>[foo]</paragraph><notBlock>foo</notBlock>' );
			const element = document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( element ) );
			} );

			expect( command.value ).to.be.false;
		} );

		it( 'should be refreshed after calling refresh()', () => {
			setData( model, '<paragraph>[foo]</paragraph><notBlock>foo</notBlock>' );
			const element = document.getRoot().getChild( 1 );

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( element ) );

				expect( command.value ).to.be.true;
				command.refresh();
				expect( command.value ).to.be.false;
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should update value after execution', () => {
			setData( model, '<heading1>[]</heading1>' );
			command.execute();

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( command.value ).to.be.true;
		} );

		it( 'should not execute when selection is in non-editable place', () => {
			setData( model, '<heading1>[]</heading1>' );

			model.document.isReadOnly = true;
			command.execute();

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
		} );

		// https://github.com/ckeditor/ckeditor5-paragraph/issues/24
		it( 'should not rename blocks which cannot become paragraphs (paragraph is not allowed in their parent)', () => {
			model.schema.register( 'restricted', { allowIn: '$root' } );

			model.schema.register( 'fooBlock', {
				inheritAllFrom: '$block',
				allowIn: 'restricted'
			} );

			model.schema.addChildCheck( ( ctx, childDef ) => {
				if ( ctx.endsWith( 'restricted' ) && childDef.name == 'paragraph' ) {
					return false;
				}
			} );

			setData(
				model,
				'<heading1>a[bc</heading1>' +
				'<restricted><fooBlock></fooBlock></restricted>' +
				'<heading1>de]f</heading1>'
			);

			command.execute();

			expect( getData( model ) ).to.equal(
				'<paragraph>a[bc</paragraph>' +
				'<restricted><fooBlock></fooBlock></restricted>' +
				'<paragraph>de]f</paragraph>'
			);
		} );

		it( 'should not rename blocks which cannot become paragraphs (block is an object)', () => {
			model.schema.register( 'imageBlock', {
				isBlock: true,
				isObject: true,
				allowIn: '$root'
			} );

			setData(
				model,
				'<heading1>a[bc</heading1>' +
				'<imageBlock></imageBlock>' +
				'<heading1>de]f</heading1>'
			);

			command.execute();

			expect( getData( model ) ).to.equal(
				'<paragraph>a[bc</paragraph>' +
				'<imageBlock></imageBlock>' +
				'<paragraph>de]f</paragraph>'
			);
		} );

		it( 'should not rename blocks which already are pargraphs', () => {
			setData( model, '<paragraph>foo[</paragraph><heading1>bar]</heading1>' );

			model.change( writer => {
				expect( writer.batch.operations.length ).to.equal( 0 );

				command.execute();

				expect( writer.batch.operations.length ).to.equal( 1 );
			} );
		} );

		describe( 'custom options', () => {
			it( 'should use parent batch', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				model.change( writer => {
					expect( writer.batch.operations.length ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length ).to.above( 0 );
				} );
			} );

			it( 'should use provided selection', () => {
				setData( model, '<heading1>foo[]bar</heading1><heading1>baz</heading1><heading1>qux</heading1>' );

				const secondToLastHeading = root.getChild( 1 );
				const lastHeading = root.getChild( 2 );
				const selection = model.createSelection( model.createRange(
					model.createPositionAt( secondToLastHeading, 0 ),
					model.createPositionAt( lastHeading, 1 )
				) );

				command.execute( { selection } );
				expect( getData( model ) ).to.equal(
					'<heading1>foo[]bar</heading1><paragraph>baz</paragraph><paragraph>qux</paragraph>'
				);
			} );
		} );

		describe( 'collapsed selection', () => {
			it( 'does nothing when executed with already applied', () => {
				setData( model, '<paragraph>foo[]bar</paragraph>' );
				command.execute();

				expect( getData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			} );

			it( 'converts topmost blocks', () => {
				schema.register( 'inlineImage', { allowWhere: '$text' } );
				schema.extend( '$text', { allowIn: 'inlineImage' } );

				setData( model, '<heading1><inlineImage>foo[]</inlineImage>bar</heading1>' );
				command.execute();

				expect( getData( model ) ).to.equal( '<paragraph><inlineImage>foo[]</inlineImage>bar</paragraph>' );
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'converts all elements where selection is applied', () => {
				schema.register( 'heading2', { inheritAllFrom: '$block' } );

				setData( model, '<heading1>fo[o</heading1><heading2>bar</heading2><heading2>baz]</heading2>' );

				command.execute();
				expect( getData( model ) ).to.equal(
					'<paragraph>fo[o</paragraph><paragraph>bar</paragraph><paragraph>baz]</paragraph>'
				);
			} );

			it( 'converts all elements even if already anchored in paragraph', () => {
				schema.register( 'heading2', { inheritAllFrom: '$block' } );

				setData( model, '<paragraph>foo[</paragraph><heading2>bar]</heading2>' );

				command.execute();
				expect( getData( model ) ).to.equal( '<paragraph>foo[</paragraph><paragraph>bar]</paragraph>' );
			} );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled when inside another block', () => {
			setData( model, '<heading1>f{}oo</heading1>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be disabled if inside non-block', () => {
			setData( model, '<notBlock>f{}oo</notBlock>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be disabled if selection is placed on non-block element', () => {
			setData( model, '[<notBlock>foo</notBlock>]' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );
} );
