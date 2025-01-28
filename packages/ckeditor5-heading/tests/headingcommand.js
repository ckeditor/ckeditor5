/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import ParagraphCommand from '@ckeditor/ckeditor5-paragraph/src/paragraphcommand.js';
import HeadingCommand from '../src/headingcommand.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

const options = [
	{ model: 'heading1', view: { name: 'h2' }, title: 'H2' },
	{ model: 'heading2', view: { name: 'h3' }, title: 'H3' },
	{ model: 'heading3', view: { name: 'h4' }, title: 'H4' }
];

describe( 'HeadingCommand', () => {
	let editor, model, document, command, root, schema;

	beforeEach( () => {
		return ModelTestEditor.create().then( newEditor => {
			editor = newEditor;
			model = editor.model;
			document = model.document;
			schema = model.schema;

			editor.commands.add( 'paragraph', new ParagraphCommand( editor ) );
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			const modelElements = [];

			for ( const option of options ) {
				modelElements.push( option.model );
				schema.register( option.model, { inheritAllFrom: '$block' } );
			}

			command = new HeadingCommand( editor, modelElements );
			editor.commands.add( 'heading', command );
			schema.register( 'heading', { inheritAllFrom: '$block' } );

			schema.register( 'notBlock' );
			schema.extend( 'notBlock', { allowIn: '$root' } );
			schema.extend( '$text', { allowIn: 'notBlock' } );

			root = document.getRoot();
		} );
	} );

	describe( 'modelElements', () => {
		it( 'is set', () => {
			expect( command.modelElements ).to.deep.equal( [ 'heading1', 'heading2', 'heading3' ] );
		} );
	} );

	describe( 'value', () => {
		for ( const option of options ) {
			test( option );
		}

		function test( { model: modelElement } ) {
			it( `equals ${ modelElement } when collapsed selection is placed inside ${ modelElement } element`, () => {
				setData( model, `<${ modelElement }>foobar</${ modelElement }>` );
				const element = root.getChild( 0 );
				model.change( writer => {
					const ranges = [
						...model.document.selection.getRanges(),
						writer.createRange( writer.createPositionAt( element, 3 ) )
					];
					writer.setSelection( ranges );
				} );
				expect( command.value ).to.equal( modelElement );
			} );

			it( 'equals false if inside to non-block element', () => {
				setData( model, '<notBlock>[foo]</notBlock>' );

				expect( command.value ).to.be.false;
			} );

			it( `equals false if moved from ${ modelElement } to non-block element`, () => {
				setData( model, `<${ modelElement }>[foo]</${ modelElement }><notBlock>foo</notBlock>` );
				const element = document.getRoot().getChild( 1 );

				model.change( writer => {
					writer.setSelection( writer.createRangeIn( element ) );
				} );

				expect( command.value ).to.be.false;
			} );

			it( 'should be refreshed after calling refresh()', () => {
				setData( model, `<${ modelElement }>[foo]</${ modelElement }><notBlock>foo</notBlock>` );
				const element = document.getRoot().getChild( 1 );

				model.change( writer => {
					writer.setSelection( writer.createRangeIn( element ) );

					expect( command.value ).to.equal( modelElement );
					command.refresh();
					expect( command.value ).to.be.false;
				} );
			} );
		}
	} );

	describe( 'execute()', () => {
		it( 'should update value after execution', () => {
			setData( model, '<paragraph>[]</paragraph>' );
			command.execute( { value: 'heading1' } );

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
			expect( command.value ).to.equal( 'heading1' );
		} );

		// https://github.com/ckeditor/ckeditor5-heading/issues/73
		it( 'should not rename blocks which cannot become headings (heading is not allowed in their parent)', () => {
			schema.register( 'restricted' );
			schema.extend( 'restricted', { allowIn: '$root' } );

			schema.register( 'fooBlock', { inheritAllFrom: '$block' } );
			schema.extend( 'fooBlock', {
				allowIn: [ 'restricted', '$root' ]
			} );

			setData(
				model,
				'<paragraph>a[bc</paragraph>' +
				'<restricted><fooBlock></fooBlock></restricted>' +
				'<fooBlock>de]f</fooBlock>'
			);

			command.execute( { value: 'heading1' } );

			expect( getData( model ) ).to.equal(
				'<heading1>a[bc</heading1>' +
				'<restricted><fooBlock></fooBlock></restricted>' +
				'<heading1>de]f</heading1>'
			);
		} );

		it( 'should not rename blocks which cannot become headings (block is an object)', () => {
			schema.register( 'imageBlock', {
				isBlock: true,
				isObject: true,
				allowIn: '$root'
			} );

			setData(
				model,
				'<paragraph>a[bc</paragraph>' +
				'<imageBlock></imageBlock>' +
				'<paragraph>de]f</paragraph>'
			);

			command.execute( { value: 'heading1' } );

			expect( getData( model ) ).to.equal(
				'<heading1>a[bc</heading1>' +
				'<imageBlock></imageBlock>' +
				'<heading1>de]f</heading1>'
			);
		} );

		it( 'should use parent batch', () => {
			setData( model, '<paragraph>foo[]bar</paragraph>' );

			model.change( writer => {
				expect( writer.batch.operations.length ).to.equal( 0 );

				command.execute( { value: 'heading1' } );

				expect( writer.batch.operations.length ).to.be.above( 0 );
			} );
		} );

		it( 'should do nothing with non-registered model elements', () => {
			setData( model, '<heading1>[]</heading1>' );
			command.execute( { value: 'heading5' } );

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
			expect( command.value ).to.equal( 'heading1' );
		} );

		describe( 'collapsed selection', () => {
			let convertTo = options[ options.length - 1 ];

			for ( const option of options ) {
				test( option, convertTo );
				convertTo = option;
			}

			it( 'does nothing when executed with already applied option', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				command.execute( { value: 'heading1' } );
				expect( getData( model ) ).to.equal( '<heading1>foo[]bar</heading1>' );
			} );

			it( 'converts topmost blocks', () => {
				schema.register( 'inlineImage', { allowWhere: '$text' } );
				schema.extend( '$text', { allowIn: 'inlineImage' } );

				setData( model, '<paragraph><inlineImage>foo[]</inlineImage>bar</paragraph>' );
				command.execute( { value: 'heading1' } );

				expect( getData( model ) ).to.equal( '<heading1><inlineImage>foo[]</inlineImage>bar</heading1>' );
			} );

			function test( from, to ) {
				it( `converts ${ from.model } to ${ to.model } on collapsed selection`, () => {
					setData( model, `<${ from.model }>foo[]bar</${ from.model }>` );
					command.execute( { value: to.model } );

					expect( getData( model ) ).to.equal( `<${ to.model }>foo[]bar</${ to.model }>` );
				} );
			}
		} );

		describe( 'non-collapsed selection', () => {
			let convertTo = options[ options.length - 1 ];

			for ( const option of options ) {
				test( option, convertTo );
				convertTo = option;
			}

			it( 'converts all elements where selection is applied', () => {
				setData( model, '<heading1>fo[o</heading1><heading2>bar</heading2><heading3>baz]</heading3>' );

				command.execute( { value: 'heading3' } );

				expect( getData( model ) ).to.equal(
					'<heading3>fo[o</heading3><heading3>bar</heading3><heading3>baz]</heading3>'
				);
			} );

			it( 'does nothing to the elements with same option (#1)', () => {
				setData( model, '<heading1>[foo</heading1><heading1>bar]</heading1>' );
				command.execute( { value: 'heading1' } );

				expect( getData( model ) ).to.equal(
					'<heading1>[foo</heading1><heading1>bar]</heading1>'
				);
			} );

			it( 'does nothing to the elements with same option (#2)', () => {
				setData( model, '<heading1>[foo</heading1><heading1>bar</heading1><heading2>baz]</heading2>' );
				command.execute( { value: 'heading1' } );

				expect( getData( model ) ).to.equal(
					'<heading1>[foo</heading1><heading1>bar</heading1><heading1>baz]</heading1>'
				);
			} );

			function test( { model: fromElement }, { model: toElement } ) {
				it( `converts ${ fromElement } to ${ toElement } on non-collapsed selection`, () => {
					setData(
						model,
						`<${ fromElement }>foo[bar</${ fromElement }><${ fromElement }>baz]qux</${ fromElement }>`
					);

					command.execute( { value: toElement } );

					expect( getData( model ) ).to.equal(
						`<${ toElement }>foo[bar</${ toElement }><${ toElement }>baz]qux</${ toElement }>`
					);
				} );
			}
		} );
	} );

	describe( 'isEnabled', () => {
		for ( const option of options ) {
			test( option.model );
		}

		function test( modelElement ) {
			describe( `${ modelElement } command`, () => {
				it( 'should be enabled when inside another block', () => {
					setData( model, '<paragraph>f{}oo</paragraph>' );

					expect( command.isEnabled ).to.be.true;
				} );

				it( 'should be disabled if inside non-block', () => {
					setData( model, '<notBlock>f{}oo</notBlock>' );

					expect( command.isEnabled ).to.be.false;
				} );

				it( 'should be disabled if selection is placed on non-block', () => {
					setData( model, '[<notBlock>foo</notBlock>]' );

					expect( command.isEnabled ).to.be.false;
				} );
			} );
		}
	} );
} );
