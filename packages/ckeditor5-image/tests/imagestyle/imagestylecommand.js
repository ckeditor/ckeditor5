/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageStyleCommand', () => {
	const defaultStyle = { name: 'defaultStyle', title: 'foo bar', icon: 'icon-1', isDefault: true };
	const otherStyle = { name: 'otherStyle', title: 'baz', icon: 'icon-2', className: 'other-class-name' };

	let model, defaultStyleCommand, otherStyleCommand;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				model = newEditor.model;
				defaultStyleCommand = new ImageStyleCommand( newEditor, defaultStyle );
				otherStyleCommand = new ImageStyleCommand( newEditor, otherStyle );

				model.schema.registerItem( 'p', '$block' );

				model.schema.registerItem( 'image' );
				model.schema.objects.add( 'image' );
				model.schema.allow( { name: 'image', inside: '$root' } );
				model.schema.allow( { name: 'image', inside: '$root', attributes: [ 'imageStyle' ] } );
			} );
	} );

	it( 'command value should be false if no image is selected', () => {
		setData( model, '[]<image></image>' );

		expect( defaultStyleCommand.value ).to.be.false;
		expect( otherStyleCommand.value ).to.be.false;
	} );

	it( 'should match default style if no imageStyle attribute is present', () => {
		setData( model, '[<image></image>]' );

		expect( defaultStyleCommand.value ).to.be.true;
		expect( otherStyleCommand.value ).to.be.false;
	} );

	it( 'proper command should have true value when imageStyle attribute is present', () => {
		setData( model, '[<image imageStyle="otherStyle"></image>]' );

		expect( defaultStyleCommand.value ).to.be.false;
		expect( otherStyleCommand.value ).to.be.true;
	} );

	it( 'should have false value if style does not match', () => {
		setData( model, '[<image imageStyle="foo"></image>]' );

		expect( defaultStyleCommand.value ).to.be.false;
		expect( otherStyleCommand.value ).to.be.false;
	} );

	it( 'should set proper value when executed', () => {
		setData( model, '[<image></image>]' );

		otherStyleCommand.execute();

		expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );
	} );

	it( 'should do nothing when attribute already present', () => {
		setData( model, '[<image imageStyle="otherStyle"></image>]' );

		otherStyleCommand.execute();

		expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );
	} );

	it( 'should use parent batch', () => {
		setData( model, '[<image></image>]' );

		model.change( writer => {
			expect( writer.batch.deltas ).to.length( 0 );

			otherStyleCommand.execute();

			expect( writer.batch.deltas ).to.length.above( 0 );
		} );
	} );

	it( 'should be enabled on image element', () => {
		setData( model, '[<image></image>]' );

		expect( defaultStyleCommand.isEnabled ).to.be.true;
		expect( otherStyleCommand.isEnabled ).to.be.true;
	} );

	it( 'should be disabled when not placed on image', () => {
		setData( model, '[<p></p>]' );

		expect( defaultStyleCommand.isEnabled ).to.be.false;
		expect( otherStyleCommand.isEnabled ).to.be.false;
	} );

	it( 'should be disabled when not placed directly on image', () => {
		setData( model, '[<p></p><image></image>]' );

		expect( defaultStyleCommand.isEnabled ).to.be.false;
		expect( otherStyleCommand.isEnabled ).to.be.false;
	} );

	it( 'default style should be active after executing it after another style', () => {
		setData( model, '[<image></image>]' );

		expect( defaultStyleCommand.value ).to.be.true;
		expect( otherStyleCommand.value ).to.be.false;

		otherStyleCommand.execute();

		expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );

		defaultStyleCommand.execute();

		expect( getData( model ) ).to.equal( '[<image></image>]' );
		expect( defaultStyleCommand.value ).to.be.true;
		expect( otherStyleCommand.value ).to.be.false;
	} );
} );
