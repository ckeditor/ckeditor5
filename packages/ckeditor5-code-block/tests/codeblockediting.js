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

	describe( 'data pipeline m -> v conversion ', () => {
		it( 'should convert empty codeBlock to empty pre tag', () => {
			setModelData( model, '<codeBlock></codeBlock>' );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( '<pre>&nbsp;</pre>' );
		} );

		it( 'should convert non-empty codeBlock to pre tag', () => {
			setModelData( model, '<codeBlock>Foo</codeBlock>' );

			expect( editor.getData() ).to.equal( '<pre>Foo</pre>' );
		} );

		it( 'should convert codeBlock with softBreaks to pre tag #1', () => {
			setModelData( model,
				'<codeBlock>' +
					'Foo<softBreak></softBreak>' +
					'Bar<softBreak></softBreak>' +
					'Biz' +
				'</codeBlock>'
			);

			expect( editor.getData() ).to.equal( '<pre>Foo\nBar\nBiz</pre>' );
		} );

		it( 'should convert codeBlock with softBreaks to pre tag #2', () => {
			setModelData( model,
				'<codeBlock>' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
					'Foo' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
				'</codeBlock>'
			);

			expect( editor.getData() ).to.equal( '<pre>\n\nFoo\n\n</pre>' );
		} );
	} );

	describe( 'data pipeline v -> m conversion ', () => {
		it( 'should convert empty pre tag to code block', () => {
			editor.setData( '<pre></pre>' );

			expect( getModelData( model ) ).to.equal( '<codeBlock>[]</codeBlock>' );
		} );

		it( 'should convert pre tag with multi-line text to code block #1', () => {
			editor.setData( '<pre>foo\nbar</pre>' );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock>[]' +
					'foo' +
					'<softBreak></softBreak>' +
					'bar' +
				'</codeBlock>'
			);
		} );

		it( 'should convert pre tag with multi-line text to code block #2', () => {
			editor.setData( '<pre>\n\n\nfoo\n\n</pre>' );

			// The result may be unclear. 3 new line characters are converted to 2 softBreak elements.
			// That's because of HTML rule, leading new line character for <pre/> element is stripped by the DOMParser.
			expect( getModelData( model ) ).to.equal(
				'<codeBlock>[]' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
					'foo' +
					'<softBreak></softBreak>' +
					'<softBreak></softBreak>' +
				'</codeBlock>'
			);
		} );

		it( 'should convert pre tag with HTML inside', () => {
			editor.setData( '<pre><p>Foo</p>\n<p>Bar</p></pre>' );

			expect( getModelData( model ) ).to.equal(
				'<codeBlock>[]' +
					'<p>Foo</p>' +
					'<softBreak></softBreak>' +
					'<p>Bar</p>' +
				'</codeBlock>'
			);
		} );

		it( 'should convert pre tag with HTML and nested pre tag', () => {
			editor.setData( '<pre><p>Foo</p><pre>Bar</pre><p>Biz</p></pre>' );

			expect( getModelData( model ) ).to.equal( '<codeBlock>[]<p>Foo</p><pre>Bar</pre><p>Biz</p></codeBlock>' );
		} );
	} );
} );
