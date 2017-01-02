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
import BalloonPanelView from 'ckeditor5-ui/src/balloonpanel/balloonpanelview';
import global from 'ckeditor5-utils/src/dom/global';
import { isImageWidget } from './utils';
import throttle from 'ckeditor5-utils/src/lib/lodash/throttle';
import AlternateTextFormView from 'ckeditor5-image/src/ui/alternatetextformview';
import clickOutsideHandler from 'ckeditor5-ui/src/bindings/clickoutsidehandler';
import escPressHandler from 'ckeditor5-ui/src/bindings/escpresshandler';
import alternateTextIcon from 'ckeditor5-core/theme/icons/source.svg';

import '../theme/theme.scss';

const arrowVOffset = BalloonPanelView.arrowVerticalOffset;
const positions = {
	//	   [text range]
	//	        ^
	//	+-----------------+
	//	|     Balloon     |
	//	+-----------------+
	south: ( targetRect, balloonRect ) => ( {
		top: targetRect.bottom + arrowVOffset,
		left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
		name: 's'
	} ),

	//	+-----------------+
	//	|     Balloon     |
	//	+-----------------+
	//	        V
	//	   [text range]
	north: ( targetRect, balloonRect ) => ( {
		top: targetRect.top - balloonRect.height - arrowVOffset,
		left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
		name: 'n'
	} )
};

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
		const panel = this._alternateTextBalloonPanel = new BalloonPanelView( this.editor.locale );
		panel.maxWidth = 300;

		const editingView = editor.editing.view;
		this._attachBalloonPanel = throttle( attachBalloonPanel, 100 );

		return editor.ui.view.body.add( panel ).then( () => {
			// Let the focusTracker know about new focusable UI element.
			editor.ui.focusTracker.add( panel.element );

			// Hide the panel when editor loses focus but no the other way around.
			panel.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, is, was ) => {
				if ( was && !is ) {
					panel.hide();
				}
			} );

			// Hide toolbar when is no longer needed.
			editor.listenTo( editingView, 'render', () => {
				const selectedElement = editingView.selection.getSelectedElement();

				if ( !selectedElement || !isImageWidget( selectedElement ) ) {
					this._hideAlternateTextChangePanel();
				}
			}, { priority: 'low' } );

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

			return panel.content.add( this._alternateTextForm );
		} );

		function attachBalloonPanel() {
			panel.attachTo( {
				target: editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ),
				positions: [ positions.north, positions.south ]
			} );
		}
	}

	_showAlternateTextChangePanel() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const selectedElement = editingView.selection.getSelectedElement();

		if ( selectedElement && isImageWidget( selectedElement ) ) {
			const command = editor.commands.get( 'imageAlternateText' );

			this._alternateTextForm.alternateTextInput.value = command.value || '';

			this._attachBalloonPanel();
			this._alternateTextForm.alternateTextInput.select();

			editor.ui.view.listenTo( global.window, 'scroll', this._attachBalloonPanel );
			editor.ui.view.listenTo( global.window, 'resize', this._attachBalloonPanel );
		}
	}

	_hideAlternateTextChangePanel() {
		const editor = this.editor;

		this._alternateTextBalloonPanel.hide();
		editor.editing.view.focus();

		editor.ui.view.stopListening( global.window, 'scroll', this._attachBalloonPanel );
		editor.ui.view.stopListening( global.window, 'resize', this._attachBalloonPanel );
	}
}
