/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import Model from '../ui/model.js';

import LinkEngine from './linkengine.js';

import ButtonController from '../ui/button/button.js';
import ButtonView from '../ui/button/buttonview.js';

import LinkBalloonPanel from './ui/linkballoonpanel.js';
import LinkBalloonPanelView from './ui/linkballoonpanelview.js';

/**
 * The link feature.
 *
 * It uses the {@link basic-styles.LinkEngine link engine feature}.
 *
 * @memberOf link
 * @extends core.Feature
 */
export default class Link extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ LinkEngine ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._createButtons();
		this._createBalloonPanel();
	}

	_createButtons() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( 'link' );

		// Create button model.
		const buttonModel = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Link' ),
			icon: 'link'
		} );

		// Bind button model to command.
		buttonModel.bind( 'isOn', 'isEnabled' ).to( command, 'isValue', 'isEnabled' );

		// Execute command.
		const hrefValue = 'http://www.cksource.com'; // Temporary href value.
		this.listenTo( buttonModel, 'execute', () => editor.execute( 'link', hrefValue ) );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'link', ButtonController, ButtonView, buttonModel );
	}

	_createBalloonPanel() {
		const editor = this.editor;
		const t = editor.t;
		const editingView = editor.editing.view;
		const editableViewElement = editor.ui.editable.view.element;

		// Create the model of the panel.
		const panelModel = new Model( {
			maxWidth: 300,
			url: 'http://example.com'
		} );

		// Observe #execute event from within the model of the panel, which means that
		// the "Save" button has been clicked.
		this.listenTo( panelModel, 'execute', () => {
			const urlValue = this.balloonPanel.urlInput.value;

			// TODO: validate panelModel#url with some RegExp imported from v4.
			if ( urlValue ) {
				/* global console */
				console.log( `URL "${ urlValue }" to be set.` );
				this.balloonPanel.view.hide();
			} else {
				window.alert( t( `"${ urlValue }" URL address is incorrect.` ) );
				this.balloonPanel.urlInput.view.focus();
			}
		} );

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.balloonPanel = new LinkBalloonPanel( panelModel, new LinkBalloonPanelView( editor.locale ) );

		editingView.on( 'render', () => {
			const firstParent = editingView.selection.getFirstPosition().parent;
			const firstParentAncestors = firstParent.getAncestors();
			const anchor = firstParentAncestors.find( ( ancestor ) => ancestor.name === 'a' );

			if ( anchor ) {
				this.balloonPanel.view.attachTo(
					editingView.domConverter.getCorrespondingDomElement( anchor ),
					editableViewElement
				);
			} else {
				this.balloonPanel.view.attachTo(
					editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ),
					editableViewElement
				);
			}

			this.balloonPanel.urlInput.view.focus();
		}, this );

		// TODO: It's a lame FocusManager.
		editingView.on( 'blur', ( evt, domEvtData ) => {
			if ( domEvtData.domEvent.relatedTarget === this.balloonPanel.urlInput ) {
				domEvtData.domEvent.preventDefault();
			} else {
				this.balloonPanel.view.hide();
			}
		} );

		editor.ui.add( 'body', this.balloonPanel );
	}
}
