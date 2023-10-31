/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceui
 */

import { type Editor, Plugin } from 'ckeditor5/src/core';
import {
	ButtonView,
	CssTransitionDisablerMixin,
	type DropdownView,
	type ViewWithCssTransitionDisabler,
	type FocusCyclerForwardCycleEvent,
	type FocusCyclerBackwardCycleEvent
} from 'ckeditor5/src/ui';
import FindAndReplaceFormView from './ui/findandreplaceformview';

import loupeIcon from '../theme/icons/find-replace.svg';
import type FindAndReplaceEditing from './findandreplaceediting';
import type FindNextCommand from './findnextcommand';
import type FindPreviousCommand from './findpreviouscommand';
import type ReplaceCommand from './replacecommand';
import type ReplaceAllCommand from './replaceallcommand';

/**
 * The default find and replace UI.
 *
 * It registers the `'findAndReplace'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}.
 * that uses the {@link module:find-and-replace/findandreplace~FindAndReplace FindAndReplace} plugin API.
 */
export default class FindAndReplaceUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FindAndReplaceUI' as const;
	}

	/**
	 * A reference to the find and replace form view.
	 */
	public formView: FindAndReplaceFormView & ViewWithCssTransitionDisabler | null;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.formView = null;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Register the toolbar dropdown component.
		editor.ui.componentFactory.add( 'findAndReplace', locale => {
			const buttonView = new ButtonView( locale );
			const formView = this.formView = new ( CssTransitionDisablerMixin( FindAndReplaceFormView ) )( editor.locale );
			const dialog = editor.plugins.get( 'Dialog' );
			const t = editor.locale.t;

			buttonView.set( {
				icon: loupeIcon,
				label: t( 'Find and replace' ),
				keystroke: 'CTRL+F',
				tooltip: true
			} );

			// Button should be disabled when in source editing mode. See #10001.
			buttonView.bind( 'isEnabled' ).to( editor.commands.get( 'find' )! );

			// Every time a dialog is opened, the search text field should get focused and selected for better UX.
			// Each time a dialog is closed, move the focus back to the find and replace toolbar button
			// and let the find and replace editing feature know that all search results can be invalidated
			// and no longer should be marked in the content.
			buttonView.on( 'execute', () => {
				dialog.show( {
					isDraggable: true,

					onShow: dialog => {
						dialog.view.children.add( formView );
						dialog.view.showHeader( t( 'Find and replace' ) );

						formView.disableCssTransitions();

						formView.reset();
						formView._findInputView.fieldView.select();

						formView.enableCssTransitions();
					},

					onHide: () => {
						this.fire( 'searchReseted' );
					}
				} );
			} );

			editor.keystrokes.set( 'Ctrl+F', ( data, cancelEvent ) => {
				buttonView.fire( 'execute' );
				cancelEvent();
			} );

			this._setupFormView( formView );

			return buttonView;
		} );
	}

	/**
	 * Sets up the find and replace button.
	 */
	private _setupDropdownButton( dropdown: DropdownView ) {
		const editor = this.editor;
		const t = editor.locale.t;

		dropdown.buttonView.set( {
			icon: loupeIcon,
			label: t( 'Find and replace' ),
			keystroke: 'CTRL+F',
			tooltip: true
		} );

		editor.keystrokes.set( 'Ctrl+F', ( data, cancelEvent ) => {
			if ( dropdown.isEnabled ) {
				dropdown.isOpen = true;
				cancelEvent();
			}
		} );
	}

	/**
	 * Sets up the form view for the find and replace.
	 *
	 * @param formView A related form view.
	 */
	private _setupFormView( formView: FindAndReplaceFormView ) {
		const editor = this.editor;
		const commands = editor.commands;
		const findAndReplaceEditing: FindAndReplaceEditing = this.editor.plugins.get( 'FindAndReplaceEditing' );
		const editingState = findAndReplaceEditing.state!;
		const sortMapping = { before: -1, same: 0, after: 1, different: 1 };
		const dialog = this.editor.plugins.get( 'Dialog' );

		// Let the form know which result is being highlighted.
		formView.bind( 'highlightOffset' ).to( editingState, 'highlightedResult', highlightedResult => {
			if ( !highlightedResult ) {
				return 0;
			}

			return Array.from( editingState.results )
				.sort( ( a, b ) => sortMapping[ a.marker!.getStart().compareWith( b.marker!.getStart() ) ] )
				.indexOf( highlightedResult ) + 1;
		} );

		// Let the form know how many results were found in total.
		formView.listenTo( editingState.results, 'change', () => {
			formView.matchCount = editingState.results.length;
		} );

		// Command states are used to enable/disable individual form controls.
		// To keep things simple, instead of binding 4 individual observables, there's only one that combines every
		// commands' isEnabled state. Yes, it will change more often but this simplifies the structure of the form.
		const findNextCommand: FindNextCommand = commands.get( 'findNext' )!;
		const findPreviousCommand: FindPreviousCommand = commands.get( 'findPrevious' )!;
		const replaceCommand: ReplaceCommand = commands.get( 'replace' )!;
		const replaceAllCommand: ReplaceAllCommand = commands.get( 'replaceAll' )!;
		formView.bind( '_areCommandsEnabled' ).to(
			findNextCommand, 'isEnabled',
			findPreviousCommand, 'isEnabled',
			replaceCommand, 'isEnabled',
			replaceAllCommand, 'isEnabled',
			( findNext, findPrevious, replace, replaceAll ) => ( { findNext, findPrevious, replace, replaceAll } )
		);

		// The UI plugin works as an interface between the form and the editing part of the feature.
		formView.delegate( 'findNext', 'findPrevious', 'replace', 'replaceAll' ).to( this );

		// Let the feature know that search results are no longer relevant because the user changed the searched phrase
		// (or options) but didn't hit the "Find" button yet (e.g. still typing).
		formView.on( 'change:isDirty', ( evt, data, isDirty ) => {
			if ( isDirty ) {
				this.fire( 'searchReseted' );
			}
		} );

		formView.focusCycler.on<FocusCyclerForwardCycleEvent>( 'forwardCycle', evt => {
			dialog.view.focusNext();
			evt.stop();
		} );

		formView.focusCycler.on<FocusCyclerBackwardCycleEvent>( 'backwardCycle', evt => {
			dialog.view.focusPrevious();
			evt.stop();
		} );
	}
}

/**
 * Fired when the UI was reset and the search results marked in the editing root should be invalidated,
 * for instance, because the user changed the searched phrase (or options) but didn't hit
 * the "Find" button yet.
 *
 * @eventName ~FindAndReplaceUI#searchReseted
 */
export type SearchResetedEvent = {
	name: 'searchReseted';
	args: [];
};
