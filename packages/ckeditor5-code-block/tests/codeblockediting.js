/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import CodeBlockEditing from '../src/codeblockediting';
import CodeBlockCommand from '../src/codeblockcommand';

import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'CodeBlockEditing', () => {
	let editor, element, model;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ CodeBlockEditing, AlignmentEditing, BoldEditing, Enter, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy().then( () => element.remove() );
	} );

	it( 'defines plugin name', () => {
		expect( CodeBlockEditing.pluginName ).to.equal( 'CodeBlockEditing' );
	} );

	it( 'defines plugin dependencies', () => {
		expect( CodeBlockEditing.requires ).to.have.members( [ ShiftEnter ] );
	} );

	it( 'adds a codeBlock command', () => {
		expect( editor.commands.get( 'codeBlock' ) ).to.be.instanceOf( CodeBlockCommand );
	} );

	it( 'allows for codeBlock in the $root', () => {
		expect( model.schema.checkChild( [ '$root' ], 'codeBlock' ) ).to.be.true;
	} );

	it( 'allows only for $text in codeBlock', () => {
		expect( model.schema.checkChild( [ '$root', 'codeBlock' ], '$text' ) ).to.equal( true );
		expect( model.schema.checkChild( [ '$root', 'codeBlock' ], '$block' ) ).to.equal( false );
		expect( model.schema.checkChild( [ '$root', 'codeBlock' ], 'codeBlock' ) ).to.equal( false );
	} );

	it( 'disallows all attributes for codeBlock', () => {
		setModelData( model, '<codeBlock>f[o]o</codeBlock>' );

		editor.execute( 'alignment', { value: 'right' } );
		editor.execute( 'bold' );

		expect( getModelData( model ) ).to.equal( '<codeBlock>f[o]o</codeBlock>' );
	} );

	it( 'adds converters to the data pipeline', () => {
		const data = '<pre>x</pre>';

		editor.setData( data );

		expect( getModelData( model ) ).to.equal( '<codeBlock>[]x</codeBlock>' );
		expect( editor.getData() ).to.equal( data );
	} );

	it( 'adds a converter to the view pipeline', () => {
		setModelData( model, '<codeBlock>x</codeBlock>' );

		expect( editor.getData() ).to.equal( '<pre>x</pre>' );
	} );

	it( 'should force shiftEnter command when pressing enter inside a codeBlock', () => {
		const enterCommand = editor.commands.get( 'enter' );
		const shiftEnterCommand = editor.commands.get( 'shiftEnter' );

		sinon.spy( enterCommand, 'execute' );
		sinon.spy( shiftEnterCommand, 'execute' );

		setModelData( model, '<codeBlock>foo[]bar</codeBlock>' );

		editor.editing.view.document.fire( 'enter', {
			preventDefault: () => {}
		} );

		expect( getModelData( model ) ).to.equal( '<codeBlock>foo<softBreak></softBreak>[]bar</codeBlock>' );
		sinon.assert.calledOnce( shiftEnterCommand.execute );
		sinon.assert.notCalled( enterCommand.execute );
	} );

	it( 'should execute enter command when pressing enter out of codeBlock', () => {
		const enterCommand = editor.commands.get( 'enter' );
		const shiftEnterCommand = editor.commands.get( 'shiftEnter' );

		sinon.spy( enterCommand, 'execute' );
		sinon.spy( shiftEnterCommand, 'execute' );

		setModelData( model, '<paragraph>foo[]bar</paragraph>' );

		editor.editing.view.document.fire( 'enter', {
			preventDefault: () => {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[]bar</paragraph>' );
		sinon.assert.calledOnce( enterCommand.execute );
		sinon.assert.notCalled( shiftEnterCommand.execute );
	} );
} );
