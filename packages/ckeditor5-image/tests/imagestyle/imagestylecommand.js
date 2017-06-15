/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageStyleCommand', () => {
	const defaultStyle = { name: 'defaultStyle', title: 'foo bar', icon: 'icon-1', value: null };
	const otherStyle = { name: 'otherStyle', title: 'baz', icon: 'icon-2', value: 'other', className: 'other-class-name' };

	let document, defaultStyleCommand, otherStyleCommand;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				document = newEditor.document;
				defaultStyleCommand = new ImageStyleCommand( newEditor, defaultStyle );
				otherStyleCommand = new ImageStyleCommand( newEditor, otherStyle );

				document.schema.registerItem( 'p', '$block' );

				document.schema.registerItem( 'image' );
				document.schema.objects.add( 'image' );
				document.schema.allow( { name: 'image', inside: '$root' } );
				document.schema.allow( { name: 'image', inside: '$root', attributes: [ 'imageStyle' ] } );
			} );
	} );

	it( 'command value should be false if no image is selected', () => {
		setData( document, '[]<image></image>' );

		expect( defaultStyleCommand.value ).to.be.false;
		expect( otherStyleCommand.value ).to.be.false;
	} );

	it( 'should match default style if no imageStyle attribute is present', () => {
		setData( document, '[<image></image>]' );

		expect( defaultStyleCommand.value ).to.be.true;
		expect( otherStyleCommand.value ).to.be.false;
	} );

	it( 'proper command should have true value when imageStyle attribute is present', () => {
		setData( document, '[<image imageStyle="other"></image>]' );

		expect( defaultStyleCommand.value ).to.be.false;
		expect( otherStyleCommand.value ).to.be.true;
	} );

	it( 'should have false value if style does not match', () => {
		setData( document, '[<image imageStyle="foo"></image>]' );

		expect( defaultStyleCommand.value ).to.be.false;
		expect( otherStyleCommand.value ).to.be.false;
	} );

	it( 'should set proper value when executed', () => {
		setData( document, '[<image></image>]' );

		otherStyleCommand.execute();

		expect( getData( document ) ).to.equal( '[<image imageStyle="other"></image>]' );
	} );

	it( 'should do nothing when attribute already present', () => {
		setData( document, '[<image imageStyle="other"></image>]' );

		otherStyleCommand.execute();

		expect( getData( document ) ).to.equal( '[<image imageStyle="other"></image>]' );
	} );

	it( 'should allow to provide batch instance', () => {
		const batch = document.batch();
		const spy = sinon.spy( batch, 'setAttribute' );

		setData( document, '[<image></image>]' );

		otherStyleCommand.execute( { batch } );

		expect( getData( document ) ).to.equal( '[<image imageStyle="other"></image>]' );
		sinon.assert.calledOnce( spy );
	} );

	it( 'should be enabled on image element', () => {
		setData( document, '[<image></image>]' );

		expect( defaultStyleCommand.isEnabled ).to.be.true;
		expect( otherStyleCommand.isEnabled ).to.be.true;
	} );

	it( 'should be disabled when not placed on image', () => {
		setData( document, '[<p></p>]' );

		expect( defaultStyleCommand.isEnabled ).to.be.false;
		expect( otherStyleCommand.isEnabled ).to.be.false;
	} );

	it( 'should be disabled when not placed directly on image', () => {
		setData( document, '[<p></p><image></image>]' );

		expect( defaultStyleCommand.isEnabled ).to.be.false;
		expect( otherStyleCommand.isEnabled ).to.be.false;
	} );
} );
