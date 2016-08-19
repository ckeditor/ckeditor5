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
		buttonModel.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

		// Execute command.
		const hrefValue = 'http://www.cksource.com'; // Temporary href value.
		this.listenTo( buttonModel, 'execute', () => editor.execute( 'link', hrefValue ) );

		// Add link button to feature components.
		editor.ui.featureComponents.add( 'link', ButtonController, ButtonView, buttonModel );
	}

	_createBalloonPanel() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const editableViewElement = editor.ui.editable.view.element;
		const t = editor.t;

		// Create panel model.
		const balloonPanelModel = new Model( {
			maxWidth: 300
		} );

		this.balloonPanel = new LinkBalloonPanel( balloonPanelModel, new LinkBalloonPanelView( t ) );

		editor.ui.add( 'body', this.balloonPanel );

		this.balloonPanel.view.element.innerHTML = 'LinkBalloonPanel';

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
				const selection = document.getSelection();

				if ( selection && selection.rangeCount ) {
					this.balloonPanel.view.attachTo( selection.getRangeAt( 0 ), editableViewElement );
				}
			}
		}, this );

		editingView.on( 'blur', () => this.balloonPanel.view.hide() );
	}
}
