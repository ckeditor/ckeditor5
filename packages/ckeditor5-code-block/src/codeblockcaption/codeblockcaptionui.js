/**
 * @module code-block/codeblockcaption/codeblockcaptionui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView, ContextualBalloon, clickOutsideHandler } from 'ckeditor5/src/ui';
import FormView from './codeblockcaptionview';

/**
 * The codeblock caption UI plugin. It introduces the `'toggleCodeblockCaption'` UI button.
 * 
 * @extends module:core/plugin~Plugin
 */
export default class CodeblockCaptionUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CodeblockCaptionUI';
    }

    /**
     * @inheritDoc
     */
    init() {
        console.log(`Einstrasse: codeblock caption ui init function called`);

        const editor = this.editor;
        const editingView = editor.editing.view;
        const t = editor.t;
        // Create the balloon and the form view
        this._balloon = editor.plugins.get( ContextualBalloon );
        this.formView = this._createFormView();

        editor.ui.componentFactory.add( 'dummyButton', () => {
			const button = new ButtonView();

			button.label = 'dummyButton';
			button.tooltip = true;
			button.withText = true;

			// Show the UI on button click.
			this.listenTo( button, 'execute', () => {
				this._showUI();
			} );

			return button;
		} );

        editor.ui.componentFactory.add( 'toggleCodeblockCaption', locale => {
            const command = editor.commands.get( 'toggleCodeblockCaption' );
            const view = new ButtonView( locale );

            view.set( {
                icon: icons.caption,
                tooltip: true,
                isToggleable: true
            } );

            view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
            view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

            this.listenTo( view, 'execute', () => {
                editor.execute( 'toggleCodeblockCaption' );

                // Scroll to the selection and highlight the caption if the caption showed up.
                console.log("UI button on click!");
                // const modelCaptionElement = 
            } );

            console.log(`Einstrasse: ${JSON.stringify(null, 2, view)}`);


            return view;
        } );
        
    }
    _createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );

		// Execute the command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			// Grab values from the abbreviation and title input fields.
			const value = {
				abbr: formView.abbrInputView.fieldView.element.value,
				title: formView.titleInputView.fieldView.element.value
			};
			editor.execute( 'addAbbreviation', value );

            // Hide the form view after submit.
			this._hideUI();
		} );

		// Hide the form view after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._hideUI();
		} );

		// Hide the form view when clicking outside the balloon.
		clickOutsideHandler( {
			emitter: formView,
			activator: () => this._balloon.visibleView === formView,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUI()
		} );

		return formView;
	}

	_showUI() {
		const selection = this.editor.model.document.selection;

		// Check the value of the command.
		const commandValue = this.editor.commands.get( 'addAbbreviation' ).value;

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		// Disable the input when the selection is not collapsed.
		this.formView.abbrInputView.isEnabled = selection.getFirstRange().isCollapsed;

		// Fill the form using the state (value) of the command.
		if ( commandValue ) {
			this.formView.abbrInputView.fieldView.value = commandValue.abbr;
			this.formView.titleInputView.fieldView.value = commandValue.title;
		}
		// If the command has no value, put the currently selected text (not collapsed)
		// in the first field and empty the second in that case.
		else {
			const selectedText = getRangeText( selection.getFirstRange() );

			this.formView.abbrInputView.fieldView.value = selectedText;
			this.formView.titleInputView.fieldView.value = '';
		}

		this.formView.focus();
	}

	_hideUI() {
        return;
		// Clear the input field values and reset the form.
		this.formView.abbrInputView.fieldView.value = '';
		this.formView.titleInputView.fieldView.value = '';
		this.formView.element.reset();

		this._balloon.remove( this.formView );

		// Focus the editing view after inserting the abbreviation so the user can start typing the content
		// right away and keep the editor focused.
		this.editor.editing.view.focus();
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		// Set a target position by converting view selection range to DOM
		target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		return {
			target
		};
	}
}