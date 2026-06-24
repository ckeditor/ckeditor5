/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/mediaembedstyleui
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { ButtonView, createDropdown, addToolbarToDropdown, SplitButtonView } from '@ckeditor/ckeditor5-ui';
import { logWarning } from '@ckeditor/ckeditor5-utils';
import { MediaEmbedStyleEditing } from './mediaembedstyleediting.js';
import { type MediaEmbedStyleCommand } from './mediaembedstylecommand.js';
import { DEFAULT_DROPDOWN_DEFINITIONS } from './constants.js';
import { isMediaStyleDropdown } from './utils.js';
import type { MediaStyleDropdownDefinition } from '../mediaembedconfig.js';

/**
 * Definition of a single alignment button registered by `MediaEmbedStyleUI`.
 */
type ButtonDefinition = {
	name: string;
	label: string;
	icon: string;
};

/**
 * The media embed style UI plugin.
 *
 * It registers a button for every style in the resolved
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#styles `config.mediaEmbed.styles`}
 * list, and the default split-button dropdowns (`mediaEmbed:wrapText`, `mediaEmbed:breakText`)
 * — filtered to the styles that survived configuration. The resulting components can be placed
 * in the {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar media embed toolbar}.
 */
export class MediaEmbedStyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ MediaEmbedStyleEditing ]> {
		return [ MediaEmbedStyleEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedStyleUI' as const;
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
		const titles = this._getLocalizedTitles();

		for ( const button of this._getButtonDefinitions( titles ) ) {
			this._createButton( button );
		}

		for ( const dropdown of this._getDropdownDefinitions( titles ) ) {
			this._createDropdown( dropdown );
		}
	}

	/**
	 * Returns the alignment button definitions sourced from the resolved options list.
	 */
	private _getButtonDefinitions( titles: Record<string, string> ): Array<ButtonDefinition> {
		const editing = this.editor.plugins.get( MediaEmbedStyleEditing );

		return editing.normalizedStyles.map( option => ( {
			name: option.name,
			label: titles[ option.title ] || option.title,
			icon: option.icon
		} ) );
	}

	/**
	 * Returns the localized titles of the built-in styles and dropdowns.
	 */
	private _getLocalizedTitles(): Record<string, string> {
		const t = this.editor.t;

		return {
			'Left aligned media': t( 'Left aligned media' ),
			'Centered media': t( 'Centered media' ),
			'Right aligned media': t( 'Right aligned media' ),
			'Wrap text': t( 'Wrap text' ),
			'Break text': t( 'Break text' )
		};
	}

	/**
	 * Returns the split-button dropdown definitions, filtered to the styles present in the
	 * resolved options list. Combines the {@link module:media-embed/mediaembedstyle/constants~DEFAULT_DROPDOWN_DEFINITIONS
	 * built-in dropdowns} with custom dropdowns declared inline in
	 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar `config.mediaEmbed.toolbar`}.
	 *
	 * A dropdown with fewer than two items is skipped — a single-item dropdown carries no value
	 * over the flat button. If the configured `defaultItem` was filtered out, the first surviving
	 * item becomes the default.
	 *
	 * When a *custom* dropdown's items reference styles that are not in the resolved options list,
	 * a console warning is emitted (the integrator's config was not fully honored). Built-in
	 * dropdowns auto-skip silently — they are added by the plugin, not the integrator.
	 */
	private _getDropdownDefinitions( titles: Record<string, string> ): Array<MediaStyleDropdownDefinition> {
		const editor = this.editor;
		const editing = editor.plugins.get( MediaEmbedStyleEditing );
		const availableComponentNames = new Set(
			editing.normalizedStyles.map( ( { name } ) => `mediaEmbed:${ name }` )
		);

		const dropdowns: Array<MediaStyleDropdownDefinition> = [];

		const resolveDropdown = ( definition: MediaStyleDropdownDefinition, warnOnFilter: boolean ): void => {
			const items = definition.items.filter( itemName => availableComponentNames.has( itemName ) );

			if ( warnOnFilter && items.length !== definition.items.length ) {
				warnInvalidDropdown( { dropdown: definition } );
			}

			if ( items.length < 2 ) {
				return;
			}

			const defaultItem = availableComponentNames.has( definition.defaultItem ) ?
				definition.defaultItem :
				items[ 0 ];

			dropdowns.push( {
				name: definition.name,
				title: titles[ definition.title ] || definition.title,
				items,
				defaultItem
			} );
		};

		for ( const definition of DEFAULT_DROPDOWN_DEFINITIONS ) {
			resolveDropdown( definition, false );
		}

		for ( const definition of this._collectCustomDropdowns() ) {
			resolveDropdown( definition, true );
		}

		return dropdowns;
	}

	/**
	 * Scans `config.mediaEmbed.toolbar` for entries shaped like a dropdown definition
	 * (objects with both `items` and `defaultItem`) and returns the valid ones. `defaultItem`
	 * is the discriminator between our split-button dropdowns and generic toolbar groupings
	 * (which use `items` + `label` and have no `defaultItem`).
	 *
	 * Invalid entries (wrong name prefix, `defaultItem` missing from `items`) are warned and
	 * dropped here. Items that reference filtered-out styles are filtered later by
	 * {@link #_getDropdownDefinitions}, alongside the same logic that applies to built-in
	 * dropdowns.
	 */
	private _collectCustomDropdowns(): Array<MediaStyleDropdownDefinition> {
		const toolbarConfig = this.editor.config.get( 'mediaEmbed.toolbar' ) || [];

		return toolbarConfig.filter( ( item ): item is MediaStyleDropdownDefinition =>
			isMediaStyleDropdown( item ) && isValidCustomDropdown( item )
		);
	}

