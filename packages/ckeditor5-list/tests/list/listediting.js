/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../src/list/listediting.js';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import LegacyListEditing from '../../src/legacylist/legacylistediting.js';
import ListIndentCommand from '../../src/list/listindentcommand.js';
import ListSplitCommand from '../../src/list/listsplitcommand.js';
import ListCommand from '../../src/list/listcommand.js';
import { isFirstBlockOfListItem } from '../../src/list/utils/model.js';

import stubUid from './_utils/uid.js';
import { modelList, prepareTest } from './_utils/utils.js';

describe( 'ListEditing', () => {
	let editor, model, modelDoc, modelRoot, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, ClipboardPipeline, BoldEditing, ListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing ]
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;

		model.schema.extend( 'paragraph', {
			allowAttributes: 'foo'
		} );

		model.schema.register( 'nonListable', {
			allowWhere: '$block',
			allowContentOf: '$block',
			inheritTypesFrom: '$block',
			allowAttributes: 'foo'
		} );

		editor.conversion.elementToElement( { model: 'nonListable', view: 'div' } );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );
		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListEditing.pluginName ).to.equal( 'ListEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'list' ).label ).to.equal(
			'Keystrokes that can be used in a list'
		);

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'list' ).keystrokes ).to.deep.include( {
			label: 'Increase list item indent',
			keystroke: 'Tab'
		} );

		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'list' ).keystrokes ).to.deep.include( {
			label: 'Decrease list item indent',
			keystroke: 'Shift+Tab'
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListEditing ) ).to.be.instanceOf( ListEditing );
	} );

	it( 'should define config', () => {
		expect( editor.config.get( 'list' ) ).to.deep.equal( {
			multiBlock: true
		} );
	} );

	it( 'should throw if loaded alongside ListEditing plugin', async () => {
		let caughtError;

		try {
			await VirtualTestEditor.create( { plugins: [ ListEditing, LegacyListEditing ] } );
		} catch ( error ) {
			caughtError = error;
		}

		expect( caughtError ).to.instanceof( CKEditorError );
		expect( caughtError.message )
			.match( /^list-feature-conflict/ );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listItemId' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listIndent' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listType' ) ).to.be.false;
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

	describe( 'commands', () => {
		it( 'should register list commands (numbered, bulleted, custom numbered, custom bulleted)', () => {
			const numbered = editor.commands.get( 'numberedList' );
			const bulleted = editor.commands.get( 'bulletedList' );
			const customNumbered = editor.commands.get( 'customNumberedList' );
			const customBulleted = editor.commands.get( 'customBulletedList' );

			expect( numbered ).to.be.instanceOf( ListCommand );
			expect( bulleted ).to.be.instanceOf( ListCommand );
			expect( customNumbered ).to.be.instanceOf( ListCommand );
			expect( customBulleted ).to.be.instanceOf( ListCommand );
		} );

		it( 'should register indent list command', () => {
			const command = editor.commands.get( 'indentList' );

			expect( command ).to.be.instanceOf( ListIndentCommand );
		} );

		it( 'should register outdent list command', () => {
			const command = editor.commands.get( 'outdentList' );

			expect( command ).to.be.instanceOf( ListIndentCommand );
		} );

		it( 'should register the splitListItemBefore command', () => {
			const command = editor.commands.get( 'splitListItemBefore' );

			expect( command ).to.be.instanceOf( ListSplitCommand );
		} );

		it( 'should register the splitListItemAfter command', () => {
			const command = editor.commands.get( 'splitListItemAfter' );

			expect( command ).to.be.instanceOf( ListSplitCommand );
		} );

		it( 'should add indent list command to indent command', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, IndentEditing, ListEditing ]
			} );

			const indentListCommand = editor.commands.get( 'indentList' );
			const indentCommand = editor.commands.get( 'indent' );

			const spy = sinon.stub( indentListCommand, 'execute' );

			indentListCommand.isEnabled = true;
			indentCommand.execute();

			sinon.assert.calledOnce( spy );

			await editor.destroy();
		} );

		it( 'should add outdent list command to outdent command', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, IndentEditing, ListEditing ]
			} );

			const outdentListCommand = editor.commands.get( 'outdentList' );
			const outdentCommand = editor.commands.get( 'outdent' );

			const spy = sinon.stub( outdentListCommand, 'execute' );

			outdentListCommand.isEnabled = true;
			outdentCommand.execute();

			sinon.assert.calledOnce( spy );

			await editor.destroy();
		} );
	} );

	describe( 'post fixer', () => {
		describe( 'insert', () => {
			function testList( input, inserted, output ) {
				const selection = prepareTest( model, input );

				model.change( () => {
					model.change( writer => {
						writer.insert( parseModel( inserted, model.schema ), selection.getFirstPosition() );
					} );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
			}

			it( 'element before nested list', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[]' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="3" listItemId="e" listType="bulleted">f</paragraph>',

					'<paragraph>x</paragraph>',

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph>x</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">f</paragraph>'
				);
			} );

			it( 'list item before nested list', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[]' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="3" listItemId="e" listType="bulleted">f</paragraph>',

					'<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>',

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="x" listType="bulleted">x</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">f</paragraph>'
				);
			} );

			it( 'multiple list items with too big indent', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[]' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>',

					'<paragraph listIndent="4" listItemId="x1" listType="bulleted">x</paragraph>' +
					'<paragraph listIndent="5" listItemId="x2" listType="bulleted">x</paragraph>' +
					'<paragraph listIndent="4" listItemId="x3" listType="bulleted">x</paragraph>',

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="x1" listType="bulleted">x</paragraph>' +
					'<paragraph listIndent="3" listItemId="x2" listType="bulleted">x</paragraph>' +
					'<paragraph listIndent="2" listItemId="x3" listType="bulleted">x</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>'
				);
			} );

			it( 'item with different type - top level list', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
					'[]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>',

					'<paragraph listIndent="0" listItemId="x" listType="numbered">x</paragraph>',

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="x" listType="numbered">x</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>'
				);
			} );

			it( 'multiple items with different type - nested list', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[]' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>',

					'<paragraph listIndent="1" listItemId="x1" listType="numbered">x</paragraph>' +
					'<paragraph listIndent="2" listItemId="x2" listType="numbered">x</paragraph>',

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="x1" listType="numbered">x</paragraph>' +
					'<paragraph listIndent="2" listItemId="x2" listType="numbered">x</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>'
				);
			} );

			it( 'item with different type, in nested list, after nested list', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
					'[]',

					'<paragraph listIndent="1" listItemId="x" listType="numbered">x</paragraph>',

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="x" listType="numbered">x</paragraph>'
				);
			} );

			it( 'two list items with mismatched types inserted in one batch', () => {
				const input =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>';

				const output =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>';

				setModelData( model, input );

				const item1 = '<paragraph listIndent="1" listItemId="c" listType="numbered">c</paragraph>';
				const item2 = '<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>';

				model.change( writer => {
					writer.append( parseModel( item1, model.schema ), modelRoot );
					writer.append( parseModel( item2, model.schema ), modelRoot );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
			} );

			it( 'paragraph between list item blocks', () => {
				const input =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">d</paragraph>';

				const output =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph>x</paragraph>' +
					'<paragraph>x</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">d</paragraph>';

				setModelData( model, input );

				const item = '<paragraph>x</paragraph><paragraph>x</paragraph>';

				model.change( writer => {
					writer.insert( parseModel( item, model.schema ), modelRoot, 1 );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( output );
			} );
		} );

		describe( 'remove', () => {
			function testList( input, output ) {
				const selection = prepareTest( model, input );

				model.change( writer => {
					writer.remove( selection.getFirstRange() );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
			}

			it( 'first list item', () => {
				testList(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>',

					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>'
				);
			} );

			it( 'first list item of nested list', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>]' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="2" listItemId="f" listType="bulleted">f</paragraph>',

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="2" listItemId="f" listType="bulleted">f</paragraph>'
				);
			} );

			it( 'selection over two different nested lists of same indent', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="numbered">e</paragraph>]' +
					'<paragraph listIndent="1" listItemId="f" listType="numbered">f</paragraph>',

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="numbered">f</paragraph>'
				);
			} );
		} );

		describe( 'move', () => {
			function testList( input, offset, output ) {
				const selection = prepareTest( model, input );

				model.change( writer => {
					const targetPosition = writer.createPositionAt( modelRoot, offset );

					writer.move( selection.getFirstRange(), targetPosition );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
			}

			it( 'nested list item out of list structure', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>]' +
					'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="4" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph>x</paragraph>',

					6,

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph>x</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>'
				);
			} );

			it( 'list items between lists', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>]' +
					'<paragraph listIndent="4" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph>x</paragraph>' +
					'<paragraph listIndent="0" listItemId="f" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>',

					7,

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph>x</paragraph>' +
					'<paragraph listIndent="0" listItemId="f" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>'
				);
			} );

			it( 'element in between nested list items', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="3" listItemId="d" listType="bulleted">d</paragraph>' +
					'[<paragraph>x</paragraph>]',

					2,

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph>x</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>'
				);
			} );

			it( 'multiple nested list items of different types #1 - fix at start', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="numbered">e</paragraph>]' +
					'<paragraph listIndent="1" listItemId="f" listType="numbered">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>' +
					'<paragraph listIndent="1" listItemId="h" listType="numbered">h</paragraph>' +
					'<paragraph listIndent="1" listItemId="i" listType="numbered">i</paragraph>',

					8,

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="numbered">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>' +
					'<paragraph listIndent="1" listItemId="h" listType="numbered">h</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="numbered">e</paragraph>' +
					'<paragraph listIndent="1" listItemId="i" listType="numbered">i</paragraph>'
				);
			} );

			it( 'multiple nested list items of different types #2 - fix at end', () => {
				testList(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="numbered">e</paragraph>]' +
					'<paragraph listIndent="1" listItemId="f" listType="numbered">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>' +
					'<paragraph listIndent="1" listItemId="h" listType="bulleted">h</paragraph>' +
					'<paragraph listIndent="1" listItemId="i" listType="bulleted">i</paragraph>',

					8,

					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="numbered">f</paragraph>' +
					'<paragraph listIndent="0" listItemId="g" listType="bulleted">g</paragraph>' +
					'<paragraph listIndent="1" listItemId="h" listType="bulleted">h</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="numbered">e</paragraph>' +
					'<paragraph listIndent="1" listItemId="i" listType="bulleted">i</paragraph>'
				);
			} );

			// #78.
			it( 'move out of container', () => {
				testList(
					'<blockQuote>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>' +
					'[<paragraph listIndent="2" listItemId="e" listType="bulleted">e</paragraph>]' +
					'</blockQuote>',

					0,

					'<paragraph listIndent="0" listItemId="e" listType="bulleted">e</paragraph>' +
					'<blockQuote>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted">d</paragraph>' +
					'</blockQuote>'
				);
			} );
		} );

		describe( 'rename', () => {
			it( 'to element that does not allow list attributes', () => {
				const modelBefore =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[<paragraph listIndent="2" listItemId="c" listType="bulleted" foo="123">c</paragraph>]' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="3" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="2" listItemId="g" listType="bulleted">g</paragraph>' +
					'<paragraph listIndent="1" listItemId="h" listType="bulleted">h</paragraph>' +
					'<paragraph listIndent="2" listItemId="i" listType="bulleted">i</paragraph>';

				const expectedModel =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<nonListable foo="123">c</nonListable>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="0" listItemId="f" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="1" listItemId="g" listType="bulleted">g</paragraph>' +
					'<paragraph listIndent="0" listItemId="h" listType="bulleted">h</paragraph>' +
					'<paragraph listIndent="1" listItemId="i" listType="bulleted">i</paragraph>';

				const selection = prepareTest( model, modelBefore );

				model.change( writer => {
					writer.rename( selection.getFirstPosition().nodeAfter, 'nonListable' );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( expectedModel );
			} );
		} );

		describe( 'changing list attributes', () => {
			it( 'remove list attributes', () => {
				const modelBefore =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>]' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="3" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="1" listItemId="f" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="2" listItemId="g" listType="bulleted">g</paragraph>' +
					'<paragraph listIndent="1" listItemId="h" listType="bulleted">h</paragraph>' +
					'<paragraph listIndent="2" listItemId="i" listType="bulleted">i</paragraph>';

				const expectedModel =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph>c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="0" listItemId="f" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="1" listItemId="g" listType="bulleted">g</paragraph>' +
					'<paragraph listIndent="0" listItemId="h" listType="bulleted">h</paragraph>' +
					'<paragraph listIndent="1" listItemId="i" listType="bulleted">i</paragraph>';

				const selection = prepareTest( model, modelBefore );
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.removeAttribute( 'listItemId', element );
					writer.removeAttribute( 'listIndent', element );
					writer.removeAttribute( 'listType', element );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( expectedModel );
			} );

			it( 'add list attributes', () => {
				const modelBefore =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'[<paragraph>c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="2" listItemId="f" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="1" listItemId="g" listType="bulleted">g</paragraph>';

				const expectedModel =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted">e</paragraph>' +
					'<paragraph listIndent="2" listItemId="f" listType="bulleted">f</paragraph>' +
					'<paragraph listIndent="1" listItemId="g" listType="bulleted">g</paragraph>';

				const selection = prepareTest( model, modelBefore );
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.setAttribute( 'listItemId', 'c', element );
					writer.setAttribute( 'listIndent', 2, element );
					writer.setAttribute( 'listType', 'bulleted', element );
					writer.setAttribute( 'listIndent', 2, element.nextSibling );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( expectedModel );
			} );

			it( 'middle block indent', () => {
				const modelBefore =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">c</paragraph>';

				const expectedModel =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">c</paragraph>';

				const selection = prepareTest( model, modelBefore );
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.setAttribute( 'listIndent', 1, element );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( expectedModel );
			} );

			it( 'middle blocks indent', () => {
				const modelBefore =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">d</paragraph>';

				const expectedModel =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="a00" listType="bulleted">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">d</paragraph>';

				const selection = prepareTest( model, modelBefore );

				model.change( writer => {
					for ( const item of selection.getFirstRange( 0 ).getItems( { shallow: true } ) ) {
						writer.setAttribute( 'listIndent', 1, item );
					}
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( expectedModel );
			} );

			it( 'middle block outdent', () => {
				const modelBefore =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">c</paragraph>';

				const expectedModel =
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="a00" listType="bulleted">c</paragraph>';

				const selection = prepareTest( model, modelBefore );
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.setAttribute( 'listIndent', 0, element );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( expectedModel );
			} );
		} );
	} );
} );

