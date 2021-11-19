/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListEditing from '../../src/documentlist/documentlistediting';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import stubUid from './_utils/uid';

describe( 'DocumentListEditing', () => {
	let editor, model, modelDoc, modelRoot, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, DocumentListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing ]
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );
		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( DocumentListEditing.pluginName ).to.equal( 'DocumentListEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( DocumentListEditing ) ).to.be.instanceOf( DocumentListEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listItemId' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listIndent' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listType' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'heading1' ], 'listItemId' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'heading1' ], 'listIndent' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'heading1' ], 'listType' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'blockQuote' ], 'listItemId' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'blockQuote' ], 'listIndent' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'blockQuote' ], 'listType' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'listItemId' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'listIndent' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'listType' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'listItemId' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'listIndent' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'listType' ) ).to.be.false;
	} );

	// describe.skip( 'commands', () => {
	// 	it( 'should register bulleted list command', () => {
	// 		const command = editor.commands.get( 'bulletedList' );
	//
	// 		expect( command ).to.be.instanceOf( ListCommand );
	// 		expect( command ).to.have.property( 'type', 'bulleted' );
	// 	} );
	//
	// 	it( 'should register numbered list command', () => {
	// 		const command = editor.commands.get( 'numberedList' );
	//
	// 		expect( command ).to.be.instanceOf( ListCommand );
	// 		expect( command ).to.have.property( 'type', 'numbered' );
	// 	} );
	//
	// 	it( 'should register indent list command', () => {
	// 		const command = editor.commands.get( 'indentList' );
	//
	// 		expect( command ).to.be.instanceOf( IndentCommand );
	// 	} );
	//
	// 	it( 'should register outdent list command', () => {
	// 		const command = editor.commands.get( 'outdentList' );
	//
	// 		expect( command ).to.be.instanceOf( IndentCommand );
	// 	} );
	//
	// 	it( 'should add indent list command to indent command', () => {
	// 		return VirtualTestEditor
	// 			.create( {
	// 				plugins: [ Paragraph, IndentEditing, ListEditing, IndentEditing ]
	// 			} )
	// 			.then( newEditor => {
	// 				editor = newEditor;
	// 			} )
	// 			.then( () => {
	// 				const indentListCommand = editor.commands.get( 'indentList' );
	// 				const indentCommand = editor.commands.get( 'indent' );
	//
	// 				const spy = sinon.spy( indentListCommand, 'execute' );
	//
	// 				indentListCommand.isEnabled = true;
	// 				indentCommand.execute();
	//
	// 				sinon.assert.calledOnce( spy );
	// 			} );
	// 	} );
	//
	// 	it( 'should add outdent list command to outdent command', () => {
	// 		return VirtualTestEditor
	// 			.create( {
	// 				plugins: [ Paragraph, IndentEditing, ListEditing, IndentEditing ]
	// 			} )
	// 			.then( newEditor => {
	// 				editor = newEditor;
	// 			} )
	// 			.then( () => {
	// 				const outdentListCommand = editor.commands.get( 'outdentList' );
	// 				const outdentCommand = editor.commands.get( 'outdent' );
	//
	// 				const spy = sinon.spy( outdentListCommand, 'execute' );
	//
	// 				outdentListCommand.isEnabled = true;
	// 				outdentCommand.execute();
	//
	// 				sinon.assert.calledOnce( spy );
	// 			} );
	// 	} );
	// } );

	describe( 'enter key handling callback', () => {
		it.skip( 'should execute outdentList command on enter key in empty list', () => {
			const domEvtDataStub = { preventDefault() {} };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">[]</listItem>' );

			editor.editing.view.document.fire( 'enter', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it.skip( 'should not execute outdentList command on enter key in non-empty list', () => {
			const domEvtDataStub = { preventDefault() {} };

			const enterCommandExecuteSpy = sinon.stub( editor.commands.get( 'enter' ), 'execute' );
			const outdentCommandExecuteSpy = sinon.stub( editor.commands.get( 'outdentList' ), 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">foo[]</listItem>' );

			editor.editing.view.document.fire( 'enter', domEvtDataStub );

			sinon.assert.calledOnce( enterCommandExecuteSpy );
			sinon.assert.notCalled( outdentCommandExecuteSpy );
		} );
	} );

	describe.skip( 'delete key handling callback', () => {
		it( 'should execute outdentList command on backspace key in first item of list (first node in root)', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should execute outdentList command on backspace key in first item of list (after a paragraph)', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<paragraph>foo</paragraph><listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should not execute outdentList command on delete key in first item of list', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'forward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWith( editor.execute, 'deleteForward' );
		} );

		it( 'should not execute outdentList command when selection is not collapsed', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">[fo]o</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWith( editor.execute, 'delete' );
		} );

		it( 'should not execute outdentList command if not in list item', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<paragraph>[]foo</paragraph>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWith( editor.execute, 'delete' );
		} );

		it( 'should not execute outdentList command if not in first list item', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData(
				model,
				'<listItem listType="bulleted" listIndent="0">foo</listItem><listItem listType="bulleted" listIndent="0">[]foo</listItem>'
			);

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWith( editor.execute, 'delete' );
		} );

		it( 'should not execute outdentList command when selection is not on first position', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">fo[]o</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWith( editor.execute, 'delete' );
		} );

		it( 'should outdent list when previous element is nested in block quote', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData(
				model,
				'<blockQuote><paragraph>x</paragraph></blockQuote><listItem listType="bulleted" listIndent="0">[]foo</listItem>'
			);

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should outdent list when list is nested in block quote', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData(
				model,
				'<paragraph>x</paragraph><blockQuote><listItem listType="bulleted" listIndent="0">[]foo</listItem></blockQuote>'
			);

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should outdent empty list when list is nested in block quote', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData(
				model,
				'<paragraph>x</paragraph><blockQuote><listItem listType="bulleted" listIndent="0">[]</listItem></blockQuote>'
			);

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should not outdent list when the selection is in an element nested inside a list item', () => {
			model.schema.register( 'listItemSub', { allowIn: 'listItem', isInline: true } );
			model.schema.extend( '$text', { allowIn: 'listItemSub' } );
			editor.conversion.elementToElement( { model: 'listItemSub', view: 'listItemSub' } );

			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<listItem listType="bulleted" listIndent="0"><listItemSub>[]foo</listItemSub></listItem>'
			);

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWith( editor.execute, 'delete' );
		} );
	} );

	describe.skip( 'tab key handling callback', () => {
		let domEvtDataStub;

		beforeEach( () => {
			domEvtDataStub = {
				keyCode: getCode( 'Tab' ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			sinon.spy( editor, 'execute' );
		} );

		afterEach( () => {
			editor.execute.restore();
		} );

		it( 'should execute indentList command on tab key', () => {
			setModelData(
				model,
				'<listItem listType="bulleted" listIndent="0">foo</listItem>' +
				'<listItem listType="bulleted" listIndent="0">[]bar</listItem>'
			);

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'indentList' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should execute outdentList command on Shift+Tab keystroke', () => {
			domEvtDataStub.keyCode += getCode( 'Shift' );

			setModelData(
				model,
				'<listItem listType="bulleted" listIndent="0">foo</listItem>' +
				'<listItem listType="bulleted" listIndent="1">[]bar</listItem>'
			);

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
			sinon.assert.calledOnce( domEvtDataStub.preventDefault );
			sinon.assert.calledOnce( domEvtDataStub.stopPropagation );
		} );

		it( 'should not indent if command is disabled', () => {
			setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );

		it( 'should not indent or outdent if alt+tab is pressed', () => {
			domEvtDataStub.keyCode += getCode( 'alt' );

			setModelData(
				model,
				'<listItem listType="bulleted" listIndent="0">foo</listItem>' +
				'<listItem listType="bulleted" listIndent="0">[]bar</listItem>'
			);

			editor.editing.view.document.fire( 'keydown', domEvtDataStub );

			expect( editor.execute.called ).to.be.false;
			sinon.assert.notCalled( domEvtDataStub.preventDefault );
			sinon.assert.notCalled( domEvtDataStub.stopPropagation );
		} );
	} );

	describe( 'post fixer', () => {
		describe( 'insert', () => {
			function testList( input, inserted, output ) {
				return () => {
					// Wrap all changes in one block to avoid post-fixing the selection
					// (which may be incorret) in the meantime.
					model.change( () => {
						setModelData( model, input );

						model.change( writer => {
							writer.insert( parseModel( inserted, model.schema ), modelDoc.selection.getFirstPosition() );
						} );
					} );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
				};
			}

			it( 'element before nested list', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'[]' +
				'<listItem listIndent="2" listType="bulleted">d</listItem>' +
				'<listItem listIndent="2" listType="bulleted">e</listItem>' +
				'<listItem listIndent="3" listType="bulleted">f</listItem>',

				'<paragraph>x</paragraph>',

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<paragraph>x</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">d</listItem>' +
				'<listItem listIndent="0" listType="bulleted">e</listItem>' +
				'<listItem listIndent="1" listType="bulleted">f</listItem>'
			) );

			it( 'list item before nested list', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'[]' +
				'<listItem listIndent="2" listType="bulleted">d</listItem>' +
				'<listItem listIndent="2" listType="bulleted">e</listItem>' +
				'<listItem listIndent="3" listType="bulleted">f</listItem>',

				'<listItem listIndent="0" listType="bulleted">x</listItem>',

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="0" listType="bulleted">x</listItem>' +
				'<listItem listIndent="1" listType="bulleted">d</listItem>' +
				'<listItem listIndent="1" listType="bulleted">e</listItem>' +
				'<listItem listIndent="2" listType="bulleted">f</listItem>'
			) );

			it( 'multiple list items with too big indent', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'[]' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>',

				'<listItem listIndent="4" listType="bulleted">x</listItem>' +
				'<listItem listIndent="5" listType="bulleted">x</listItem>' +
				'<listItem listIndent="4" listType="bulleted">x</listItem>',

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="2" listType="bulleted">x</listItem>' +
				'<listItem listIndent="3" listType="bulleted">x</listItem>' +
				'<listItem listIndent="2" listType="bulleted">x</listItem>' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>'
			) );

			it( 'item with different type - top level list', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="0" listType="bulleted">b</listItem>' +
				'[]' +
				'<listItem listIndent="0" listType="bulleted">c</listItem>',

				'<listItem listIndent="0" listType="numbered">x</listItem>',

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="0" listType="bulleted">b</listItem>' +
				'<listItem listIndent="0" listType="numbered">x</listItem>' +
				'<listItem listIndent="0" listType="bulleted">c</listItem>'
			) );

			it( 'multiple items with different type - nested list', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'[]' +
				'<listItem listIndent="2" listType="bulleted">c</listItem>',

				'<listItem listIndent="1" listType="numbered">x</listItem>' +
				'<listItem listIndent="2" listType="numbered">x</listItem>',

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">x</listItem>' +
				'<listItem listIndent="2" listType="numbered">x</listItem>' +
				'<listItem listIndent="2" listType="numbered">c</listItem>'
			) );

			it( 'item with different type, in nested list, after nested list', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="2" listType="bulleted">c</listItem>' +
				'[]',

				'<listItem listIndent="1" listType="numbered">x</listItem>',

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="2" listType="bulleted">c</listItem>' +
				'<listItem listIndent="1" listType="bulleted">x</listItem>'
			) );

			it( 'two list items with mismatched types inserted in one batch', () => {
				const input =
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>';

				const output =
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="1" listType="bulleted">c</listItem>' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>';

				setModelData( model, input );

				const item1 = '<listItem listIndent="1" listType="numbered">c</listItem>';
				const item2 = '<listItem listIndent="1" listType="bulleted">d</listItem>';

				model.change( writer => {
					writer.append( parseModel( item1, model.schema ), modelRoot );
					writer.append( parseModel( item2, model.schema ), modelRoot );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
			} );
		} );

		describe( 'remove', () => {
			function testList( input, output ) {
				return () => {
					model.change( writer => {
						setModelData( model, input );

						writer.remove( modelDoc.selection.getFirstRange() );
					} );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
				};
			}

			it( 'first list item', testList(
				'[<listItem listIndent="0" listType="bulleted">a</listItem>]' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="2" listType="bulleted">c</listItem>',

				'<listItem listIndent="0" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>'
			) );

			it( 'first list item of nested list', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'[<listItem listIndent="1" listType="bulleted">b</listItem>]' +
				'<listItem listIndent="2" listType="bulleted">c</listItem>' +
				'<listItem listIndent="3" listType="bulleted">d</listItem>' +
				'<listItem listIndent="1" listType="bulleted">e</listItem>' +
				'<listItem listIndent="2" listType="bulleted">f</listItem>',

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>' +
				'<listItem listIndent="2" listType="bulleted">d</listItem>' +
				'<listItem listIndent="1" listType="bulleted">e</listItem>' +
				'<listItem listIndent="2" listType="bulleted">f</listItem>'
			) );

			it( 'selection over two different nested lists of same indent', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'[<listItem listIndent="1" listType="bulleted">c</listItem>' +
				'<listItem listIndent="0" listType="bulleted">d</listItem>' +
				'<listItem listIndent="1" listType="numbered">e</listItem>]' +
				'<listItem listIndent="1" listType="numbered">f</listItem>',

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">f</listItem>'
			) );
		} );

		describe( 'move', () => {
			function testList( input, offset, output ) {
				return () => {
					model.change( writer => {
						setModelData( model, input );

						const targetPosition = writer.createPositionAt( modelRoot, offset );

						writer.move( modelDoc.selection.getFirstRange(), targetPosition );
					} );

					expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
				};
			}

			it( 'nested list item out of list structure', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'[<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="2" listType="bulleted">c</listItem>]' +
				'<listItem listIndent="3" listType="bulleted">d</listItem>' +
				'<listItem listIndent="4" listType="bulleted">e</listItem>' +
				'<paragraph>x</paragraph>',

				6,

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">d</listItem>' +
				'<listItem listIndent="2" listType="bulleted">e</listItem>' +
				'<paragraph>x</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>'
			) );

			it( 'list items between lists', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'[<listItem listIndent="2" listType="bulleted">c</listItem>' +
				'<listItem listIndent="3" listType="bulleted">d</listItem>]' +
				'<listItem listIndent="4" listType="bulleted">e</listItem>' +
				'<paragraph>x</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">f</listItem>' +
				'<listItem listIndent="0" listType="bulleted">g</listItem>',

				7,

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="2" listType="bulleted">e</listItem>' +
				'<paragraph>x</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">f</listItem>' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>' +
				'<listItem listIndent="2" listType="bulleted">d</listItem>' +
				'<listItem listIndent="0" listType="bulleted">g</listItem>'
			) );

			it( 'element in between nested list items', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="2" listType="bulleted">c</listItem>' +
				'<listItem listIndent="3" listType="bulleted">d</listItem>' +
				'[<paragraph>x</paragraph>]',

				2,

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<paragraph>x</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">c</listItem>' +
				'<listItem listIndent="1" listType="bulleted">d</listItem>'
			) );

			it( 'multiple nested list items of different types #1 - fix at start', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'[<listItem listIndent="1" listType="bulleted">c</listItem>' +
				'<listItem listIndent="0" listType="bulleted">d</listItem>' +
				'<listItem listIndent="1" listType="numbered">e</listItem>]' +
				'<listItem listIndent="1" listType="numbered">f</listItem>' +
				'<listItem listIndent="0" listType="bulleted">g</listItem>' +
				'<listItem listIndent="1" listType="numbered">h</listItem>' +
				'<listItem listIndent="1" listType="numbered">i</listItem>',

				8,

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">f</listItem>' +
				'<listItem listIndent="0" listType="bulleted">g</listItem>' +
				'<listItem listIndent="1" listType="numbered">h</listItem>' +
				'<listItem listIndent="1" listType="numbered">c</listItem>' +
				'<listItem listIndent="0" listType="bulleted">d</listItem>' +
				'<listItem listIndent="1" listType="numbered">e</listItem>' +
				'<listItem listIndent="1" listType="numbered">i</listItem>'
			) );

			it( 'multiple nested list items of different types #2 - fix at end', testList(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'[<listItem listIndent="1" listType="bulleted">c</listItem>' +
				'<listItem listIndent="0" listType="bulleted">d</listItem>' +
				'<listItem listIndent="1" listType="numbered">e</listItem>]' +
				'<listItem listIndent="1" listType="numbered">f</listItem>' +
				'<listItem listIndent="0" listType="bulleted">g</listItem>' +
				'<listItem listIndent="1" listType="bulleted">h</listItem>' +
				'<listItem listIndent="1" listType="bulleted">i</listItem>',

				8,

				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">f</listItem>' +
				'<listItem listIndent="0" listType="bulleted">g</listItem>' +
				'<listItem listIndent="1" listType="bulleted">h</listItem>' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>' +
				'<listItem listIndent="0" listType="bulleted">d</listItem>' +
				'<listItem listIndent="1" listType="numbered">e</listItem>' +
				'<listItem listIndent="1" listType="numbered">i</listItem>'
			) );

			// #78.
			it( 'move out of container', testList(
				'<blockQuote>' +
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>' +
				'<listItem listIndent="1" listType="bulleted">d</listItem>' +
				'[<listItem listIndent="2" listType="bulleted">e</listItem>]' +
				'</blockQuote>',

				0,

				'<listItem listIndent="0" listType="bulleted">e</listItem>' +
				'<blockQuote>' +
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">c</listItem>' +
				'<listItem listIndent="1" listType="bulleted">d</listItem>' +
				'</blockQuote>'
			) );
		} );

		describe( 'rename', () => {
			it( 'rename nested item', () => {
				const modelBefore =
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="2" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="2" listType="bulleted">d</listItem>' +
					'<listItem listIndent="3" listType="bulleted">e</listItem>' +
					'<listItem listIndent="1" listType="bulleted">f</listItem>' +
					'<listItem listIndent="2" listType="bulleted">g</listItem>' +
					'<listItem listIndent="1" listType="bulleted">h</listItem>' +
					'<listItem listIndent="2" listType="bulleted">i</listItem>';

				const expectedModel =
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<paragraph>c</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">d</listItem>' +
					'<listItem listIndent="1" listType="bulleted">e</listItem>' +
					'<listItem listIndent="0" listType="bulleted">f</listItem>' +
					'<listItem listIndent="1" listType="bulleted">g</listItem>' +
					'<listItem listIndent="0" listType="bulleted">h</listItem>' +
					'<listItem listIndent="1" listType="bulleted">i</listItem>';

				model.change( writer => {
					setModelData( model, modelBefore );

					const element = modelDoc.selection.getFirstPosition().nodeAfter;

					writer.rename( element, 'paragraph' );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( expectedModel );
			} );
		} );
	} );

	describe( 'paste and insertContent integration', () => {
		it( 'should be triggered on DataController#insertContent()', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			editor.model.insertContent(
				parseModel(
					'<listItem listType="bulleted" listIndent="0">X</listItem>' +
					'<listItem listType="bulleted" listIndent="1">Y</listItem>',
					model.schema
				)
			);

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">BX</listItem>' +
				'<listItem listIndent="2" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="2" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should be triggered when selectable is passed', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			model.insertContent(
				parseModel(
					'<listItem listType="bulleted" listIndent="0">X</listItem>' +
					'<listItem listType="bulleted" listIndent="1">Y</listItem>',
					model.schema
				),
				model.createRange(
					model.createPositionFromPath( modelRoot, [ 1, 1 ] ),
					model.createPositionFromPath( modelRoot, [ 1, 1 ] )
				)
			);

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">B[]X</listItem>' +
				'<listItem listIndent="2" listType="bulleted">Y</listItem>' +
				'<listItem listIndent="2" listType="bulleted">C</listItem>'
			);
		} );

		// Just checking that it doesn't crash. #69
		it( 'should work if an element is passed to DataController#insertContent()', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			model.change( writer => {
				const listItem = writer.createElement( 'listItem', { listType: 'bulleted', listIndent: '0' } );
				writer.insertText( 'X', listItem );

				model.insertContent( listItem );
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">BX[]</listItem>' +
				'<listItem listIndent="2" listType="bulleted">C</listItem>'
			);
		} );

		// Just checking that it doesn't crash. #69
		it( 'should work if an element is passed to DataController#insertContent() - case #69', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			model.change( writer => {
				model.insertContent( writer.createText( 'X' ) );
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">BX[]</listItem>' +
				'<listItem listIndent="2" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should fix indents of pasted list items', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">BX</listItem>' +
				'<listItem listIndent="2" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="2" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should not fix indents of list items that are separated by non-list element', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X</li></ul></li></ul><p>Y</p><ul><li>Z</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">BW</listItem>' +
				'<listItem listIndent="2" listType="bulleted">X</listItem>' +
				'<paragraph>Y</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">Z[]</listItem>' +
				'<listItem listIndent="1" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should co-work correctly with post fixer', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<p>X</p><ul><li>Y</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">BX</listItem>' +
				'<listItem listIndent="0" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="1" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should work if items are pasted between listItem elements', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<listItem listType="bulleted" listIndent="0">A</listItem>' +
					'<listItem listType="bulleted" listIndent="1">B</listItem>[]' +
					'<listItem listType="bulleted" listIndent="2">C</listItem>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
				} );
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">B</listItem>' +
				'<listItem listIndent="1" listType="bulleted">X</listItem>' +
				'<listItem listIndent="2" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="2" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should create correct model when list items are pasted in top-level list', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A[]</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">AX</listItem>' +
				'<listItem listIndent="1" listType="bulleted">Y[]</listItem>' +
				'<listItem listIndent="1" listType="bulleted">B</listItem>'
			);
		} );

		it( 'should create correct model when list items are pasted in non-list context', () => {
			setModelData( model,
				'<paragraph>A[]</paragraph>' +
				'<paragraph>B</paragraph>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>X<ul><li>Y</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>AX</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">Y[]</listItem>' +
				'<paragraph>B</paragraph>'
			);
		} );

		it( 'should not crash when "empty content" is inserted', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( () => {
				model.change( writer => {
					editor.model.insertContent( writer.createDocumentFragment() );
				} );
			} ).not.to.throw();
		} );

		it( 'should correctly handle item that is pasted without its parent', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<listItem listType="numbered" listIndent="0">A</listItem>' +
					'<listItem listType="numbered" listIndent="1">B</listItem>' +
					'[]' +
					'<paragraph>Bar</paragraph>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<li>X</li>' )
				} );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>Foo</paragraph>' +
				'<listItem listIndent="0" listType="numbered">A</listItem>' +
				'<listItem listIndent="1" listType="numbered">B</listItem>' +
				'<listItem listIndent="1" listType="numbered">X[]</listItem>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should correctly handle item that is pasted without its parent #2', () => {
			// Wrap all changes in one block to avoid post-fixing the selection
			// (which may be incorret) in the meantime.
			model.change( () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<listItem listType="numbered" listIndent="0">A</listItem>' +
					'<listItem listType="numbered" listIndent="1">B</listItem>' +
					'[]' +
					'<paragraph>Bar</paragraph>'
				);

				const clipboard = editor.plugins.get( 'ClipboardPipeline' );

				clipboard.fire( 'inputTransformation', {
					content: parseView( '<li>X<ul><li>Y</li></ul></li>' )
				} );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>Foo</paragraph>' +
				'<listItem listIndent="0" listType="numbered">A</listItem>' +
				'<listItem listIndent="1" listType="numbered">B</listItem>' +
				'<listItem listIndent="1" listType="numbered">X</listItem>' +
				'<listItem listIndent="2" listType="bulleted">Y[]</listItem>' +
				'<paragraph>Bar</paragraph>'
			);
		} );

		it( 'should handle block elements inside pasted list #1', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B[]</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X<p>Y</p>Z</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">A</listItem>' +
				'<listItem listIndent="1" listType="bulleted">BW</listItem>' +
				'<listItem listIndent="2" listType="bulleted">X</listItem>' +
				'<paragraph>Y</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">Z[]</listItem>' +
				'<listItem listIndent="1" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should handle block elements inside pasted list #2', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A[]</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>W<ul><li>X<p>Y</p>Z</li></ul></li></ul>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">AW</listItem>' +
				'<listItem listIndent="1" listType="bulleted">X</listItem>' +
				'<paragraph>Y</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">Z[]</listItem>' +
				'<listItem listIndent="0" listType="bulleted">B</listItem>' +
				'<listItem listIndent="1" listType="bulleted">C</listItem>'
			);
		} );

		it( 'should handle block elements inside pasted list #3', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A[]</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li><p>W</p><p>X</p><p>Y</p></li><li>Z</li></ul>' )
			} );

			expect( getModelData( model ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">AW</listItem>' +
				'<paragraph>X</paragraph>' +
				'<paragraph>Y</paragraph>' +
				'<listItem listIndent="0" listType="bulleted">Z[]</listItem>' +
				'<listItem listIndent="1" listType="bulleted">B</listItem>' +
				'<listItem listIndent="2" listType="bulleted">C</listItem>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5-list/issues/126#issuecomment-518206743
		it( 'should properly handle split of list items with non-standard converters', () => {
			setModelData( model,
				'<listItem listType="bulleted" listIndent="0">A[]</listItem>' +
				'<listItem listType="bulleted" listIndent="1">B</listItem>' +
				'<listItem listType="bulleted" listIndent="2">C</listItem>'
			);

			editor.model.schema.register( 'splitBlock', { inheritAllFrom: '$block' } );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'splitBlock', view: 'splitBlock' } );
			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:splitBlock', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );

				// Use split to allowed parent logic to simulate a non-standard use of `modelCursor` after split.
				const splitBlock = conversionApi.writer.createElement( 'splitBlock' );
				conversionApi.safeInsert( splitBlock, data.modelCursor );

				data.modelRange = conversionApi.writer.createRangeOn( splitBlock );
				data.modelCursor = conversionApi.writer.createPositionAfter( splitBlock );
			} ) );

			const clipboard = editor.plugins.get( 'ClipboardPipeline' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<ul><li>a<splitBlock></splitBlock>b</li></ul>' )
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">Aa</listItem>' +
				'<splitBlock></splitBlock>' +
				'<listItem listIndent="0" listType="bulleted">b</listItem>' +
				'<listItem listIndent="1" listType="bulleted">B</listItem>' +
				'<listItem listIndent="2" listType="bulleted">C</listItem>'
			);
		} );
	} );
} );
