/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimageui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Image from '@ckeditor/ckeditor5-image/src/image';
import LinkUI from './linkui';
import LinkEditing from './linkediting';

import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

const linkKeystroke = 'Ctrl+K';
import linkIcon from '../theme/icons/link.svg';

import '../theme/linkimageui.css';

/**
 * The link image UI plugin.
 *
 * TODO: Docs.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkImageUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Image, LinkEditing, LinkUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LinkImageUI';
	}

	init() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		// TODO
		this.linkButtonView = null;
		// TODO
		this.actionsView = null;

		// TODO
		this._linkCommand = editor.commands.get( 'link' );
		// TODO
		this._linkUIPlugin = editor.plugins.get( 'LinkUI' );

		this.listenTo( viewDocument, 'click', ( evt, data ) => {
			const hasLink = this._isImageLinked( editor.model.document.selection.getSelectedElement() );

			if ( hasLink ) {
				data.preventDefault();
			}
		} );

		this._createToolbarLinkImageButton();
	}

	/**
	 * Creates a LinkImageUI view containing {@link #linkButtonView} and {@link #actionsView}.
	 * Clicking on {@link #linkButtonView} will show a {@link module:link/linkui~LinkUI#_balloon} attached to the selection.
	 * When image is already linked, the view shows {@link #actionsView} instead.
	 *
	 * @private
	 */
	_createToolbarLinkImageButton() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'linkImage', locale => {
			const view = new View( locale );
			const button = new ButtonView( locale );
			const actionsView = this._linkUIPlugin._createActionsView();

			button.isEnabled = true;
			button.label = t( 'Link image' );
			button.icon = linkIcon;
			button.keystroke = linkKeystroke;
			button.tooltip = true;
			button.isToggleable = true;

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( this._linkCommand, 'isEnabled' );
			button.bind( 'isOn' ).to( this._linkCommand, 'value', value => !!value );
			button.bind( 'hasLink' ).to( this, 'hasLink' );

			actionsView.bind( 'isVisible' ).to( actionsView, 'href' );
			actionsView.extendTemplate( {
				attributes: {
					class: [ actionsView.bindTemplate.if( 'isVisible', 'ck-hidden', value => !value ) ]
				}
			} );

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => this._linkUIPlugin._showUI( true ) );

			view.setTemplate( {
				tag: 'div',
				attributes: {
					class: 'ck-link-image-options'
				},
				children: [
					button,
					actionsView
				]
			} );

			// EVENT HIJACK ALLEY.
			// Listen to the selection change for the proper UI state handling before toolbar is visible.
			this.listenTo( editor.model.document.selection, 'change:range', () => {
				const hasLink = this._isImageLinked( editor.model.document.selection.getSelectedElement() );

				button.isVisible = !hasLink;
				actionsView.isVisible = hasLink;
			} );

			// Toggle the proper state of the plugin UI after clicking the "Save" button.
			this.listenTo( this._linkUIPlugin.formView, 'submit', () => {
				this._linkUIPlugin._hideUI();

				actionsView.isVisible = true;
				button.isVisible = false;
			} );

			// Toggle the proper state of the plugin UI after clicking the "Cancel" button.
			this.listenTo( this._linkUIPlugin.formView, 'cancel', () => {
				this._linkUIPlugin._hideUI();

				actionsView.isVisible = true;
				button.isVisible = false;
			} );

			// Toggle the proper state of the plugin UI after clicking the "Unlink" button.
			this.listenTo( actionsView, 'unlink', () => {
				this._linkUIPlugin._hideUI();

				actionsView.isVisible = false;
				button.isVisible = true;
			} );

			this.linkButtonView = button;
			this.actionsView = actionsView;

			return view;
		} );
	}

	_isImageLinked( element ) {
		if ( !( element && element.is( 'image' ) ) ) {
			return false;
		}

		return element && element.hasAttribute( 'linkHref' );
	}
}
