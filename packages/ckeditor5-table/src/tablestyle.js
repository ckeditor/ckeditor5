/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablestyle
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { findAncestor } from './commands/utils';

function downcastToStyle( conversion, modelAttribute, viewStyleName ) {
	conversion.for( 'downcast' ).attributeToAttribute( {
		model: modelAttribute,
		view: modelAttributeValue => ( {
			key: 'style',
			value: {
				[ viewStyleName ]: modelAttributeValue
			}
		} )
	} );
}

/**
 * The table editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const conversion = editor.conversion;

		schema.extend( 'table', {
			allowAttributes: [ 'borderWidth', 'borderColor', 'borderStyle', 'background-color', 'width', 'height' ]
		} );

		schema.extend( 'tableRow', {
			allowAttributes: [ 'height' ]
		} );

		schema.extend( 'tableCell', {
			allowAttributes: [
				'borderWidth', 'borderColor', 'borderStyle',
				'background-color', 'padding', 'vertical-align', 'width', 'height' ]
		} );

		// Table attributes.
		setupTableConversion( conversion, 'background-color' );
		setupTableConversion( conversion, 'width' );
		setupTableConversion( conversion, 'height' );

		// Table row attributes.
		setupConversion( conversion, 'height', 'tableRow' );

		upcastBorderStyles( conversion, 'td' );
		upcastBorderStyles( conversion, 'th' );
		upcastBorderStyles( conversion, 'table' );

		downcastToStyle( conversion, 'borderStyle', 'border-style' );
		downcastToStyle( conversion, 'borderColor', 'border-color' );
		downcastToStyle( conversion, 'borderWidth', 'border-width' );

		setupConversion( conversion, 'background-color', 'tableCell' );
		setupConversion( conversion, 'padding', 'tableCell' );
		setupConversion( conversion, 'vertical-align', 'tableCell' );
		setupConversion( conversion, 'width', 'tableCell' );

		editor.ui.componentFactory.add( 'borderWidth', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Border width',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
				const model = editor.model;
				const document = model.document;
				const selection = document.selection;
				const firstPosition = selection.getFirstPosition();

				const tableCell = findAncestor( 'tableCell', firstPosition );

				const border = tableCell.getAttribute( 'border' );

				let currentWidth;

				if ( border ) {
					const borderWidth = ( border && border.width ) || {};

					// Unify width to one value. If different values are set default to top (or right, etc).
					currentWidth = borderWidth.top || borderWidth.right || borderWidth.bottom || borderWidth.left;
				}

				// eslint-disable-next-line no-undef,no-alert
				const newWidth = prompt( 'Set border width:', currentWidth || '' );

				const parts = /^([0-9]*[.]?[0-9]*)([a-z]{2,4})?/.exec( newWidth );
				const unit = parts[ 2 ];

				const borderWidthToSet = parts[ 1 ] + ( unit || 'px' );

				// TODO: Command, setting new value is dumb on `border` object.
				editor.model.change( writer => {
					writer.setAttribute( 'borderWidth', {
						top: borderWidthToSet,
						right: borderWidthToSet,
						bottom: borderWidthToSet,
						left: borderWidthToSet
					}, tableCell );
				} );
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'borderColor', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Border color',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
				const model = editor.model;
				const document = model.document;
				const selection = document.selection;
				const firstPosition = selection.getFirstPosition();

				const tableCell = findAncestor( 'tableCell', firstPosition );

				const border = tableCell.getAttribute( 'border' );

				let currentColor;

				if ( border ) {
					const borderColor = ( border && border.color ) || {};

					// Unify width to one value. If different values are set default to top (or right, etc).
					currentColor = borderColor.top || borderColor.right || borderColor.bottom || borderColor.left;
				}

				// eslint-disable-next-line no-undef,no-alert
				const newColor = prompt( 'Set new border color:', currentColor || '' );

				// TODO: Command, setting new value is dumb on `border` object.
				editor.model.change( writer => {
					writer.setAttribute( 'borderColor', {
						top: newColor,
						right: newColor,
						bottom: newColor,
						left: newColor
					}, tableCell );
				} );
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'borderStyle', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Border style',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
				const model = editor.model;
				const document = model.document;
				const selection = document.selection;
				const firstPosition = selection.getFirstPosition();

				const tableCell = findAncestor( 'tableCell', firstPosition );

				const border = tableCell.getAttribute( 'border' );

				let currentStyle;

				if ( border ) {
					const borderStyle = ( border && border.style ) || {};

					// Unify width to one value. If different values are set default to top (or right, etc).
					currentStyle = borderStyle.top || borderStyle.right || borderStyle.bottom || borderStyle.left;
				}

				// eslint-disable-next-line no-undef,no-alert
				const newStyle = prompt( 'Set new border style:', currentStyle || '' );

				// TODO: Command, setting new value is dumb on `border` object.
				editor.model.change( writer => {
					writer.setAttribute( 'borderStyle', {
						top: newStyle,
						right: newStyle,
						bottom: newStyle,
						left: newStyle
					}, tableCell );
				} );
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'backgroundColor', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Background color',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
				const model = editor.model;
				const document = model.document;
				const selection = document.selection;
				const firstPosition = selection.getFirstPosition();

				const tableCell = findAncestor( 'tableCell', firstPosition );

				const backgroundColor = tableCell.getAttribute( 'background-color' );

				// eslint-disable-next-line no-undef,no-alert
				const newColor = prompt( 'Set new background color:', backgroundColor || '' );

				editor.model.change( writer => {
					writer.setAttribute( 'background-color', newColor, tableCell );
				} );
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'padding', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Cell padding',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
				const model = editor.model;
				const document = model.document;
				const selection = document.selection;
				const firstPosition = selection.getFirstPosition();

				const tableCell = findAncestor( 'tableCell', firstPosition );

				const padding = tableCell.getAttribute( 'padding' );

				let currentPadding;

				if ( padding ) {
					// Unify width to one value. If different values are set default to top (or right, etc).
					currentPadding = padding.top || padding.right || padding.bottom || padding.left;
				}

				// eslint-disable-next-line no-undef,no-alert
				const newPadding = prompt( 'Set new padding:', currentPadding || '' );

				editor.model.change( writer => {
					writer.setAttribute( 'padding', newPadding, tableCell );
				} );
			} );

			return button;
		} );
	}
}

function setupConversion( conversion, styleName, modelName ) {
	// General upcast 'border' attribute (requires model border attribute to be allowed).
	upcastAttribute( conversion, styleName, modelName );

	// Downcast table cell only (table has own downcast converter).
	conversion.for( 'downcast' ).attributeToAttribute( {
		model: {
			name: modelName,
			key: styleName
		},
		view: modelAttributeValue => ( {
			key: 'style',
			value: {
				[ styleName ]: modelAttributeValue
			}
		} )
	} );
}

function upcastAttribute( conversion, styleName, modelName ) {
	conversion.for( 'upcast' ).attributeToAttribute( {
		view: {
			styles: {
				[ styleName ]: /[\s\S]+/
			}
		},
		model: {
			name: modelName,
			key: styleName,
			value: viewElement => viewElement.getNormalizedStyle( styleName )
		}
	} );
}

function upcastBorderStyles( conversion, viewElement ) {
	conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:' + viewElement, ( evt, data, conversionApi ) => {
		let matcherPattern;

		if ( data.viewItem.hasStyle( 'border' ) ) {
			matcherPattern = {
				styles: [ 'border' ]
			};
		} else {
			const stylesToConsume = [
				'border-top',
				'border-right',
				'border-bottom',
				'border-left'
			].filter( styleName => data.viewItem.hasStyle( styleName ) );

			if ( stylesToConsume.length ) {
				matcherPattern = {
					styles: stylesToConsume
				};
			} else {
				return;
			}
		}

		// Try to consume appropriate values from consumable values list.
		const toMatch = matcherPattern;

		if ( !conversionApi.consumable.test( data.viewItem, toMatch ) ) {
			return;
		}

		const modelElement = [ ...data.modelRange.getItems( { shallow: true } ) ].pop();

		conversionApi.consumable.consume( data.viewItem, toMatch );

		if ( conversionApi.schema.checkAttribute( modelElement, 'borderStyle' ) ) {
			conversionApi.writer.setAttribute( 'borderStyle', data.viewItem.getNormalizedStyle( 'border-style' ), modelElement );
		}

		if ( conversionApi.schema.checkAttribute( modelElement, 'borderColor' ) ) {
			conversionApi.writer.setAttribute( 'borderColor', data.viewItem.getNormalizedStyle( 'border-color' ), modelElement );
		}

		if ( conversionApi.schema.checkAttribute( modelElement, 'borderWidth' ) ) {
			conversionApi.writer.setAttribute( 'borderWidth', data.viewItem.getNormalizedStyle( 'border-width' ), modelElement );
		}
	} ) );
}

function setupTableConversion( conversion, styleName ) {
	upcastAttribute( conversion, styleName, 'table' );

	// Properly downcast table border attribute on <table> and not on <figure>.
	conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( `attribute:${ styleName }:table`, ( evt, data, conversionApi ) => {
		const { item, attributeNewValue } = data;
		const { mapper, writer } = conversionApi;

		const table = [ ...mapper.toViewElement( item ).getChildren() ].find( child => child.is( 'table' ) );

		writer.setStyle( styleName, attributeNewValue, table );
	} ) );
}
