/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/utils
 */

import type {
	DocumentSelection,
	DowncastWriter,
	Item,
	ViewElement,
	Writer
} from 'ckeditor5/src/engine.js';
import { startCase, cloneDeep } from 'es-toolkit/compat';

export interface GHSViewAttributes {
	attributes?: Record<string, unknown>;
	classes?: Array<string>;
	styles?: Record<string, string>;
}

/**
* Helper function for the downcast converter. Updates attributes on the given view element.
*
* @param writer The view writer.
* @param oldViewAttributes The previous GHS attribute value.
* @param newViewAttributes The current GHS attribute value.
* @param viewElement The view element to update.
*/
export function updateViewAttributes(
	writer: DowncastWriter,
	oldViewAttributes: GHSViewAttributes,
	newViewAttributes: GHSViewAttributes,
	viewElement: ViewElement
): void {
	if ( oldViewAttributes ) {
		removeViewAttributes( writer, oldViewAttributes, viewElement );
	}

	if ( newViewAttributes ) {
		setViewAttributes( writer, newViewAttributes, viewElement );
	}
}

/**
 * Helper function for the downcast converter. Sets attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 */
export function setViewAttributes( writer: DowncastWriter, viewAttributes: GHSViewAttributes, viewElement: ViewElement ): void {
	if ( viewAttributes.attributes ) {
		for ( const [ key, value ] of Object.entries( viewAttributes.attributes ) ) {
			writer.setAttribute( key, value, viewElement );
		}
	}

	if ( viewAttributes.styles ) {
		writer.setStyle( viewAttributes.styles, viewElement );
	}

	if ( viewAttributes.classes ) {
		writer.addClass( viewAttributes.classes, viewElement );
	}
}

/**
 * Helper function for the downcast converter. Removes attributes on the given view element.
 *
 * @param writer The view writer.
 * @param viewAttributes The GHS attribute value.
 * @param viewElement The view element to update.
 */
export function removeViewAttributes( writer: DowncastWriter, viewAttributes: GHSViewAttributes, viewElement: ViewElement ): void {
	if ( viewAttributes.attributes ) {
		for ( const [ key ] of Object.entries( viewAttributes.attributes ) ) {
			writer.removeAttribute( key, viewElement );
		}
	}

	if ( viewAttributes.styles ) {
		for ( const style of Object.keys( viewAttributes.styles ) ) {
			writer.removeStyle( style, viewElement );
		}
	}

	if ( viewAttributes.classes ) {
		writer.removeClass( viewAttributes.classes, viewElement );
	}
}

/**
* Merges view element attribute objects.
*/
export function mergeViewElementAttributes( target: GHSViewAttributes, source: GHSViewAttributes ): GHSViewAttributes {
	const result = cloneDeep( target ) as Record<string, any>;
	let key: keyof GHSViewAttributes = 'attributes';
	for ( key in source ) {
		// Merge classes.
		if ( key == 'classes' ) {
			result[ key ] = Array.from( new Set( [ ...( target[ key ] || [] ), ...source[ key ]! ] ) );
		}

		// Merge attributes or styles.
		else {
			result[ key ] = { ...target[ key ], ...source[ key ] };
		}
	}

	return result;
}

type ModifyGhsAttributesCallback = ( t: Map<string, unknown> ) => void;
type ModifyGhsClassesCallback = ( t: Set<string> ) => void;
type ModifyGhsStylesCallback = ( t: Map<string, string> ) => void;

/**
 * Updates a GHS attribute on a specified item.
 * @param callback That receives a map as an argument and should modify it (add or remove entries).
 */
export function modifyGhsAttribute(
	writer: Writer,
	item: Item | DocumentSelection,
	ghsAttributeName: string,
	subject: 'attributes',
	callback: ModifyGhsAttributesCallback
): void;

/**
 * Updates a GHS attribute on a specified item.
 * @param callback That receives a set as an argument and should modify it (add or remove entries).
 */
export function modifyGhsAttribute(
	writer: Writer,
	item: Item | DocumentSelection,
	ghsAttributeName: string,
	subject: 'classes',
	callback: ModifyGhsClassesCallback
): void;

/**
 * Updates a GHS attribute on a specified item.
 * @param callback That receives a map as an argument and should modify it (add or remove entries).
 */
export function modifyGhsAttribute(
	writer: Writer,
	item: Item | DocumentSelection,
	ghsAttributeName: string,
	subject: 'styles',
	callback: ModifyGhsStylesCallback
): void;

export function modifyGhsAttribute(
	writer: Writer,
	item: Item | DocumentSelection,
	ghsAttributeName: string,
	subject: 'attributes' | 'styles' | 'classes',
	callback: ModifyGhsClassesCallback | ModifyGhsAttributesCallback | ModifyGhsStylesCallback
): void {
	const oldValue = item.getAttribute( ghsAttributeName ) as Record<string, any>;
	const newValue: Record<string, any> = {};

	for ( const kind of [ 'attributes', 'styles', 'classes' ] ) {
		// Properties other than `subject` should be assigned from `oldValue`.
		if ( kind != subject ) {
			if ( oldValue && oldValue[ kind ] ) {
				newValue[ kind ] = oldValue[ kind ];
			}
			continue;
		}

		// `callback` should be applied on property [`subject`].
		if ( subject == 'classes' ) {
			const values = new Set<string>( oldValue && oldValue.classes || [] );
			( callback as ModifyGhsClassesCallback )( values );
			if ( values.size ) {
				newValue[ kind ] = Array.from( values );
			}
			continue;
		}

		const values = new Map<string, any>( Object.entries( oldValue && oldValue[ kind ] || {} ) );
		( callback as ( ModifyGhsAttributesCallback | ModifyGhsStylesCallback ) )( values );
		if ( values.size ) {
			newValue[ kind ] = Object.fromEntries( values );
		}
	}

	if ( Object.keys( newValue ).length ) {
		if ( item.is( 'documentSelection' ) ) {
			writer.setSelectionAttribute( ghsAttributeName, newValue );
		} else {
			writer.setAttribute( ghsAttributeName, newValue, item );
		}
	} else if ( oldValue ) {
		if ( item.is( 'documentSelection' ) ) {
			writer.removeSelectionAttribute( ghsAttributeName );
		} else {
			writer.removeAttribute( ghsAttributeName, item );
		}
	}
}

/**
 * Transforms passed string to PascalCase format. Examples:
 * * `div` => `Div`
 * * `h1` => `H1`
 * * `table` => `Table`
 */
export function toPascalCase( data: string ): string {
	return startCase( data ).replace( / /g, '' );
}

/**
 * Returns the attribute name of the model element that holds raw HTML attributes.
 */
export function getHtmlAttributeName( viewElementName: string ): string {
	return `html${ toPascalCase( viewElementName ) }Attributes`;
}
