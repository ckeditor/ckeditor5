/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import BookmarkUI from '../src/bookmarkui.js';

import bookmarkIcon from '../theme/icons/bookmark.svg';

describe( 'BookmarkUI', () => {
	let editor, element, button;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ BookmarkUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( BookmarkUI.pluginName ).to.equal( 'BookmarkUI' );
	} );

	describe( 'the "bookmark" toolbar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'bookmark' );
		} );

		testButton( 'bookmark', 'Bookmark', ButtonView );

		it( 'should have tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).to.equal( bookmarkIcon );
		} );
	} );

	describe( 'the menuBar:bookmark menu bar button', () => {
		beforeEach( () => {
			button = editor.ui.componentFactory.create( 'menuBar:bookmark' );
		} );

		testButton( 'bookmark', 'Bookmark', MenuBarMenuListItemButtonView );
	} );

	function testButton( featureName, label, Component ) {
		it( 'should register feature component', () => {
			expect( button ).to.be.instanceOf( Component );
		} );

		it( 'should create UI component with correct attribute values', () => {
			expect( button.isOn ).to.be.false;
			expect( button.label ).to.equal( label );
		} );

		it( `should execute ${ featureName } command on model execute event and focus the view`, () => {
			// TODO: uncomment after command implementation.

			// const executeSpy = testUtils.sinon.stub( editor, 'execute' );
			const focusSpy = testUtils.sinon.stub( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( focusSpy );

			// TODO: uncomment after command implementation.

			// sinon.assert.calledOnceWithExactly( executeSpy, featureName );
			// sinon.assert.callOrder( executeSpy, focusSpy );
		} );

		// TODO: unskip after command implementation.
		it.skip( `should bind #isEnabled to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			expect( button.isOn ).to.be.false;

			const initState = command.isEnabled;
			expect( button.isEnabled ).to.equal( initState );

			command.isEnabled = !initState;
			expect( button.isEnabled ).to.equal( !initState );
		} );

		// TODO: unskip after command implementation.
		it.skip( `should bind #isOn to ${ featureName } command`, () => {
			const command = editor.commands.get( featureName );

			command.value = false;
			command.isEnabled = true;
			expect( button.isOn ).to.be.false;

			command.value = true;
			command.isEnabled = true;
			expect( button.isOn ).to.be.true;

			command.value = true;
			command.isEnabled = false;
			expect( button.isOn ).to.be.false;
		} );
	}
} );
