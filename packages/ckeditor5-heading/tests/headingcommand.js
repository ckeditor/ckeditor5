/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ParagraphCommand from '@ckeditor/ckeditor5-paragraph/src/paragraphcommand';
import HeadingCommand from '../src/headingcommand';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

const options = [
	{ model: 'heading1', view: { name: 'h2' }, title: 'H2' },
	{ model: 'heading2', view: { name: 'h3' }, title: 'H3' },
	{ model: 'heading3', view: { name: 'h4' }, title: 'H4' }
];

describe( 'HeadingCommand', () => {
	let editor, model, document, commands, root, schema;

	beforeEach( () => {
		return ModelTestEditor.create().then( newEditor => {
			editor = newEditor;
			model = editor.model;
			document = model.document;
			commands = {};
			schema = model.schema;

			editor.commands.add( 'paragraph', new ParagraphCommand( editor ) );
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			for ( const option of options ) {
				commands[ option.model ] = new HeadingCommand( editor, option.model );
				schema.register( option.model, { inheritAllFrom: '$block' } );
			}

			schema.register( 'notBlock' );
			schema.extend( 'notBlock', { allowIn: '$root' } );
			schema.extend( '$text', { allowIn: 'notBlock' } );

			root = document.getRoot();
		} );
	} );

	afterEach( () => {
		for ( const modelElement in commands ) {
			commands[ modelElement ].destroy();
		}
	} );

	describe( 'modelElement', () => {
		it( 'is set', () => {
			expect( commands.heading1.modelElement ).to.equal( 'heading1' );
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
						Range.createFromParentsAndOffsets( element, 3, element, 3 )
					];
					writer.setSelection( ranges );
				} );
				expect( commands[ modelElement ].value ).to.be.true;
			} );

			it( 'equals false if inside to non-block element', () => {
				setData( model, '<notBlock>[foo]</notBlock>' );

				expect( commands[ modelElement ].value ).to.be.false;
			} );

			it( `equals false if moved from ${ modelElement } to non-block element`, () => {
				setData( model, `<${ modelElement }>[foo]</${ modelElement }><notBlock>foo</notBlock>` );
				const element = document.getRoot().getChild( 1 );

				model.change( writer => {
					writer.setSelection( Range.createIn( element ) );
				} );

				expect( commands[ modelElement ].value ).to.be.false;
			} );

			it( 'should be refreshed after calling refresh()', () => {
				const command = commands[ modelElement ];
				setData( model, `<${ modelElement }>[foo]</${ modelElement }><notBlock>foo</notBlock>` );
				const element = document.getRoot().getChild( 1 );

				// Purposely not putting it in `model.change` to update command manually.
				model.document.selection._setTo( Range.createIn( element ) );

				expect( command.value ).to.be.true;
				command.refresh();
				expect( command.value ).to.be.false;
			} );
		}
	} );

	describe( 'execute()', () => {
		it( 'should update value after execution', () => {
			const command = commands.heading1;

			setData( model, '<paragraph>[]</paragraph>' );
			command.execute();

			expect( getData( model ) ).to.equal( '<heading1>[]</heading1>' );
			expect( command.value ).to.be.true;
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

			commands.heading1.execute();

			expect( getData( model ) ).to.equal(
				'<heading1>a[bc</heading1>' +
				'<restricted><fooBlock></fooBlock></restricted>' +
				'<heading1>de]f</heading1>'
			);
		} );

		it( 'should not rename blocks which cannot become headings (block is an object)', () => {
			schema.register( 'image', {
				isBlock: true,
				isObject: true,
				allowIn: '$root'
			} );

			setData(
				model,
				'<paragraph>a[bc</paragraph>' +
				'<image></image>' +
				'<paragraph>de]f</paragraph>'
			);

			commands.heading1.execute();

			expect( getData( model ) ).to.equal(
				'<heading1>a[bc</heading1>' +
				'<image></image>' +
				'<heading1>de]f</heading1>'
			);
		} );

		it( 'should use parent batch', () => {
			const command = commands.heading1;

			setData( model, '<paragraph>foo[]bar</paragraph>' );

			model.change( writer => {
				expect( writer.batch.deltas.length ).to.equal( 0 );

				command.execute();

				expect( writer.batch.deltas.length ).to.be.above( 0 );
			} );
		} );

		describe( 'collapsed selection', () => {
			let convertTo = options[ options.length - 1 ];

			for ( const option of options ) {
				test( option, convertTo );
				convertTo = option;
			}

			it( 'does nothing when executed with already applied option', () => {
				setData( model, '<heading1>foo[]bar</heading1>' );

				commands.heading1.execute();
				expect( getData( model ) ).to.equal( '<heading1>foo[]bar</heading1>' );
			} );

			it( 'converts topmost blocks', () => {
				schema.register( 'inlineImage', { allowWhere: '$text' } );
				schema.extend( '$text', { allowIn: 'inlineImage' } );

				setData( model, '<paragraph><inlineImage>foo[]</inlineImage>bar</paragraph>' );
				commands.heading1.execute();

				expect( getData( model ) ).to.equal( '<heading1><inlineImage>foo[]</inlineImage>bar</heading1>' );
			} );

			function test( from, to ) {
				it( `converts ${ from.model } to ${ to.model } on collapsed selection`, () => {
					setData( model, `<${ from.model }>foo[]bar</${ from.model }>` );
					commands[ to.model ].execute();

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
				setData( model, '<heading1>foo[</heading1><heading2>bar</heading2><heading3>baz]</heading3>' );

				commands.heading3.execute();

				expect( getData( model ) ).to.equal(
					'<heading3>foo[</heading3><heading3>bar</heading3><heading3>baz]</heading3>'
				);
			} );

			it( 'does nothing to the elements with same option (#1)', () => {
				setData( model, '<heading1>[foo</heading1><heading1>bar]</heading1>' );
				commands.heading1.execute();

				expect( getData( model ) ).to.equal(
					'<heading1>[foo</heading1><heading1>bar]</heading1>'
				);
			} );

			it( 'does nothing to the elements with same option (#2)', () => {
				setData( model, '<heading1>[foo</heading1><heading1>bar</heading1><heading2>baz]</heading2>' );
				commands.heading1.execute();

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

					commands[ toElement ].execute();

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
			let command;

			beforeEach( () => {
				command = commands[ modelElement ];
			} );

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
