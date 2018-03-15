/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import '../theme/heading.css';

/**
 * The headings UI feature. It introduces the `headings` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HeadingUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const options = this._getLocalizedOptions();
		const defaultTitle = t( 'Choose heading' );
		const dropdownTooltip = t( 'Heading' );

		// Register UI component.
		editor.ui.componentFactory.add( 'heading', locale => {
			const titles = {};
			const dropdownItems = new Collection();

			const headingCommand = editor.commands.get( 'heading' );
			const paragraphCommand = editor.commands.get( 'paragraph' );

			const commands = [ headingCommand ];

			for ( const option of options ) {
				const itemModel = new Model( {
					label: option.title,
					class: option.class
				} );

				if ( option.model === 'paragraph' ) {
					itemModel.bind( 'isActive' ).to( paragraphCommand, 'value' );
					itemModel.set( 'commandName', 'paragraph' );
					commands.push( paragraphCommand );
				} else {
					itemModel.bind( 'isActive' ).to( headingCommand, 'value', value => value === option.model );
					itemModel.set( {
						commandName: 'heading',
						commandValue: option.model
					} );
				}

				// Add the option to the collection.
				dropdownItems.add( itemModel );

				titles[ option.model ] = option.title;
			}

			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, dropdownItems );

			dropdownView.buttonView.set( {
				isOn: false,
				withText: true,
				tooltip: dropdownTooltip
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: [
						'ck-heading-dropdown'
					]
				}
			} );

			dropdownView.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( ...areEnabled ) => {
				return areEnabled.some( isEnabled => isEnabled );
			} );

			dropdownView.buttonView.bind( 'label' ).to( headingCommand, 'value', paragraphCommand, 'value', ( value, para ) => {
				const whichModel = value || para && 'paragraph';
				// If none of the commands is active, display default title.
				return titles[ whichModel ] ? titles[ whichModel ] : defaultTitle;
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( evt.source.commandName, evt.source.commandValue ? { value: evt.source.commandValue } : undefined );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns heading options as defined in `config.heading.options` but processed to consider
	 * editor localization, i.e. to display {@link module:heading/heading~HeadingOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there's no way to use {@link module:utils/locale~Locale#t}
	 * when the user config is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:heading/heading~HeadingOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;
		const localizedTitles = {
			Paragraph: t( 'Paragraph' ),
			'Heading 1': t( 'Heading 1' ),
			'Heading 2': t( 'Heading 2' ),
			'Heading 3': t( 'Heading 3' )
		};

		return editor.config.get( 'heading.options' ).map( option => {
			const title = localizedTitles[ option.title ];

			if ( title && title != option.title ) {
				// Clone the option to avoid altering the original `config.heading.options`.
				option = Object.assign( {}, option, { title } );
			}

			return option;
		} );
	}
}
