/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ImageTextAlternativeCommand from '../../src/imagetextalternative/imagetextalternativecommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageTextAlternativeCommand', () => {
	let document, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				document = newEditor.document;
				command = new ImageTextAlternativeCommand( newEditor );

				document.schema.registerItem( 'p', '$block' );

				document.schema.registerItem( 'image' );
				document.schema.requireAttributes( 'image', [ 'src' ] );
				document.schema.allow( { name: 'image', attributes: [ 'alt', 'src' ], inside: '$root' } );
				document.schema.objects.add( 'image' );
			} );
	} );

	it( 'should have false value if no image is selected', () => {
		setData( document, '[]<p></p>' );

		expect( command.value ).to.be.false;
	} );

	it( 'should have false value if image without alt is selected', () => {
		setData( document, '[<image src="image.png"></image>]' );

		expect( command.value ).to.be.false;
	} );

	it( 'should be disabled if not on image element', () => {
		setData( document, '[]<p></p>' );

		expect( command.isEnabled ).to.be.false;
	} );

	it( 'should be enabled on image element without alt attribute', () => {
		setData( document, '[<image src="image.png"></image>]' );

		expect( command.isEnabled ).to.be.true;
	} );

	it( 'should have proper value if on image element with alt attribute', () => {
		setData( document, '[<image src="image.png" alt="foo bar baz"></image>]' );

		expect( command.value ).to.equal( 'foo bar baz' );
	} );

	it( 'should set proper alt if executed on image without alt attribute', () => {
		setData( document, '[<image src="image.png"></image>]' );

		command.execute( { newValue: 'fiz buz' } );

		expect( getData( document ) ).to.equal( '[<image alt="fiz buz" src="image.png"></image>]' );
	} );

	it( 'should change alt if executed on image with alt attribute', () => {
		setData( document, '[<image alt="foo bar" src="image.png"></image>]' );

		command.execute( { newValue: 'fiz buz' } );

		expect( getData( document ) ).to.equal( '[<image alt="fiz buz" src="image.png"></image>]' );
	} );

	it( 'should allow to provide batch instance', () => {
		const batch = document.batch();
		const spy = sinon.spy( batch, 'setAttribute' );

		setData( document, '[<image src="image.png"></image>]' );

		command.execute( { newValue: 'foo bar', batch } );

		expect( getData( document ) ).to.equal( '[<image alt="foo bar" src="image.png"></image>]' );
		sinon.assert.calledOnce( spy );
	} );
} );