describe( 'ListEditing - registerDowncastStrategy()', () => {
	let editor, model, view;

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should allow registering strategy for list elements', async () => {
		await createEditor( class CustomPlugin extends Plugin {
			init() {
				this.editor.plugins.get( 'ListEditing' ).registerDowncastStrategy( {
					scope: 'list',
					attributeName: 'someFoo',

					setAttributeOnDowncast( writer, attributeValue, viewElement ) {
						writer.setAttribute( 'data-foo', attributeValue, viewElement );
					}
				} );
			}
		} );

		setModelData( model, modelList( `
			* <paragraph someFoo="123">foo</paragraph>
			* <paragraph someFoo="123">bar</paragraph>
		` ) );

		expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
			'<ul data-foo="123">' +
				'<li><span class="ck-list-bogus-paragraph">foo</span></li>' +
				'<li><span class="ck-list-bogus-paragraph">bar</span></li>' +
			'</ul>'
		);
	} );

	it( 'should allow registering strategy for list items elements', async () => {
		await createEditor( class CustomPlugin extends Plugin {
			init() {
				this.editor.plugins.get( 'ListEditing' ).registerDowncastStrategy( {
					scope: 'item',
					attributeName: 'someFoo',

					setAttributeOnDowncast( writer, attributeValue, viewElement ) {
						writer.setAttribute( 'data-foo', attributeValue, viewElement );
					}
				} );
			}
		} );

		setModelData( model, modelList( `
			* <paragraph someFoo="123">foo</paragraph>
			* <paragraph someFoo="321">bar</paragraph>
		` ) );

		expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
			'<ul>' +
				'<li data-foo="123"><span class="ck-list-bogus-paragraph">foo</span></li>' +
				'<li data-foo="321"><span class="ck-list-bogus-paragraph">bar</span></li>' +
			'</ul>'
		);
	} );

	describe( 'should allow registering strategy for list items markers', () => {
		describe( 'without first block wrapper', () => {
			beforeEach( async () => {
				await createEditor( class CustomPlugin extends Plugin {
					init() {
						this.editor.plugins.get( 'ListEditing' ).registerDowncastStrategy( {
							scope: 'itemMarker',
							attributeName: 'someFoo',

							createElement( writer, modelElement, { dataPipeline } ) {
								return writer.createEmptyElement( 'input', {
									type: 'checkbox',
									value: modelElement.getAttribute( 'someFoo' ),
									...( dataPipeline ? { disabled: 'disabled' } : null )
								} );
							}
						} );
					}
				} );
			} );

			it( 'single block in a list item', () => {
				setModelData( model, modelList( `
					* <paragraph someFoo="123">foo</paragraph>
					* <paragraph someFoo="321">bar</paragraph>
				` ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li><input type="checkbox" value="123"></input><span class="ck-list-bogus-paragraph">foo</span></li>' +
						'<li><input type="checkbox" value="321"></input><span class="ck-list-bogus-paragraph">bar</span></li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li><input type="checkbox" value="123" disabled="disabled">foo</li>' +
						'<li><input type="checkbox" value="321" disabled="disabled">bar</li>' +
					'</ul>'
				);
			} );

			it( 'multiple blocks in a single list item', () => {
				setModelData( model, modelList( `
					* <paragraph someFoo="123">foo</paragraph>
					  <paragraph someFoo="321">bar</paragraph>
				` ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'<input type="checkbox" value="123"></input>' +
							'<p>foo</p>' +
							'<p>bar</p>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'<input type="checkbox" value="123" disabled="disabled">' +
							'<p>foo</p>' +
							'<p>bar</p>' +
						'</li>' +
					'</ul>'
				);
			} );
		} );

		describe( 'with first block wrapper', () => {
			beforeEach( async () => {
				await createEditor( class CustomPlugin extends Plugin {
					init() {
						this.editor.plugins.get( 'ListEditing' ).registerDowncastStrategy( {
							scope: 'itemMarker',
							attributeName: 'someFoo',

							createElement( writer, modelElement, { dataPipeline } ) {
								return writer.createEmptyElement( 'input', {
									type: 'checkbox',
									value: modelElement.getAttribute( 'someFoo' ),
									...( dataPipeline ? { disabled: 'disabled' } : null )
								} );
							},

							canWrapElement( modelElement ) {
								return isFirstBlockOfListItem( modelElement ) && modelElement.is( 'element', 'paragraph' );
							},

							createWrapperElement( writer, modelElement, { dataPipeline } ) {
								return writer.createAttributeElement( dataPipeline ? 'label' : 'span', { class: 'label' } );
							}
						} );

						this.editor.conversion.for( 'downcast' ).elementToElement( {
							model: 'paragraph',
							view: ( element, { writer } ) => {
								if ( isFirstBlockOfListItem( element ) ) {
									return writer.createContainerElement( 'span', { class: 'description' } );
								}
							},
							converterPriority: 'highest'
						} );
					}
				} );
			} );

			it( 'single block in a list item', () => {
				setModelData( model, modelList( `
					* <paragraph someFoo="123">foo</paragraph>
					* <paragraph someFoo="321">bar</paragraph>
				` ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'<span class="label">' +
								'<input type="checkbox" value="123"></input>' +
								'<span class="description">foo</span>' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="label">' +
								'<input type="checkbox" value="321"></input>' +
								'<span class="description">bar</span>' +
							'</span>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'<label class="label">' +
								'<input type="checkbox" value="123" disabled="disabled">' +
								'<span class="description">foo</span>' +
							'</label>' +
						'</li>' +
						'<li>' +
							'<label class="label">' +
								'<input type="checkbox" value="321" disabled="disabled">' +
								'<span class="description">bar</span>' +
							'</label>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'multiple blocks in a single list item', () => {
				setModelData( model, modelList( `
					* <paragraph someFoo="123">foo</paragraph>
					  <paragraph someFoo="321">bar</paragraph>
				` ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'<span class="label">' +
								'<input type="checkbox" value="123"></input>' +
								'<span class="description">foo</span>' +
							'</span>' +
							'<p>bar</p>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'<label class="label">' +
								'<input type="checkbox" value="123" disabled="disabled">' +
								'<span class="description">foo</span>' +
							'</label>' +
							'<p>bar</p>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'single block (non paragraph) in a list item', () => {
				setModelData( model, modelList( `
					* <heading1 someFoo="123">foo</heading1>
				` ) );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'<span class="label">' +
								'<input type="checkbox" value="123"></input>' +
							'</span>' +
							'<h2>foo</h2>' +
						'</li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
					'<ul>' +
						'<li>' +
							'<label class="label">' +
								'<input type="checkbox" value="123" disabled="disabled">' +
							'</label>' +
							'<h2>foo</h2>' +
						'</li>' +
					'</ul>'
				);
			} );
		} );
	} );

	async function createEditor( extraPlugin ) {
		editor = await VirtualTestEditor.create( {
			plugins: [ extraPlugin, Paragraph, ListEditing, UndoEditing, HeadingEditing ]
		} );

		model = editor.model;
		view = editor.editing.view;
	}
} );
