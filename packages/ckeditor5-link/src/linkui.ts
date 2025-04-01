/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/linkui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { IconLink, IconPencil, IconUnlink, IconSettings } from 'ckeditor5/src/icons.js';
import {
	ClickObserver,
	type ViewAttributeElement,
	type ViewDocumentClickEvent,
	type ViewElement,
	type ViewPosition
} from 'ckeditor5/src/engine.js';
import {
	ButtonView,
	SwitchButtonView,
	ContextualBalloon,
	clickOutsideHandler,
	CssTransitionDisablerMixin,
	MenuBarMenuListItemButtonView,
	ToolbarView,
	type ViewWithCssTransitionDisabler,
	type ButtonExecuteEvent
} from 'ckeditor5/src/ui.js';

import { Collection, type ObservableChangeEvent, type PositionOptions } from 'ckeditor5/src/utils.js';
import { isWidget } from 'ckeditor5/src/widget.js';

import LinkEditing from './linkediting.js';

import LinkPreviewButtonView, { type LinkPreviewButtonNavigateEvent } from './ui/linkpreviewbuttonview.js';
import LinkFormView, { type LinkFormValidatorCallback } from './ui/linkformview.js';
import LinkProviderItemsView from './ui/linkprovideritemsview.js';
import LinkPropertiesView from './ui/linkpropertiesview.js';
import LinkButtonView from './ui/linkbuttonview.js';

import type LinkCommand from './linkcommand.js';
import type UnlinkCommand from './unlinkcommand.js';

import {
	addLinkProtocolIfApplicable,
	ensureSafeUrl,
	isLinkElement,
	extractTextFromLinkRange,
	LINK_KEYSTROKE
} from './utils.js';

import '../theme/linktoolbar.css';

const VISUAL_SELECTION_MARKER_NAME = 'link-ui';

