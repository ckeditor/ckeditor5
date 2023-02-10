/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharactersnavigationview
 */

import { Collection, type Locale } from 'ckeditor5/src/utils';
import {
	addListToDropdown,
	createDropdown,
	Model,
	FormHeaderView,
	type DropdownView,
	type ListDropdownButtonDefinition
} from 'ckeditor5/src/ui';

/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 */
export default class SpecialCharactersNavigationView extends FormHeaderView {
	/**
	 * A dropdown that allows selecting a group of special characters to be displayed.
	 */
	public groupDropdownView: DropdownView;

	/**
	 * Name of the currectly selected character group.
	 *
	 * @observable
	 */
	declare public value: string;

	/**
	 * Creates an instance of the {@link module:special-characters/ui/specialcharactersnavigationview~SpecialCharactersNavigationView}
	 * class.
	 *
	 * @param locale The localization services instance.
	 * @param groupNames The names of the character groups and their displayed labels.
	 */
	constructor( locale: Locale, groupNames: GroupNames ) {
		super( locale );

		const t = locale.t;
		const groupDefinitions = this._getCharacterGroupListItemDefinitions( groupNames );

		this.set( 'value', groupDefinitions.first!.model.name as string );
		this.set( 'class', 'ck-special-characters-navigation' );
		this.groupDropdownView = this._createGroupDropdown( groupNames, groupDefinitions );
		this.groupDropdownView.panelPosition = locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw';
		this.label = t( 'Special characters' );
		this.children.add( this.groupDropdownView );
	}

	/**
	 * Returns the name of the character group currently selected in the {@link #groupDropdownView}.
	 */
	public get currentGroupName(): string {
		return this.value;
	}

	/**
	 * Focuses the character categories dropdown.
	 */
	public focus(): void {
		this.groupDropdownView.focus();
	}

	/**
	 * Returns a dropdown that allows selecting character groups.
	 *
	 * @param groupNames The names of the character groups and their displayed labels.
	 * @param groupDefinitions Definitions used in the character group dropdown to represent character groups.
	 */
	private _createGroupDropdown(
		groupNames: GroupNames,
		groupDefinitions: Collection<ListDropdownButtonDefinition>
	): DropdownView {
		const locale = this.locale;
		const t = locale!.t;
		const dropdown = createDropdown( locale );

		dropdown.buttonView.bind( 'label' ).to( this, 'value', value => groupNames.get( value ) );

		dropdown.buttonView.set( {
			isOn: false,
			withText: true,
			tooltip: t( 'Character categories' ),
			class: [ 'ck-dropdown__button_label-width_auto' ]
		} );

		dropdown.on( 'execute', evt => {
			this.value = ( evt.source as Model ).name as string;
		} );

		dropdown.delegate( 'execute' ).to( this );

		addListToDropdown( dropdown, groupDefinitions );

		return dropdown;
	}

	/**
	 * Returns list item definitions to be used in the character group dropdown
	 * representing specific character groups.
	 *
	 * @param groupNames The names of the character groups and their displayed labels.
	 */
	private _getCharacterGroupListItemDefinitions( groupNames: GroupNames ): Collection<ListDropdownButtonDefinition> {
		const groupDefs = new Collection<ListDropdownButtonDefinition>();

		for ( const [ name, label ] of groupNames ) {
			const model = new Model( {
				name,
				label,
				withText: true
			} );

			model.bind( 'isOn' ).to( this, 'value', value => value === model.name );

			groupDefs.add( { type: 'button', model } );
		}

		return groupDefs;
	}
}

/**
 * The names of the character groups and their displayed labels.
 */
export type GroupNames = Map<string, string>;
