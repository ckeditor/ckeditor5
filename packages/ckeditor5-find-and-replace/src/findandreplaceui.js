import { Plugin } from 'ckeditor5/src/core';
import { createDropdown, SplitButtonView } from 'ckeditor5/src/ui';
import 'ckeditor5/packages/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import 'ckeditor5/packages/ckeditor5-media-embed/theme/mediaform.css';
import FindAndReplaceFormView from './ui/findandreplaceformview';

/**
 * Example Find & Replace UI that uses FindAndReplace plugin API.
 *
 * It demonstrates how to use that API form outside the editor (except UI buttons).
 */
export default class FindAndReplaceUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FindAndReplaceUI';
	}

	constructor( editor ) {
		super( editor );

		this.set( 'searchText' );
	}
	init() {
		this.activeSearch = null;
		this.findAndReplacePlugin = this.editor.plugins.get( 'FindAndReplace' );

		const editor = this.editor;

		editor.ui.componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale, SplitButtonView );

			const formView = new FindAndReplaceFormView( editor.locale );

			formView.delegate( 'findNext' ).to( this );

			this._createToolbarDropdown( dropdown, formView );

			return dropdown;
		} );
	}

	/**
	 * @private
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdown
	 * @param {module:ui/view~View} form
	 */
	_createToolbarDropdown( dropdown, form ) {
		const editor = this.editor;
		const t = editor.t;

		// Configure dropdown's button properties:
		dropdown.buttonView.set( {
			withText: true,
			label: t( 'Find and replace' ),
			tooltip: true
		} );

		dropdown.panelView.children.add( form.findViewConfig );
		dropdown.panelView.children.add( form.replaceViewConfig );
	}

	// NextInputView.on( 'execute', () => {
	// 	// eslint-disable-next-line no-unused-vars
	// 	const currentResultId = resultsFound.get( 0 ).id;
	// } );
}
