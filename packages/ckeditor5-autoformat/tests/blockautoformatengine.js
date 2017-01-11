/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BlockAutoformatEngine from 'ckeditor5-autoformat/src/blockautoformatengine';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from 'ckeditor5-core/tests/_utils/virtualtesteditor';
import Enter from 'ckeditor5-enter/src/enter';
import { setData, getData } from 'ckeditor5-engine/src/dev-utils/model';
import testUtils from 'ckeditor5-core/tests/_utils/utils';
import Command from 'ckeditor5-core/src/command/command';

testUtils.createSinonSandbox();

describe( 'BlockAutoformatEngine', () => {
	let editor, doc, batch;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ Enter, Paragraph ]
		} )
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;
			batch = doc.batch();
		} );
	} );

	describe( 'Command name', () => {
		it( 'should run a command when the pattern is matched', () => {
			const spy = testUtils.sinon.spy();
			editor.commands.set( 'testCommand', new TestCommand( editor, spy ) );
			new BlockAutoformatEngine( editor, /^[\*]\s$/, 'testCommand' );

			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should remove found pattern', () => {
			const spy = testUtils.sinon.spy();
			editor.commands.set( 'testCommand', new TestCommand( editor, spy ) );
			new BlockAutoformatEngine( editor, /^[\*]\s$/, 'testCommand' );

			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.calledOnce( spy );
			expect( getData( doc ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );
	} );

	describe( 'Callback', () => {
		it( 'should run callback when the pattern is matched', () => {
			const spy = testUtils.sinon.spy();
			new BlockAutoformatEngine( editor, /^[\*]\s$/, spy );

			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), ' ' );
			} );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should ignore other delta operations', () => {
			const spy = testUtils.sinon.spy();
			new BlockAutoformatEngine( editor, /^[\*]\s/, spy );

			setData( doc, '<paragraph>*[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.remove( doc.selection.getFirstRange() );
			} );

			sinon.assert.notCalled( spy );
		} );

		it( 'should stop if there is no text to run matching on', () => {
			const spy = testUtils.sinon.spy();
			new BlockAutoformatEngine( editor, /^[\*]\s/, spy );

			setData( doc, '<paragraph>[]</paragraph>' );
			doc.enqueueChanges( () => {
				batch.insert( doc.selection.getFirstPosition(), '' );
			} );

			sinon.assert.notCalled( spy );
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
	 * @param {module:core/editor~Editor} editor Editor instance.
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
