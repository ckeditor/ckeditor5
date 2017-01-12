/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image
 */

import Plugin from 'ckeditor5-core/src/plugin';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import ImageAlternateTextEngine from './imagealternatetextengine';
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
	static get requires() {
		return [ ImageAlternateTextEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// TODO: docs for this._panel and this._form.
		this._createButton();

		return this._createBalloonPanel().then( panel => {
			this.balloonPanel = panel;
			this.form = panel.content.get( 0 );
		} );
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

		editor.ui.componentFactory.add( 'imageAlternateText', ( locale ) => {
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
		const form = new AlternateTextFormView( editor.locale );

		this.listenTo( form, 'submit', () => {
			editor.execute( 'imageAlternateText', { newValue: form.labeledTextarea.inputView.element.value } );
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

		return Promise.all( [
			panel.content.add( form ),
			editor.ui.view.body.add( panel )
		] ).then( () => panel ) ;
	}

	_showBalloonPanel() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageAlternateText' );
		const imageToolbar = editor.plugins.get( ImageToolbar );

		if ( imageToolbar ) {
			imageToolbar.hide();
		}

		this.form.labeledTextarea.value = command.value || '';
		this.balloonPanel.attach();
		this.form.labeledTextarea.select();
	}

	_hideBalloonPanel() {
		const editor = this.editor;
		this.balloonPanel.detach();
		editor.editing.view.focus();

		const imageToolbar = editor.plugins.get( ImageToolbar );

		if ( imageToolbar ) {
			imageToolbar.show();
		}
	}
}