	/**
	 * Registers a single alignment toggle button in the component factory.
	 */
	private _createButton( definition: ButtonDefinition ): void {
		const editor = this.editor;
		const componentName = `mediaEmbed:${ definition.name }`;

		editor.ui.componentFactory.add( componentName, locale => {
			const command: MediaEmbedStyleCommand = editor.commands.get( 'mediaStyle' )!;
			const view = new ButtonView( locale );

			view.set( {
				label: definition.label,
				icon: definition.icon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			view.bind( 'isOn' ).to( command, 'value', value => value === definition.name );

			view.on( 'execute', () => {
				editor.execute( 'mediaStyle', { value: definition.name } );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}

	/**
	 * Registers a split-button dropdown grouping a set of alignment buttons. The action button
	 * reflects whichever child option is currently `isOn`, falling back to the dropdown's
	 * `defaultItem` when nothing is active.
	 */
	private _createDropdown( definition: MediaStyleDropdownDefinition ): void {
		const editor = this.editor;
		const factory = editor.ui.componentFactory;

		factory.add( definition.name, locale => {
			// Build child buttons via the factory; pick the default by name.
			const buttonViews = definition.items.map(
				itemName => factory.create( itemName ) as ButtonView
			);
			const defaultButton = buttonViews[ definition.items.indexOf( definition.defaultItem ) ];

			// Resolve the currently-active child or fall back to the default. Used by the
			// reactive `icon` and `label` bindings on the split button.
			const activeOrDefault = ( ...areOn: Array<boolean> ): ButtonView => {
				const index = areOn.findIndex( Boolean );

				return index < 0 ? defaultButton : buttonViews[ index ];
			};

			// Build the dropdown shell.
			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView as SplitButtonView;

			addToolbarToDropdown( dropdownView, buttonViews, { enableActiveItemFocusOnDropdownOpen: true } );

			splitButtonView.set( {
				label: getDropdownButtonTitle( definition.title, defaultButton.label! ),
				class: null,
				tooltip: true
			} );

			splitButtonView.arrowView.unbind( 'label' );
			splitButtonView.arrowView.set( { label: definition.title } );

			// Reactive: action button mirrors the active child's icon and label.
			splitButtonView.bind( 'icon' ).toMany( buttonViews, 'isOn',
				( ...areOn ) => activeOrDefault( ...areOn ).icon
			);

			splitButtonView.bind( 'label' ).toMany( buttonViews, 'isOn',
				( ...areOn ) => getDropdownButtonTitle( definition.title, activeOrDefault( ...areOn ).label! )
			);

			// Reactive: split button shows the "active" state when any child is on.
			splitButtonView.bind( 'isOn' ).toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( Boolean ) );

			splitButtonView.bind( 'class' ).toMany( buttonViews, 'isOn',
				( ...areOn ) => areOn.some( Boolean ) ? 'ck-splitbutton_flatten' : undefined
			);

			// Action click: re-fire the default child when nothing is active; otherwise toggle the dropdown.
			this.listenTo( splitButtonView, 'execute', () => {
				if ( buttonViews.some( ( { isOn } ) => isOn ) ) {
					dropdownView.isOpen = !dropdownView.isOpen;
				} else {
					defaultButton.fire( 'execute' );
				}
			} );

			// Reactive: dropdown is enabled when any child is enabled.
			dropdownView.bind( 'isEnabled' ).toMany( buttonViews, 'isEnabled',
				( ...areEnabled ) => areEnabled.some( Boolean )
			);

			// Refocus the editing view so the dropdown action doesn't steal caret position.
			this.listenTo( dropdownView, 'execute', () => {
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}
}

/**
 * Combines the dropdown title and the default action item label for the split-button label.
 */
function getDropdownButtonTitle( dropdownTitle: string, buttonTitle: string ): string {
	return `${ dropdownTitle }: ${ buttonTitle }`;
}

/**
 * Validates a user-supplied dropdown definition. Emits a console warning under
 * `media-style-configuration-definition-invalid` and returns `false` when any of these rules is
 * broken: `name` must start with `mediaEmbed:`, `title` must be a non-empty string, `items` must
 * be non-empty and every entry must be a `mediaEmbed:`-prefixed string, and `defaultItem` must be
 * one of the `items`.
 *
 * Item-membership against the resolved styles is checked separately, downstream, alongside the
 * same logic that applies to built-in dropdowns.
 */
function isValidCustomDropdown( definition: MediaStyleDropdownDefinition ): boolean {
	const valid =
		definition.name.startsWith( 'mediaEmbed:' ) &&
		typeof definition.title === 'string' && definition.title.length > 0 &&
		definition.items.length > 0 &&
		definition.items.every( name => typeof name === 'string' && name.startsWith( 'mediaEmbed:' ) ) &&
		definition.items.includes( definition.defaultItem );

	if ( !valid ) {
		warnInvalidDropdown( { dropdown: definition } );
	}

	return valid;
}

/**
 * Emits a console warning under `media-style-configuration-definition-invalid` for an invalid
 * or partially-honored dropdown definition. Called from {@link ~isValidCustomDropdown} for
 * structural problems and from {@link MediaEmbedStyleUI#_getDropdownDefinitions} when items
 * reference styles that are not in the resolved options list.
 */
function warnInvalidDropdown( info: object ): void {
	logWarning( 'media-style-configuration-definition-invalid', info );
}
