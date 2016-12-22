/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from 'tests/core/_utils/modeltesteditor.js';
import ImageStyleCommand from 'ckeditor5/image/imagestyle/imagestylecommand.js';
import { setData, getData } from 'ckeditor5/engine/dev-utils/model.js';

describe( 'ImageStyleCommand', () => {
	const styles = [
		{ name: 'defaultStyle', title: 'foo bar', icon: 'icon-1', value: null },
		{ name: 'otherStyle', title: 'baz', icon: 'icon-2', value: 'other', className: 'other-class-name' }
	];

	let document, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				document = newEditor.document;
				command = new ImageStyleCommand( newEditor, styles );

				document.schema.registerItem( 'p', '$block' );

				document.schema.registerItem( 'image' );
				document.schema.objects.add( 'image' );
				document.schema.allow( { name: 'image', inside: '$root' } );
				document.schema.allow( { name: 'image', inside: '$root', attributes: [ 'imageStyle' ] } );
			} );
	} );

	it( 'should have false if image is not selected', () => {
		setData( document, '[]<image></image>' );

		expect( command.value ).to.be.false;
	} );

	it( 'should have null if image without style is selected', () => {
		setData( document, '[<image></image>]' );

		expect( command.value ).to.be.null;
	} );

	it( 'should have proper value if image with style is selected', () => {
		setData( document, '[<image imageStyle="other"></image>]' );

		expect( command.value ).to.equal( 'other' );
	} );

	it( 'should return false if value is not allowed', () => {
		setData( document, '[<image imageStyle="foo"></image>]' );

		expect( command.value ).to.be.false;
	} );

	it( 'should set proper value when executed', () => {
		setData( document, '[<image></image>]' );

		command._doExecute( { value: 'other' } );

		expect( getData( document ) ).to.equal( '[<image imageStyle="other"></image>]' );
	} );

	it( 'should do nothing when executed with wrong value', () => {
		setData( document, '[<image></image>]' );

		command._doExecute( { value: 'foo' } );

		expect( getData( document ) ).to.equal( '[<image></image>]' );
	} );

	it( 'should do nothing when executed with same value', () => {
		setData( document, '[<image imageStyle="other"></image>]' );

		command._doExecute( { value: 'other' } );

		expect( getData( document ) ).to.equal( '[<image imageStyle="other"></image>]' );
	} );

	it( 'should allow to provide batch instance', () => {
		const batch = document.batch();
		const spy = sinon.spy( batch, 'setAttribute' );

		setData( document, '[<image></image>]' );

		command._doExecute( { value: 'other', batch } );

		expect( getData( document ) ).to.equal( '[<image imageStyle="other"></image>]' );
		sinon.assert.calledOnce( spy );
	} );

	it( 'should be enabled on image element', () => {
		setData( document, '[<image></image>]' );

		expect( command.isEnabled ).to.be.true;
	} );

	it( 'should be disabled when not placed on image', () => {
		setData( document, '[<p></p>]' );

		expect( command.isEnabled ).to.be.false;
	} );

	it( 'should be disabled when not placed directly on image', () => {
		setData( document, '[<p></p><image></image>]' );

		expect( command.isEnabled ).to.be.false;
	} );
} );
