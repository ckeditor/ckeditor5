/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharacterscategoriesview
 */

import { type Locale, Collection } from 'ckeditor5/src/utils.js';
import {
	addListToDropdown,
	createLabeledDropdown,
	LabeledFieldView,
	View,
	ViewModel,
	type DropdownView,
	type ListDropdownItemDefinition
} from 'ckeditor5/src/ui.js';

/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 */
export default class SpecialCharactersCategoriesView extends View {
	/**
	 * Currently selected special characters group's name.
	 */
	declare public currentGroupName: string;

	private _groupNames: Map<string, string>;

	private _dropdownView: LabeledFieldView<DropdownView>;

	/**
	 * Creates an instance of the {@link module:special-characters/ui/specialcharacterscategoriesview~SpecialCharactersCategoriesView}
	 * class.
	 *
	 * @param locale The localization services instance.
	 * @param groupNames The names of the character groups.
	 */
	constructor( locale: Locale, groupNames: Map<string, string> ) {
		super( locale );

		this.set( 'currentGroupName', Array.from( groupNames.entries() )[ 0 ][ 0 ] );
		this._groupNames = groupNames;
		this._dropdownView = new LabeledFieldView( locale, createLabeledDropdown );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-character-categories' ]
			},
			children: [
				this._dropdownView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this._setupDropdown();
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this._dropdownView.focus();
	}

	/**
	 * Creates dropdown item list, sets up bindings and fills properties.
	 */
	private _setupDropdown(): void {
		const items = new Collection<ListDropdownItemDefinition>();

		for ( const [ name, label ] of this._groupNames ) {
			const item: ListDropdownItemDefinition = {
				type: 'button',
				model: new ViewModel( {
					name,
					label,
					withText: true
				} )
			};

			item.model.bind( 'isOn' ).to( this, 'currentGroupName', value => {
				return value === name;
			} );

			items.add( item );
		}

		const t = this.locale!.t;
		const accessibleLabel = t( 'Category' );

		this._dropdownView.set( {
			label: accessibleLabel,
			isEmpty: false
		} );

		this._dropdownView.fieldView.panelPosition = this.locale!.uiLanguageDirection === 'rtl' ? 'se' : 'sw';

		this._dropdownView.fieldView.buttonView.set( {
			withText: true,
			tooltip: accessibleLabel,
			ariaLabel: accessibleLabel,
			ariaLabelledBy: undefined,
			isOn: false
		} );
		this._dropdownView.fieldView.buttonView.bind( 'label' )
			.to( this, 'currentGroupName', value => this._groupNames.get( value )! );
		this._dropdownView.fieldView.on( 'execute', ( { source } ) => {
			this.currentGroupName = ( source as ViewModel ).name as string;
		} );

		addListToDropdown( this._dropdownView.fieldView, items, {
			ariaLabel: accessibleLabel,
			role: 'menu'
		} );
	}
}
