/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojitoneview
 */

import '../../theme/emojitone.css';

import {
	type Locale
} from 'ckeditor5/src/utils.js';

import {
	createDropdown,
	addToolbarToDropdown,
	ListItemButtonView,

	View,
	ViewCollection,
	DropdownButtonView
} from 'ckeditor5/src/ui.js';

export type SkinToneId = 'default' | 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

type SkinTone = {
	id: SkinToneId;
	example: string;
	tooltip: string;
};

export default class EmojiToneView extends View {
	declare public selectedSkinTone: SkinToneId;

	private _skinTones: Array<SkinTone>;

	private _mainDropdownButton: DropdownButtonView;
	private _dropdownButtons: ViewCollection<ListItemButtonView>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, skinTone: SkinToneId ) {
		super( locale );

		const t = locale.t;

		this.set( 'selectedSkinTone', skinTone );

		this._skinTones = [
			{ id: 'default', example: '👋', tooltip: 'Default skin tone' },
			{ id: 'light', example: '👋🏻', tooltip: 'Light skin tone' },
			{ id: 'medium-light', example: '👋🏼', tooltip: 'Medium Light skin tone' },
			{ id: 'medium', example: '👋🏽', tooltip: 'Medium skin tone' },
			{ id: 'medium-dark', example: '👋🏾', tooltip: 'Medium Dark skin tone' },
			{ id: 'dark', example: '👋🏿', tooltip: 'Dark skin tone' }
		];

		this._mainDropdownButton = new DropdownButtonView();
		const dropdownView = createDropdown( locale, this._mainDropdownButton );
		this._dropdownButtons = new ViewCollection(
			this._skinTones.map( ( { id, example, tooltip } ) => this._createButton( locale, id, example, tooltip ) )
		);

		this._mainDropdownButton.withText = true;
		this._mainDropdownButton.label = this._getSkinTone( this.selectedSkinTone ).example;
		this._mainDropdownButton.tooltip = 'Select skin tone';

		addToolbarToDropdown(
			dropdownView,
			this._dropdownButtons,
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

	public focus(): void {
		this._mainDropdownButton.focus();
	}

	/**
	 * Helper method for creating the button view element.
	 */
	private _createButton( locale: Locale, buttonSkinToneId: SkinToneId, example: string, tooltip: string ): ListItemButtonView {
		const buttonView = new ListItemButtonView( locale );

		buttonView.set( {
			label: example,
			withText: true,
			tooltip,
			tooltipPosition: 'e',
			hasCheckSpace: true,
			isToggleable: true
		} );

		buttonView.bind( 'isOn' ).to( this, 'selectedSkinTone', newSkinToneId => newSkinToneId === buttonSkinToneId );

		// Execute command.
		this.listenTo( buttonView, 'execute', () => {
			this.selectedSkinTone = buttonSkinToneId;

			this._mainDropdownButton.label = this._getSkinTone( buttonSkinToneId ).example;
		} );

		return buttonView;
	}

	private _getSkinTone( skinToneId: SkinToneId ): SkinTone {
		return this._skinTones.find( tone => tone.id === skinToneId )!;
	}
}
