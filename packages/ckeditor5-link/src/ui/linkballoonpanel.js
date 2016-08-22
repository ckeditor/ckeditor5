/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Model from '../../ui/model.js';
import Button from '../../ui/button/button.js';
import ButtonView from '../../ui/button/buttonview.js';
import BalloonPanel from './balloonpanel.js';
import LabeledInput from './labeledinput.js';
import LabeledInputView from './labeledinputview.js';
import Box from './box.js';
import BoxView from './boxview.js';

/**
 * The link balloon panel controller class.
 *
 * @memberOf link.ui
 * @extends ui.Controller
 */
export default class LinkBalloonPanel extends BalloonPanel {
	/**
	 * Creates an instance of {@link ui.dropdown.Dropdown} class.
	 *
	 * @param {ui.balloonPanel.BalloonPanelModel} model Model of this balloon panel.
	 * @param {ui.View} view View of this balloon panel.
	 */
	constructor( model, view ) {
		super( model, view );

		const contentCollection = this.collections.get( 'content' );

		contentCollection.add( this._createLabeledInput() );
		contentCollection.add( this._createButtons() );
	}

	_createLabeledInput() {
		const t = this.view.t;
		const model = new Model( {
			label: t( 'Link URL' )
		} );

		model.bind( 'value' ).to( this.model, 'url' );

		const labeledInput = new LabeledInput( model, new LabeledInputView( this.locale ) );

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.urlInput = labeledInput.input;

		return labeledInput;
	}

	_createButtons() {
		const box = new Box( new Model( {
			alignRight: true
		} ), new BoxView( this.locale ) );

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.saveButton = this._createSaveButton();

		/**
		 * TODO
		 *
		 * @member {} todo
		 */
		this.cancelButton = this._createCancelButton();

		box.add( 'content', this.cancelButton );
		box.add( 'content', this.saveButton );

		return box;
	}

	_createSaveButton() {
		const t = this.view.t;
		const model = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Save' ),
			withText: true
		} );

		model.on( 'execute', () => {
			this.model.url = this.urlInput.value;
			this.view.hide();
		} );

		const button = new Button( model, new ButtonView( this.locale ) );
		button.view.element.classList.add( 'ck-button-action' );

		return button;
	}

	_createCancelButton() {
		const t = this.view.t;
		const model = new Model( {
			isEnabled: true,
			isOn: false,
			label: t( 'Cancel' ),
			withText: true
		} );

		model.on( 'execute', () => this.view.hide() );

		return new Button( model, new ButtonView( this.locale ) );
	}
}
