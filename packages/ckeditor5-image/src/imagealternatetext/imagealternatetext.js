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

import AlternateTextFormView from './ui/alternatetextformview';
import ImageBalloonPanel from '../ui/imageballoonpanel';

import alternateTextIcon from 'ckeditor5-core/theme/icons/source.svg';
// TODO: move part of the theme to this sub-directory.

/**
 * The image alternate text plugin.
 *
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageAlternateText extends Plugin {

	/**
	 * @inheritDoc
	 */
	init() {
		// Register ImageAlternateTextCommand.
		this.editor.commands.set( 'imageAlternateText', new ImageAlternateTextCommand( this.editor ) );

		// TODO: this returns promise too.
		this._createAlternateTextChangeButton();

		return this._createAlternateTextBalloonPanel();
	}

	/**
	 * Creates button showing alternate text change balloon panel and registers it in
	 * editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 */
	_createAlternateTextChangeButton() {
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

			this.listenTo( view, 'execute', () => this._showAlternateTextChangePanel() );

			return view;
		} );
	}

	_createAlternateTextBalloonPanel() {
		const editor = this.editor;

		const panel = new ImageBalloonPanel( editor );
		const form = this._alternateTextForm = new AlternateTextFormView( editor.locale );

		this.listenTo( form, 'submit', () => {
			editor.execute( 'imageAlternateText', form.alternateTextInput.value );
			this._hideAlternateTextChangePanel();
		} );

		this.listenTo( form, 'cancel', () => this._hideAlternateTextChangePanel() );

		// Close on `ESC` press.
		escPressHandler( {
			emitter: panel,
			activator: () => panel.isVisible,
			callback: () => this._hideAlternateTextChangePanel()
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: panel,
			activator: () => panel.isVisible,
			contextElement: panel.element,
			callback: () => this._hideAlternateTextChangePanel()
		} );

		this.panel = panel;

		return Promise.all( [
			panel.content.add( this._alternateTextForm ),
			editor.ui.view.body.add( panel )
		] );
	}

	_showAlternateTextChangePanel() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageAlternateText' );

		this._alternateTextForm.alternateTextInput.value = command.value || '';

		this._alternateTextForm.alternateTextInput.select();
		this.panel.attach();
	}

	_hideAlternateTextChangePanel() {
		this.panel.hide();
		this.editor.editing.view.focus();
	}
}
