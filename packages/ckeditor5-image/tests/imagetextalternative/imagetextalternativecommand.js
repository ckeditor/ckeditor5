/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ImageTextAlternativeCommand from '../../src/imagetextalternative/imagetextalternativecommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageTextAlternativeCommand', () => {
	let model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				model = newEditor.model;
				command = new ImageTextAlternativeCommand( newEditor );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );

				model.schema.register( 'image', {
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
			} );
	} );

	it( 'should have false value if no image is selected', () => {
		setData( model, '[]<p></p>' );

		expect( command.value ).to.be.false;
	} );

	it( 'should be disabled if not on image element', () => {
		setData( model, '[]<p></p>' );

		expect( command.isEnabled ).to.be.false;
	} );

	describe( 'on block image', () => {
		it( 'should have false value if image without alt is selected', () => {
			setData( model, '[<image src="image.png"></image>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be enabled on image element without alt attribute', () => {
			setData( model, '[<image src="image.png"></image>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should have proper value if on image element with alt attribute', () => {
			setData( model, '[<image src="image.png" alt="foo bar baz"></image>]' );

			expect( command.value ).to.equal( 'foo bar baz' );
		} );

		it( 'should set proper alt if executed on image without alt attribute', () => {
			setData( model, '[<image src="image.png"></image>]' );

			command.execute( { newValue: 'fiz buz' } );

			expect( getData( model ) ).to.equal( '[<image alt="fiz buz" src="image.png"></image>]' );
		} );

		it( 'should change alt if executed on image with alt attribute', () => {
			setData( model, '[<image alt="foo bar" src="image.png"></image>]' );

			command.execute( { newValue: 'fiz buz' } );

			expect( getData( model ) ).to.equal( '[<image alt="fiz buz" src="image.png"></image>]' );
		} );

		it( 'should use parent batch', () => {
			setData( model, '[<image src="image.png"></image>]' );

			model.change( writer => {
				expect( writer.batch.operations ).to.length( 0 );

				command.execute( { newValue: 'foo bar' } );

				expect( writer.batch.operations ).to.length.above( 0 );
			} );
		} );
	} );

	describe( 'on inline image', () => {
		it( 'should have false value if image without alt is selected', () => {
			setData( model, '<p>[<imageInline src="image.png"></imageInline>]</p>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be enabled on image element without alt attribute', () => {
			setData( model, '<p>[<imageInline src="image.png"></imageInline>]</p>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should have proper value if on image element with alt attribute', () => {
			setData( model, '<p>[<imageInline src="image.png" alt="foo bar baz"></imageInline>]</p>' );

			expect( command.value ).to.equal( 'foo bar baz' );
		} );

		it( 'should set proper alt if executed on image without alt attribute', () => {
			setData( model, '<p>[<imageInline src="image.png"></imageInline>]</p>' );

			command.execute( { newValue: 'fiz buz' } );

			expect( getData( model ) ).to.equal( '<p>[<imageInline alt="fiz buz" src="image.png"></imageInline>]</p>' );
		} );

		it( 'should change alt if executed on image with alt attribute', () => {
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
} );
