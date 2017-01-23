/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagealternatetext/imagealternatetext
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ImageAlternateTextEngine from './imagealternatetextengine';
import escPressHandler from '@ckeditor/ckeditor5-ui/src/bindings/escpresshandler';
import ImageToolbar from '../imagetoolbar';
import AlternateTextFormView from './ui/alternatetextformview';
import ImageBalloonPanel from '../ui/imageballoonpanel';

import alternateTextIcon from '@ckeditor/ckeditor5-core/theme/icons/input.svg';
import '../../theme/imagealternatetext/theme.scss';

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
		this._createButton();

		return this._createBalloonPanel().then( panel => {
			/**
			 * Balloon panel containing alternate text change form.
			 *
			 * @member {module:image/ui/imageballoonpanel~ImageBalloonPanel} #baloonPanel
			 */
			this.balloonPanel = panel;

			/**
			 * Form containing textarea and buttons, used to change `alt` text value.
			 *
			 * @member {module:image/imagealternatetext/ui/imagealternatetextformview~AlternateTextFormView} #form
			 */
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
				icon: alternateTextIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			this.listenTo( view, 'execute', () => this._showBalloonPanel() );

			return view;
		} );
	}

	/**
	 * Creates balloon panel.
	 *
	 * @private
	 * @return {Promise.<module:image/ui/imageballoonpanel~ImageBalloonPanel>}
	 */
	_createBalloonPanel() {
		const editor = this.editor;

		const panel = new ImageBalloonPanel( editor );
		const form = new AlternateTextFormView( editor.locale );

		this.listenTo( form, 'submit', () => {
			editor.execute( 'imageAlternateText', { newValue: form.lebeledInput.inputView.element.value } );
			this._hideBalloonPanel();
		} );

		this.listenTo( form, 'cancel', () => this._hideBalloonPanel() );

		// Close on `ESC` press.
		escPressHandler( {
			emitter: panel,
			activator: () => panel.isVisible,
			callback: () => this._hideBalloonPanel()
		} );

		return Promise.all( [
			panel.content.add( form ),
			editor.ui.view.body.add( panel )
		] ).then( () => panel ) ;
	}

	/**
	 * Shows the balloon panel.
	 *
	 * @private
	 */
	_showBalloonPanel() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageAlternateText' );
		const imageToolbar = editor.plugins.get( ImageToolbar );

		if ( imageToolbar ) {
			imageToolbar.hide();
		}

		this.form.lebeledInput.value = command.value || '';
		this.balloonPanel.attach();
		this.form.lebeledInput.select();
	}

	/**
	 * Hides the balloon panel.
	 *
	 * @private
	 */
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
