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
			allowAttributes: [ 'border', 'background-color', 'width', 'height' ]
		} );

		schema.extend( 'tableRow', {
			allowAttributes: [ 'height' ]
		} );

		schema.extend( 'tableCell', {
			allowAttributes: [ 'border', 'background-color', 'padding', 'vertical-align', 'width', 'height' ]
		} );

		// Table attributes.
		setupTableConversion( conversion, 'border' );
		setupTableConversion( conversion, 'background-color' );
		setupTableConversion( conversion, 'width' );
		setupTableConversion( conversion, 'height' );

		// Table row attributes.
		setupConversion( conversion, 'height', 'tableRow' );

		// Table cell attributes.
		setupConversion( conversion, 'border', 'tableCell' );
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
					writer.setAttribute( 'border', Object.assign( {}, border, {
						width: {
							top: borderWidthToSet,
							right: borderWidthToSet,
							bottom: borderWidthToSet,
							left: borderWidthToSet
						}
					} ), tableCell );
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
					writer.setAttribute( 'border', Object.assign( {}, border, {
						color: {
							top: newColor,
							right: newColor,
							bottom: newColor,
							left: newColor
						}
					} ), tableCell );
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
					writer.setAttribute( 'border', Object.assign( {}, border, {
						style: {
							top: newStyle,
							right: newStyle,
							bottom: newStyle,
							left: newStyle
						}
					} ), tableCell );
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
