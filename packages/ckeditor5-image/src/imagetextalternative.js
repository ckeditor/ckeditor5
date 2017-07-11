/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetextalternative
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ImageTextAlternativeEngine from './imagetextalternative/imagetextalternativeengine';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import TextAlternativeFormView from './imagetextalternative/ui/textalternativeformview';
import ImageBalloon from './image/ui/imageballoon';
import textAlternativeIcon from '@ckeditor/ckeditor5-core/theme/icons/low-vision.svg';

import '../theme/imagetextalternative/theme.scss';

/**
 * The image text alternative plugin.
 *
 * The plugin uses {@link module:image/image/ui/imageballoon~ImageBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageTextAlternative extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageTextAlternativeEngine, ImageBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageTextAlternative';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._createButton();
		this._createForm();
	}

	/**
	 * Creates button showing text alternative change balloon panel and registers it in
	 * editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 */
	_createButton() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageTextAlternative' );
		const t = editor.t;

		editor.ui.componentFactory.add( 'imageTextAlternative', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Change image text alternative' ),
				icon: textAlternativeIcon,
				tooltip: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );

			this.listenTo( view, 'execute', () => this._showForm() );

			return view;
		} );
	}

	/**
	 * Creates the {@link module:image/imagetextalternative/ui/textalternativeformview~TextAlternativeFormView}
	 * form.
	 *
	 * @protected
	 */
	_createForm() {
		const editor = this.editor;

		/**
		 * Form containing textarea and buttons, used to change `alt` text value.
		 *
		 * @member {module:image/imagetextalternative/ui/textalternativeformview~TextAlternativeFormView} #form
		 */
		this._form = new TextAlternativeFormView( editor.locale );

		this.listenTo( this._form, 'submit', () => {
			editor.execute( 'imageTextAlternative', {
				newValue: this._form.labeledInput.inputView.element.value
			} );

			this._hideForm( true );
		} );

		this.listenTo( this._form, 'cancel', () => {
			this._hideForm( true );
		} );

		// Close the form on Esc key press.
		this._form.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideForm( true );
			cancel();
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this._form,
			activator: () => this._isVisible,
			contextElement: this._form.element,
			callback: () => this._hideForm()
		} );
	}

	/**
	 * Shows the form in a balloon.
	 *
	 * @protected
	 */
	_showForm() {
		const editor = this.editor;
		const balloon = editor.plugins.get( 'ImageBalloon' );
		const command = editor.commands.get( 'imageTextAlternative' );
		const labeledInput = this._form.labeledInput;

		if ( !balloon.hasView( this._form ) ) {
			balloon.add( {
				view: this._form
			} );

			// Make sure that each time the panel shows up, the field remains in sync with the value of
			// the command. If the user typed in the input, then canceled the balloon (`labeledInput#value`
			// stays unaltered) and re-opened it without changing the value of the command, they would see the
			// old value instead of the actual value of the command.
			// https://github.com/ckeditor/ckeditor5-image/issues/114
			labeledInput.value = labeledInput.inputView.element.value = command.value || '';

			this._form.labeledInput.select();
		}
	}

	/**
	 * Hides the form in a balloon.
	 *
	 * @param {Boolean} focusEditable Control whether the editing view is focused afterwards.
	 * @protected
	 */
	_hideForm( focusEditable ) {
		const editor = this.editor;
		const balloon = editor.plugins.get( 'ImageBalloon' );

		if ( balloon.hasView( this._form ) ) {
			balloon.remove( this._form );

			if ( focusEditable ) {
				editor.editing.view.focus();
			}
		}
	}

	/**
	 * Returns `true` when the {@link _form} is the visible view
	 * in {@link module:image/ui/imageballoon~ImageBalloon}.
	 *
	 * @protected
	 * @type {Boolean}
	 */
	get _isVisible() {
		return this.editor.plugins.get( 'ImageBalloon' ).visibleView == this._form;
	}
}
