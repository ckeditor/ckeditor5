/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/mediaembedresizebuttons
 */

import { Plugin, type Editor, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import {
	ButtonView,
	DropdownButtonView,
	UIModel,
	createDropdown,
	addListToDropdown,
	type ListDropdownItemDefinition
} from '@ckeditor/ckeditor5-ui';
import { CKEditorError, Collection, type Locale } from '@ckeditor/ckeditor5-utils';
import {
	IconObjectSizeCustom,
	IconObjectSizeFull,
	IconObjectSizeLarge,
	IconObjectSizeMedium,
	IconObjectSizeSmall
} from '@ckeditor/ckeditor5-icons';

import { MediaEmbedResizeEditing } from './mediaembedresizeediting.js';
import type { ResizeMediaEmbedCommand } from './resizemediaembedcommand.js';
import type { MediaEmbedResizeOption } from '../mediaembedconfig.js';

const RESIZE_ICONS = /* #__PURE__ */ ( () => ( {
	small: IconObjectSizeSmall,
	medium: IconObjectSizeMedium,
	large: IconObjectSizeLarge,
	custom: IconObjectSizeCustom,
	original: IconObjectSizeFull
} ) )();

/**
 * The media embed resize buttons plugin.
 *
 * It adds a possibility to resize media embeds using the toolbar dropdown or individual buttons,
 * depending on the plugin configuration.
 */
export class MediaEmbedResizeButtons extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ MediaEmbedResizeEditing ]> {
		return [ MediaEmbedResizeEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedResizeButtons' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	private readonly _resizeUnit: 'px' | '%';

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._resizeUnit = editor.config.get( 'mediaEmbed.resizeUnit' )!;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const options = editor.config.get( 'mediaEmbed.resizeOptions' )!;
		const command: ResizeMediaEmbedCommand = editor.commands.get( 'resizeMediaEmbed' )!;

		this.bind( 'isEnabled' ).to( command );

		for ( const option of options ) {
			this._registerMediaEmbedResizeButton( option );
		}

		this._registerMediaEmbedResizeDropdown( options );
	}

	/**
	 * Creates a standalone button component for the given resize option.
	 */
	private _registerMediaEmbedResizeButton( option: MediaEmbedResizeOption ): void {
		const editor = this.editor;
		const { name, value, icon } = option;

		editor.ui.componentFactory.add( name, locale => {
			const button = new ButtonView( locale );
			const command: ResizeMediaEmbedCommand = editor.commands.get( 'resizeMediaEmbed' )!;
			const labelText = this._getOptionLabelValue( option, true );

			if ( !RESIZE_ICONS[ icon as keyof typeof RESIZE_ICONS ] ) {
				/**
				 * When configuring {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#resizeOptions
				 * `config.mediaEmbed.resizeOptions`} for standalone buttons, a valid `icon` token must be set for each option.
				 *
				 * See all valid options described in the
				 * {@link module:media-embed/mediaembedconfig~MediaEmbedResizeOption plugin configuration}.
				 *
				 * @error mediaembedresizebuttons-missing-icon
				 * @param {module:media-embed/mediaembedconfig~MediaEmbedResizeOption} option Invalid media embed resize option.
				 */
				throw new CKEditorError(
					'mediaembedresizebuttons-missing-icon',
					editor,
					option
				);
			}

			button.set( {
				label: labelText,
				icon: RESIZE_ICONS[ icon as keyof typeof RESIZE_ICONS ],
				tooltip: labelText,
				isToggleable: true
			} );

			button.bind( 'isEnabled' ).to( this );

			if ( editor.plugins.has( 'MediaEmbedCustomResizeUI' ) && isCustomMediaEmbedResizeOption( option ) ) {
				const customResizeUI = editor.plugins.get( 'MediaEmbedCustomResizeUI' );

				this.listenTo( button, 'execute', () => {
					customResizeUI._showForm( this._resizeUnit );
				} );
			} else {
				const optionValueWithUnit = value ? value + this._resizeUnit : null;

				button.bind( 'isOn' ).to(
					command, 'value',
					command, 'isEnabled',
					getIsOnButtonCallback( optionValueWithUnit )
				);

				this.listenTo( button, 'execute', () => {
					editor.execute( 'resizeMediaEmbed', { width: optionValueWithUnit } );
				} );
			}

			return button;
		} );
	}

