/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import ImageTextAlternativeCommand from '../../src/imagetextalternative/imagetextalternativecommand.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import ImageTextAlternativeEditing from '../../src/imagetextalternative/imagetextalternativeediting.js';

describe( 'ImageTextAlternativeCommand', () => {
	let editor, model, command;

	beforeEach( async () => {
		editor = await ModelTestEditor.create( {
			plugins: [ ImageTextAlternativeEditing ]
		} );
		model = editor.model;
		command = new ImageTextAlternativeCommand( editor );

		model.schema.register( 'p', { inheritAllFrom: '$block' } );

		model.schema.register( 'imageBlock', {
			allowWhere: '$block',
			isObject: true,
			isBlock: true,
			alllowAttributes: [ 'alt', 'src' ]
		} );

		model.schema.register( 'imageInline', {
			allowWhere: '$text',
			isObject: true,
			isInline: true,
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		model.schema.register( 'caption', {
			allowContentOf: '$block',
			allowIn: 'imageBlock',
			isLimit: true
		} );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	it( 'should have false value if no image is selected', () => {
		setData( model, '[]<p></p>' );

		expect( command.value ).to.be.false;
	} );

	it( 'should be disabled if not on image element', () => {
		setData( model, '[]<p></p>' );

		expect( command.isEnabled ).to.be.false;
	} );

	describe( 'the #isEnabled property', () => {
		describe( 'when a block image is selected', () => {
			it( 'should be true if an image element has no alt attribute', () => {
				setData( model, '[<imageBlock src="image.png"></imageBlock>]' );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'when an inline image is selected', () => {
			it( 'should be true if an inline image has no alt attribute', () => {
				setData( model, '<p>[<imageInline src="image.png"></imageInline>]</p>' );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'when the selection is in a block image caption', () => {
			it( 'should be true if an inline image has no alt attribute', () => {
				setData( model, '<imageBlock src="image.png"><caption>Foo[]</caption></imageBlock>' );

				expect( command.isEnabled ).to.be.true;
			} );
		} );
	} );

	describe( 'the #value property', () => {
		describe( 'when a block image is selected', () => {
			it( 'should be false if an image has no alt attribute', () => {
				setData( model, '[<imageBlock src="image.png"></imageBlock>]' );

				expect( command.value ).to.be.false;
			} );

			it( 'should have a proper value if an image has the alt attribute', () => {
				setData( model, '[<imageBlock src="image.png" alt="foo bar baz"></imageBlock>]' );

				expect( command.value ).to.equal( 'foo bar baz' );
			} );
		} );

		describe( 'when an inline image is selected', () => {
			it( 'should be false if an inline image has no alt attribute', () => {
				setData( model, '<p>[<imageInline src="image.png"></imageInline>]</p>' );

				expect( command.value ).to.be.false;
			} );

			it( 'should have a proper value if an inline image the alt attribute', () => {
				setData( model, '<p>[<imageInline src="image.png" alt="foo bar baz"></imageInline>]</p>' );

				expect( command.value ).to.equal( 'foo bar baz' );
			} );
		} );

		describe( 'when the selection is in a a block image caption', () => {
			it( 'should be false if an image has no alt attribute', () => {
				setData( model, '<imageBlock src="image.png"><caption>F[oo]</caption></imageBlock>' );

				expect( command.value ).to.be.false;
			} );

			it( 'should have a proper value if an image has the alt attribute', () => {
				setData( model, '<imageBlock src="image.png" alt="foo bar baz"><caption>[Foo]</caption></imageBlock>' );

				expect( command.value ).to.equal( 'foo bar baz' );
			} );
		} );
	} );

	describe( 'execution', () => {
		describe( 'when a block image is selected', () => {
			it( 'should set the proper alt attribute value if the image does not have one', () => {
				setData( model, '[<imageBlock src="image.png"></imageBlock>]' );

				command.execute( { newValue: 'fiz buz' } );

				expect( getData( model ) ).to.equal( '[<imageBlock alt="fiz buz" src="image.png"></imageBlock>]' );
			} );

			it( 'should change the alt attribute if the image already has one', () => {
				setData( model, '[<imageBlock alt="foo bar" src="image.png"></imageBlock>]' );

				command.execute( { newValue: 'fiz buz' } );

				expect( getData( model ) ).to.equal( '[<imageBlock alt="fiz buz" src="image.png"></imageBlock>]' );
			} );

			it( 'should use parent batch', () => {
				setData( model, '[<imageBlock src="image.png"></imageBlock>]' );

				model.change( writer => {
					expect( writer.batch.operations ).to.length( 0 );

					command.execute( { newValue: 'foo bar' } );

					expect( writer.batch.operations ).to.length.above( 0 );
				} );
			} );
		} );

		describe( 'when an inline image is selected', () => {
			it( 'should set the proper alt attribute value if the image does not have one', () => {
				setData( model, '<p>[<imageInline src="image.png"></imageInline>]</p>' );

				command.execute( { newValue: 'fiz buz' } );

				expect( getData( model ) ).to.equal( '<p>[<imageInline alt="fiz buz" src="image.png"></imageInline>]</p>' );
			} );

			it( 'should change the alt attribute if the image already has one', () => {
				setData( model, '<p>[<imageInline alt="foo bar" src="image.png"></imageInline>]</p>' );

				command.execute( { newValue: 'fiz buz' } );

				expect( getData( model ) ).to.equal( '<p>[<imageInline alt="fiz buz" src="image.png"></imageInline>]</p>' );
			} );

			it( 'should use parent batch', () => {
				setData( model, '<p>[<imageInline src="image.png"></imageInline>]</p>' );

				model.change( writer => {
					expect( writer.batch.operations ).to.length( 0 );

					command.execute( { newValue: 'foo bar' } );

					expect( writer.batch.operations ).to.length.above( 0 );
				} );
			} );
		} );

		describe( 'when the selection is in a block image caption', () => {
			it( 'should set the proper alt attribute value if the image does not have one', () => {
				setData( model, '<imageBlock src="image.png"><caption>[]Foo</caption></imageBlock>' );

				command.execute( { newValue: 'fiz buz' } );

				expect( getData( model ) ).to.equal( '<imageBlock alt="fiz buz" src="image.png"><caption>[]Foo</caption></imageBlock>' );
			} );

			it( 'should change the alt attribute if the image already has one', () => {
				setData( model, '<imageBlock alt="foo bar" src="image.png"><caption>[]Foo</caption></imageBlock>' );

				command.execute( { newValue: 'fiz buz' } );

				expect( getData( model ) ).to.equal( '<imageBlock alt="fiz buz" src="image.png"><caption>[]Foo</caption></imageBlock>' );
			} );
		} );
	} );
} );
