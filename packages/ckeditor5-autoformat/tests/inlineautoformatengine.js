/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import InlineAutoformatEngine from '/ckeditor5/autoformat/inlineautoformatengine.js';
import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import VirtualTestEditor from '/tests/core/_utils/virtualtesteditor.js';
import Enter from '/ckeditor5/enter/enter.js';
import { setData, getData } from '/ckeditor5/engine/dev-utils/model.js';
import testUtils from '/tests/core/_utils/utils.js';
import Command from '/ckeditor5/core/command/command.js';

testUtils.createSinonSandbox();

describe( 'InlineAutoformatEngine', () => {
	let editor, doc, batch;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			features: [ Enter, Paragraph ]
		} )
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;
			batch = doc.batch();
		} );
	} );

	describe( 'Command name', () => {
		it( 'should accept a string pattern', () => {
			const spy = testUtils.sinon.spy();
			editor.commands.set( 'testCommand', new TestCommand( editor, spy ) );
			new InlineAutoformatEngine( editor, '(\\*)(.+?)(\\*)', 'testCommand' );

			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should stop early if there are less than 3 capture groups', () => {
			const spy = testUtils.sinon.spy();
			editor.commands.set( 'testCommand', new TestCommand( editor, spy ) );
			new InlineAutoformatEngine( editor, /(\*)(.+?)\*/g, 'testCommand' );

			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should run a command when the pattern is matched', () => {
			const spy = testUtils.sinon.spy();
			editor.commands.set( 'testCommand', new TestCommand( editor, spy ) );
			new InlineAutoformatEngine( editor, /(\*)(.+?)(\*)/g, 'testCommand' );

			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should remove found pattern', () => {
			const spy = testUtils.sinon.spy();
			editor.commands.set( 'testCommand', new TestCommand( editor, spy ) );
			new InlineAutoformatEngine( editor, /(\*)(.+?)(\*)/g, 'testCommand' );

			setData( doc, '<paragraph>*foobar[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '*' );
			} );

			sinon.assert.calledOnce( spy );
			expect( getData( doc ) ).to.equal( '<paragraph>foobar[]</paragraph>' );
		} );
	} );

	describe( 'Callback', () => {
		it( 'should stop when there are no format ranges returned from testCallback', () => {
			const formatSpy = testUtils.sinon.spy();
			const testStub = testUtils.sinon.stub().returns( {
				format: [ [] ],
				remove: []
			} );

			new InlineAutoformatEngine( editor, testStub, formatSpy );

			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should stop when there are no remove ranges returned from testCallback', () => {
			const formatSpy = testUtils.sinon.spy();
			const testStub = testUtils.sinon.stub().returns( {
				format: [],
				remove: [ [] ]
			} );

			new InlineAutoformatEngine( editor, testStub, formatSpy );

			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'should stop early when there is no text', () => {
			const formatSpy = testUtils.sinon.spy();
			const testStub = testUtils.sinon.stub().returns( {
				format: [],
				remove: [ [] ]
			} );

			new InlineAutoformatEngine( editor, testStub, formatSpy );

			setData( doc, '<paragraph>[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.notCalled( formatSpy );
		} );

		it( 'takes text from nested elements', () => {
			const formatSpy = testUtils.sinon.spy();
			const testStub = testUtils.sinon.stub().returns( {
				format: [],
				remove: []
			} );

			new InlineAutoformatEngine( editor, testStub, formatSpy );

			setData( doc, '<paragraph><paragraph>foobar[]</paragraph></paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.called( testStub );
			sinon.assert.notCalled( formatSpy );
			sinon.assert.calledWith( testStub, 'foobar' );
		} );
	} );
} );

/**
 * Dummy command to execute.
 */
class TestCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {core.editor.Editor} editor Editor instance.
	 * @param {Function} onExecuteCallback _doExecute call hook
	 */
	constructor( editor, onExecuteCallback ) {
		super( editor );

		this.onExecute = onExecuteCallback;
	}

	/**
	 * Executes command.
	 *
	 * @protected
	 */
	_doExecute() {
		this.onExecute();
	}
}
