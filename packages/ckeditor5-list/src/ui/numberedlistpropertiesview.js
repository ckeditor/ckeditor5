/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { View, SwitchButtonView, LabeledFieldView, ViewCollection } from 'ckeditor5/src/ui';
import InputNumberView from './inputnumberview';
import CollapsibleView from './collapsibleview';

import '../../theme/numberedlistproperties.css';

/**
 * TODO
 *
 * @extends module:ui/view~View
 */
export default class NumberedListPropertiesView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, { enabledProperties, renderAsCollapsible } ) {
		super( locale );

		const t = locale.t;
		const propertyFieldViews = [];

		/**
		 * A collection of the child views.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * A collection of views that can be focused in the view.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.focusables = new ViewCollection();

		if ( enabledProperties.startIndex ) {
			propertyFieldViews.push( this._createStartIndexField() );
		}

		if ( enabledProperties.reversed ) {
			propertyFieldViews.push( this._createReversedField() );
		}

		if ( renderAsCollapsible ) {
			const collapsibleView = new CollapsibleView( locale, propertyFieldViews );

			collapsibleView.set( {
				label: t( 'List properties' ),
				isCollapsed: true
			} );

			this.children.add( collapsibleView );
			this.focusables.add( collapsibleView.buttonView );
		} else {
			this.children.addMany( propertyFieldViews );
		}

		this.focusables.addMany( propertyFieldViews );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-numbered-list-properties'
				]
			},
			children: this.children
		} );
	}

	render() {
		super.render();
	}

	_createStartIndexField() {
		const t = this.locale.t;
		const startIndexFieldView = new LabeledFieldView( this.locale, createLabeledInputNumber );

		startIndexFieldView.set( {
			label: t( 'Start at' ),
			class: 'ck-numbered-list-properties-start-index'
		} );

		startIndexFieldView.fieldView.set( {
			min: 1,
			step: 1,
			value: 1
		} );

		return startIndexFieldView;
	}

	_createReversedField() {
		const t = this.locale.t;
		const reversedButtonView = new SwitchButtonView( this.locale );

		reversedButtonView.set( {
			withText: true,
			label: t( 'Reversed order' ),
			class: 'ck-numbered-list-properties-reversed-order'
		} );

		return reversedButtonView;
	}
}

/**
 * TODO
 *
 * @param {*} labeledFieldView
 * @param {*} viewUid
 * @param {*} statusUid
 * @returns
 */
function createLabeledInputNumber( labeledFieldView, viewUid, statusUid ) {
	const inputView = new InputNumberView( labeledFieldView.locale );

	inputView.set( {
		id: viewUid,
		ariaDescribedById: statusUid
	} );

	inputView.bind( 'isReadOnly' ).to( labeledFieldView, 'isEnabled', value => !value );
	inputView.bind( 'hasError' ).to( labeledFieldView, 'errorText', value => !!value );

	inputView.on( 'input', () => {
		// UX: Make the error text disappear and disable the error indicator as the user
		// starts fixing the errors.
		labeledFieldView.errorText = null;
	} );

	labeledFieldView.bind( 'isEmpty', 'isFocused', 'placeholder' ).to( inputView );

	return inputView;
}
