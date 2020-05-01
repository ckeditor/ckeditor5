/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import HeadingEditing from '../src/headingediting';
import HeadingButtonsUI from '../src/headingbuttonsui';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { getLocalizedOptions } from '../src/utils';
import iconHeading2 from '../theme/icons/heading2.svg';

describe( 'HeadingButtonUI', () => {
	let editorElement, editor;

	describe( 'default config', () => {
		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ HeadingButtonsUI, HeadingEditing ],
					toolbar: [ 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6' ],
					heading: {
						options: [
							{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
							{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
							{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
							{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' },
							{ model: 'heading4', view: 'h5', title: 'Heading 4', class: 'ck-heading_heading4' },
							{ model: 'heading5', view: 'h6', title: 'Heading 5', class: 'ck-heading_heading5' },
							{ model: 'heading6', view: 'p', title: 'Heading 6', class: 'ck-heading_heading6' }
						]
					}
				} )
				.then( newEditor => {
					editor = newEditor;

					// Set data so the commands will be enabled.
					setData( editor.model, '<heading1>f{}oo</heading1>' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should define default buttons', () => {
			const factory = editor.ui.componentFactory;

			expect( factory.create( 'heading1' ) ).to.be.instanceOf( ButtonView );
			expect( factory.create( 'heading2' ) ).to.be.instanceOf( ButtonView );
			expect( factory.create( 'heading3' ) ).to.be.instanceOf( ButtonView );
			expect( factory.create( 'heading4' ) ).to.be.instanceOf( ButtonView );
			expect( factory.create( 'heading5' ) ).to.be.instanceOf( ButtonView );
			expect( factory.create( 'heading6' ) ).to.be.instanceOf( ButtonView );
		} );

		it( 'should initialize buttons with correct localized data', () => {
			const localizedOptions = getLocalizedOptions( editor ).filter( option => option.model == 'heading2' )[ 0 ];
			const heading2Button = editor.ui.componentFactory.create( 'heading2' );

			expect( heading2Button.label ).to.equal( localizedOptions.title );
			expect( heading2Button.icon ).to.equal( iconHeading2 );
			expect( heading2Button.tooltip ).to.equal( true );
		} );

		it( 'should bind buttons to correct commands', () => {
			const headingButton = editor.ui.componentFactory.create( 'heading1' );
			const headingCommand = editor.commands.get( 'heading' );

			expect( headingCommand.isEnabled ).to.be.true;
			expect( headingButton.isEnabled ).to.be.true;

			headingCommand.isEnabled = false;
			expect( headingButton.isEnabled ).to.be.false;

			expect( headingCommand.value ).to.equal( 'heading1' );
			expect( headingButton.isOn ).to.be.true;

			setData( editor.model, '<heading2>f{}oo</heading2>' );

			expect( headingCommand.value ).to.equal( 'heading2' );
			expect( headingButton.isOn ).to.be.false;
		} );

		it( 'should bind button execute to command execute', () => {
			const headingButton = editor.ui.componentFactory.create( 'heading1' );
			const executeCommandSpy = sinon.spy( editor, 'execute' );

			headingButton.fire( 'execute' );

			sinon.assert.calledOnce( executeCommandSpy );
			sinon.assert.calledWithExactly( executeCommandSpy, 'heading', { value: 'heading1' } );
		} );

		it( 'should be initialized as toggleable button', () => {
			const factory = editor.ui.componentFactory;

			expect( factory.create( 'heading1' ).isToggleable ).to.be.true;
			expect( factory.create( 'heading2' ).isToggleable ).to.be.true;
			expect( factory.create( 'heading3' ).isToggleable ).to.be.true;
			expect( factory.create( 'heading4' ).isToggleable ).to.be.true;
			expect( factory.create( 'heading5' ).isToggleable ).to.be.true;
			expect( factory.create( 'heading6' ).isToggleable ).to.be.true;
		} );
	} );

	describe( 'custom config', () => {
		const customIcon = '<svg></svg>';

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					heading: {
						options: [
							{ model: 'paragraph' },
							{ model: 'heading1', view: 'h2', icon: customIcon }
						]
					},
					plugins: [ HeadingButtonsUI, HeadingEditing ],
					toolbar: [ 'heading1', 'heading2', 'heading3' ]
				} )
				.then( newEditor => {
					editor = newEditor;

					// Set data so the commands will be enabled.
					setData( editor.model, '<heading1>f{}oo</heading1>' );
				} );
		} );

		afterEach( () => {
			editorElement.remove();

			return editor.destroy();
		} );

		it( 'should allow to pass custom image to the configuration', () => {
			const headingButton = editor.ui.componentFactory.create( 'heading1' );

			expect( headingButton.icon ).to.equal( customIcon );
		} );
	} );
} );
