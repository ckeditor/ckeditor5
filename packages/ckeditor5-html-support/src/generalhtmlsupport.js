/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/generalhtmlsupport
 */

import { Plugin } from 'ckeditor5/src/core';
import { toArray } from 'ckeditor5/src/utils';

import DataFilter from './datafilter';
import CodeBlockElementSupport from './integrations/codeblock';
import DualContentModelElementSupport from './integrations/dualcontent';
import HeadingElementSupport from './integrations/heading';
import ImageElementSupport from './integrations/image';
import MediaEmbedElementSupport from './integrations/mediaembed';
import ScriptElementSupport from './integrations/script';
import TableElementSupport from './integrations/table';
import StyleElementSupport from './integrations/style';
import DocumentListElementSupport from './integrations/documentlist';
import CustomElementSupport from './integrations/customelement';

/**
 * The General HTML Support feature.
 *
 * This is a "glue" plugin which initializes the {@link module:html-support/datafilter~DataFilter data filter} configuration
 * and features integration with the General HTML Support.
 *
 * @extends module:core/plugin~Plugin
 */
export default class GeneralHtmlSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'GeneralHtmlSupport';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [
			DataFilter,
			CodeBlockElementSupport,
			DualContentModelElementSupport,
			HeadingElementSupport,
			ImageElementSupport,
			MediaEmbedElementSupport,
			ScriptElementSupport,
			TableElementSupport,
			StyleElementSupport,
			DocumentListElementSupport,
			CustomElementSupport
		];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dataFilter = editor.plugins.get( DataFilter );

		// Load the filtering configuration.
		dataFilter.loadAllowedConfig( editor.config.get( 'htmlSupport.allow' ) || [] );
		dataFilter.loadDisallowedConfig( editor.config.get( 'htmlSupport.disallow' ) || [] );
	}

	/**
	 * Returns a GHS model attribute name related to a given view element name.
	 *
	 * @protected
	 * @param {String} viewElementName A view element name.
	 * @returns {String}
	 */
	getGhsAttributeNameForElement( viewElementName ) {
		const dataSchema = this.editor.plugins.get( 'DataSchema' );
		const definitions = Array.from( dataSchema.getDefinitionsForView( viewElementName, false ) );

		if ( definitions && definitions.length && definitions[ 0 ].isInline && !definitions[ 0 ].isObject ) {
			return definitions[ 0 ].model;
		}

		return 'htmlAttributes';
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it includes the given class name.
	 *
	 * @protected
	 * @param {String} viewElementName A view element name.
	 * @param {String|Array.<String>} className The css class to add.
	 * @param {module:engine/model/selection~Selectable} selectable The selection or element to update.
	 */
	addModelHtmlClass( viewElementName, className, selectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'classes', classes => {
					for ( const value of toArray( className ) ) {
						classes.add( value );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it does not include the given class name.
	 *
	 * @protected
	 * @param {String} viewElementName A view element name.
	 * @param {String|Array.<String>} className The css class to remove.
	 * @param {module:engine/model/selection~Selectable} selectable The selection or element to update.
	 */
	removeModelHtmlClass( viewElementName, className, selectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'classes', classes => {
					for ( const value of toArray( className ) ) {
						classes.delete( value );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it includes the given attribute.
	 *
	 * @protected
	 * @param {String} viewElementName A view element name.
	 * @param {Object} attributes The object with attributes to set.
	 * @param {module:engine/model/selection~Selectable} selectable The selection or element to update.
	 */
	setModelHtmlAttributes( viewElementName, attributes, selectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'attributes', attributesMap => {
					for ( const [ key, value ] of Object.entries( attributes ) ) {
						attributesMap.set( key, value );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it does not include the given attribute.
	 *
	 * @protected
	 * @param {String} viewElementName A view element name.
	 * @param {String|Array.<String>} attributeName The attribute name (or names) to remove.
	 * @param {module:engine/model/selection~Selectable} selectable The selection or element to update.
	 */
	removeModelHtmlAttributes( viewElementName, attributeName, selectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'attributes', attributesMap => {
					for ( const key of toArray( attributeName ) ) {
						attributesMap.delete( key );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it includes a given style.
	 *
	 * @protected
	 * @param {String} viewElementName A view element name.
	 * @param {Object} styles The object with styles to set.
	 * @param {module:engine/model/selection~Selectable} selectable The selection or element to update.
	 */
	setModelHtmlStyles( viewElementName, styles, selectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'styles', stylesMap => {
					for ( const [ key, value ] of Object.entries( styles ) ) {
						stylesMap.set( key, value );
					}
				} );
			}
		} );
	}

	/**
	 * Updates GHS model attribute for a specified view element name, so it does not include a given style.
	 *
	 * @protected
	 * @param {String} viewElementName A view element name.
	 * @param {String|Array.<String>} properties The style (or styles list) to remove.
	 * @param {module:engine/model/selection~Selectable} selectable The selection or element to update.
	 */
	removeModelHtmlStyles( viewElementName, properties, selectable ) {
		const model = this.editor.model;
		const ghsAttributeName = this.getGhsAttributeNameForElement( viewElementName );

		model.change( writer => {
			for ( const item of getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) ) {
				modifyGhsAttribute( writer, item, ghsAttributeName, 'styles', stylesMap => {
					for ( const key of toArray( properties ) ) {
						stylesMap.delete( key );
					}
				} );
			}
		} );
	}
}

// Returns an iterator over an items in the selectable that accept given GHS attribute.
function* getItemsToUpdateGhsAttribute( model, selectable, ghsAttributeName ) {
	if ( selectable.is( 'documentSelection' ) && selectable.isCollapsed ) {
		if ( model.schema.checkAttributeInSelection( selectable, ghsAttributeName ) ) {
			yield selectable;
		}
	} else {
		for ( const range of getValidRangesForSelectable( model, selectable, ghsAttributeName ) ) {
			yield* range.getItems( { shallow: true } );
		}
	}
}

// Translates a given selectable to an iterable of ranges.
function getValidRangesForSelectable( model, selectable, ghsAttributeName ) {
	if ( selectable.is( 'node' ) || selectable.is( '$text' ) || selectable.is( '$textProxy' ) ) {
		if ( model.schema.checkAttribute( selectable, ghsAttributeName ) ) {
			return [ model.createRangeOn( selectable ) ];
		} else {
			return [];
		}
	} else {
		return model.schema.getValidRanges( model.createSelection( selectable ).getRanges(), ghsAttributeName );
	}
}

// Updates a GHS attribute on a specified item.
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/item~Item|module:engine/model/documentselection~DocumentSelection} item
// @param {String} ghsAttributeName
// @param {'classes'|'attributes'|'styles'} subject
// @param {Function} callback That receives a map or set as an argument and should modify it (add or remove entries).
function modifyGhsAttribute( writer, item, ghsAttributeName, subject, callback ) {
	const oldValue = item.getAttribute( ghsAttributeName );
	const newValue = {};

	for ( const kind of [ 'attributes', 'styles', 'classes' ] ) {
		if ( kind != subject ) {
			if ( oldValue && oldValue[ kind ] ) {
				newValue[ kind ] = oldValue[ kind ];
			}
		} else {
			const values = kind == 'classes' ?
				new Set( oldValue && oldValue[ kind ] || [] ) :
				new Map( Object.entries( oldValue && oldValue[ kind ] || {} ) );

			callback( values );

			if ( values.size ) {
				newValue[ kind ] = kind == 'classes' ? Array.from( values ) : Object.fromEntries( values );
			}
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
 * The configuration of the General HTML Support feature.
 * Introduced by the {@link module:html-support/generalhtmlsupport~GeneralHtmlSupport} feature.
 *
 * Read more in {@link module:html-support/generalhtmlsupport~GeneralHtmlSupportConfig}.
 *
 * @member {module:htmlsupport/generalhtmlsupport~GeneralHtmlSupportConfig} module:core/editor/editorconfig~EditorConfig#htmlSupport
 */

/**
 * The configuration of the General HTML Support feature.
 * The option is used by the {@link module:html-support/generalhtmlsupport~GeneralHtmlSupport} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				htmlSupport: ... // General HTML Support feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface GeneralHtmlSupportConfig
 */

/**
 * The configuration of allowed content rules used by General HTML Support.
 *
 * Setting this configuration option will enable HTML features that are not explicitly supported by any other dedicated CKEditor 5 features.
 *
 * 		const htmlSupportConfig.allow = [
 * 			{
 * 				name: 'div',                      // Enable 'div' element support,
 * 				classes: [ 'special-container' ], // allow 'special-container' class,
 * 				styles: 'background',             // allow 'background' style,
 * 				attributes: true                  // allow any attribute (can be empty).
 * 			},
 * 			{
 * 				name: 'p',                                   // Extend existing Paragraph feature,
 * 				classes: 'highlighted'                       // with 'highlighted' class,
 * 				attributes: [
 * 					{ key: 'data-i18n-context, value: true } // and i18n attribute.
 * 				]
 * 			}
 * 		];
 *
 * @member {Array.<module:engine/view/matcher~MatcherPattern>} module:html-support/generalhtmlsupport~GeneralHtmlSupportConfig#allow
 */

/**
 * The configuration of disallowed content rules used by General HTML Support.
 *
 * Setting this configuration option will disable listed HTML features.
 *
 * 		const htmlSupportConfig.disallow = [
 * 			{
 * 				name: /[\s\S]+/    // For every HTML feature,
 * 				attributes: {
 * 					key: /^on.*$/ // disable 'on*' attributes, like 'onClick', 'onError' etc.
 * 				}
 * 			}
 * 		];
 * @member {Array.<module:engine/view/matcher~MatcherPattern>} module:html-support/generalhtmlsupport~GeneralHtmlSupportConfig#disallow
 */
