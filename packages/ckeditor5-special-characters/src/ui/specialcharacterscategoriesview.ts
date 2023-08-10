/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharacterscategoriesview
 */

import { type Locale, Collection, isVisible, first } from 'ckeditor5/src/utils';
import {
	type DropdownView, type ListDropdownItemDefinition, type ViewCollection,
	ListView,
	ListItemView,
	ButtonView,
	View,
	addListToDropdown,
	Model,
	createDropdown
} from 'ckeditor5/src/ui';

/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 *
 * @extends module:ui/formheader/formheaderview~FormHeaderView
 */
export default class SpecialCharactersCategoriesView extends View {
	/**
	 * TODO
	 */
	declare public currentGroupName: string;

	/**
	 * TODO
	 */
	private _groupNames: Map<string, string>;

	/**
	 * TODO
	 */
	public listView: ListView;

	/**
	 * TODO
	 */
	public dropdownView: DropdownView;

	/**
	 * Creates an instance of the {@link module:special-characters/ui/specialcharacterscategoriesview~SpecialCharactersNavigationView}
	 * class.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {Iterable.<String>} groupNames The names of the character groups.
	 */
	constructor( locale: Locale, groupNames: Map<string, string> ) {
		super( locale );

		this.set( 'currentGroupName', Array.from( groupNames.entries() )[ 0 ][ 0 ] );

		/**
		 * TODO
		 */
		this._groupNames = groupNames;

		/**
		 * TODO
		 */
		this.listView = new ListView( locale );

		/**
		 * TODO
		 */
		this.dropdownView = createDropdown( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-character-categories' ]
			},
			children: [
				this.listView,
				this.dropdownView
			]
		} );
	}

	/**
	 * TODO
	 */
	public override render(): void {
		super.render();

		// TODO: Maybe there's a chance a single component could work both for desktop and mobile?
		this._setupList();
		this._setupDropdown();
	}

	/**
	 * TODO
	 */
	public focus(): void {
		if ( isVisible( this.listView.element ) ) {
			const listItems = ( this.listView.items as ViewCollection<ListItemView> );
			const firstOnItem = listItems.find( ( item: any ) => item.children.first.isOn );
			const firstItem = listItems.first!;

			( firstOnItem || firstItem ).focus();
		} else {
			this.dropdownView.focus();
		}
	}

	/**
	 * TODO
	 */
	private _setupList(): void {
		const locale = this.locale;

		for ( const [ name, label ] of this._groupNames ) {
			const listItemView = new ListItemView( locale );
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label,
				withText: true
			} );

			buttonView.bind( 'isOn' ).to( this, 'currentGroupName', value => {
				return value === name;
			} );

			buttonView.on( 'execute', () => {
				this.currentGroupName = name;
			} );

			listItemView.children.add( buttonView );

			this.listView.items.add( listItemView );
		}
	}

	/**
	 * TODO
	 */
	private _setupDropdown(): void {
		const items = new Collection<ListDropdownItemDefinition>();

		for ( const [ name, label ] of this._groupNames ) {
			const item: ListDropdownItemDefinition = {
				type: 'button',
				model: new Model( {
					label,
					withText: true
				} )
			};

			item.model.bind( 'isOn' ).to( this, 'currentGroupName', value => {
				return value === name;
			} );

			items.add( item );
		}

		this.dropdownView.buttonView.withText = true;
		this.dropdownView.buttonView.bind( 'label' ).to( this, 'currentGroupName' );
		this.dropdownView.buttonView.tooltip = true;
		this.dropdownView.on( 'execute', ( { source } ) => {
			this.currentGroupName = ( source as ButtonView ).label!;
		} );

		addListToDropdown( this.dropdownView, items );
	}
}
