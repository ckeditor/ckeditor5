/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { IconParagraph } from '@ckeditor/ckeditor5-icons';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '../src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import ParagraphButtonUI from '../src/paragraphbuttonui.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview.js';

describe( 'HeadingButtonUI', () => {
	let editorElement, editor;

	describe( 'default config', () => {
		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, ParagraphButtonUI, Heading ],
					toolbar: [ 'paragraph' ]
				} )
				.then( newEditor => {
					editor = newEditor;
					setData( editor.model, '<paragraph>f{}oo</paragraph>' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should define default buttons', () => {
			const factory = editor.ui.componentFactory;

			expect( factory.create( 'paragraph' ) ).to.be.instanceOf( ButtonView );
		} );

		it( 'should intialize buttons with correct data', () => {
			const paragraphButton = editor.ui.componentFactory.create( 'paragraph' );

			expect( paragraphButton.label ).to.equal( 'Paragraph' );
			expect( paragraphButton.icon ).to.equal( IconParagraph );
			expect( paragraphButton.tooltip ).to.equal( true );
			expect( paragraphButton.isToggleable ).to.equal( true );
		} );

		it( 'should bind button to command', () => {
			const paragraphButton = editor.ui.componentFactory.create( 'paragraph' );
			const paragraphCommand = editor.commands.get( 'paragraph' );

			expect( paragraphCommand.isEnabled ).to.be.true;
			expect( paragraphButton.isEnabled ).to.be.true;

			paragraphCommand.isEnabled = false;
			expect( paragraphButton.isEnabled ).to.be.false;

			expect( paragraphCommand.value ).to.be.true;
			expect( paragraphButton.isOn ).to.be.true;

			setData( editor.model, '<heading2>f{}oo</heading2>' );

			expect( paragraphCommand.value ).to.be.false;
			expect( paragraphButton.isOn ).to.be.false;
		} );

		it( 'should bind button execute to command execute', () => {
			const pararaphButton = editor.ui.componentFactory.create( 'paragraph' );
			const executeCommandSpy = sinon.spy( editor, 'execute' );

			pararaphButton.fire( 'execute' );

			sinon.assert.calledOnce( executeCommandSpy );
			sinon.assert.calledWithExactly( executeCommandSpy, 'paragraph' );
		} );
	} );
} );
