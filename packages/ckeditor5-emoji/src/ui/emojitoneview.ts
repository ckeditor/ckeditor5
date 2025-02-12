/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojitoneview
 */

import {
	createDropdown,
	addListToDropdown,
	View,
	ViewModel,
	type ButtonExecuteEvent,
	type DropdownView,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui.js';
import { Collection, type Locale } from 'ckeditor5/src/utils.js';
import type { SkinToneId } from '../emojiconfig.js';
import type { SkinTone } from '../emojirepository.js';

import '../../theme/emojitone.css';

/**
 * A view responsible for selecting a skin tone for an emoji.
 */
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
	public readonly dropdownView: DropdownView;

	/**
	 * An array of available skin tones.
	 */
	private readonly _skinTones: Array<SkinTone>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, { skinTone, skinTones }: { skinTone: SkinToneId; skinTones: Array<SkinTone> } ) {
		super( locale );

		this.set( 'skinTone', skinTone );
		this._skinTones = skinTones;

		const t = locale.t;
		const accessibleLabel = t( 'Select skin tone' );

		const dropdownView = createDropdown( locale );
		const itemDefinitions: Collection<ListDropdownItemDefinition> = new Collection();

		for ( const { id, icon, tooltip } of this._skinTones ) {
			const def: ListDropdownItemDefinition = {
				type: 'button',
				model: new ViewModel( {
					value: id,
					label: icon,
					ariaLabel: tooltip,
					tooltip,
					tooltipPosition: 'e',
					role: 'menuitemradio',
					withText: true,
					// To improve accessibility, disconnect a button and its label connection so that screen
					// readers can read the `[aria-label]` attribute directly from the more descriptive button.
					ariaLabelledBy: undefined
				} )
			};

			def.model.bind( 'isOn' ).to( this, 'skinTone', value => value === id );

			itemDefinitions.add( def );
		}

		addListToDropdown(
			dropdownView,
			itemDefinitions,
			{
				ariaLabel: accessibleLabel,
				role: 'menu'
			}
		);

		dropdownView.buttonView.set( {
			label: this._getSkinTone().icon,
			ariaLabel: accessibleLabel,
			ariaLabelledBy: undefined,
			isOn: false,
			withText: true,
			tooltip: accessibleLabel
		} );

		this.dropdownView = dropdownView;

		// Execute command when an item from the dropdown is selected.
		this.listenTo<ButtonExecuteEvent>( dropdownView, 'execute', evt => {
			this.skinTone = ( evt.source as any ).value;
		} );

		dropdownView.buttonView.bind( 'label' ).to( this, 'skinTone', () => {
			return this._getSkinTone().icon;
		} );

		dropdownView.buttonView.bind( 'ariaLabel' ).to( this, 'skinTone', () => {
			// Render a current state, but also what the dropdown does.
			return `${ this._getSkinTone().tooltip }, ${ accessibleLabel }`;
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji__skin-tone' ]
			},
			children: [ dropdownView ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.dropdownView.buttonView.focus();
	}

	/**
	 * Helper method for receiving an object describing the active skin tone.
	 */
	private _getSkinTone(): SkinTone {
		return this._skinTones.find( tone => tone.id === this.skinTone )!;
	}
}
