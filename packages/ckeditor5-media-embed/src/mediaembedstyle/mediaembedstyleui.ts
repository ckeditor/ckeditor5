/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/mediaembedstyleui
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { ButtonView, createDropdown, addToolbarToDropdown, SplitButtonView } from '@ckeditor/ckeditor5-ui';
import {
	IconObjectCenter,
	IconObjectInlineLeft,
	IconObjectInlineRight,
	IconObjectLeft,
	IconObjectRight
} from '@ckeditor/ckeditor5-icons';
import { MediaEmbedStyleEditing } from './mediaembedstyleediting.js';
import { type MediaEmbedStyleCommand } from './mediaembedstylecommand.js';
import { DEFAULT_STYLE_NAME, type MediaStyleName } from './constants.js';

/**
 * Definition of a single alignment button registered by `MediaEmbedStyleUI`.
 */
type ButtonDefinition = {
	name: MediaStyleName;
	label: string;
	icon: string;
};

/**
 * Definition of a default split-button dropdown.
 */
type DropdownDefinition = {
	name: string;
	title: string;
	items: Array<MediaStyleName>;
	defaultItem: MediaStyleName;
};

/**
 * The media embed style UI plugin.
 *
 * It registers buttons for each alignment style and the default split-button dropdowns
 * (`mediaEmbed:wrapText` and `mediaEmbed:breakText`) that can be used in the
 * {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#toolbar media embed toolbar}.
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
		for ( const button of this._getButtonDefinitions() ) {
			this._createButton( button );
		}

		for ( const dropdown of this._getDropdownDefinitions() ) {
			this._createDropdown( dropdown );
		}
	}

	/**
	 * Returns the alignment button definitions, with localized labels.
	 */
	private _getButtonDefinitions(): Array<ButtonDefinition> {
		const t = this.editor.t;

		return [
			{ name: 'alignLeft', label: t( 'Left aligned media' ), icon: IconObjectInlineLeft },
			{ name: 'alignBlockLeft', label: t( 'Left aligned media' ), icon: IconObjectLeft },
			{ name: 'alignCenter', label: t( 'Centered media' ), icon: IconObjectCenter },
			{ name: 'alignBlockRight', label: t( 'Right aligned media' ), icon: IconObjectRight },
			{ name: 'alignRight', label: t( 'Right aligned media' ), icon: IconObjectInlineRight }
		];
	}

	/**
	 * Returns the default split-button dropdown definitions, with localized titles.
	 */
	private _getDropdownDefinitions(): Array<DropdownDefinition> {
		const t = this.editor.t;

		return [
			{
				name: 'wrapText',
				title: t( 'Wrap text' ),
				items: [ 'alignLeft', 'alignRight' ],
				defaultItem: 'alignLeft'
			},
			{
				name: 'breakText',
				title: t( 'Break text' ),
				items: [ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ],
				defaultItem: DEFAULT_STYLE_NAME
			}
		];
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
	private _createDropdown( definition: DropdownDefinition ): void {
		const editor = this.editor;
		const factory = editor.ui.componentFactory;

		factory.add( `mediaEmbed:${ definition.name }`, locale => {
			// Build child buttons via the factory; pick the default by name.
			const buttonViews = definition.items.map(
				itemName => factory.create( `mediaEmbed:${ itemName }` ) as ButtonView
			);
			const defaultButton = buttonViews[ definition.items.indexOf( definition.defaultItem ) ] as ButtonView;

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
