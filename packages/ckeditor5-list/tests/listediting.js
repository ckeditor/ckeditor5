/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ListEditing from '../src/listediting';
import ListCommand from '../src/listcommand';
import IndentCommand from '../src/indentcommand';

import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData, parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting';

import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';

describe( 'ListEditing', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc, viewRoot;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Clipboard, BoldEditing, ListEditing, UndoEditing, BlockQuoteEditing, TableEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
				modelDoc = model.document;
				modelRoot = modelDoc.getRoot();

				view = editor.editing.view;
				viewDoc = view.document;
				viewRoot = viewDoc.getRoot();

				model.schema.register( 'foo', {
					allowWhere: '$block',
					allowAttributes: [ 'listIndent', 'listType' ],
					isBlock: true,
					isObject: true
				} );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListEditing.pluginName ).to.equal( 'ListEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListEditing ) ).to.be.instanceOf( ListEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.isRegistered( 'listItem' ) );
		expect( model.schema.isBlock( 'listItem' ) );

		expect( model.schema.checkChild( [ '$root' ], 'listItem' ) ).to.be.true;
		expect( model.schema.checkChild( [ '$root', 'listItem' ], '$text' ) ).to.be.true;
		expect( model.schema.checkChild( [ '$root', 'listItem' ], 'listItem' ) ).to.be.false;
		expect( model.schema.checkChild( [ '$root', 'listItem' ], '$block' ) ).to.be.false;

		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listIndent' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listType' ) ).to.be.true;
	} );

	describe( 'commands', () => {
		it( 'should register bulleted list command', () => {
			const command = editor.commands.get( 'bulletedList' );

			expect( command ).to.be.instanceOf( ListCommand );
			expect( command ).to.have.property( 'type', 'bulleted' );
		} );

		it( 'should register numbered list command', () => {
			const command = editor.commands.get( 'numberedList' );

			expect( command ).to.be.instanceOf( ListCommand );
			expect( command ).to.have.property( 'type', 'numbered' );
		} );

		it( 'should register indent list command', () => {
			const command = editor.commands.get( 'indentList' );

			expect( command ).to.be.instanceOf( IndentCommand );
		} );

		it( 'should register outdent list command', () => {
			const command = editor.commands.get( 'outdentList' );

			expect( command ).to.be.instanceOf( IndentCommand );
		} );

		it( 'should add indent list command to indent command', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ListEditing, IndentEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} )
				.then( () => {
					const indentListCommand = editor.commands.get( 'indentList' );
					const indentCommand = editor.commands.get( 'indent' );

					const spy = sinon.spy( indentListCommand, 'execute' );

					indentListCommand.isEnabled = true;
					indentCommand.execute();

					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'should add outdent list command to outdent command', () => {
			return VirtualTestEditor
				.create( {
					plugins: [ ListEditing, IndentEditing ]
				} )
				.then( newEditor => {
					editor = newEditor;
				} )
				.then( () => {
					const outdentListCommand = editor.commands.get( 'outdentList' );
					const outdentCommand = editor.commands.get( 'outdent' );

					const spy = sinon.spy( outdentListCommand, 'execute' );

					outdentListCommand.isEnabled = true;
					outdentCommand.execute();

					sinon.assert.calledOnce( spy );
				} );
		} );
	} );

	describe( 'enter key handling callback', () => {
		it( 'should execute outdentList command on enter key in empty list', () => {
			const domEvtDataStub = { preventDefault() {} };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">[]</listItem>' );

			editor.editing.view.document.fire( 'enter', domEvtDataStub );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should not execute outdentList command on enter key in non-empty list', () => {
			const domEvtDataStub = { preventDefault() {} };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">foo[]</listItem>' );

			editor.editing.view.document.fire( 'enter', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );
	} );

	describe( 'delete key handling callback', () => {
		it( 'should execute outdentList command on backspace key in first item of list', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.calledWithExactly( editor.execute, 'outdentList' );
		} );

		it( 'should execute outdentList command on backspace key in first item of list', () => {
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

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command when selection is not collapsed', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">[fo]o</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command if not in list item', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<paragraph>[]foo</paragraph>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command if not in first list item', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData(
				model,
				'<listItem listType="bulleted" listIndent="0">foo</listItem><listItem listType="bulleted" listIndent="0">[]foo</listItem>'
			);

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command when selection is not on first position', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">fo[]o</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
		} );

		it( 'should not execute outdentList command when selection is not on first position', () => {
			const domEvtDataStub = { preventDefault() {}, direction: 'backward' };

			sinon.spy( editor, 'execute' );

			setModelData( model, '<listItem listType="bulleted" listIndent="0">fo[]o</listItem>' );

			editor.editing.view.document.fire( 'delete', domEvtDataStub );

			sinon.assert.notCalled( editor.execute );
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
	} );

	describe( 'tab key handling callback', () => {
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

	describe( 'flat lists', () => {
		describe( 'setting data', () => {
			function testList( testName, string, expectedString = null ) {
				it( testName, () => {
					editor.setData( string );
					expect( editor.getData() ).to.equal( expectedString || string );
				} );
			}

			testList( 'single item', '<ul><li>x</li></ul>' );
			testList( 'multiple items', '<ul><li>a</li><li>b</li><li>c</li></ul>' );
			testList( 'items and text', '<p>xxx</p><ul><li>a</li><li>b</li></ul><p>yyy</p><ul><li>c</li><li>d</li></ul>' );
			testList( 'numbered list', '<ol><li>a</li><li>b</li></ol>' );
			testList( 'mixed list and content #1', '<p>xxx</p><ul><li>a</li><li>b</li></ul><ol><li>c</li><li>d</li></ol><p>yyy</p>' );
			testList( 'mixed list and content #2',
				'<ol><li>a</li></ol><p>xxx</p><ul><li>b</li><li>c</li></ul><p>yyy</p><ul><li>d</li></ul>' );
			testList(
				'clears incorrect elements',
				'<ul>x<li>a</li><li>b</li><p>xxx</p>x</ul><p>c</p>', '<ul><li>a</li><li>b</li></ul><p>c</p>'
			);
			testList(
				'clears whitespaces',
				'<p>foo</p>' +
				'<ul>' +
				'	<li>xxx</li>' +
				'	<li>yyy</li>' +
				'</ul>',
				'<p>foo</p><ul><li>xxx</li><li>yyy</li></ul>'
			);

			// #ckeditor5/1399
			testList( 'single item with `font-weight` style',
				'<ol><li style="font-weight: bold">foo</li></ol>', '<ol><li><strong>foo</strong></li></ol>' );

			it( 'model test for mixed content', () => {
				editor.setData( '<ol><li>a</li></ol><p>xxx</p><ul><li>b</li><li>c</li></ul><p>yyy</p><ul><li>d</li></ul>' );

				const expectedModelData =
					'<listItem listIndent="0" listType="numbered">a</listItem>' +
					'<paragraph>xxx</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>' +
					'<paragraph>yyy</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">d</listItem>';

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( expectedModelData );
			} );

			describe( 'block elements inside list items', () => {
				describe( 'single block', () => {
					testList(
						'single item',
						'<ul><li><p>Foo</p></li></ul>',
						'<p>Foo</p>'
					);
					testList(
						'multiple items',
						'<ul><li><p>Foo</p></li><li><p>Bar</p></li></ul>',
						'<p>Foo</p><p>Bar</p>'
					);
					testList(
						'nested items',
						'<ul><li><p>Foo</p><ol><li><p>Bar</p></li></ol></li></ul>',
						'<p>Foo</p><p>Bar</p>'
					);
				} );

				describe( 'multiple blocks', () => {
					testList(
						'single item',
						'<ul><li><h2>Foo</h2><p>Bar</p></li></ul>',
						'<p>Foo</p><p>Bar</p>'
					);
					testList(
						'multiple items',
						'<ol><li><p>123</p></li></ol><ul><li><h2>Foo</h2><p>Bar</p></li></ul>',
						'<p>123</p><p>Foo</p><p>Bar</p>'
					);
					testList(
						'nested items #2',
						'<ol><li><p>123</p><p>456</p><ul><li><h2>Foo</h2><p>Bar</p></li></ul></li></ol>',
						'<p>123</p><p>456</p><p>Foo</p><p>Bar</p>'
					);
				} );

				describe.skip( 'multiple blocks', () => { // Skip due to #112 issue.
					testList(
						'nested items #1',
						'<ol><li><p>123</p><ul><li><h2>Foo</h2><p>Bar</p></li></ul><p>456</p></li></ol>',
						'<p>123</p><p>Foo</p><p>Bar</p><p>456</p>'
					);
				} );

				describe( 'inline + block', () => {
					testList(
						'single item',
						'<ul><li>Foo<p>Bar</p></li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p>'
					);
					testList(
						'multiple items',
						'<ul><li>Foo<p>Bar</p></li><li>Foz<p>Baz</p></li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p><ul><li>Foz</li></ul><p>Baz</p>'
					);
					testList(
						'split by list items',
						'<ul><li>Foo</li><li><p>Bar</p></li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p>'
					);
					testList(
						'nested split by list items',
						'<ul><li>Foo<ol><li><p>Bar</p></li></ol></li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p>'
					);
					testList(
						'nested items #1',
						'<ol><li>Foo<p>Bar</p><ul><li>123<h2>456</h2></li></ul></li></ol>',
						'<ol><li>Foo</li></ol><p>Bar</p><ul><li>123</li></ul><p>456</p>'
					);
					testList(
						'nested items #2',
						'<ol><li>Foo<p>Bar</p><ul><li>123<h2>456</h2></li></ul></li><li>abc<h2>def</h2></li></ol>',
						'<ol><li>Foo</li></ol><p>Bar</p><ul><li>123</li></ul><p>456</p><ol><li>abc</li></ol><p>def</p>'
					);
				} );

				describe( 'block + inline', () => {
					testList(
						'single item',
						'<ul><li><p>Foo</p>Bar</li></ul>',
						'<p>Foo</p><ul><li>Bar</li></ul>'
					);
					testList(
						'multiple items',
						'<ul><li><p>Foo</p>Bar</li><li><p>Foz</p>Baz</li></ul>',
						'<p>Foo</p><ul><li>Bar</li></ul><p>Foz</p><ul><li>Baz</li></ul>'
					);
					testList(
						'split by list items',
						'<ul><li><p>Bar</p><li>Foo</li></li></ul>',
						'<p>Bar</p><ul><li>Foo</li></ul>'
					);
					testList(
						'nested split by list items',
						'<ul><li><p>Bar</p><ol><li>Foo</li></ol></li></ul>',
						'<p>Bar</p><ol><li>Foo</li></ol>'
					);
					testList(
						'nested items #1',
						'<ol><li><p>Foo</p>Bar<ul><li><h2>123</h2>456</li></ul></li></ol>',
						'<p>Foo</p><ol><li>Bar</li></ol><p>123</p><ul><li>456</li></ul>'
					);
					testList(
						'nested items #2',
						'<ol><li><p>Foo</p>Bar<ul><li><h2>123</h2>456</li></ul></li><li><h2>abc</h2>def</li></ol>',
						'<p>Foo</p><ol><li>Bar</li></ol><p>123</p><ul><li>456</li></ul><p>abc</p><ol><li>def</li></ol>'
					);
				} );

				describe( 'complex', () => {
					testList(
						'single item with inline block inline',
						'<ul><li>Foo<p>Bar</p>Baz</li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p><ul><li>Baz</li></ul>'
					);
					testList(
						'single item with inline block block',
						'<ul><li>Text<p>Foo</p><p>Bar</p></li></ul>',
						'<ul><li>Text</li></ul><p>Foo</p><p>Bar</p>'
					);
					testList(
						'single item with block block inline',
						'<ul><li><p>Foo</p><p>Bar</p>Text</li></ul>',
						'<p>Foo</p><p>Bar</p><ul><li>Text</li></ul>'
					);
					testList(
						'single item with block block block',
						'<ul><li><p>Foo</p><p>Bar</p><p>Baz</p></li></ul>',
						'<p>Foo</p><p>Bar</p><p>Baz</p>'
					);
					testList(
						'item inline + item block and inline',
						'<ul><li>Foo</li><li><p>Bar</p>Baz</li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p><ul><li>Baz</li></ul>'
					);
					testList(
						'item inline and block + item inline',
						'<ul><li>Foo<p>Bar</p></li><li>Baz</li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p><ul><li>Baz</li></ul>'
					);
					testList(
						'multiple items inline/block mix',
						'<ul><li>Text<p>Foo</p></li><li>Bar<p>Baz</p>123</li></ul>',
						'<ul><li>Text</li></ul><p>Foo</p><ul><li>Bar</li></ul><p>Baz</p><ul><li>123</li></ul>'
					);
					testList(
						'nested items',
						'<ul><li>Foo<p>Bar</p></li><li>Baz<p>123</p>456<ol><li>ABC<p>DEF</p></li><li>GHI</li></ol></li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p><ul><li>Baz</li></ul><p>123</p><ul><li>456<ol><li>ABC</li></ol></li></ul>' +
							'<p>DEF</p><ol><li>GHI</li></ol>'
					);
					testList(
						'list with empty inline element',
						'<ul><li><span></span>Foo<p>Bar</p></li></ul>',
						'<ul><li>Foo</li></ul><p>Bar</p>'
					);
				} );
			} );
		} );

		describe( 'position mapping', () => {
			let mapper;

			beforeEach( () => {
				mapper = editor.editing.mapper;

				editor.setData(
					'<p>a</p>' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ul>' +
					'<p>e</p>' +
					'<ol>' +
						'<li>f</li>' +
					'</ol>' +
					'<p>g</p>'
				);
			} );

			/*
				<paragraph>a</paragraph>
				<listItem listIndent=0 listType="bulleted">b</listItem>
				<listItem listIndent=0 listType="bulleted">c</listItem>
				<listItem listIndent=0 listType="bulleted">d</listItem>
				<paragraph>e</paragraph>
				<listItem listIndent=0 listType="numbered">f</listItem>
				<paragraph>g</paragraph>
			 */

			describe( 'view to model', () => {
				function testList( testName, viewPath, modelPath ) {
					it( testName, () => {
						const viewPos = getViewPosition( viewRoot, viewPath, view );
						const modelPos = mapper.toModelPosition( viewPos );

						expect( modelPos.root ).to.equal( modelRoot );
						expect( modelPos.path ).to.deep.equal( modelPath );
					} );
				}

				testList( 'before ul',			[ 1 ],			[ 1 ] );	// --> before first `listItem`
				testList( 'before first li',	[ 1, 0 ],		[ 1 ] );	// --> before first `listItem`
				testList( 'beginning of li',	[ 1, 0, 0 ],	[ 1, 0 ] );	// --> beginning of first `listItem`
				testList( 'end of li',			[ 1, 0, 1 ],	[ 1, 1 ] );	// --> end of first `listItem`
				testList( 'before middle li',	[ 1, 1 ],		[ 2 ] );	// --> before middle `listItem`
				testList( 'before last li',		[ 1, 2 ],		[ 3 ] );	// --> before last `listItem`
				testList( 'after last li',		[ 1, 3 ],		[ 4 ] );	// --> after last `listItem` / before `paragraph`
				testList( 'after ul',			[ 2 ],			[ 4 ] );	// --> after last `listItem` / before `paragraph`
				testList( 'before ol',			[ 3 ],			[ 5 ] );	// --> before numbered `listItem`
				testList( 'before only li',		[ 3, 0 ],		[ 5 ] );	// --> before numbered `listItem`
				testList( 'after only li',		[ 3, 1 ],		[ 6 ] );	// --> after numbered `listItem`
				testList( 'after ol',			[ 4 ],			[ 6 ] );	// --> after numbered `listItem`
			} );

			describe( 'model to view', () => {
				function testList( testName, modelPath, viewPath ) {
					it( testName, () => {
						const modelPos = model.createPositionFromPath( modelRoot, modelPath );
						const viewPos = mapper.toViewPosition( modelPos );

						expect( viewPos.root ).to.equal( viewRoot );
						expect( getViewPath( viewPos ) ).to.deep.equal( viewPath );
					} );
				}

				testList( 'before first listItem',			[ 1 ],		[ 1 ] );			// --> before ul
				testList( 'beginning of first listItem',	[ 1, 0 ],	[ 1, 0, 0, 0 ] );	// --> beginning of `b` text node
				testList( 'end of first listItem',			[ 1, 1 ],	[ 1, 0, 0, 1 ] );	// --> end of `b` text node
				testList( 'before middle listItem',			[ 2 ],		[ 1, 1 ] );			// --> before middle li
				testList( 'before last listItem',			[ 3 ],		[ 1, 2 ] );			// --> before last li
				testList( 'after last listItem',			[ 4 ],		[ 2 ] );			// --> after ul
				testList( 'before numbered listItem',		[ 5 ],		[ 3 ] );			// --> before ol
				testList( 'after numbered listItem',		[ 6 ],		[ 4 ] );			// --> after ol
			} );
		} );

		describe( 'convert changes', () => {
			describe( 'insert', () => {
				testInsert(
					'list item at the beginning of same list type',

					'<paragraph>p</paragraph>' +
					'[<listItem listIndent="0" listType="bulleted">x</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>',

					'<p>p</p>' +
					'<ul>' +
						'<li>x</li>' +
						'<li>a</li>' +
					'</ul>'
				);

				testInsert(
					'list item in the middle of same list type',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">x</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>x</li>' +
						'<li>b</li>' +
					'</ul>'
				);

				testInsert(
					'list item at the end of same list type',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">x</listItem>]',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>x</li>' +
					'</ul>'
				);

				testInsert(
					'list item at the beginning of different list type',

					'<paragraph>p</paragraph>' +
					'[<listItem listIndent="0" listType="numbered">x</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>',

					'<p>p</p>' +
					'<ol>' +
						'<li>x</li>' +
					'</ol>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>'
				);

				testInsert(
					'list item in the middle of different list type',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="numbered">x</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<ol>' +
						'<li>x</li>' +
					'</ol>' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>'
				);

				testInsert(
					'list item at the end of different list type',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="numbered">x</listItem>]',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<ol>' +
						'<li>x</li>' +
					'</ol>'
				);

				testInsert(
					'element between list items',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<paragraph>x</paragraph>]' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>',

					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>'
				);
			} );

			describe( 'remove', () => {
				testRemove(
					'remove the first list item',

					'<paragraph>p</paragraph>' +
					'[<listItem listIndent="0" listType="bulleted">a</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>',

					'<p>p</p>' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>'
				);

				testRemove(
					'remove list item from the middle',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>c</li>' +
					'</ul>'
				);

				testRemove(
					'remove the last list item',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">c</listItem>]',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ul>'
				);

				testRemove(
					'remove the only list item',

					'<paragraph>p</paragraph>' +
					'[<listItem listIndent="0" listType="bulleted">x</listItem>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<p>p</p>'
				);

				testRemove(
					'remove element from between lists of same type',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<paragraph>x</paragraph>]' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ul>' +
					'<p>p</p>'
				);

				testRemove(
					'remove element from between lists of different type',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<paragraph>x</paragraph>]' +
					'<listItem listIndent="0" listType="numbered">b</listItem>' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
					'<p>p</p>'
				);
			} );

			describe( 'change type', () => {
				testChangeType(
					'change first list item',

					'<paragraph>p</paragraph>' +
					'[<listItem listIndent="0" listType="bulleted">a</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>',

					'<p>p</p>' +
					'<ol>' +
						'<li>a</li>' +
					'</ol>' +
					'<ul>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ul>'
				);

				testChangeType(
					'change middle list item',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<ol>' +
						'<li>b</li>' +
					'</ol>' +
					'<ul>' +
						'<li>c</li>' +
					'</ul>'
				);

				testChangeType(
					'change last list item',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">c</listItem>]',

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ul>' +
					'<ol>' +
						'<li>c</li>' +
					'</ol>'
				);

				testChangeType(
					'change only list item',

					'<paragraph>p</paragraph>' +
					'[<listItem listIndent="0" listType="bulleted">a</listItem>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>a</li>' +
					'</ol>' +
					'<p>p</p>'
				);

				testChangeType(
					'change element at the edge of two different lists #1',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="0" listType="numbered">d</listItem>',

					'<ul>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ul>' +
					'<ol>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ol>'
				);

				testChangeType(
					'change element at the edge of two different lists #1',

					'<listItem listIndent="0" listType="numbered">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>' +
					'<listItem listIndent="0" listType="bulleted">d</listItem>',

					'<ol>' +
						'<li>a</li>' +
						'<li>b</li>' +
					'</ol>' +
					'<ul>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ul>'
				);

				testChangeType(
					'change multiple elements #1',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">d</listItem>',

					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<ol>' +
						'<li>b</li>' +
						'<li>c</li>' +
					'</ol>' +
					'<ul>' +
						'<li>d</li>' +
					'</ul>'
				);

				testChangeType(
					'change multiple elements #2',

					'<listItem listIndent="0" listType="numbered">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="0" listType="numbered">d</listItem>',

					'<ol>' +
						'<li>a</li>' +
						'<li>b</li>' +
						'<li>c</li>' +
						'<li>d</li>' +
					'</ol>'
				);
			} );

			describe( 'rename from list item', () => {
				testRenameFromListItem(
					'rename first list item',

					'[<listItem listIndent="0" listType="bulleted">a</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>',

					'<p>a</p>' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>'
				);

				testRenameFromListItem(
					'rename middle list item',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>',

					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>b</p>' +
					'<ul>' +
						'<li>c</li>' +
					'</ul>'
				);

				testRenameFromListItem(
					'rename last list item',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]',

					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>b</p>'
				);

				testRenameFromListItem(
					'rename only list item',

					'<paragraph>p</paragraph>' +
					'[<listItem listIndent="0" listType="bulleted">x</listItem>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<p>x</p>' +
					'<p>p</p>'
				);
			} );

			describe( 'rename to list item (with attribute change)', () => {
				testRenameToListItem(
					'only paragraph', 0,

					'[<paragraph>a</paragraph>]',

					'<ul>' +
						'<li>a</li>' +
					'</ul>'
				);

				testRenameToListItem(
					'paragraph between paragraphs', 0,

					'<paragraph>x</paragraph>' +
					'[<paragraph>a</paragraph>]' +
					'<paragraph>x</paragraph>',

					'<p>x</p>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>x</p>'
				);

				testRenameToListItem(
					'element before list of same type', 0,

					'[<paragraph>x</paragraph>]' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>',

					'<ul>' +
						'<li>x</li>' +
						'<li>a</li>' +
					'</ul>'
				);

				testRenameToListItem(
					'element after list of same type', 0,

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<paragraph>x</paragraph>]',

					'<ul>' +
						'<li>a</li>' +
						'<li>x</li>' +
					'</ul>'
				);

				testRenameToListItem(
					'element before list of different type', 0,

					'[<paragraph>x</paragraph>]' +
					'<listItem listIndent="0" listType="numbered">a</listItem>',

					'<ul>' +
						'<li>x</li>' +
					'</ul>' +
					'<ol>' +
						'<li>a</li>' +
					'</ol>'
				);

				testRenameToListItem(
					'element after list of different type', 0,

					'<listItem listIndent="0" listType="numbered">a</listItem>' +
					'[<paragraph>x</paragraph>]',

					'<ol>' +
						'<li>a</li>' +
					'</ol>' +
					'<ul>' +
						'<li>x</li>' +
					'</ul>'
				);

				testRenameToListItem(
					'element between lists of same type', 0,

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<paragraph>x</paragraph>]' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>',

					'<ul>' +
						'<li>a</li>' +
						'<li>x</li>' +
						'<li>b</li>' +
					'</ul>'
				);
			} );

			describe( 'move', () => {
				testMove(
					'list item inside same list',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>',

					4, // Move after last item.

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
						'<li>c</li>' +
						'<li>b</li>' +
					'</ul>'
				);

				testMove(
					'out list item from list',

					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<paragraph>p</paragraph>',

					4, // Move after second paragraph.

					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>p</p>' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>'
				);

				testMove(
					'the only list item',

					'<paragraph>p</paragraph>' +
					'[<listItem listIndent="0" listType="bulleted">a</listItem>]' +
					'<paragraph>p</paragraph>',

					3, // Move after second paragraph.

					'<p>p</p>' +
					'<p>p</p>' +
					'<ul>' +
						'<li>a</li>' +
					'</ul>'
				);

				testMove(
					'list item between two lists of same type',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">c</listItem>' +
					'<listItem listIndent="0" listType="bulleted">d</listItem>',

					4, // Move between list item "c" and list item "d'.

					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>p</p>' +
					'<ul>' +
						'<li>c</li>' +
						'<li>b</li>' +
						'<li>d</li>' +
					'</ul>'
				);

				testMove(
					'list item between two lists of different type',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<paragraph>p</paragraph>' +
					'<listItem listIndent="0" listType="numbered">c</listItem>' +
					'<listItem listIndent="0" listType="numbered">d</listItem>',

					4, // Move between list item "c" and list item "d'.

					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>p</p>' +
					'<ol>' +
						'<li>c</li>' +
					'</ol>' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>' +
					'<ol>' +
						'<li>d</li>' +
					'</ol>'
				);

				testMove(
					'element between list items',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="0" listType="bulleted">b</listItem>' +
					'[<paragraph>p</paragraph>]',

					1, // Move between list item "a" and list item "b'.

					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>p</p>' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>'
				);
			} );
		} );
	} );

	describe( 'nested lists', () => {
		describe( 'setting data', () => {
			function testList( string, expectedString = null ) {
				return () => {
					editor.setData( string );
					assertEqualMarkup( editor.getData(), expectedString || string );
				};
			}

			describe( 'non HTML compliant list fixing', () => {
				it( 'ul in ul', testList(
					'<ul>' +
						'<ul>' +
							'<li>1.1</li>' +
						'</ul>' +
					'</ul>',
					'<ul>' +
						'<li>1.1</li>' +
					'</ul>'
				) );

				it( 'ul in ol', testList(
					'<ol>' +
						'<ul>' +
							'<li>1.1</li>' +
						'</ul>' +
					'</ol>',
					'<ul>' +
					'<li>1.1</li>' +
					'</ul>'
				) );

				it( 'ul in ul (previous sibling is li)', testList(
					'<ul>' +
						'<li>1</li>' +
						'<ul>' +
							'<li>2.1</li>' +
						'</ul>' +
					'</ul>',
					'<ul>' +
						'<li>1' +
							'<ul>' +
								'<li>2.1</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				) );

				it( 'ul in deeply nested ul - base index > 0 #1', testList(
					'<ul>' +
						'<li>1.1</li>' +
						'<li>1.2' +
							'<ul>' +
								'<ul>' +
									'<ul>' +
										'<ul>' +
											'<li>2.1</li>' +
										'</ul>' +
									'</ul>' +
								'</ul>' +
							'</ul>' +
						'</li>' +
					'</ul>',
					'<ul>' +
						'<li>1.1</li>' +
						'<li>1.2' +
							'<ul>' +
								'<li>2.1</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				) );

				it( 'ul in deeply nested ul - base index > 0 #2', testList(
					'<ul>' +
						'<li>1.1</li>' +
						'<li>1.2' +
							'<ul>' +
								'<li>2.1</li>' +
								'<ul>' +
									'<ul>' +
										'<ul>' +
											'<li>3.1</li>' +
										'</ul>' +
									'</ul>' +
								'</ul>' +
								'<li>2.2</li>' +
							'</ul>' +
						'</li>' +
					'</ul>',
					'<ul>' +
						'<li>1.1</li>' +
						'<li>1.2' +
							'<ul>' +
								'<li>2.1' +
									'<ul>' +
										'<li>3.1</li>' +
									'</ul>' +
								'</li>' +
								'<li>2.2</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				) );

				it( 'ul in deeply nested ul inside li', testList(
					'<ul>' +
						'<li>A' +
							'<ul>' +
								'<ul>' +
									'<ul>' +
										'<ul>' +
											'<li>B</li>' +
										'</ul>' +
									'</ul>' +
								'</ul>' +
								'<li>C</li>' +
							'</ul>' +
						'</li>' +
					'</ul>',
					'<ul>' +
					'<li>A' +
						'<ul>' +
							'<li>B</li>' +
							'<li>C</li>' +
						'</ul>' +
					'</li>' +
					'</ul>'
				) );

				it( 'ul in deeply nested ul/ol', testList(
					'<ul>' +
						'<li>A' +
							'<ol>' +
								'<ul>' +
									'<ol>' +
										'<ul>' +
											'<li>B</li>' +
										'</ul>' +
									'</ol>' +
								'</ul>' +
								'<li>C</li>' +
							'</ol>' +
						'</li>' +
					'</ul>',
					'<ul>' +
						'<li>A' +
						'<ul>' +
							'<li>B</li>' +
							'<li>C</li>' +
						'</ul>' +
						'</li>' +
					'</ul>'
				) );

				it( 'ul in ul (complex case)', testList(
					'<ol>' +
						'<li>1</li>' +
						'<ul>' +
							'<li>A</li>' +
							'<ol>' +
								'<li>1</li>' +
							'</ol>' +
						'</ul>' +
						'<li>2</li>' +
						'<li>3</li>' +
						'<ul>' +
							'<li>A</li>' +
							'<li>B</li>' +
						'</ul>' +
					'</ol>' +
					'<ul>' +
						'<li>A</li>' +
						'<ol>' +
							'<li>1</li>' +
							'<li>2</li>' +
						'</ol>' +
					'</ul>',
					'<ol>' +
						'<li>1' +
							'<ul>' +
								'<li>A' +
									'<ol>' +
										'<li>1</li>' +
									'</ol>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>2</li>' +
						'<li>3' +
							'<ul>' +
								'<li>A</li>' +
								'<li>B</li>' +
							'</ul>' +
						'</li>' +
					'</ol>' +
					'<ul>' +
						'<li>A' +
							'<ol>' +
								'<li>1</li>' +
								'<li>2</li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				) );

				it( 'ol in ol (deep structure)', testList(
					'<ol>' +
						'<li>A1</li>' +
						'<ol>' +
							'<ol>' +
								'<ol>' +
									'<ol>' +
										'<ol>' +
											'<ol>' +
												'<ol>' +
													'<li>B8</li>' +
												'</ol>' +
											'</ol>' +
										'</ol>' +
									'</ol>' +
								'</ol>' +
								'<li>C3</li>' +
								'<ol>' +
									'<li>D4</li>' +
								'</ol>' +
							'</ol>' +
							'<li>E2</li>' +
						'</ol>' +
					'</ol>',
					'<ol>' +
						'<li>A1' +
							'<ol>' +
								'<li>B8</li>' +
								'<li>C3' +
									'<ol>' +
										'<li>D4</li>' +
									'</ol>' +
								'</li>' +
								'<li>E2</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				) );

				it( 'block elements wrapping nested ul', testList(
					'text before' +
					'<ul>' +
						'<li>' +
							'text' +
							'<div>' +
								'<ul>' +
									'<li>inner text</li>' +
								'</ul>' +
							'</div>' +
						'</li>' +
					'</ul>',
					'<p>text before</p>' +
					'<ul>' +
						'<li>' +
							'text' +
							'<ul>' +
								'<li>inner text</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				) );

				it( 'block elements wrapping nested ul - invalid blocks', testList(
					'<ul>' +
						'<li>' +
							'a' +
							'<table>' +
								'<tr>' +
									'<td>' +
										'<div>' +
											'<ul>' +
												'<li>b</li>' +
												'<li>c' +
													'<ul>' +
														'<li>' +
															'd' +
															'<table>' +
																'<tr>' +
																	'<td>' +
																		'e' +
																	'</td>' +
																'</tr>' +
															'</table>' +
														'</li>' +
													'</ul>' +
												'</li>' +
											'</ul>' +
										'</div>' +
									'</td>' +
								'</tr>' +
							'</table>' +
							'f' +
						'</li>' +
						'<li>g</li>' +
					'</ul>',
					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>' +
										'<ul>' +
											'<li>b</li>' +
											'<li>c<ul>' +
											'<li>d</li>' +
										'</ul>' +
										'</li>' +
										'</ul>' +
										'<p>e</p>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
					'</figure>' +
					'<ul>' +
					'<li>f</li>' +
					'<li>g</li>' +
					'</ul>'
				) );

				it( 'deeply nested block elements wrapping nested ul', testList(
					'<ul>' +
							'<li>' +
								'a' +
								'<div>' +
									'<div>' +
										'<ul>' +
											'<li>b</li>' +
											'<li>c' +
												'<ul>' +
													'<li>d' +
														'<div>' +
															'<ul>' +
																'<li>e</li>' +
															'</ul>' +
														'</div>' +
													'</li>' +
												'</ul>' +
											'</li>' +
										'</ul>' +
									'</div>' +
								'</div>' +
								'f' +
							'</li>' +
						'<li>g</li>' +
						'</ul>' +
					'</ul>',
					'<ul>' +
						'<li>a' +
							'<ul>' +
								'<li>b</li>' +
								'<li>c' +
									'<ul>' +
										'<li>d' +
											'<ul>' +
												'<li>e</li>' +
											'</ul>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>f</li>' +
						'<li>g</li>' +
					'</ul>'
				) );
			} );

			it( 'bullet list simple structure', testList(
				'<p>foo</p>' +
				'<ul>' +
					'<li>' +
						'1' +
						'<ul>' +
							'<li>1.1</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'<p>bar</p>'
			) );

			it( 'bullet list deep structure', testList(
				'<p>foo</p>' +
				'<ul>' +
					'<li>' +
						'1' +
						'<ul>' +
							'<li>' +
								'1.1' +
								'<ul><li>1.1.1</li><li>1.1.2</li><li>1.1.3</li><li>1.1.4</li></ul>' +
							'</li>' +
							'<li>' +
								'1.2' +
								'<ul><li>1.2.1</li></ul>' +
							'</li>' +
						'</ul>' +
					'</li>' +
					'<li>2</li>' +
					'<li>' +
						'3' +
						'<ul>' +
							'<li>' +
								'3.1' +
								'<ul>' +
									'<li>' +
										'3.1.1' +
										'<ul><li>3.1.1.1</li></ul>' +
									'</li>' +
									'<li>3.1.2</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'<p>bar</p>'
			) );

			it( 'mixed lists deep structure', testList(
				'<p>foo</p>' +
				'<ul>' +
					'<li>' +
						'1' +
						'<ul>' +
							'<li>' +
								'1.1' +
								'<ul><li>1.1.1</li><li>1.1.2</li></ul>' +
								'<ol><li>1.1.3</li><li>1.1.4</li></ol>' +
							'</li>' +
							'<li>' +
								'1.2' +
								'<ul><li>1.2.1</li></ul>' +
							'</li>' +
						'</ul>' +
					'</li>' +
					'<li>2</li>' +
					'<li>' +
						'3' +
						'<ol>' +
							'<li>' +
								'3.1' +
								'<ul>' +
									'<li>' +
										'3.1.1' +
										'<ol><li>3.1.1.1</li></ol>' +
										'<ul><li>3.1.1.2</li></ul>' +
									'</li>' +
									'<li>3.1.2</li>' +
								'</ul>' +
							'</li>' +
						'</ol>' +
						'<ul>' +
							'<li>3.2</li>' +
							'<li>3.3</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'<p>bar</p>',

				'<p>foo</p>' +
				'<ul>' +
					'<li>' +
						'1' +
						'<ul>' +
							'<li>' +
								'1.1' +
								'<ul><li>1.1.1</li><li>1.1.2</li><li>1.1.3</li><li>1.1.4</li></ul>' +
							'</li>' +
							'<li>' +
								'1.2' +
								'<ul><li>1.2.1</li></ul>' +
							'</li>' +
						'</ul>' +
					'</li>' +
					'<li>2</li>' +
					'<li>' +
						'3' +
						'<ol>' +
							'<li>' +
								'3.1' +
								'<ul>' +
									'<li>' +
										'3.1.1' +
										'<ol><li>3.1.1.1</li><li>3.1.1.2</li></ol>' +
									'</li>' +
									'<li>3.1.2</li>' +
								'</ul>' +
							'</li>' +
							'<li>3.2</li>' +
							'<li>3.3</li>' +
						'</ol>' +
					'</li>' +
				'</ul>' +
				'<p>bar</p>'
			) );

			it( 'mixed lists deep structure, white spaces, incorrect content, empty items', testList(
				'<p>foo</p>' +
				'<ul>' +
				'	xxx' +
				'	<li>' +
				'		1' +
				'		<ul>' +
				'			xxx' +
				'			<li>' +
				'				<ul><li></li><li>1.1.2</li></ul>' +
				'				<ol><li>1.1.3</li><li>1.1.4</li></ol>' +		// Will be changed to <ul>.
				'			</li>' +
				'			<li>' +
				'				<ul><li>1.2.1</li></ul>' +
				'			</li>' +
				'			xxx' +
				'		</ul>' +
				'	</li>' +
				'	<li>2</li>' +
				'	<li>' +
				'		<ol>' +
				'			<p>xxx</p>' +
				'			<li>' +
				'				3<strong>.</strong>1' +							// Test multiple text nodes in <li>.
				'				<ul>' +
				'					<li>' +
				'						3.1.1' +
				'						<ol><li>3.1.1.1</li></ol>' +
				'						<ul><li>3.1.1.2</li></ul>' +			// Will be changed to <ol>.
				'					</li>' +
				'					<li>3.1.2</li>' +
				'				</ul>' +
				'			</li>' +
				'		</ol>' +
				'		<p>xxx</p>' +
				'		<ul>' +													// Since <p> gets removed, this will become <ol>.
				'			<li>3.2</li>' +
				'			<li>3.3</li>' +
				'		</ul>' +
				'	</li>' +
				'	<p>xxx</p>' +
				'</ul>' +
				'<p>bar</p>',

				'<p>foo</p>' +
				'<ul>' +
					'<li>' +
						'1' +
						'<ul>' +
							'<li>' +
								'&nbsp;' +
								'<ul>' +
									'<li>&nbsp;</li>' +
									'<li>1.1.2</li>' +
									'<li>1.1.3</li>' +
									'<li>1.1.4</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'&nbsp;' +
								'<ul><li>1.2.1</li></ul>' +
							'</li>' +
						'</ul>' +
					'</li>' +
					'<li>2</li>' +
					'<li>' +
						'&nbsp;' +
						'<ol>' +
							'<li>' +
								'3<strong>.</strong>1' +
								'<ul>' +
									'<li>' +
										'3.1.1' +
										'<ol>' +
											'<li>3.1.1.1</li>' +
											'<li>3.1.1.2</li>' +
										'</ol>' +
									'</li>' +
									'<li>3.1.2</li>' +
								'</ul>' +
							'</li>' +
							'<li>3.2</li>' +
							'<li>3.3</li>' +
						'</ol>' +
					'</li>' +
				'</ul>' +
				'<p>bar</p>'
			) );

			describe( 'model tests for nested lists', () => {
				it( 'should properly set listIndent and listType', () => {
					// <ol> in the middle will be fixed by postfixer to bulleted list.
					editor.setData(
						'<p>foo</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>1.1</li>' +
								'</ul>' +
								'<ol>' +
									'<li>' +
										'1.2' +
										'<ol>' +
											'<li>1.2.1</li>' +
										'</ol>' +
									'</li>' +
									'<li>1.3</li>' +
								'</ol>' +
							'</li>' +
							'<li>2</li>' +
						'</ul>' +
						'<p>bar</p>'
					);

					const expectedModelData =
						'<paragraph>foo</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">1.2</listItem>' +
						'<listItem listIndent="2" listType="numbered">1.2.1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">1.3</listItem>' +
						'<listItem listIndent="0" listType="bulleted">2</listItem>' +
						'<paragraph>bar</paragraph>';

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), expectedModelData );
				} );

				it( 'should properly listIndent when list nested in other block', () => {
					editor.setData(
						'<ul>' +
							'<li>' +
								'a' +
								'<table>' +
									'<tr>' +
									'<td>' +
										'<div>' +
											'<ul>' +
											'<li>b</li>' +
											'<li>c' +
												'<ul>' +
													'<li>' +
														'd' +
														'<table>' +
															'<tr>' +
																'<td>e</td>' +
															'</tr>' +
														'</table>' +
													'</li>' +
												'</ul>' +
											'</li>' +
											'</ul>' +
										'</div>' +
									'</td>' +
									'</tr>' +
								'</table>' +
								'f' +
								'</li>' +
							'<li>g</li>' +
						'</ul>'
					);

					const expectedModelData =
						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<listItem listIndent="0" listType="bulleted">b</listItem>' +
									'<listItem listIndent="0" listType="bulleted">c</listItem>' +
									'<listItem listIndent="1" listType="bulleted">d</listItem>' +
									'<paragraph>e</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
						'</table>' +
						'<listItem listIndent="0" listType="bulleted">f</listItem>' +
						'<listItem listIndent="0" listType="bulleted">g</listItem>';

					assertEqualMarkup( getModelData( model, { withoutSelection: true } ), expectedModelData );
				} );
			} );
		} );

		describe( 'position mapping', () => {
			let mapper;

			beforeEach( () => {
				mapper = editor.editing.mapper;

				editor.setData(
					'<ul>' +
						'<li>a</li>' +
						'<li>' +
							'bbb' +
							'<ol>' +
								'<li>c</li>' +
								'<li>d</li>' +
								'<li>e</li>' +
								'<li>' +
									'<ul>' +
										'<li>g</li>' +
										'<li>h</li>' +
										'<li>i</li>' +
									'</ul>' +
								'</li>' +
								'<li>j</li>' +
							'</ol>' +
						'</li>' +
						'<li>k</li>' +
					'</ul>'
				);
			} );

			/*
				<listItem listIndent=0 listType="bulleted">a</listItem>
				<listItem listIndent=0 listType="bulleted">bbb</listItem>
				<listItem listIndent=1 listType="numbered">c</listItem>
				<listItem listIndent=1 listType="numbered">d</listItem>
				<listItem listIndent=1 listType="numbered">e</listItem>
				<listItem listIndent=1 listType="numbered"></listItem>
				<listItem listIndent=2 listType="bulleted">g</listItem>
				<listItem listIndent=2 listType="bulleted">h</listItem>
				<listItem listIndent=2 listType="bullered">i</listItem>
				<listItem listIndent=1 listType="numbered">j</listItem>
				<listItem listIndent=0 listType="bulleted">k</listItem>
			 */

			describe( 'view to model', () => {
				function testList( testName, viewPath, modelPath ) {
					it( testName, () => {
						const viewPos = getViewPosition( viewRoot, viewPath, view );
						const modelPos = mapper.toModelPosition( viewPos );

						expect( modelPos.root ).to.equal( modelRoot );
						expect( modelPos.path ).to.deep.equal( modelPath );
					} );
				}

				testList( 'before ul#1',		[ 0 ],					[ 0 ] );	// --> before listItem "a"
				testList( 'before li "a"',		[ 0, 0 ],				[ 0 ] );	// --> before listItem "a"
				testList( 'before "a"',			[ 0, 0, 0 ],			[ 0, 0 ] );	// --> beginning of listItem "a"
				testList( 'after "a"',			[ 0, 0, 1 ],			[ 0, 1 ] );	// --> end of listItem "a"
				testList( 'before li "bbb"',	[ 0, 1 ],				[ 1 ] );	// --> before listItem "bbb"
				testList( 'before "bbb"',		[ 0, 1, 0 ],			[ 1, 0 ] );	// --> beginning of listItem "bbb"
				testList( 'after "bbb"',		[ 0, 1, 1 ],			[ 1, 3 ] );	// --> end of listItem "bbb"
				testList( 'before li "c"',		[ 0, 1, 1, 0 ],			[ 2 ] );	// --> before listItem "c"
				testList( 'before "c"',			[ 0, 1, 1, 0, 0 ],		[ 2, 0 ] );	// --> beginning of listItem "c"
				testList( 'after "c"',			[ 0, 1, 1, 0, 1 ],		[ 2, 1 ] );	// --> end of listItem "c"
				testList( 'before li "d"',		[ 0, 1, 1, 1 ],			[ 3 ] );	// --> before listItem "d"
				testList( 'before li "e"',		[ 0, 1, 1, 2 ],			[ 4 ] );	// --> before listItem "e"
				testList( 'before "empty" li',	[ 0, 1, 1, 3 ],			[ 5 ] );	// --> before "empty" listItem
				testList( 'before ul#2',		[ 0, 1, 1, 3, 0 ],		[ 5, 0 ] ); // --> inside "empty" listItem
				testList( 'before li "g"',		[ 0, 1, 1, 3, 0, 0 ],	[ 6 ] );	// --> before listItem "g"
				testList( 'before li "h"',		[ 0, 1, 1, 3, 0, 1 ],	[ 7 ] );	// --> before listItem "h"
				testList( 'before li "i"',		[ 0, 1, 1, 3, 0, 2 ],	[ 8 ] );	// --> before listItem "i"
				testList( 'after li "i"',		[ 0, 1, 1, 3, 0, 3 ],	[ 9 ] );	// --> before listItem "j"
				testList( 'after ul#2',			[ 0, 1, 1, 3, 1 ],		[ 9 ] );	// --> before listItem "j"
				testList( 'before li "j"',		[ 0, 1, 1, 4 ],			[ 9 ] );	// --> before listItem "j"
				testList( 'after li "j"',		[ 0, 1, 1, 5 ],			[ 10 ] );	// --> before listItem "k"
				testList( 'end of li "bbb"',	[ 0, 1, 2 ],			[ 10 ] );	// --> before listItem "k"
				testList( 'before li "k"',		[ 0, 2 ],				[ 10 ] );	// --> before listItem "k"
				testList( 'after li "k"',		[ 0, 3 ],				[ 11 ] );	// --> after listItem "k"
				testList( 'after ul',			[ 1 ],					[ 11 ] );	// --> after listItem "k"
			} );

			describe( 'model to view', () => {
				function testList( testName, modelPath, viewPath ) {
					it( testName, () => {
						const modelPos = model.createPositionFromPath( modelRoot, modelPath );
						const viewPos = mapper.toViewPosition( modelPos );

						expect( viewPos.root ).to.equal( viewRoot );
						expect( getViewPath( viewPos ) ).to.deep.equal( viewPath );
					} );
				}

				testList( 'before listItem "a"',			[ 0 ],		[ 0 ] );				// --> before ul
				testList( 'beginning of listItem "a"',		[ 0, 0 ],	[ 0, 0, 0, 0 ] );		// --> beginning of "a" text node
				testList( 'end of listItem "a"',			[ 0, 1 ],	[ 0, 0, 0, 1 ] );		// --> end of "a" text node
				testList( 'before listItem "bbb"',			[ 1 ],		[ 0, 1 ] );				// --> before li "bbb"
				testList( 'beginning of listItem "bbb"',	[ 1, 0 ],	[ 0, 1, 0, 0 ] );		// --> beginning of "bbb" text node
				testList( 'end of listItem "bbb"',			[ 1, 3 ],	[ 0, 1, 0, 3 ] );		// --> end of "bbb" text node
				testList( 'before listItem "c"',			[ 2 ],		[ 0, 1, 1, 0 ] );		// --> before li "c"
				testList( 'beginning of listItem "c"',		[ 2, 0 ],	[ 0, 1, 1, 0, 0, 0 ] );	// --> beginning of "c" text node
				testList( 'end of listItem "c"',			[ 2, 1 ],	[ 0, 1, 1, 0, 0, 1 ] );	// --> end of "c" text node
				testList( 'before listItem "d"',			[ 3 ],		[ 0, 1, 1, 1 ] );		// --> before li "d"
				testList( 'before listItem "e"',			[ 4 ],		[ 0, 1, 1, 2 ] );		// --> before li "e"
				testList( 'before "empty" listItem',		[ 5 ],		[ 0, 1, 1, 3 ] );		// --> before "empty" li
				testList( 'inside "empty" listItem',		[ 5, 0 ],	[ 0, 1, 1, 3, 0 ] );	// --> before ul
				testList( 'before listItem "g"',			[ 6 ],		[ 0, 1, 1, 3, 0, 0 ] );	// --> before li "g"
				testList( 'before listItem "h"',			[ 7 ],		[ 0, 1, 1, 3, 0, 1 ] );	// --> before li "h"
				testList( 'before listItem "i"',			[ 8 ],		[ 0, 1, 1, 3, 0, 2 ] );	// --> before li "i"
				testList( 'before listItem "j"',			[ 9 ],		[ 0, 1, 1, 4 ] );		// --> before li "j"
				testList( 'before listItem "k"',			[ 10 ],		[ 0, 2 ] );				// --> before li "k"
				testList( 'after listItem "k"',				[ 11 ],		[ 1 ] );				// --> after ul
			} );
		} );

		describe( 'convert changes', () => {
			describe( 'insert', () => {
				describe( 'same list type', () => {
					testInsert(
						'after smaller indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">x</listItem>]',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>x</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testInsert(
						'after smaller indent, before same indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">x</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>x</li>' +
									'<li>1.1</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testInsert(
						'after smaller indent, before smaller indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">x</listItem>]' +
						'<listItem listIndent="0" listType="bulleted">2</listItem>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>x</li>' +
								'</ul>' +
							'</li>' +
							'<li>2</li>' +
						'</ul>'
					);

					testInsert(
						'after same indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">x</listItem>]',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>1.1</li>' +
									'<li>x</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testInsert(
						'after same indent, before bigger indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'[<listItem listIndent="0" listType="bulleted">x</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>',

						'<p>p</p>' +
						'<ul>' +
							'<li>1</li>' +
							'<li>' +
								'x' +
								'<ul>' +
									'<li>1.1</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testInsert(
						'after bigger indent, before bigger indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>' +
						'[<listItem listIndent="0" listType="bulleted">x</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">1.2</listItem>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>1.1</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'x' +
								'<ul>' +
									'<li>1.2</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testInsert(
						'list items with too big indent',

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="4" listType="bulleted">x</listItem>' + // This indent should be fixed by post fixer.
						'<listItem listIndent="5" listType="bulleted">x</listItem>' + // This indent should be fixed by post fixer.
						'<listItem listIndent="4" listType="bulleted">x</listItem>]' + // This indent should be fixed by post fixer.
						'<listItem listIndent="1" listType="bulleted">c</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>' +
										'b' +
										'<ul>' +
											'<li>' +
												'x' +
												'<ul>' +
													'<li>x</li>' +
												'</ul>' +
											'</li>' +
											'<li>x</li>' +
										'</ul>' +
									'</li>' +
									'<li>c</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				describe( 'different list type', () => {
					testInsert(
						'after smaller indent, before same indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'[<listItem listIndent="1" listType="numbered">x</listItem>]' + // This type should be fixed by post fixer.
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ol>' +
									'<li>x</li>' +
									'<li>1.1</li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);

					testInsert(
						'after same indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>' +
						'[<listItem listIndent="1" listType="numbered">x</listItem>]', // This type should be fixed by post fixer.

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>1.1</li>' +
									'<li>x</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testInsert(
						'after same indent, before bigger indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'[<listItem listIndent="0" listType="numbered">x</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>',

						'<p>p</p>' +
						'<ul>' +
							'<li>1</li>' +
						'</ul>' +
						'<ol>' +
							'<li>' +
								'x' +
								'<ul>' +
									'<li>1.1</li>' +
								'</ul>' +
							'</li>' +
						'</ol>'
					);

					testInsert(
						'after bigger indent, before bigger indent',

						'<paragraph>p</paragraph>' +
						'<listItem listIndent="0" listType="bulleted">1</listItem>' +
						'<listItem listIndent="1" listType="bulleted">1.1</listItem>' +
						'[<listItem listIndent="0" listType="numbered">x</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">1.2</listItem>',

						'<p>p</p>' +
						'<ul>' +
							'<li>' +
								'1' +
								'<ul>' +
									'<li>1.1</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<ol>' +
							'<li>' +
								'x' +
								'<ul>' +
									'<li>1.2</li>' +
								'</ul>' +
							'</li>' +
						'</ol>'
					);

					testInsert(
						'after bigger indent, in nested list, different type',

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'<listItem listIndent="2" listType="bulleted">c</listItem>' +
						'[<listItem listIndent="1" listType="numbered">x</listItem>]', // This type should be fixed by post fixer.

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>' +
										'b' +
										'<ul>' +
											'<li>c</li>' +
										'</ul>' +
									'</li>' +
									'<li>x</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				// This case is pretty complex but it tests various edge cases concerning splitting lists.
				testInsert(
					'element between nested list items - complex',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="2" listType="bulleted">c</listItem>' +
					'<listItem listIndent="3" listType="numbered">d</listItem>' +
					'[<paragraph>x</paragraph>]' +
					'<listItem listIndent="3" listType="numbered">e</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="2" listType="bulleted">f</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="3" listType="bulleted">g</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="1" listType="bulleted">h</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="2" listType="numbered">i</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="0" listType="numbered">j</listItem>' + // This indent should be fixed by post fixer.
					'<paragraph>p</paragraph>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>' +
									'b' +
									'<ul>' +
										'<li>' +
											'c' +
											'<ol>' +
												'<li>d</li>' +
											'</ol>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ol>' +
						'<li>e</li>' +
					'</ol>' +
					'<ul>' +
						'<li>' +
							'f' +
							'<ul>' +
								'<li>g</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'h' +
							'<ol>' +
								'<li>i</li>' +
							'</ol>' +
						'</li>' +
					'</ul>' +
					'<ol>' +
						'<li>j</li>' +
					'</ol>' +
					'<p>p</p>',

					false
				);

				testInsert(
					'element before indent "hole"',

					'<listItem listIndent="0" listType="bulleted">1</listItem>' +
					'<listItem listIndent="1" listType="bulleted">1.1</listItem>' +
					'[<paragraph>x</paragraph>]' +
					'<listItem listIndent="2" listType="bulleted">1.1.1</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="0" listType="bulleted">2</listItem>',

					'<ul>' +
						'<li>' +
							'1' +
							'<ul>' +
								'<li>1.1</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ul>' +
						'<li>1.1.1</li>' +
						'<li>2</li>' +
					'</ul>',

					false
				);

				_test(
					'two list items with mismatched types inserted in one batch',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>[]',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
								'<li>c</li>' +
								'<li>d</li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					() => {
						const item1 = '<listItem listIndent="1" listType="numbered">c</listItem>';
						const item2 = '<listItem listIndent="1" listType="bulleted">d</listItem>';

						model.change( writer => {
							writer.append( parseModel( item1, model.schema ), modelRoot );
							writer.append( parseModel( item2, model.schema ), modelRoot );
						} );
					}
				);
			} );

			describe( 'remove', () => {
				testRemove(
					'the first nested item',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="1" listType="bulleted">b</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">c</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>c</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'nested item from the middle',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="1" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
								'<li>d</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'the last nested item',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="1" listType="bulleted">c</listItem>]',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'the only nested item',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="1" listType="bulleted">c</listItem>]',

					'<ul>' +
						'<li>a</li>' +
					'</ul>'
				);

				testRemove(
					'list item that separates two nested lists of same type',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="numbered">b</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="1" listType="numbered">d</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ol>' +
								'<li>b</li>' +
								'<li>d</li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'list item that separates two nested lists of different type',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="numbered">b</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>', // This type should be fixed by post fixer.

					'<ul>' +
						'<li>' +
							'a' +
							'<ol>' +
								'<li>b</li>' +
								'<li>d</li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'item that has nested lists, previous item has same indent',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">c</listItem>' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>c</li>' +
								'<li>d</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'item that has nested lists, previous item has smaller indent',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="1" listType="bulleted">b</listItem>]' +
					'<listItem listIndent="2" listType="bulleted">c</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="2" listType="bulleted">d</listItem>', // This indent should be fixed by post fixer.

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>c</li>' +
								'<li>d</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'item that has nested lists, previous item has bigger indent by 1',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>' +
					'<listItem listIndent="2" listType="numbered">e</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
								'<li>' +
									'd' +
									'<ol>' +
										'<li>e</li>' +
									'</ol>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'item that has nested lists, previous item has bigger indent by 2',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="2" listType="bulleted">c</listItem>' +
					'[<listItem listIndent="0" listType="bulleted">d</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">e</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>' +
									'b' +
									'<ul>' +
										'<li>c</li>' +
									'</ul>' +
								'</li>' +
								'<li>e</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRemove(
					'first list item that has nested list',

					'[<listItem listIndent="0" listType="bulleted">a</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="2" listType="bulleted">c</listItem>', // This indent should be fixed by post fixer.

					'<ul>' +
						'<li>' +
							'b' +
							'<ul>' +
								'<li>c</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			describe( 'change type', () => {
				testChangeType(
					'list item that has nested items',

					'[<listItem listIndent="0" listType="numbered">a</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="1" listType="bulleted">c</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
								'<li>c</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				// The change will be "prevented" by post fixer.
				testChangeType(
					'list item that is a nested item',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="numbered">b</listItem>' +
					'[<listItem listIndent="1" listType="numbered">c</listItem>]' +
					'<listItem listIndent="1" listType="numbered">d</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ol>' +
								'<li>b</li>' +
								'<li>c</li>' +
								'<li>d</li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				);
			} );

			describe( 'change indent', () => {
				describe( 'same list type', () => {
					testChangeIndent(
						'indent last item of flat list', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'[<listItem listIndent="0" listType="bulleted">b</listItem>]',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'indent middle item of flat list', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
						'<listItem listIndent="0" listType="bulleted">c</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
								'</ul>' +
							'</li>' +
							'<li>c</li>' +
						'</ul>'
					);

					testChangeIndent(
						'indent last item in nested list', 2,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">c</listItem>]',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>' +
										'b' +
										'<ul>' +
											'<li>c</li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'indent middle item in nested list', 2,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">c</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>' +
										'b' +
										'<ul>' +
											'<li>c</li>' +
										'</ul>' +
									'</li>' +
									'<li>d</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					// Keep in mind that this test is different than "executing command on item that has nested list".
					// A command is automatically indenting nested items so the hierarchy is preserved.
					// Here we test conversion and the change is simple changing indent of one item.
					// This may be true also for other tests in this suite, keep this in mind.
					testChangeIndent(
						'indent item that has nested list', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'[<listItem listIndent="0" listType="bulleted">b</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">c</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
									'<li>c</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'indent item that in view is a next sibling of item that has nested list', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="0" listType="bulleted">c</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
									'<li>c</li>' +
									'<li>d</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'outdent the first item of nested list', 0,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">b</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">c</listItem>' +
						'<listItem listIndent="1" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>a</li>' +
							'<li>' +
								'b' +
								'<ul>' +
									'<li>c</li>' +
									'<li>d</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'outdent item from the middle of nested list', 0,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">c</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
								'</ul>' +
							'</li>' +
							'<li>' +
								'c' +
								'<ul>' +
									'<li>d</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'outdent the last item of nested list', 0,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">c</listItem>]',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
								'</ul>' +
							'</li>' +
							'<li>c</li>' +
						'</ul>'
					);

					testChangeIndent(
						'outdent the only item of nested list', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="2" listType="bulleted">c</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
									'<li>c</li>' +
									'<li>d</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'outdent item by two', 0,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="2" listType="bulleted">c</listItem>]' +
						'<listItem listIndent="0" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
								'</ul>' +
							'</li>' +
							'<li>c</li>' +
							'<li>d</li>' +
						'</ul>'
					);
				} );

				describe( 'different list type', () => {
					testChangeIndent(
						'indent middle item of flat list', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'[<listItem listIndent="0" listType="numbered">b</listItem>]' +
						'<listItem listIndent="0" listType="bulleted">c</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ol>' +
									'<li>b</li>' +
								'</ol>' +
							'</li>' +
							'<li>c</li>' +
						'</ul>'
					);

					testChangeIndent(
						'indent item that has nested list', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'[<listItem listIndent="0" listType="numbered">b</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">c</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ol>' +
									'<li>b</li>' +
									'<li>c</li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'indent item that in view is a next sibling of item that has nested list #1', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="0" listType="numbered">c</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
									'<li>c</li>' +
									'<li>d</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'outdent the first item of nested list', 0,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'[<listItem listIndent="1" listType="bulleted">b</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">c</listItem>' +
						'<listItem listIndent="1" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>a</li>' +
							'<li>' +
								'b' +
								'<ul>' +
									'<li>c</li>' +
									'<li>d</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'outdent the only item of nested list', 1,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="2" listType="bulleted">c</listItem>]' +
						'<listItem listIndent="1" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
									'<li>c</li>' +
									'<li>d</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					testChangeIndent(
						'outdent item by two', 0,

						'<listItem listIndent="0" listType="bulleted">a</listItem>' +
						'<listItem listIndent="1" listType="bulleted">b</listItem>' +
						'[<listItem listIndent="2" listType="numbered">c</listItem>]' +
						'<listItem listIndent="0" listType="bulleted">d</listItem>',

						'<ul>' +
							'<li>' +
								'a' +
								'<ul>' +
									'<li>b</li>' +
								'</ul>' +
							'</li>' +
						'</ul>' +
						'<ol>' +
							'<li>c</li>' +
						'</ol>' +
						'<ul>' +
							'<li>d</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'rename from list item', () => {
				testRenameFromListItem(
					'rename nested item from the middle #1',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="1" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>', // This indent should be fixed by post fixer.

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>c</p>' +
					'<ul>' +
						'<li>d</li>' +
					'</ul>',

					false
				);

				testRenameFromListItem(
					'rename nested item from the middle #2 - nightmare example',

					// Indents in this example should be fixed by post fixer.
					// This nightmare example checks if structure of the list is kept as intact as possible.
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +	// a --------			-->  a --------
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +	//   b --------			-->    b --------
					'[<listItem listIndent="2" listType="bulleted">c</listItem>]' +	//     c --------		--> --------
					'<listItem listIndent="3" listType="bulleted">d</listItem>' +	//       d --------		-->  d --------
					'<listItem listIndent="3" listType="bulleted">e</listItem>' +	//       e --------		-->  e --------
					'<listItem listIndent="4" listType="bulleted">f</listItem>' +	//         f --------	-->    f --------
					'<listItem listIndent="2" listType="bulleted">g</listItem>' +	//     g --------		-->  g --------
					'<listItem listIndent="3" listType="bulleted">h</listItem>' +	//       h --------		-->    h --------
					'<listItem listIndent="4" listType="bulleted">i</listItem>' +	//         i --------	-->      i --------
					'<listItem listIndent="1" listType="bulleted">j</listItem>' +	//   j --------			-->  j --------
					'<listItem listIndent="2" listType="bulleted">k</listItem>' +	//     k --------		-->    k --------
					'<listItem listIndent="0" listType="bulleted">l</listItem>' +	// l --------			-->  l --------
					'<listItem listIndent="1" listType="bulleted">m</listItem>',	//   m --------			-->    m --------

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>c</p>' +
					'<ul>' +
						'<li>d</li>' +
						'<li>' +
							'e' +
							'<ul>' +
								'<li>f</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'g' +
							'<ul>' +
								'<li>' +
									'h' +
									'<ul>' +
										'<li>i</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'j' +
							'<ul>' +
								'<li>k</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'l' +
							'<ul>' +
								'<li>m</li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					false
				);

				testRenameFromListItem(
					'rename nested item from the middle #3 - manual test example',

					// Indents in this example should be fixed by post fixer.
					// This example checks a bug found by testing manual test.
					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="2" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="1" listType="bulleted">d</listItem>' +
					'<listItem listIndent="2" listType="bulleted">e</listItem>' +
					'<listItem listIndent="2" listType="bulleted">f</listItem>' +
					'<listItem listIndent="2" listType="bulleted">g</listItem>' +
					'<listItem listIndent="2" listType="bulleted">h</listItem>' +
					'<listItem listIndent="0" listType="bulleted"></listItem>' +
					'<listItem listIndent="1" listType="bulleted"></listItem>' +
					'<listItem listIndent="2" listType="numbered">k</listItem>' +
					'<listItem listIndent="2" listType="numbered">l</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>c</p>' +
					'<ul>' +
						'<li>' +
							'd' +
							'<ul>' +
								'<li>e</li>' +
								'<li>f</li>' +
								'<li>g</li>' +
								'<li>h</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<ul>' +
								'<li>' +
									'<ol>' +
										'<li>k</li>' +
										'<li>l</li>' +
									'</ol>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					false
				);

				testRenameFromListItem(
					'rename the only nested item',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="1" listType="bulleted">b</listItem>]',

					'<ul>' +
						'<li>a</li>' +
					'</ul>' +
					'<p>b</p>'
				);
			} );

			describe( 'rename to list item (with attribute change)', () => {
				testRenameToListItem(
					'element into first item in nested list', 1,

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<paragraph>b</paragraph>]',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRenameToListItem(
					'element into last item in nested list', 1,

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<paragraph>c</paragraph>]',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
								'<li>c</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testRenameToListItem(
					'element into a first item in deeply nested list', 2,

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<paragraph>c</paragraph>]' +
					'<listItem listIndent="0" listType="bulleted">d</listItem>',

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>' +
									'b' +
									'<ul>' +
										'<li>c</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>d</li>' +
					'</ul>'
				);
			} );

			describe( 'move', () => {
				// Since move is in fact remove + insert and does not event have its own converter, only a few cases will be tested here.
				testMove(
					'out nested list items',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'[<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="2" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="3" listType="bulleted">d</listItem>' + // This indent should be fixed by post fixer.
					'<listItem listIndent="4" listType="bulleted">e</listItem>' + // This indent should be fixed by post fixer.
					'<paragraph>x</paragraph>',

					6,

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>' +
									'd' +
									'<ul>' +
										'<li>e</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ul>' +
						'<li>' +
							'b' +
							'<ul>' +
								'<li>c</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				testMove(
					'nested list items between lists of same type',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="2" listType="bulleted">c</listItem>' +
					'<listItem listIndent="3" listType="bulleted">d</listItem>]' +
					'<listItem listIndent="4" listType="bulleted">e</listItem>' +
					'<paragraph>x</paragraph>' +
					'<listItem listIndent="0" listType="bulleted">f</listItem>' +
					'<listItem listIndent="0" listType="bulleted">g</listItem>',

					7,

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>' +
									'b' +
									'<ul>' +
										'<li>e</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ul>' +
						'<li>' +
							'f' +
							'<ul>' +
								'<li>' +
									'c' +
									'<ul>' +
										'<li>d</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>g</li>' +
					'</ul>'
				);

				testMove(
					'nested list items between lists of different type',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="2" listType="bulleted">c</listItem>' +
					'<listItem listIndent="3" listType="bulleted">d</listItem>]' +
					'<listItem listIndent="4" listType="bulleted">e</listItem>' +
					'<paragraph>x</paragraph>' +
					'<listItem listIndent="0" listType="numbered">f</listItem>' +
					'<listItem listIndent="1" listType="numbered">g</listItem>',

					7,

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>' +
									'b' +
									'<ul>' +
										'<li>e</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ol>' +
						'<li>' +
							'f' +
							'<ul>' +
								'<li>' +
									'c' +
									'<ul>' +
										'<li>d</li>' +
									'</ul>' +
								'</li>' +
								'<li>g</li>' +
							'</ul>' +
						'</li>' +
					'</ol>',

					false
				);

				testMove(
					'element between nested list',

					'<listItem listIndent="0" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listType="bulleted">b</listItem>' +
					'<listItem listIndent="2" listType="bulleted">c</listItem>' +
					'<listItem listIndent="3" listType="bulleted">d</listItem>' +
					'[<paragraph>x</paragraph>]',

					2,

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
							'</ul>' +
						'</li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ul>' +
						'<li>' +
							'c' +
							'<ul>' +
								'<li>d</li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					false
				);

				testMove(
					'multiple nested list items of different types #1 - fix at start',

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

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
								'<li>f</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'g' +
							'<ol>' +
								'<li>h</li>' +
								'<li>c</li>' +
							'</ol>' +
						'</li>' +
						'<li>' +
							'd' +
							'<ol>' +
								'<li>e</li>' +
								'<li>i</li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				);

				testMove(
					'multiple nested list items of different types #2 - fix at end',

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

					'<ul>' +
						'<li>' +
							'a' +
							'<ul>' +
								'<li>b</li>' +
								'<li>f</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'g' +
							'<ul>' +
								'<li>h</li>' +
								'<li>c</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'd' +
							'<ol>' +
								'<li>e</li>' +
								'<li>i</li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				);
			} );
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
		it( 'should work if an element is passed to DataController#insertContent()', () => {
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

			const clipboard = editor.plugins.get( 'Clipboard' );

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

			const clipboard = editor.plugins.get( 'Clipboard' );

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

			const clipboard = editor.plugins.get( 'Clipboard' );

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

				const clipboard = editor.plugins.get( 'Clipboard' );

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

			const clipboard = editor.plugins.get( 'Clipboard' );

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

			const clipboard = editor.plugins.get( 'Clipboard' );

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

				const clipboard = editor.plugins.get( 'Clipboard' );

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

				const clipboard = editor.plugins.get( 'Clipboard' );

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

			const clipboard = editor.plugins.get( 'Clipboard' );

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

			const clipboard = editor.plugins.get( 'Clipboard' );

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

			const clipboard = editor.plugins.get( 'Clipboard' );

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
				const splitResult = conversionApi.splitToAllowedParent( splitBlock, data.modelCursor );

				conversionApi.writer.insert( splitBlock, splitResult.position );

				data.modelRange = conversionApi.writer.createRangeOn( splitBlock );
				data.modelCursor = conversionApi.writer.createPositionAfter( splitBlock );
			} ) );

			const clipboard = editor.plugins.get( 'Clipboard' );

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

	describe( 'other', () => {
		it( 'model insert converter should not fire if change was already consumed', () => {
			editor.editing.downcastDispatcher.on( 'insert:listItem', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:listType' );
				conversionApi.consumable.consume( data.item, 'attribute:listIndent' );
			}, { priority: 'highest' } );

			editor.conversion.for( 'downcast' )
				.elementToElement( { model: 'listItem', view: 'p', converterPriority: 'highest' } );

			// Paragraph is needed, otherwise selection throws.
			setModelData( model, '<paragraph>x</paragraph><listItem listIndent="0" listType="bulleted">y</listItem>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>x</p><p>y</p>' );
		} );

		it( 'model remove converter should be possible to overwrite', () => {
			editor.editing.downcastDispatcher.on( 'remove:listItem', evt => {
				evt.stop();
			}, { priority: 'highest' } );

			// Paragraph is needed to prevent autoparagraphing of empty editor.
			setModelData( model, '<paragraph>x</paragraph><listItem listIndent="0" listType="bulleted"></listItem>' );

			model.change( writer => {
				writer.remove( modelRoot.getChild( 1 ) );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>x</p><ul><li></li></ul>' );
		} );

		it( 'model change type converter should not fire if change was already consumed', () => {
			editor.editing.downcastDispatcher.on( 'attribute:listType', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:listType' );
			}, { priority: 'highest' } );

			setModelData( model, '<listItem listIndent="0" listType="bulleted"></listItem>' );

			model.change( writer => {
				writer.setAttribute( 'listType', 'numbered', modelRoot.getChild( 0 ) );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<ul><li></li></ul>' );
		} );

		it( 'model change indent converter should not fire if change was already consumed', () => {
			editor.editing.downcastDispatcher.on( 'attribute:listIndent', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'attribute:listIndent' );
			}, { priority: 'highest' } );

			setModelData(
				model,
				'<listItem listIndent="0" listType="bulleted">a</listItem><listItem listIndent="0" listType="bulleted">b</listItem>'
			);

			model.change( writer => {
				writer.setAttribute( 'listIndent', 1, modelRoot.getChild( 1 ) );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<ul><li>a</li><li>b</li></ul>' );
		} );

		it( 'view li converter should not fire if change was already consumed', () => {
			editor.data.upcastDispatcher.on( 'element:li', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );
			}, { priority: 'highest' } );

			editor.setData( '<p></p><ul><li></li></ul>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph></paragraph>' );
		} );

		it( 'view ul converter should not fire if change was already consumed', () => {
			editor.data.upcastDispatcher.on( 'element:ul', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.viewItem, { name: true } );
			}, { priority: 'highest' } );

			editor.setData( '<p></p><ul><li></li></ul>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph></paragraph>' );
		} );

		it( 'view converter should pass model range in data.modelRange', () => {
			editor.data.upcastDispatcher.on( 'element:ul', ( evt, data ) => {
				expect( data.modelRange ).to.be.instanceof( ModelRange );
			}, { priority: 'lowest' } );

			editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );
		} );

		// This test tests the fix in `injectViewList` helper.
		it( 'ul and ol should not be inserted before ui element - injectViewList()', () => {
			editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );

			// Append ui element at the end of first <li>.
			view.change( writer => {
				const firstChild = viewDoc.getRoot().getChild( 0 ).getChild( 0 );

				const uiElement = writer.createUIElement( 'span' );
				writer.insert( writer.createPositionAt( firstChild, 'end' ), uiElement );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<ul><li>Foo<span></span></li><li>Bar</li></ul>' );

			model.change( writer => {
				// Change indent of the second list item.
				writer.setAttribute( 'listIndent', 1, modelRoot.getChild( 1 ) );
			} );

			// Check if the new <ul> was added at correct position.
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<ul><li>Foo<span></span><ul><li>Bar</li></ul></li></ul>' );
		} );

		// This test tests the fix in `hoistNestedLists` helper.
		it( 'ul and ol should not be inserted before ui element - hoistNestedLists()', () => {
			editor.setData( '<ul><li>Foo</li><li>Bar<ul><li>Xxx</li><li>Yyy</li></ul></li></ul>' );

			// Append ui element at the end of first <li>.
			view.change( writer => {
				const firstChild = viewDoc.getRoot().getChild( 0 ).getChild( 0 );

				const uiElement = writer.createUIElement( 'span' );
				writer.insert( writer.createPositionAt( firstChild, 'end' ), uiElement );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<ul><li>Foo<span></span></li><li>Bar<ul><li>Xxx</li><li>Yyy</li></ul></li></ul>' );

			model.change( writer => {
				// Remove second list item. Expect that its sub-list will be moved to first list item.
				writer.remove( modelRoot.getChild( 1 ) );
			} );

			// Check if the <ul> was added at correct position.
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<ul><li>Foo<span></span><ul><li>Xxx</li><li>Yyy</li></ul></li></ul>' );
		} );

		describe( 'remove converter should properly handle ui elements', () => {
			let liFoo, liBar;

			beforeEach( () => {
				editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );
				liFoo = modelRoot.getChild( 0 );
				liBar = modelRoot.getChild( 1 );
			} );

			it( 'ui element before <ul>', () => {
				view.change( writer => {
					// Append ui element before <ul>.
					writer.insert( writer.createPositionAt( viewRoot, 0 ), writer.createUIElement( 'span' ) );
				} );

				model.change( writer => {
					writer.remove( liFoo );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<span></span><ul><li>Bar</li></ul>' );
			} );

			it( 'ui element before first <li>', () => {
				view.change( writer => {
					// Append ui element before <ul>.
					writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ), 0 ), writer.createUIElement( 'span' ) );
				} );

				model.change( writer => {
					writer.remove( liFoo );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<ul><span></span><li>Bar</li></ul>' );
			} );

			it( 'ui element in the middle of list', () => {
				view.change( writer => {
					// Append ui element before <ul>.
					writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ), 'end' ), writer.createUIElement( 'span' ) );
				} );

				model.change( writer => {
					writer.remove( liBar );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<ul><li>Foo</li><span></span></ul>' );
			} );
		} );
	} );

	describe( 'schema checking and parent splitting', () => {
		beforeEach( () => {
			// Since this part of test tests only view->model conversion editing pipeline is not necessary.
			editor.editing.destroy();
		} );

		it( 'list should be not converted when modelCursor and its ancestors disallow to insert list', () => {
			model.document.createRoot( '$title', 'title' );

			model.schema.register( '$title', {
				disallow: '$block',
				allow: 'inline'
			} );

			editor.data.set( { title: '<ul><li>foo</li></ul>' } );

			expect( getModelData( model, { rootName: 'title', withoutSelection: true } ) ).to.equal( '' );
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - in the middle', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'abc' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'def' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<div>abc</div>' +
				'<listItem listIndent="0" listType="bulleted">foo</listItem>' +
				'<div>def</div>'
			);
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - at the end', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'abc' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<div>abc</div>' +
				'<listItem listIndent="0" listType="bulleted">foo</listItem>'
			);
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - at the beginning', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'def' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">foo</listItem>' +
				'<div>def</div>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5-list/issues/121
		it( 'should correctly set data.modelCursor', () => {
			editor.setData(
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
				'</ul>' +
				'c'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<listItem listIndent="0" listType="bulleted">a</listItem>' +
				'<listItem listIndent="0" listType="bulleted">b</listItem>' +
				'<paragraph>c</paragraph>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5/issues/1572
		it( 'should not crash if list item contains autoparagraphed block that will be split', () => {
			// Creating a new editor as we need HeadingEditing. Cannot add HeadingEditing to the `describe` at the beginning of the
			// test file because other tests assume that headings are not available.
			return VirtualTestEditor
				.create( {
					plugins: [ ListEditing, HeadingEditing ]
				} )
				.then( editor => {
					editor.setData( '<ul><li><div><h2>Foo</h2></div></li></ul>' );

					expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal( '<heading1>Foo</heading1>' );
				} );
		} );
	} );

	function getViewPosition( root, path, view ) {
		let parent = root;

		while ( path.length > 1 ) {
			parent = parent.getChild( path.shift() );
		}

		return view.createPositionAt( parent, path[ 0 ] );
	}

	function getViewPath( position ) {
		const path = [ position.offset ];
		let parent = position.parent;

		while ( parent.parent ) {
			path.unshift( parent.index );
			parent = parent.parent;
		}

		return path;
	}

	function testInsert( testName, input, output, testUndo = true ) {
		// Cut out inserted element that is between '[' and ']' characters.
		const selStart = input.indexOf( '[' ) + 1;
		const selEnd = input.indexOf( ']' );

		const item = input.substring( selStart, selEnd );
		const modelInput = input.substring( 0, selStart ) + input.substring( selEnd );

		const actionCallback = selection => {
			model.change( writer => {
				writer.insert( parseModel( item, model.schema ), selection.getFirstPosition() );
			} );
		};

		_test( testName, modelInput, output, actionCallback, testUndo );
	}

	function testRemove( testName, input, output ) {
		const actionCallback = selection => {
			model.change( writer => {
				writer.remove( selection.getFirstRange() );
			} );
		};

		_test( testName, input, output, actionCallback );
	}

	function testChangeType( testName, input, output ) {
		const actionCallback = selection => {
			const element = selection.getFirstPosition().nodeAfter;
			const newType = element.getAttribute( 'listType' ) == 'numbered' ? 'bulleted' : 'numbered';

			model.change( writer => {
				const itemsToChange = Array.from( selection.getSelectedBlocks() );

				for ( const item of itemsToChange ) {
					writer.setAttribute( 'listType', newType, item );
				}
			} );
		};

		_test( testName, input, output, actionCallback );
	}

	function testRenameFromListItem( testName, input, output, testUndo = true ) {
		const actionCallback = selection => {
			const element = selection.getFirstPosition().nodeAfter;

			model.change( writer => {
				writer.rename( element, 'paragraph' );
				writer.removeAttribute( 'listType', element );
				writer.removeAttribute( 'listIndent', element );
			} );
		};

		_test( testName, input, output, actionCallback, testUndo );
	}

	function testRenameToListItem( testName, newIndent, input, output ) {
		const actionCallback = selection => {
			const element = selection.getFirstPosition().nodeAfter;

			model.change( writer => {
				writer.setAttributes( { listType: 'bulleted', listIndent: newIndent }, element );
				writer.rename( element, 'listItem' );
			} );
		};

		_test( testName, input, output, actionCallback );
	}

	function testChangeIndent( testName, newIndent, input, output ) {
		const actionCallback = selection => {
			model.change( writer => {
				writer.setAttribute( 'listIndent', newIndent, selection.getFirstRange() );
			} );
		};

		_test( testName, input, output, actionCallback );
	}

	function testMove( testName, input, rootOffset, output, testUndo = true ) {
		const actionCallback = selection => {
			model.change( writer => {
				const targetPosition = writer.createPositionAt( modelRoot, rootOffset );

				writer.move( selection.getFirstRange(), targetPosition );
			} );
		};

		_test( testName, input, output, actionCallback, testUndo );
	}

	function _test( testName, input, output, actionCallback, testUndo ) {
		it( testName, () => {
			const callbackSelection = prepareTest( model, input );

			actionCallback( callbackSelection );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal( output );
		} );

		if ( testUndo ) {
			it( testName + ' (undo integration)', () => {
				const callbackSelection = prepareTest( model, input );

				const modelBefore = getModelData( model );
				const viewBefore = getViewData( view, { withoutSelection: true } );

				actionCallback( callbackSelection );

				const modelAfter = getModelData( model );
				const viewAfter = getViewData( view, { withoutSelection: true } );

				editor.execute( 'undo' );

				expect( getModelData( model ) ).to.equal( modelBefore );
				expect( getViewData( view, { withoutSelection: true } ) ).to.equal( viewBefore );

				editor.execute( 'redo' );

				expect( getModelData( model ) ).to.equal( modelAfter );
				expect( getViewData( view, { withoutSelection: true } ) ).to.equal( viewAfter );
			} );
		}

		function prepareTest( model, input ) {
			const modelRoot = model.document.getRoot( 'main' );

			// Parse data string to model.
			const parsedResult = parseModel( input, model.schema, { context: [ modelRoot.name ] } );

			// Retrieve DocumentFragment and Selection from parsed model.
			const modelDocumentFragment = parsedResult.model;
			const selection = parsedResult.selection;

			// Ensure no undo step is generated.
			model.enqueueChange( 'transparent', writer => {
				// Replace existing model in document by new one.
				writer.remove( writer.createRangeIn( modelRoot ) );
				writer.insert( modelDocumentFragment, modelRoot );

				// Clean up previous document selection.
				writer.setSelection( null );
				writer.removeSelectionAttribute( model.document.selection.getAttributeKeys() );
			} );

			const ranges = [];

			for ( const range of selection.getRanges() ) {
				const start = model.createPositionFromPath( modelRoot, range.start.path );
				const end = model.createPositionFromPath( modelRoot, range.end.path );

				ranges.push( model.createRange( start, end ) );
			}

			return model.createSelection( ranges );
		}
	}
} );
