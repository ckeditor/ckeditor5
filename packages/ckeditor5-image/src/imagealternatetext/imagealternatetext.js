/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image
 */

import Plugin from 'ckeditor5-core/src/plugin';
import ImageAlternateTextCommand from './imagealternatetextcommand';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import clickOutsideHandler from 'ckeditor5-ui/src/bindings/clickoutsidehandler';
import escPressHandler from 'ckeditor5-ui/src/bindings/escpresshandler';

import ImageToolbar from '../imagetoolbar';

import AlternateTextFormView from './ui/alternatetextformview';
import ImageBalloonPanel from '../ui/imageballoonpanel';

import alternateTextIcon from 'ckeditor5-core/theme/icons/source.svg';
// TODO: move part of the theme to this sub-directory.

/**
 * The image alternate text plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageAlternateText extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		// TODO: Register ImageAlternateTextCommand in engine part.
		this.editor.commands.set( 'imageAlternateText', new ImageAlternateTextCommand( this.editor ) );

		// TODO: docs for this._panel and this._form.

		return Promise.all( [
			this._createButton(),
			this._createBalloonPanel()
		] );
	}

	/**
	 * Creates button showing alternate text change balloon panel and registers it in
	 * editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 */
	_createButton() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageAlternateText' );
		const t = editor.t;

		return editor.ui.componentFactory.add( 'imageAlternateText', ( locale ) => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Change alternate text' ),
				icon: alternateTextIcon
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			this.listenTo( view, 'execute', () => this._showBalloonPanel() );

			return view;
		} );
	}

	_createBalloonPanel() {
		const editor = this.editor;

		const panel = new ImageBalloonPanel( editor );
		const form = this._form = new AlternateTextFormView( editor.locale );

		this.listenTo( form, 'submit', () => {
			editor.execute( 'imageAlternateText', form.alternateTextInput.value );
			this._hideBalloonPanel();
		} );

		this.listenTo( form, 'cancel', () => this._hideBalloonPanel() );

		// Close on `ESC` press.
		escPressHandler( {
			emitter: panel,
			activator: () => panel.isVisible,
			callback: () => this._hideBalloonPanel()
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: panel,
			activator: () => panel.isVisible,
			contextElement: panel.element,
			callback: () => this._hideBalloonPanel()
		} );

		this._panel = panel;

		return Promise.all( [
			panel.content.add( this._form ),
			editor.ui.view.body.add( panel )
		] );
	}

	_showBalloonPanel() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageAlternateText' );
		const imageToolbar = editor.plugins.get( ImageToolbar );

		if ( imageToolbar ) {
			imageToolbar.hide();
		}

		this._form.alternateTextInput.value = command.value || '';
		this._form.alternateTextInput.select();
		this._panel.attach();
	}

	_hideBalloonPanel() {
		const editor = this.editor;
		this._panel.hide();
		editor.editing.view.focus();

		const imageToolbar = editor.plugins.get( ImageToolbar );

		if ( imageToolbar ) {
			imageToolbar.show();
		}
	}
}
