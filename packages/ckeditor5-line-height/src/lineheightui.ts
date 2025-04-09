/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module line-height/lineheightui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import {
	createDropdown,
	addListToDropdown,
	type ListDropdownButtonDefinition,
	ViewModel
} from 'ckeditor5/src/ui.js';
import { Collection } from 'ckeditor5/src/utils.js';
import { IconLineHeight } from 'ckeditor5/src/icons.js';

import { normalizeOptions } from './utils.js';
import { LINE_HEIGHT, type LineHeightOption } from './lineheightconfig.js';
import type LineHeightCommand from './lineheightcommand.js';

import '../theme/lineheight.css';

/**
 * The line height UI plugin. It introduces the `'lineHeight'` dropdown.
 */
export default class LineHeightUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LineHeightUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = editor.t;

		const options = this._getLineHeightOptions();
		const command: LineHeightCommand = editor.commands.get( LINE_HEIGHT )!;
		const accessibleLabel = t( 'Line height' );

		const listOptions = this._prepareListOptions( options, command );

		// Register UI component.
		editor.ui.componentFactory.add( LINE_HEIGHT, locale => {
			const dropdownView = createDropdown( locale );

			addListToDropdown( dropdownView, listOptions, {
				role: 'menu',
				ariaLabel: accessibleLabel
			} );

			// Create dropdown model.
			dropdownView.buttonView.set( {
				label: accessibleLabel,
				tooltip: true,
				icon: IconLineHeight
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: [
						'ck-line-height-dropdown'
					]
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( ( evt.source as any ).commandName, { value: ( evt.source as any ).commandParam } );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns an array of line height options as defined in the editor configuration.
	 */
	private _getLineHeightOptions(): Array<LineHeightOption> {
		const editor = this.editor;
		const configOptions = editor.config.get( 'lineHeight.options' );

		return normalizeOptions( Array.isArray( configOptions ) ? configOptions : [ 0.5, 1, 1.5, 2, 2.5 ] );
	}

	/**
	 * Prepares dropdown items for the line height dropdown.
	 */
	private _prepareListOptions( options: Array<LineHeightOption>, command: LineHeightCommand ): Collection<ListDropdownButtonDefinition> {
		const itemDefinitions = new Collection<ListDropdownButtonDefinition>();

		// Create item for removing the line-height attribute.
		const removeLineHeightButton = {
			type: 'button' as const,
			model: new ViewModel( {
				commandName: LINE_HEIGHT,
				commandParam: undefined,
				label: this.editor.t( 'Default' ),
				class: 'ck-line-height-option',
				withText: true
			} )
		};

		removeLineHeightButton.model.bind( 'isOn' ).to( command, 'value', ( value: unknown ) => !value );
		itemDefinitions.add( removeLineHeightButton );

		// Add options for each line height value.
		for ( const option of options ) {
			const definitionModel = new ViewModel( {
				commandName: LINE_HEIGHT,
				commandParam: option.model,
				label: option.title,
				class: 'ck-line-height-option',
				withText: true
			} );

			definitionModel.bind( 'isOn' ).to( command, 'value', ( value: unknown ) => {
				return value === option.model;
			} );

			const definition = {
				type: 'button' as const,
				model: definitionModel
			};

			itemDefinitions.add( definition );
		}

		return itemDefinitions;
	}
}
