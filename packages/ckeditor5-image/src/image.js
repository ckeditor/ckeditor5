/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/image
 */

import Plugin from 'ckeditor5-core/src/plugin';
import ImageEngine from './imageengine';
import Widget from './widget/widget';
import ButtonView from 'ckeditor5-ui/src/button/buttonview';
import { isImageWidget } from './utils';
import AlternateTextFormView from 'ckeditor5-image/src/ui/alternatetextformview';
import clickOutsideHandler from 'ckeditor5-ui/src/bindings/clickoutsidehandler';
import escPressHandler from 'ckeditor5-ui/src/bindings/escpresshandler';
import ImageBalloonPanel from './ui/imageballoonpanel';

import alternateTextIcon from 'ckeditor5-core/theme/icons/source.svg';
import '../theme/theme.scss';

/**
 * The image plugin.
 *
 * Uses {@link module:image/imageengine~ImageEngine}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Image extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
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
		const editingView = editor.editing.view;
		const selectedElement = editingView.selection.getSelectedElement();

		if ( selectedElement && isImageWidget( selectedElement ) ) {
			const command = editor.commands.get( 'imageAlternateText' );

			this._alternateTextForm.alternateTextInput.value = command.value || '';

			this._alternateTextForm.alternateTextInput.select();
			this.panel.attach();
		}
	}

	_hideAlternateTextChangePanel() {
		this.panel.hide();
		this.editor.editing.view.focus();
	}
}
