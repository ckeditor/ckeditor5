/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';

import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Indent from '@ckeditor/ckeditor5-core/src/indent';

import IndentBlock from '../src/indentblock';
import IndentBlockCommand from '../src/indentblockcommand';

describe( 'IndentBlock', () => {
	let editor, element, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( IndentBlock.pluginName ).to.equal( 'IndentBlock' );
	} );

	it( 'should be loaded', () => {
		return createTestEditor()
			.then( newEditor => {
				expect( newEditor.plugins.get( IndentBlock ) ).to.be.instanceOf( IndentBlock );
			} );
	} );

	it( 'should set proper schema rules', () => {
		return createTestEditor()
			.then( newEditor => {
				model = newEditor.model;

				expect( model.schema.checkAttribute( [ 'paragraph' ], 'indent' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ 'heading1' ], 'indent' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ 'heading2' ], 'indent' ) ).to.be.true;
				expect( model.schema.checkAttribute( [ 'heading3' ], 'indent' ) ).to.be.true;
			} );
	} );

	it( 'should register indent block command', () => {
		return createTestEditor()
			.then( newEditor => {
				const command = newEditor.commands.get( 'indentBlock' );

				expect( command ).to.be.instanceof( IndentBlockCommand );
			} );
	} );

	describe( 'config', () => {
		describe( 'default value', () => {
			it( 'should be set', () => {
				return createTestEditor().then( editor => {
					expect( editor.config.get( 'indentBlock' ) ).to.deep.equal( { offset: 1, unit: 'em' } );
				} );
			} );
		} );
	} );

	describe( 'conversion', () => {
		describe( 'using offset', () => {
			beforeEach( () => {
				return createTestEditor( { indentBlock: { offset: 50, unit: 'px' } } )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						doc = model.document;
					} );
			} );

			it( 'should convert margin-left to indent attribute (known offset)', () => {
				editor.setData( '<p style="margin-left:50px">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( '50px' );

				expect( editor.getData() ).to.equal( '<p style="margin-left:50px;">foo</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p style="margin-left:50px">foo</p>' );
			} );

			it( 'should convert margin-left to indent attribute (any offset)', () => {
				editor.setData( '<p style="margin-left:42em">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( '42em' );

				expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p style="margin-left:42em">foo</p>' );
			} );

			it( 'should convert margin shortcut to indent attribute (one entry)', () => {
				editor.setData( '<p style="margin:42em">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( '42em' );

				expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p style="margin-left:42em">foo</p>' );
			} );

			it( 'should convert margin shortcut to indent attribute (two entries)', () => {
				editor.setData( '<p style="margin:24em 42em">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( '42em' );

				expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p style="margin-left:42em">foo</p>' );
			} );

			it( 'should convert margin shortcut to indent attribute (three entries)', () => {
				editor.setData( '<p style="margin:24em 42em 20em">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( '42em' );

				expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p style="margin-left:42em">foo</p>' );
			} );

			it( 'should convert margin shortcut to indent attribute (four entries)', () => {
				editor.setData( '<p style="margin:24em 40em 24em 42em">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( '42em' );

				expect( editor.getData() ).to.equal( '<p style="margin-left:42em;">foo</p>' );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p style="margin-left:42em">foo</p>' );
			} );

			it( 'should not convert class to indent attribute', () => {
				editor.setData( '<p class="indent-1">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.false;

				const expectedView = '<p>foo</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );
		} );

		describe( 'using classes', () => {
			beforeEach( () => {
				return createTestEditor( {
					indentBlock: {
						classes: [ 'indent-1', 'indent-2', 'indent-3', 'indent-4' ]
					}
				} ).then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
			} );

			it( 'should convert class to indent attribute', () => {
				editor.setData( '<p class="indent-1">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.true;
				expect( paragraph.getAttribute( 'indent' ) ).to.equal( 'indent-1' );

				const expectedView = '<p class="indent-1">foo</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );

			it( 'should not convert unknown class to indent attribute', () => {
				editor.setData( '<p class="indent-7">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.false;

				const expectedView = '<p>foo</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );

			it( 'should not convert margin-left to indent attribute (known offset)', () => {
				editor.setData( '<p style="margin-left:50px">foo</p>' );

				const paragraph = doc.getRoot().getChild( 0 );

				expect( paragraph.hasAttribute( 'indent' ) ).to.be.false;

				const expectedView = '<p>foo</p>';

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );
		} );
	} );

	describe( 'tab key handling callback', () => {
		let domEvtDataStub;

		beforeEach( () => {
			return createTestEditor()
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
					domEvtDataStub = {
						keyCode: getCode( 'Tab' ),
						preventDefault: sinon.spy(),
						stopPropagation: sinon.spy()
					};

					sinon.spy( editor, 'execute' );
				} );
		} );

		it( 'should execute indentBlock command on tab key', () => {
			editor.setData( '<p>foo</p>' );
			editor.model.change( writer => writer.setSelection( doc.getRoot().getChild( 0 ), 0 ) );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'indentBlock' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should execute outdentBlock command on Shift+Tab keystroke', () => {
			domEvtDataStub.keyCode += getCode( 'Shift' );

			editor.setData( '<p style="margin-left:1em;">foo</p>' );
			editor.model.change( writer => writer.setSelection( doc.getRoot().getChild( 0 ), 0 ) );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'outdentBlock' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should not indent if command is disabled', () => {
			editor.model.schema.register( 'block', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { model: 'block', view: 'block' } );

			editor.setData( '<block>foo</block>' );
			editor.model.change( writer => writer.setSelection( doc.getRoot().getChild( 0 ), 0 ) );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );

		it( 'should not indent or outdent if alt+tab is pressed', () => {
			domEvtDataStub.keyCode += getCode( 'alt' );

			editor.setData( '<p style="margin-left:1em;">foo</p>' );
			editor.model.change( writer => writer.setSelection( doc.getRoot().getChild( 0 ), 0 ) );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );
	} );

	function createTestEditor( extraConfig = {} ) {
		return ClassicTestEditor
			.create( element, Object.assign( {
				plugins: [ Paragraph, HeadingEditing, Indent, IndentBlock ]
			}, extraConfig ) );
	}
} );
