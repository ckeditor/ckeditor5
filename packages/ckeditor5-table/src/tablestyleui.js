/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablestyleui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { findAncestor } from './commands/utils';

/**
 * The table style UI feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableStyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		this._setupUI();
	}

	_setupUI() {
		const editor = this.editor;
		const model = editor.model;
		const document = model.document;
		const selection = document.selection;

		const componentFactory = editor.ui.componentFactory;

		componentFactory.add( 'borderWidth', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Border width',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
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

		componentFactory.add( 'borderColor', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Border color',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
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

		componentFactory.add( 'borderStyle', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Border style',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
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

		componentFactory.add( 'backgroundColor', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Background color',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
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

		componentFactory.add( 'padding', locale => {
			const button = new ButtonView( locale );

			button.set( {
				label: 'Cell padding',
				icon: false,
				tooltip: true,
				withText: true
			} );

			button.on( 'execute', () => {
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