/**
 * The link UI plugin. It introduces the `'link'` and `'unlink'` buttons and support for the <kbd>Ctrl+K</kbd> keystroke.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export default class LinkUI extends Plugin {
	/**
	 * The toolbar view displayed inside of the balloon.
	 */
	public toolbarView: ToolbarView | null = null;

	/**
	 * The form view displayed inside the balloon.
	 */
	public formView: LinkFormView & ViewWithCssTransitionDisabler | null = null;

	/**
	 * The view displaying links list.
	 */
	public linkProviderItemsView: LinkProviderItemsView | null = null;

	/**
	 * The form view displaying properties link settings.
	 */
	public propertiesView: LinkPropertiesView & ViewWithCssTransitionDisabler | null = null;

	/**
	 * The selected text of the link or text that is selected and can become a link.
	 *
	 * Note: It is `undefined` when the current selection does not allow for text,
	 * for example any non text node is selected or multiple blocks are selected.
	 *
	 * @observable
	 * @readonly
	 */
	declare public selectedLinkableText: string | undefined;

	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon!: ContextualBalloon;

	/**
	 * The collection of the link providers.
	 */
	private _linksProviders: Collection<LinksProvider> = new Collection();

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon, LinkEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LinkUI' as const;
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
		const t = this.editor.t;

		this.set( 'selectedLinkableText', undefined );

		editor.editing.view.addObserver( ClickObserver );

		this._balloon = editor.plugins.get( ContextualBalloon );

		// Create toolbar buttons.
		this._registerComponents();
		this._registerEditingOpeners();
		this._enableBalloonActivators();

		// Renders a fake visual selection marker on an expanded selection.
		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: VISUAL_SELECTION_MARKER_NAME,
			view: {
				classes: [ 'ck-fake-link-selection' ]
			}
		} );

		// Renders a fake visual selection marker on a collapsed selection.
		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: VISUAL_SELECTION_MARKER_NAME,
			view: ( data, { writer } ) => {
				if ( !data.markerRange.isCollapsed ) {
					return null;
				}

				const markerElement = writer.createUIElement( 'span' );

				writer.addClass(
					[ 'ck-fake-link-selection', 'ck-fake-link-selection_collapsed' ],
					markerElement
				);

				return markerElement;
			}
		} );

		// Add the information about the keystrokes to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Create link' ),
					keystroke: LINK_KEYSTROKE
				},
				{
					label: t( 'Move out of a link' ),
					keystroke: [
						[ 'arrowleft', 'arrowleft' ],
						[ 'arrowright', 'arrowright' ]
					]
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		if ( this.propertiesView ) {
			this.propertiesView.destroy();
		}

		if ( this.formView ) {
			this.formView.destroy();
		}

		if ( this.toolbarView ) {
			this.toolbarView.destroy();
		}

		if ( this.linkProviderItemsView ) {
			this.linkProviderItemsView.destroy();
		}
	}

	/**
	 * Registers list of buttons below the link form view that
	 * open a list of links provided by the clicked provider.
	 */
	public registerLinksListProvider( provider: LinksProvider ): void {
		const insertIndex = this._linksProviders
			.filter( existing => ( existing.order || 0 ) <= ( provider.order || 0 ) )
			.length;

		this._linksProviders.add( provider, insertIndex );
	}

	/**
	 * Creates views.
	 */
	private _createViews() {
		const linkCommand: LinkCommand = this.editor.commands.get( 'link' )!;

		this.toolbarView = this._createToolbarView();
		this.formView = this._createFormView();

		if ( linkCommand.manualDecorators.length ) {
			this.propertiesView = this._createPropertiesView();
		}

		// Attach lifecycle actions to the the balloon.
		this._enableUserBalloonInteractions();
	}

	/**
	 * Creates the ToolbarView instance.
	 */
	private _createToolbarView(): ToolbarView {
		const editor = this.editor;
		const toolbarView = new ToolbarView( editor.locale );
		const linkCommand: LinkCommand = editor.commands.get( 'link' )!;

		toolbarView.class = 'ck-link-toolbar';

		// Remove the linkProperties button if there are no manual decorators, as it would be useless.
		let toolbarItems = editor.config.get( 'link.toolbar' )!;

		if ( !linkCommand.manualDecorators.length ) {
			toolbarItems = toolbarItems.filter( item => item !== 'linkProperties' );
		}

		toolbarView.fillFromConfig( toolbarItems, editor.ui.componentFactory );

		// Close the panel on esc key press when the **link toolbar have focus**.
		toolbarView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		// Open the form view on Ctrl+K when the **link toolbar have focus**..
		toolbarView.keystrokes.set( LINK_KEYSTROKE, ( data, cancel ) => {
			this._addFormView();

			cancel();
		} );

		// Register the toolbar, so it becomes available for Alt+F10 and Esc navigation.
		// TODO this should be registered earlier to be able to open this toolbar without previously opening it by click or Ctrl+K
		editor.ui.addToolbar( toolbarView, {
			isContextual: true,
			beforeFocus: () => {
				if ( this._getSelectedLinkElement() && !this._isToolbarVisible ) {
					this._showUI( true );
				}
			},
			afterBlur: () => {
				this._hideUI( false );
			}
		} );

		return toolbarView;
	}

	/**
	 * Creates the {@link module:link/ui/linkformview~LinkFormView} instance.
	 */
	private _createFormView(): LinkFormView & ViewWithCssTransitionDisabler {
		const editor = this.editor;
		const t = editor.locale.t;
		const linkCommand: LinkCommand = editor.commands.get( 'link' )!;
		const defaultProtocol = editor.config.get( 'link.defaultProtocol' );

		const formView = new ( CssTransitionDisablerMixin( LinkFormView ) )( editor.locale, getFormValidators( editor ) );

		formView.displayedTextInputView.bind( 'isEnabled' ).to( this, 'selectedLinkableText', value => value !== undefined );

		// Form elements should be read-only when corresponding commands are disabled.
		formView.urlInputView.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );

		// Disable the "save" button if the command is disabled.
		formView.saveButtonView.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );

		// Change the "Save" button label depending on the command state.
		formView.saveButtonView.bind( 'label' ).to( linkCommand, 'value', value => value ? t( 'Update' ) : t( 'Insert' ) );

		// Execute link command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			if ( formView.isValid() ) {
				const url = formView.urlInputView.fieldView.element!.value;
				const parsedUrl = addLinkProtocolIfApplicable( url, defaultProtocol );
				const displayedText = formView.displayedTextInputView.fieldView.element!.value;

				editor.execute(
					'link',
					parsedUrl,
					this._getDecoratorSwitchesState(),
					displayedText !== this.selectedLinkableText ? displayedText : undefined
				);

				this._closeFormView();
			}
		} );

		// Update balloon position when form error changes.
		this.listenTo( formView.urlInputView, 'change:errorText', () => {
			editor.ui.update();
		} );

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._closeFormView();
		} );

		// Close the panel on esc key press when the **form has focus**.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._closeFormView();
			cancel();
		} );

		// Watch adding new link providers and add them to the buttons list.
		formView.providersListChildren.bindTo( this._linksProviders ).using(
			provider => this._createLinksListProviderButton( provider )
		);

		return formView;
	}

	/**
	 * Creates a sorted array of buttons with link names.
	 */
	private _createLinkProviderListView( provider: LinksProvider ): Array<ButtonView> {
		return provider.getListItems().map( ( { href, label, icon } ) => {
			const buttonView = new ButtonView();

			buttonView.set( {
				label,
				icon,
				tooltip: false,
				withText: true
			} );

			buttonView.on( 'execute', () => {
				this.formView!.resetFormStatus();
				this.formView!.urlInputView.fieldView.value = href;

				// Set focus to the editing view to prevent from losing it while current view is removed.
				this.editor.editing.view.focus();

				this._removeLinksProviderView();

				// Set the focus to the URL input field.
				this.formView!.focus();
			} );

			return buttonView;
		} );
	}

	/**
	 * Creates a view for links provider.
	 */
	private _createLinkProviderItemsView( provider: LinksProvider ): LinkProviderItemsView {
		const editor = this.editor;
		const t = editor.locale.t;

		const view = new LinkProviderItemsView( editor.locale );
		const { emptyListPlaceholder, label } = provider;

		view.emptyListPlaceholder = emptyListPlaceholder || t( 'No links available' );
		view.title = label;

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( view, 'cancel', () => {
			// Set focus to the editing view to prevent from losing it while current view is removed.
			editor.editing.view.focus();

			this._removeLinksProviderView();

			// Set the focus to the URL input field.
			this.formView!.focus();
		} );

		return view;
	}

	/**
	 * Creates the {@link module:link/ui/linkpropertiesview~LinkPropertiesView} instance.
	 */
	private _createPropertiesView(): LinkPropertiesView & ViewWithCssTransitionDisabler {
		const editor = this.editor;
		const linkCommand: LinkCommand = this.editor.commands.get( 'link' )!;

		const view = new ( CssTransitionDisablerMixin( LinkPropertiesView ) )( editor.locale );

		// Hide the panel after clicking the back button.
		this.listenTo( view, 'back', () => {
			// Move focus back to the editing view to prevent from losing it while current view is removed.
			editor.editing.view.focus();

			this._removePropertiesView();
		} );

		view.listChildren.bindTo( linkCommand.manualDecorators ).using( manualDecorator => {
			const button: SwitchButtonView = new SwitchButtonView( editor.locale );

			button.set( {
				label: manualDecorator.label,
				withText: true
			} );

			button.bind( 'isOn' ).toMany( [ manualDecorator, linkCommand ], 'value', ( decoratorValue, commandValue ) => {
				return commandValue === undefined && decoratorValue === undefined ?
					!!manualDecorator.defaultValue :
					!!decoratorValue;
			} );

			button.on( 'execute', () => {
				manualDecorator.set( 'value', !button.isOn );
				editor.execute( 'link', linkCommand.value!, this._getDecoratorSwitchesState() );
			} );

			return button;
		} );

		return view;
	}

	/**
	 * Obtains the state of the manual decorators.
	 */
	private _getDecoratorSwitchesState(): Record<string, boolean> {
		const linkCommand: LinkCommand = this.editor.commands.get( 'link' )!;

		return Array
			.from( linkCommand.manualDecorators )
			.reduce( ( accumulator, manualDecorator ) => {
				const value = linkCommand.value === undefined && manualDecorator.value === undefined ?
					manualDecorator.defaultValue :
					manualDecorator.value;

				return {
					...accumulator,
					[ manualDecorator.id ]: !!value
				};
			}, {} as Record<string, boolean> );
	}

	/**
	 * Registers listeners used in editing plugin, used to open links.
	 */
	private _registerEditingOpeners() {
		const linkEditing = this.editor.plugins.get( LinkEditing );

		linkEditing._registerLinkOpener( href => {
			const match = this._getLinkProviderLinkByHref( href );

			if ( !match ) {
				return false;
			}

			const { item, provider } = match;

			if ( provider.navigate ) {
				return provider.navigate( item );
			}

			return false;
		} );
	}

	/**
	 * Registers components in the ComponentFactory.
	 */
	private _registerComponents(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'link', () => {
			const button = this._createButton( ButtonView );

			button.set( {
				tooltip: true
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'menuBar:link', () => {
			const button = this._createButton( MenuBarMenuListItemButtonView );

			button.set( {
				role: 'menuitemcheckbox'
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'linkPreview', locale => {
			const button = new LinkPreviewButtonView( locale );
			const allowedProtocols = editor.config.get( 'link.allowedProtocols' )!;
			const linkCommand: LinkCommand = editor.commands.get( 'link' )!;
			const t = locale.t;

			button.bind( 'isEnabled' ).to( linkCommand, 'value', href => !!href );

			button.bind( 'href' ).to( linkCommand, 'value', href => {
				return href && ensureSafeUrl( href, allowedProtocols );
			} );

			const setHref = ( href: string | undefined ) => {
				if ( !href ) {
					button.label = undefined;
					button.icon = undefined;
					button.tooltip = t( 'Open link in new tab' );
					return;
				}

				const selectedLinksProviderLink = this._getLinkProviderLinkByHref( href );

				if ( selectedLinksProviderLink ) {
					const { label, tooltip, icon } = selectedLinksProviderLink.item;

					button.label = label;
					button.tooltip = tooltip || false;
					button.icon = icon;
				} else {
					button.label = href;
					button.icon = undefined;
					button.tooltip = t( 'Open link in new tab' );
				}
			};

			setHref( linkCommand.value );

			this.listenTo<ObservableChangeEvent<string | undefined>>( linkCommand, 'change:value', ( evt, name, href ) => {
				setHref( href );
			} );

			this.listenTo<LinkPreviewButtonNavigateEvent>( button, 'navigate', ( evt, href, cancel ) => {
				const selectedLinksProviderLink = this._getLinkProviderLinkByHref( href );

				if ( !selectedLinksProviderLink ) {
					return;
				}

				const { provider, item } = selectedLinksProviderLink!;
				const { navigate } = provider;

				if ( navigate && navigate( item! ) ) {
					evt.stop();
					cancel();
				}
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'unlink', locale => {
			const unlinkCommand: UnlinkCommand = editor.commands.get( 'unlink' )!;
			const button = new ButtonView( locale );
			const t = locale.t;

			button.set( {
				label: t( 'Unlink' ),
				icon: IconUnlink,
				tooltip: true
			} );

			button.bind( 'isEnabled' ).to( unlinkCommand );

			this.listenTo<ButtonExecuteEvent>( button, 'execute', () => {
				editor.execute( 'unlink' );
				this._hideUI();
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'editLink', locale => {
			const linkCommand: LinkCommand = editor.commands.get( 'link' )!;
			const button = new ButtonView( locale );
			const t = locale.t;

			button.set( {
				label: t( 'Edit link' ),
				icon: IconPencil,
				tooltip: true
			} );

			button.bind( 'isEnabled' ).to( linkCommand );

			this.listenTo<ButtonExecuteEvent>( button, 'execute', () => {
				this._addFormView();
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'linkProperties', locale => {
			const linkCommand: LinkCommand = editor.commands.get( 'link' )!;
			const button = new ButtonView( locale );
			const t = locale.t;

			button.set( {
				label: t( 'Link properties' ),
				icon: IconSettings,
				tooltip: true
			} );

			button.bind( 'isEnabled' ).to(
				linkCommand, 'isEnabled',
				linkCommand, 'value',
				linkCommand, 'manualDecorators',
				( isEnabled, href, manualDecorators ) => isEnabled && !!href && manualDecorators.length > 0
			);

			this.listenTo<ButtonExecuteEvent>( button, 'execute', () => {
				this._addPropertiesView();
			} );

			return button;
		} );
	}

	/**
	 * Creates a links button view.
	 */
	private _createLinksListProviderButton( linkProvider: LinksProvider ): LinkButtonView {
		const locale = this.editor.locale!;
		const linksButton = new LinkButtonView( locale );

		linksButton.set( {
			label: linkProvider.label
		} );

		this.listenTo( linksButton, 'execute', () => {
			this._showLinksProviderView( linkProvider );
		} );

		return linksButton;
	}

	/**
	 * Creates a button for link command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const command = editor.commands.get( 'link' )!;
		const view = new ButtonClass( editor.locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Link' ),
			icon: IconLink,
			keystroke: LINK_KEYSTROKE,
			isToggleable: true
		} );

		view.bind( 'isEnabled' ).to( command, 'isEnabled' );
		view.bind( 'isOn' ).to( command, 'value', value => !!value );

		// Show the panel on button click.
		this.listenTo<ButtonExecuteEvent>( view, 'execute', () => {
			editor.editing.view.scrollToTheSelection();
			this._showUI( true );

			// Open the form view on-top of the toolbar view if it's already visible.
			// It should be visible every time the link is selected.
			if ( this._getSelectedLinkElement() ) {
				this._addFormView();
			}
		} );

		return view;
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} should be displayed.
	 */
	private _enableBalloonActivators(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		// Handle click on view document and show panel when selection is placed inside the link element.
		// Keep panel open until selection will be inside the same link element.
		this.listenTo<ViewDocumentClickEvent>( viewDocument, 'click', () => {
			const parentLink = this._getSelectedLinkElement();

			if ( parentLink ) {
				// Then show panel but keep focus inside editor editable.
				this._showUI();
			}
		} );

		// Handle the `Ctrl+K` keystroke and show the panel.
		editor.keystrokes.set( LINK_KEYSTROKE, ( keyEvtData, cancel ) => {
			// Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
			cancel();

			if ( editor.commands.get( 'link' )!.isEnabled ) {
				editor.editing.view.scrollToTheSelection();
				this._showUI( true );
			}
		} );
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 */
	private _enableUserBalloonInteractions(): void {
		// Focus the form if the balloon is visible and the Tab key has been pressed.
		this.editor.keystrokes.set( 'Tab', ( data, cancel ) => {
			if ( this._isToolbarVisible && !this.toolbarView!.focusTracker.isFocused ) {
				this.toolbarView!.focus();
				cancel();
			}
		}, {
			// Use the high priority because the link UI navigation is more important
			// than other feature's actions, e.g. list indentation.
			// https://github.com/ckeditor/ckeditor5-link/issues/146
			priority: 'high'
		} );

		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._isUIVisible ) {
				this._hideUI();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView!,
			activator: () => this._isUIInPanel,
			contextElements: () => [ this._balloon.view.element! ],
			callback: () => {
				// Focusing on the editable during a click outside the balloon panel might
				// cause the selection to move to the beginning of the editable, so we avoid
				// focusing on it during this action.
				// See: https://github.com/ckeditor/ckeditor5/issues/18253
				this._hideUI( false );
			}
		} );
	}

	/**
	 * Adds the {@link #toolbarView} to the {@link #_balloon}.
	 *
	 * @internal
	 */
	public _addToolbarView(): void {
		if ( !this.toolbarView ) {
			this._createViews();
		}

		if ( this._isToolbarInPanel ) {
			return;
		}

		this._balloon.add( {
			view: this.toolbarView!,
			position: this._getBalloonPositionData(),
			balloonClassName: 'ck-toolbar-container'
		} );
	}

	/**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 */
	private _addFormView(): void {
		if ( !this.formView ) {
			this._createViews();
		}

		if ( this._isFormInPanel ) {
			return;
		}

		const linkCommand: LinkCommand = this.editor.commands.get( 'link' )!;

		this.formView!.disableCssTransitions();
		this.formView!.resetFormStatus();
		this.formView!.backButtonView.isVisible = linkCommand.isEnabled && !!linkCommand.value;

		this._balloon.add( {
			view: this.formView!,
			position: this._getBalloonPositionData()
		} );

		// Make sure that each time the panel shows up, the fields remains in sync with the value of
		// the command. If the user typed in the input, then canceled the balloon (`urlInputView.fieldView#value` stays
		// unaltered) and re-opened it without changing the value of the link command (e.g. because they
		// clicked the same link), they would see the old value instead of the actual value of the command.
		// https://github.com/ckeditor/ckeditor5-link/issues/78
		// https://github.com/ckeditor/ckeditor5-link/issues/123

		this.selectedLinkableText = this._getSelectedLinkableText();

		this.formView!.displayedTextInputView.fieldView.value = this.selectedLinkableText || '';
		this.formView!.urlInputView.fieldView.value = linkCommand.value || '';

		// Select input when form view is currently visible.
		if ( this._balloon.visibleView === this.formView ) {
			this.formView!.urlInputView.fieldView.select();
		}

		this.formView!.enableCssTransitions();
	}

	/**
	 * Adds the {@link #propertiesView} to the {@link #_balloon}.
	 */
	private _addPropertiesView(): void {
		if ( !this.propertiesView ) {
			this._createViews();
		}

		if ( this._arePropertiesInPanel ) {
			return;
		}

		this.propertiesView!.disableCssTransitions();

		this._balloon.add( {
			view: this.propertiesView!,
			position: this._getBalloonPositionData()
		} );

		this.propertiesView!.enableCssTransitions();
		this.propertiesView!.focus();
	}

	/**
	 * Shows the view with links provided by the given provider.
	 */
	private _showLinksProviderView( provider: LinksProvider ): void {
		if ( this.linkProviderItemsView ) {
			this._removeLinksProviderView();
		}

		this.linkProviderItemsView = this._createLinkProviderItemsView( provider );

		this._addLinkProviderItemsView( provider );
	}

	/**
	 * Adds the {@link #linkProviderItemsView} to the {@link #_balloon}.
	 */
	private _addLinkProviderItemsView( provider: LinksProvider ): void {
		// Clear the collection of links.
		this.linkProviderItemsView!.listChildren.clear();

		// Add links to the collection.
		this.linkProviderItemsView!.listChildren.addMany( this._createLinkProviderListView( provider ) );

		this._balloon.add( {
			view: this.linkProviderItemsView!,
			position: this._getBalloonPositionData()
		} );

		this.linkProviderItemsView!.focus();
	}

	/**
	 * Closes the form view. Decides whether the balloon should be hidden completely or if the action view should be shown. This is
	 * decided upon the link command value (which has a value if the document selection is in the link).
	 */
	private _closeFormView(): void {
		const linkCommand: LinkCommand = this.editor.commands.get( 'link' )!;

		this.selectedLinkableText = undefined;

		if ( linkCommand.value !== undefined ) {
			this._removeFormView();
		} else {
			this._hideUI();
		}
	}

	/**
	 * Removes the {@link #propertiesView} from the {@link #_balloon}.
	 */
	private _removePropertiesView(): void {
		if ( this._arePropertiesInPanel ) {
			this._balloon.remove( this.propertiesView! );
		}
	}

	/**
	 * Removes the {@link #linkProviderItemsView} from the {@link #_balloon}.
	 */
	private _removeLinksProviderView(): void {
		if ( this._isLinksListInPanel ) {
			this._balloon.remove( this.linkProviderItemsView! );
		}
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 */
	private _removeFormView( updateFocus: boolean = true ): void {
		if ( this._isFormInPanel ) {
			// Blur the input element before removing it from DOM to prevent issues in some browsers.
			// See https://github.com/ckeditor/ckeditor5/issues/1501.
			this.formView!.saveButtonView.focus();

			// Reset fields to update the state of the submit button.
			this.formView!.displayedTextInputView.fieldView.reset();
			this.formView!.urlInputView.fieldView.reset();

			this._balloon.remove( this.formView! );

			// Because the form has an input which has focus, the focus must be brought back
			// to the editor. Otherwise, it would be lost.
			if ( updateFocus ) {
				this.editor.editing.view.focus();
			}

			this._hideFakeVisualSelection();
		}
	}

	/**
	 * Shows the correct UI type. It is either {@link #formView} or {@link #toolbarView}.
	 *
	 * @internal
	 */
	public _showUI( forceVisible: boolean = false ): void {
		if ( !this.formView ) {
			this._createViews();
		}

		// When there's no link under the selection, go straight to the editing UI.
		if ( !this._getSelectedLinkElement() ) {
			// Show visual selection on a text without a link when the contextual balloon is displayed.
			// See https://github.com/ckeditor/ckeditor5/issues/4721.
			this._showFakeVisualSelection();

			this._addToolbarView();

			// Be sure panel with link is visible.
			if ( forceVisible ) {
				this._balloon.showStack( 'main' );
			}

			this._addFormView();
		}
		// If there's a link under the selection...
		else {
			// Go to the editing UI if toolbar is already visible.
			if ( this._isToolbarVisible ) {
				this._addFormView();
			}
			// Otherwise display just the toolbar.
			else {
				this._addToolbarView();
			}

			// Be sure panel with link is visible.
			if ( forceVisible ) {
				this._balloon.showStack( 'main' );
			}
		}

		// Begin responding to ui#update once the UI is added.
		this._startUpdatingUI();
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 *
	 * See {@link #_addFormView}, {@link #_addToolbarView}.
	 */
	private _hideUI( updateFocus: boolean = true ): void {
		const editor = this.editor;

		if ( !this._isUIInPanel ) {
			return;
		}

		this.stopListening( editor.ui, 'update' );
		this.stopListening( this._balloon, 'change:visibleView' );

		// Make sure the focus always gets back to the editable _before_ removing the focused form view.
		// Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
		if ( updateFocus ) {
			editor.editing.view.focus();
		}

		// If the links view is visible, remove it because it can be on top of the stack.
		this._removeLinksProviderView();

		// If the properties form view is visible, remove it because it can be on top of the stack.
		this._removePropertiesView();

		// Then remove the form view because it's beneath the properties form.
		this._removeFormView( updateFocus );

		// Finally, remove the link toolbar view because it's last in the stack.
		if ( this._isToolbarInPanel ) {
			this._balloon.remove( this.toolbarView! );
		}

		this._hideFakeVisualSelection();
	}

	/**
	 * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
	 * reposition itself when the editor UI should be refreshed.
	 *
	 * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
	 */
	private _startUpdatingUI(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		let prevSelectedLink = this._getSelectedLinkElement();
		let prevSelectionParent = getSelectionParent();

		const update = () => {
			const selectedLink = this._getSelectedLinkElement();
			const selectionParent = getSelectionParent();

			// Hide the panel if:
			//
			// * the selection went out of the EXISTING link element. E.g. user moved the caret out
			//   of the link,
			// * the selection went to a different parent when creating a NEW link. E.g. someone
			//   else modified the document.
			// * the selection has expanded (e.g. displaying link toolbar then pressing SHIFT+Right arrow).
			//
			// Note: #_getSelectedLinkElement will return a link for a non-collapsed selection only
			// when fully selected.
			if ( ( prevSelectedLink && !selectedLink ) ||
				( !prevSelectedLink && selectionParent !== prevSelectionParent ) ) {
				this._hideUI();
			}
			// Update the position of the panel when:
			//  * link panel is in the visible stack
			//  * the selection remains in the original link element,
			//  * there was no link element in the first place, i.e. creating a new link
			else if ( this._isUIVisible ) {
				// If still in a link element, simply update the position of the balloon.
				// If there was no link (e.g. inserting one), the balloon must be moved
				// to the new position in the editing view (a new native DOM range).
				this._balloon.updatePosition( this._getBalloonPositionData() );
			}

			prevSelectedLink = selectedLink;
			prevSelectionParent = selectionParent;
		};

		function getSelectionParent() {
			return viewDocument.selection.focus!.getAncestors()
				.reverse()
				.find( ( node ): node is ViewElement => node.is( 'element' ) );
		}

		this.listenTo( editor.ui, 'update', update );
		this.listenTo( this._balloon, 'change:visibleView', update );
	}

	/**
	 * Returns `true` when {@link #propertiesView} is in the {@link #_balloon}.
	 */
	private get _arePropertiesInPanel(): boolean {
		return !!this.propertiesView && this._balloon.hasView( this.propertiesView );
	}

	/**
	 * Returns `true` when {@link #linkProviderItemsView} is in the {@link #_balloon}.
	 */
	private get _isLinksListInPanel(): boolean {
		return !!this.linkProviderItemsView && this._balloon.hasView( this.linkProviderItemsView );
	}

	/**
	 * Returns `true` when {@link #formView} is in the {@link #_balloon}.
	 */
	private get _isFormInPanel(): boolean {
		return !!this.formView && this._balloon.hasView( this.formView );
	}

	/**
	 * Returns `true` when {@link #toolbarView} is in the {@link #_balloon}.
	 */
	private get _isToolbarInPanel(): boolean {
		return !!this.toolbarView && this._balloon.hasView( this.toolbarView );
	}

	/**
	 * Returns `true` when {@link #propertiesView} is in the {@link #_balloon} and it is
	 * currently visible.
	 */
	private get _isPropertiesVisible(): boolean {
		return !!this.propertiesView && this._balloon.visibleView === this.propertiesView;
	}

	/**
	 * Returns `true` when {@link #formView} is in the {@link #_balloon} and it is
	 * currently visible.
	 */
	private get _isFormVisible(): boolean {
		return !!this.formView && this._balloon.visibleView == this.formView;
	}

	/**
	 * Returns `true` when {@link #toolbarView} is in the {@link #_balloon} and it is
	 * currently visible.
	 */
	private get _isToolbarVisible(): boolean {
		return !!this.toolbarView && this._balloon.visibleView === this.toolbarView;
	}

	/**
	 * Returns `true` when {@link #propertiesView}, {@link #toolbarView}, {@link #linkProviderItemsView}
	 * or {@link #formView} is in the {@link #_balloon}.
	 */
	private get _isUIInPanel(): boolean {
		return this._arePropertiesInPanel || this._isLinksListInPanel || this._isFormInPanel || this._isToolbarInPanel;
	}

	/**
	 * Returns `true` when {@link #propertiesView}, {@link #linkProviderItemsView}, {@link #toolbarView}
	 * or {@link #formView} is in the {@link #_balloon} and it is currently visible.
	 */
	private get _isUIVisible(): boolean {
		return this._isPropertiesVisible || this._isLinksListInPanel || this._isFormVisible || this._isToolbarVisible;
	}

	/**
	 * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
	 * to the target element or selection.
	 *
	 * If the selection is collapsed and inside a link element, the panel will be attached to the
	 * entire link element. Otherwise, it will be attached to the selection.
	 */
	private _getBalloonPositionData(): Partial<PositionOptions> {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		const model = this.editor.model;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			// There are cases when we highlight selection using a marker (#7705, #4721).
			const markerViewElements = this.editor.editing.mapper.markerNameToElements( VISUAL_SELECTION_MARKER_NAME );

			// Marker could be removed by link text override and end up in the graveyard.
			if ( markerViewElements ) {
				const markerViewElementsArray = Array.from( markerViewElements );
				const newRange = view.createRange(
					view.createPositionBefore( markerViewElementsArray[ 0 ] ),
					view.createPositionAfter( markerViewElementsArray[ markerViewElementsArray.length - 1 ] )
				);

				return {
					target: view.domConverter.viewRangeToDom( newRange )
				};
			}
		}

		// Make sure the target is calculated on demand at the last moment because a cached DOM range
		// (which is very fragile) can desynchronize with the state of the editing view if there was
		// any rendering done in the meantime. This can happen, for instance, when an inline widget
		// gets unlinked.
		return {
			target: () => {
				const targetLink = this._getSelectedLinkElement();

				return targetLink ?
					// When selection is inside link element, then attach panel to this element.
					view.domConverter.mapViewToDom( targetLink )! :
					// Otherwise attach panel to the selection.
					view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange()! );
			}
		};
	}

	/**
	 * Returns the link {@link module:engine/view/attributeelement~AttributeElement} under
	 * the {@link module:engine/view/document~Document editing view's} selection or `null`
	 * if there is none.
	 *
	 * **Note**: For a non–collapsed selection, the link element is returned when **fully**
	 * selected and the **only** element within the selection boundaries, or when
	 * a linked widget is selected.
	 */
	private _getSelectedLinkElement(): ViewAttributeElement | null {
		const view = this.editor.editing.view;
		const selection = view.document.selection;
		const selectedElement = selection.getSelectedElement();

		// The selection is collapsed or some widget is selected (especially inline widget).
		if ( selection.isCollapsed || selectedElement && isWidget( selectedElement ) ) {
			return findLinkElementAncestor( selection.getFirstPosition()! );
		} else {
			// The range for fully selected link is usually anchored in adjacent text nodes.
			// Trim it to get closer to the actual link element.
			const range = selection.getFirstRange()!.getTrimmed();
			const startLink = findLinkElementAncestor( range.start );
			const endLink = findLinkElementAncestor( range.end );

			if ( !startLink || startLink != endLink ) {
				return null;
			}

			// Check if the link element is fully selected.
			if ( view.createRangeIn( startLink ).getTrimmed().isEqual( range ) ) {
				return startLink;
			} else {
				return null;
			}
		}
	}

	/**
	 * Returns selected link text content.
	 * If link is not selected it returns the selected text.
	 * If selection or link includes non text node (inline object or block) then returns undefined.
	 */
	private _getSelectedLinkableText(): string | undefined {
		const model = this.editor.model;
		const editing = this.editor.editing;
		const selectedLink = this._getSelectedLinkElement();

		if ( !selectedLink ) {
			return extractTextFromLinkRange( model.document.selection.getFirstRange()! );
		}

		const viewLinkRange = editing.view.createRangeOn( selectedLink );
		const linkRange = editing.mapper.toModelRange( viewLinkRange );

		return extractTextFromLinkRange( linkRange );
	}

	/**
	 * Returns a provider by its URL.
	 *
	 * @param href URL of the link.
	 * @returns Link provider and item or `null` if not found.
	 */
	private _getLinkProviderLinkByHref( href: string ): { provider: LinksProvider; item: LinksProviderDetailedItem } | null {
		if ( !href ) {
			return null;
		}

		for ( const provider of this._linksProviders ) {
			const item = provider.getItem ?
				provider.getItem( href ) :
				provider.getListItems().find( item => item.href === href );

			if ( item ) {
				return { provider, item };
			}
		}

		return null;
	}

	/**
	 * Displays a fake visual selection when the contextual balloon is displayed.
	 *
	 * This adds a 'link-ui' marker into the document that is rendered as a highlight on selected text fragment.
	 */
	private _showFakeVisualSelection(): void {
		const model = this.editor.model;

		model.change( writer => {
			const range = model.document.selection.getFirstRange()!;

			if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
				writer.updateMarker( VISUAL_SELECTION_MARKER_NAME, { range } );
			} else {
				if ( range.start.isAtEnd ) {
					const startPosition = range.start.getLastMatchingPosition(
						( { item } ) => !model.schema.isContent( item ),
						{ boundaries: range }
					);

					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range: writer.createRange( startPosition, range.end )
					} );
				} else {
					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range
					} );
				}
			}
		} );
	}

	/**
	 * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
	 */
	private _hideFakeVisualSelection(): void {
		const model = this.editor.model;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			model.change( writer => {
				writer.removeMarker( VISUAL_SELECTION_MARKER_NAME );
			} );
		}
	}
}

/**
 * Link list item that represents a single link in the provider's list.
 * It's displayed after the user clicks the button that opens the list in the link form view.
 */
export type LinksProviderListItem = {

	/**
	 * Unique identifier of the item. Avoids collection malfunction when there are links with the same labels.
	 */
	id: string;

	/**
	 * URL of the link.
	 */
	href: string;

	/**
	 * Label that is used as a text for the list item.
	 */
	label: string;

	/**
	 * Optional icon displayed for the item.
	 */
	icon?: string;
};

/**
 * Link list item with additional attributes that will be used when:
 *
 * 	* The item is selected and the preview of the item is displayed.
 * 	* The user selects the item and the link is created.
 * 	* The user navigates to the item using editing.
 *
 * It can be used to perform additional lookups in the database or to provide additional information about the link.
 */
export type LinksProviderDetailedItem = {

	/**
	 * URL of the link.
	 */
	href: string;

	/**
	 * Optional icon displayed when the user opens toolbar with the item preview.
	 */
	icon?: string;

	/**
	 * Optional label shown in the link preview. If not passed then the `href` is used as the label.
	 */
	label?: string;

	/**
	 * Optional tooltip shown in the link preview.
	 */
	tooltip?: string;
};

/**
 * Interface for a provider that provides a list of links to be displayed in the link form view.
 */
export type LinksProvider = {

	/**
	 * Label that serves two purposes:
	 *
	 * 	* As a text for the button that opens this link list from within link form view.
	 * 	* As a text for the header when the list of links from this provider is displayed.
	 */
	label: string;

	/**
	 * Message to be displayed when there are no items in the list.
	 * It's optional and if not provided, a default message will be displayed.
	 */
	emptyListPlaceholder?: string;

	/**
	 * Weight used for ordering providers in the list. Higher weight means the provider will be displayed lower in the list.
	 *
	 * @default 0
	 */
	order?: number;

	/**
	 * Callback for retrieving an static array of items which is being called every time the list is displayed.
	 * It's not required to provide all links at once, it's possible to pass only slice of links.
	 */
	getListItems(): Array<LinksProviderListItem>;

	/**
	 * Optional callback for retrieving an item by its URL.
	 * If not provided the item from the list will be used.
	 */
	getItem?( href: string ): LinksProviderDetailedItem | null;

	/**
	 * Callback called when user clicked the link in the list.
	 *
	 * @param item Item that was clicked.
	 * @returns `true` if the link was handled by the provider, `false` otherwise. It'll prevent the default action if `true`.
	 */
	navigate?( item: LinksProviderDetailedItem ): boolean;
};

/**
 * Returns a link element if there's one among the ancestors of the provided `Position`.
 *
 * @param View position to analyze.
 * @returns Link element at the position or null.
 */
function findLinkElementAncestor( position: ViewPosition ): ViewAttributeElement | null {
	return position.getAncestors().find( ( ancestor ): ancestor is ViewAttributeElement => isLinkElement( ancestor ) ) || null;
}

/**
 * Returns link form validation callbacks.
 *
 * @param editor Editor instance.
 */
function getFormValidators( editor: Editor ): Array<LinkFormValidatorCallback> {
	const t = editor.t;
	const allowCreatingEmptyLinks = editor.config.get( 'link.allowCreatingEmptyLinks' );

	return [
		form => {
			if ( !allowCreatingEmptyLinks && !form.url!.length ) {
				return t( 'Link URL must not be empty.' );
			}
		}
	];
}