	/**
	 * Creates the dropdown component containing all resize options.
	 */
	private _registerMediaEmbedResizeDropdown( options: Array<MediaEmbedResizeOption> ): void {
		const editor = this.editor;
		const t = editor.t;
		const originalSizeOption = options.find( option => !option.value )!;

		const componentCreator = ( locale: Locale ) => {
			const command: ResizeMediaEmbedCommand = editor.commands.get( 'resizeMediaEmbed' )!;
			const dropdownView = createDropdown( locale, DropdownButtonView );
			const dropdownButton: typeof dropdownView.buttonView & { commandValue?: string | null } = dropdownView.buttonView;
			const accessibleLabel = t( 'Resize media' );

			dropdownButton.set( {
				tooltip: accessibleLabel,
				commandValue: originalSizeOption ? originalSizeOption.value : null,
				icon: RESIZE_ICONS.medium,
				isToggleable: true,
				label: originalSizeOption ? this._getOptionLabelValue( originalSizeOption ) : '',
				withText: true,
				class: 'ck-resize-media-embed-button',
				ariaLabel: accessibleLabel,
				ariaLabelledBy: undefined
			} );

			dropdownButton.bind( 'label' ).to( command, 'value', commandValue => {
				if ( commandValue ) {
					return commandValue;
				}

				return originalSizeOption ? this._getOptionLabelValue( originalSizeOption ) : '';
			} );
			dropdownView.bind( 'isEnabled' ).to( this );

			addListToDropdown( dropdownView, () => this._getResizeDropdownListItemDefinitions( options, command ), {
				ariaLabel: t( 'Media resize list' ),
				role: 'menu'
			} );

			this.listenTo( dropdownView, 'execute', evt => {
				if ( 'onClick' in evt.source ) {
					( evt.source as any ).onClick();
				} else {
					editor.execute( ( evt.source as any ).commandName, { width: ( evt.source as any ).commandValue } );
					editor.editing.view.focus();
				}
			} );

			return dropdownView;
		};

		editor.ui.componentFactory.add( 'resizeMediaEmbed', componentCreator );
	}

	/**
	 * Returns a label for the given resize option.
	 */
	private _getOptionLabelValue( option: MediaEmbedResizeOption, forTooltip: boolean = false ): string {
		const t = this.editor.t;

		if ( option.label ) {
			return option.label;
		}

		const isCustom = isCustomMediaEmbedResizeOption( option );

		if ( forTooltip ) {
			if ( isCustom ) {
				return t( 'Custom media size' );
			}

			return option.value ?
				t( 'Resize media to %0', option.value + this._resizeUnit ) :
				t( 'Resize media to the original size' );
		}

		if ( isCustom ) {
			return t( 'Custom' );
		}

		return option.value ?
			option.value + this._resizeUnit :
			t( 'Original' );
	}

	/**
	 * Returns list item definitions for the resize dropdown.
	 */
	private _getResizeDropdownListItemDefinitions(
		options: Array<MediaEmbedResizeOption>,
		command: ResizeMediaEmbedCommand
	): Collection<ListDropdownItemDefinition> {
		const { editor } = this;
		const itemDefinitions = new Collection<ListDropdownItemDefinition>();

		const optionsWithSerializedValues = options.map( option => {
			if ( isCustomMediaEmbedResizeOption( option ) ) {
				return {
					...option,
					valueWithUnits: 'custom'
				};
			}

			if ( !option.value ) {
				return {
					...option,
					valueWithUnits: null
				};
			}

			return {
				...option,
				valueWithUnits: `${ option.value }${ this._resizeUnit }`
			};
		} );

		for ( const option of optionsWithSerializedValues ) {
			let definition: ListDropdownItemDefinition | null = null;

			if ( editor.plugins.has( 'MediaEmbedCustomResizeUI' ) && isCustomMediaEmbedResizeOption( option ) ) {
				const customResizeUI = editor.plugins.get( 'MediaEmbedCustomResizeUI' );

				definition = {
					type: 'button',
					model: new UIModel( {
						label: this._getOptionLabelValue( option ),
						role: 'menuitemradio',
						withText: true,
						icon: null,
						onClick: () => {
							customResizeUI._showForm( this._resizeUnit );
						}
					} )
				};

				const allDropdownValues = Object.values( optionsWithSerializedValues ).map( option => option.valueWithUnits );

				definition.model.bind( 'isOn' ).to(
					command, 'value',
					command, 'isEnabled',
					getIsOnCustomButtonCallback( allDropdownValues )
				);
			} else {
				definition = {
					type: 'button',
					model: new UIModel( {
						commandName: 'resizeMediaEmbed',
						commandValue: option.valueWithUnits,
						label: this._getOptionLabelValue( option ),
						role: 'menuitemradio',
						withText: true,
						icon: null
					} )
				};

				definition.model.bind( 'isOn' ).to(
					command, 'value',
					command, 'isEnabled',
					getIsOnButtonCallback( option.valueWithUnits )
				);
			}

			definition.model.bind( 'isEnabled' ).to( command, 'isEnabled' );
			itemDefinitions.add( definition );
		}

		return itemDefinitions;
	}
}

function isCustomMediaEmbedResizeOption( option: MediaEmbedResizeOption ) {
	return option.value === 'custom';
}

function getIsOnButtonCallback( value: string | null ) {
	return ( commandValue: ResizeMediaEmbedCommand['value'], isEnabled: boolean ): boolean => {
		if ( commandValue === undefined || !isEnabled ) {
			return false;
		}

		return commandValue === value;
	};
}

function getIsOnCustomButtonCallback( allDropdownValues: Array<string | null> ) {
	return ( commandValue: ResizeMediaEmbedCommand['value'], isEnabled: boolean ): boolean => !allDropdownValues.some(
		dropdownValue => getIsOnButtonCallback( dropdownValue )( commandValue, isEnabled )
	);
}
