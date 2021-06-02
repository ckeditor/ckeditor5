import { Plugin } from 'ckeditor5/src/core';
import { createDropdown, ButtonView, SplitButtonView, LabeledFieldView, createLabeledInputText, View } from 'ckeditor5/src/ui';
import 'ckeditor5/packages/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import 'ckeditor5/packages/ckeditor5-media-embed/theme/mediaform.css';

/**
 * Example Find & Replace UI that uses FindAndReplace plugin API.
 *
 * It demonstrates how to use that API form outside the editor (except UI buttons).
 */
export default class FindAndReplaceUI extends Plugin {
	constructor( editor ) {
		super( editor );

		this.set( 'searchText' );
	}
	init() {
		this.activeSearch = null;

		this.addToolbarDropdown();
		this.findAndReplacePlugin = this.editor.plugins.get( 'FindAndReplace' );
		// this.on( 'change:searchText', ( event, propertyName, newValue, oldValue ) => {
		// console.log( propertyName, newValue, oldValue );
		// } );
	}
	addToolbarDropdown() {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale, SplitButtonView );

			// Configure dropdown's button properties:
			dropdown.buttonView.set( {
				withText: true,
				label: t( 'Find and replace' ),
				tooltip: true
			} );

			dropdown.buttonView.on( 'execute', () => {

			} );

			dropdown.buttonView.on( 'open', () => {

			} );

			dropdown.render();

			const findView = new View();
			const replaceView = new View();

			const findInputView = this._createInputField( 'Find', 'Search for something you\'d like to find' );
			const findPrevView = this._createButton( t( '<' ), 'ck-button-prev', 'submit' );
			const findNextView = this._createButton( t( '>' ), 'ck-button-next', 'submit' );

			const replaceInputView = this._createInputField( 'Replace', 'Replace what you\'ve previously selected' );
			const replacePrevView = this._createButton( t( '?' ), 'ck-button-prev', 'submit' );
			const replaceNextView = this._createButton( t( 'REPLACE' ), 'ck-button-next', 'submit' );

			const findViewConfig = this._findViewConfig( findView, t, findNextView, findPrevView, findInputView );
			const replaceViewConfig = this._replaceViewConfig( replaceView, t, replaceNextView, replacePrevView, replaceInputView );

			dropdown.panelView.children.add( findViewConfig );
			dropdown.panelView.children.add( replaceViewConfig );

			return dropdown;
		} );
	}
	_findViewConfig( viewName, t, NextInputView, PrevInputView, InputView ) {
		NextInputView.on( 'execute', () => {
			// this.findAndReplacePlugin.stop();
			if ( this.searchText.length !== 0 ) {
				this.findAndReplacePlugin.stop();
			}
			const resultsFound = this.findAndReplacePlugin.find( this.searchText );

			// eslint-disable-next-line no-unused-vars
			const currentResultId = resultsFound.get( 0 ).id;

			// console.log( 'currentResultId ', currentResultId );
		} );

		PrevInputView.on( 'execute', () => {
			// console.log( 'prevButton has been clicked' );
		} );

		viewName.setTemplate( {
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-media-form',
					'ck-responsive-form'
				],
				tabindex: '-1'
			},
			children: [
				InputView,
				PrevInputView,
				NextInputView
			]
		} );
		return viewName;
	}
	_replaceViewConfig( viewName, t, NextInputView, PrevInputView, InputView ) {
		NextInputView.on( 'execute', () => {
			this.findAndReplacePlugin.replaceAll( 'testingReplace' );
			this.findAndReplacePlugin.stop();
		} );

		PrevInputView.on( 'execute', () => {
			// console.log( 'prevButton has been clicked' );
		} );

		viewName.setTemplate( {
			tag: 'form',
			attributes: {
				class: [
					'ck',
					'ck-media-form',
					'ck-responsive-form'
				],
				tabindex: '-1'
			},
			children: [
				InputView,
				PrevInputView,
				NextInputView
			]
		} );
		return viewName;
	}
	_createInputField( labelText, infoText ) {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const inputView = labeledInput.fieldView;

		inputView.on( 'input', () => {
			this.searchText = inputView.element.value;
		} );

		labeledInput.label = labelText;
		labeledInput.infoText = infoText;
		labeledInput.render();

		return labeledInput.element;
	}
	_createButton( label, icon, className ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			withText: true,
			tooltip: true
		} );
		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );
		// button.on( 'execute', () => {
		// 	this.findAndReplacePlugin.stop();
		// 	this.findAndReplacePlugin.find( this.searchText );
		// } );
		// button.type = 'submit';

		return button;
	}
}
