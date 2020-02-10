/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import ImageStyleCommand from '../../src/imagestyle/imagestylecommand';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'ImageStyleCommand', () => {
	const defaultStyle = { name: 'defaultStyle', title: 'foo bar', icon: 'icon-1', isDefault: true };
	const otherStyle = { name: 'otherStyle', title: 'baz', icon: 'icon-2', className: 'other-class-name' };

	let model, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				model = newEditor.model;
				command = new ImageStyleCommand( newEditor, [ defaultStyle, otherStyle ] );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );

				model.schema.register( 'image', {
					isObject: true,
					isBlock: true,
					allowWhere: '$block',
					allowAttributes: 'imageStyle'
				} );
			} );
	} );

	it( 'should have defaultStyle property correctly set', () => {
		expect( command.defaultStyle ).to.equal( 'defaultStyle' );
	} );

	it( 'command value should be false if no image is selected', () => {
		setData( model, '<p>[]</p><image></image>' );

		expect( command.value ).to.be.false;
	} );

	it( 'should match default style if no imageStyle attribute is present', () => {
		setData( model, '[<image></image>]' );

		expect( command.value ).to.equal( 'defaultStyle' );
	} );

	it( 'proper command should have true value when imageStyle attribute is present', () => {
		setData( model, '[<image imageStyle="otherStyle"></image>]' );

		expect( command.value ).to.equal( 'otherStyle' );
	} );

	it( 'should have false value if style does not match', () => {
		setData( model, '[<image imageStyle="foo"></image>]' );

		expect( command.value ).to.be.false;
	} );

	it( 'should set proper value when executed', () => {
		setData( model, '[<image></image>]' );

		command.execute( { value: 'otherStyle' } );

		expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );
	} );

	it( 'should do nothing when attribute already present', () => {
		setData( model, '[<image imageStyle="otherStyle"></image>]' );

		command.execute( { value: 'otherStyle' } );

		expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );
	} );

	it( 'should use parent batch', () => {
		setData( model, '[<image></image>]' );

		model.change( writer => {
			expect( writer.batch.operations ).to.length( 0 );

			command.execute( { value: 'otherStyle' } );

			expect( writer.batch.operations ).to.length.above( 0 );
		} );
	} );

	it( 'should be enabled on image element', () => {
		setData( model, '[<image></image>]' );

		expect( command.isEnabled ).to.be.true;
	} );

	it( 'should be disabled when not placed on image', () => {
		setData( model, '[<p></p>]' );

		expect( command.isEnabled ).to.be.false;
	} );

	it( 'should be disabled when not placed directly on image', () => {
		setData( model, '[<p></p><image></image>]' );

		expect( command.isEnabled ).to.be.false;
	} );

	it( 'default style should be active after executing it after another style', () => {
		setData( model, '[<image></image>]' );

		expect( command.value ).to.equal( 'defaultStyle' );

		command.execute( { value: 'otherStyle' } );

		expect( getData( model ) ).to.equal( '[<image imageStyle="otherStyle"></image>]' );

		command.execute( { value: 'defaultStyle' } );

		expect( getData( model ) ).to.equal( '[<image></image>]' );
		expect( command.value ).to.equal( 'defaultStyle' );
	} );
} );
