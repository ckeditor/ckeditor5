/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojitoneview
 */

import {
	createDropdown,
	addToolbarToDropdown,
	ListItemButtonView,
	View,
	ViewCollection,
	DropdownButtonView
} from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
import type { SkinToneId } from '../emojiconfig.js';
import type { SkinTone } from '../emojidatabase.js';

import '../../theme/emojitone.css';

export default class EmojiToneView extends View {
	/**
	 * Active skin tone.
	 *
	 * @observable
	 */
	declare public skinTone: SkinToneId;

	/**
	 * A dropdown element for selecting an active skin tone.
	 */
	public readonly mainDropdownButton: DropdownButtonView;

	/**
	 * Option elements to select an active tone.
	 */
	public readonly dropdownButtons: ViewCollection<ListItemButtonView>;

	/**
	 * An array of available skin tones.
	 */
	private readonly _skinTones: Array<SkinTone>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, { skinTone, skinTones }: { skinTone: SkinToneId; skinTones: Array<SkinTone> } ) {
		super( locale );

		const t = locale.t;

		this.set( 'skinTone', skinTone );

		this._skinTones = skinTones;
		this.mainDropdownButton = new DropdownButtonView();

		const dropdownView = createDropdown( locale, this.mainDropdownButton );

		this.dropdownButtons = new ViewCollection(
			this._skinTones.map( ( { id, icon, tooltip } ) => this._createButton( locale, id, icon, tooltip ) )
		);

		this.mainDropdownButton.withText = true;
		this.mainDropdownButton.label = this._getSkinTone( this.skinTone ).icon;
		this.mainDropdownButton.tooltip = t( 'Select skin tone' );

		/* eslint-disable max-len */
		// TODO: `addListToDropdown()` instead.
		// Example: https://github.com/ckeditor/ckeditor5/blob/6eca87a05212e01c7067426d41dc21a3a73543af/packages/ckeditor5-heading/src/headingui.ts#L96
		/* eslint-enable max-len */
		addToolbarToDropdown(
			dropdownView,
			this.dropdownButtons,
			{
				isVertical: true,
				isCompact: true,
				enableActiveItemFocusOnDropdownOpen: true,
				ariaLabel: t( 'Skin tone toolbar' )
			}
		);

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji-tone' ]
			},
			children: [ dropdownView ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.mainDropdownButton.focus();
	}

	/**
	 * Helper method for creating the button view element.
	 */
	private _createButton( locale: Locale, buttonSkinToneId: SkinToneId, icon: string, tooltip: string ): ListItemButtonView {
		const buttonView = new ListItemButtonView( locale );

		buttonView.set( {
			label: icon,
			withText: true,
			tooltip,
			tooltipPosition: 'e',
			hasCheckSpace: true,
			isToggleable: true
		} );

		buttonView.bind( 'isOn' ).to( this, 'skinTone', newSkinToneId => newSkinToneId === buttonSkinToneId );

		// Execute command.
		this.listenTo( buttonView, 'execute', () => {
			this.skinTone = buttonSkinToneId;
			this.mainDropdownButton.label = this._getSkinTone( buttonSkinToneId ).icon;
		} );

		return buttonView;
	}

	/**
	 * Helper method for receiving an object describing the active skin tone.
	 */
	private _getSkinTone( skinToneId: SkinToneId ): SkinTone {
		return this._skinTones.find( tone => tone.id === skinToneId )!;
	}
}
