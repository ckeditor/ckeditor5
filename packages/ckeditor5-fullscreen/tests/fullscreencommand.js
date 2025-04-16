/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import { InlineEditor } from '@ckeditor/ckeditor5-editor-inline';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { removeEditorBodyOrphans } from '@ckeditor/ckeditor5-core/tests/_utils/cleanup.js';

import FullscreenCommand from '../src/fullscreencommand.js';
import ClassicEditorHandler from '../src/handlers/classiceditorhandler.js';
import DecoupledEditorHandler from '../src/handlers/decouplededitorhandler.js';
import AbstractEditorHandler from '../src/handlers/abstracteditorhandler.js';

const basicConfig = {
	plugins: [
		Paragraph,
		Essentials
	]
};

describe( 'FullscreenCommand', () => {
	let domElement, editor, command;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, basicConfig );

		command = new FullscreenCommand( editor );
	} );

	afterEach( () => {
		domElement.remove();
		return editor.destroy();
	} );

	it( '#value should be initially set to `false`', () => {
		expect( command.value ).to.equal( false );
	} );

	it( 'should not affect data', () => {
		expect( command.affectsData ).to.equal( false );
	} );

	it( 'should be enabled by default', () => {
		expect( command.isEnabled ).to.equal( true );
	} );

	describe( 'should set proper #fullscreenHandler for each editor type', () => {
		let tempElement;

		beforeEach( async () => {
			tempElement = global.document.createElement( 'div' );
			global.document.body.appendChild( tempElement );
		} );

		afterEach( () => {
			tempElement.remove();
			removeEditorBodyOrphans();
		} );

		it( 'for Classic editor', async () => {
			testEditorTypeHandler( tempElement, ClassicEditor, ClassicEditorHandler );
		} );

		it( 'for Decoupled editor', async () => {
			testEditorTypeHandler( tempElement, DecoupledEditor, DecoupledEditorHandler );
		} );

		it( 'for Inline editor', async () => {
			testEditorTypeHandler( tempElement, InlineEditor, AbstractEditorHandler );
		} );

		it( 'for Balloon editor', async () => {
			testEditorTypeHandler( tempElement, BalloonEditor, AbstractEditorHandler );
		} );

		it( 'for Multiroot editor', async () => {
			testEditorTypeHandler( tempElement, MultiRootEditor, AbstractEditorHandler );
		} );

		async function testEditorTypeHandler( element, editorConstructor, editorHandler ) {
			const tempEditor = await editorConstructor.create( element, basicConfig );
			const tempCommand = new FullscreenCommand( tempEditor );

			expect( tempCommand.fullscreenHandler ).to.be.instanceOf( editorHandler );

			return tempEditor.destroy();
		}
	} );

	describe( '#execute()', () => {
		it( 'should call #_disableFullscreenMode() if #value is `true`', () => {
			const spy = sinon.spy( command, '_disableFullscreenMode' );

			command.value = true;

			command.execute();

			expect( spy.calledOnce ).to.equal( true );
		} );

		it( 'should call #_enableFullscreenMode() if #value is `false`', () => {
			const spy = sinon.spy( command, '_enableFullscreenMode' );

			command.value = false;

			command.execute();

			expect( spy.calledOnce ).to.equal( true );

			command.execute();
		} );
	} );
} );
