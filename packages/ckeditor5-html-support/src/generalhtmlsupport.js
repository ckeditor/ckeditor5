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
import { setModelHtmlAttribute, setModelSelectionHtmlAttribute } from './conversionutils';

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
			StyleElementSupport
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
	 * TODO
	 *
	 * @param {String} viewElementName
	 * @param {String|Array.<String>} className
	 * @param {module:engine/model/selection~Selectable} selectable
	 */
	addModelHtmlClass( viewElementName, className, selectable ) {
		const model = this.editor.model;
		const dataSchema = this.editor.plugins.get( 'DataSchema' );
		const definitions = Array.from( dataSchema.getDefinitionsForView( viewElementName, false ) );

		let htmlAttributeName = 'htmlAttributes';

		if ( definitions && definitions[ 0 ].isInline ) {
			htmlAttributeName = definitions[ 0 ].model;
		}

		model.change( writer => {
			if ( selectable.is( 'selection' ) && selectable.isCollapsed ) {
				if ( model.schema.checkAttributeInSelection( selectable, htmlAttributeName ) ) {
					const attributeValue = selectable.getAttribute( htmlAttributeName );
					const classes = new Set( attributeValue && attributeValue.classes || [] );

					for ( const name of toArray( className ) ) {
						classes.add( name );
					}

					setModelHtmlAttribute( writer, selectable, htmlAttributeName, 'classes', Array.from( classes ) );
				}

				return;
			}

			let ranges = [];

			if ( selectable.is( 'range' ) ) {
				ranges = model.schema.getValidRanges( [ selectable ], htmlAttributeName );
			} else if ( selectable.is( 'selection' ) ) {
				ranges = model.schema.getValidRanges( selectable.getRanges(), htmlAttributeName );
			} else if ( model.schema.checkAttribute( selectable, htmlAttributeName ) ) {
				ranges = [ model.createRangeOn( selectable ) ];
			}

			for ( const range of ranges ) {
				for ( const item of range.getItems( { shallow: true } ) ) {
					const attributeValue = item.getAttribute( htmlAttributeName );
					const classes = new Set( attributeValue && attributeValue.classes || [] );

					for ( const name of toArray( className ) ) {
						classes.add( name );
					}

					setModelHtmlAttribute( writer, item, htmlAttributeName, 'classes', Array.from( classes ) );
				}
			}
		} );
	}

	/**
	 * TODO
	 *
	 * @param {String} viewElementName
	 * @param {String|Array.<String>} className
	 * @param {module:engine/model/selection~Selectable} selectable
	 */
	removeModelHtmlClass( viewElementName, className, selectable ) {
		const model = this.editor.model;
		const dataSchema = this.editor.plugins.get( 'DataSchema' );
		const definitions = Array.from( dataSchema.getDefinitionsForView( viewElementName, false ) );

		let htmlAttributeName = 'htmlAttributes';

		if ( definitions && definitions[ 0 ].isInline ) {
			htmlAttributeName = definitions[ 0 ].model;
		}

		model.change( writer => {
			if ( selectable.is( 'selection' ) && selectable.isCollapsed ) {
				if ( model.schema.checkAttributeInSelection( selectable, htmlAttributeName ) ) {
					const attributeValue = selectable.getAttribute( htmlAttributeName );
					const classes = new Set( attributeValue && attributeValue.classes || [] );

					for ( const name of toArray( className ) ) {
						classes.delete( name );
					}

					setModelHtmlAttribute( writer, selectable, htmlAttributeName, 'classes', Array.from( classes ) );
				}

				return;
			}

			let ranges = [];

			if ( selectable.is( 'range' ) ) {
				ranges = model.schema.getValidRanges( [ selectable ], htmlAttributeName );
			} else if ( selectable.is( 'selection' ) ) {
				ranges = model.schema.getValidRanges( selectable.getRanges(), htmlAttributeName );
			} else if ( model.schema.checkAttribute( selectable, htmlAttributeName ) ) {
				ranges = [ model.createRangeOn( selectable ) ];
			}

			for ( const range of ranges ) {
				for ( const item of range.getItems( { shallow: true } ) ) {
					const attributeValue = item.getAttribute( htmlAttributeName );
					const classes = new Set( attributeValue && attributeValue.classes || [] );

					for ( const name of toArray( className ) ) {
						classes.delete( name );
					}

					setModelHtmlAttribute( writer, item, htmlAttributeName, 'classes', Array.from( classes ) );
				}
			}
		} );
	}

	/**
	 * TODO to remove
	 * Helper function to update only one attribute from all html attributes on a model element.
	 *
	 * @protected
	 * @deprecated
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 * @param {module:engine/model/element~Element|module:engine/model/text~Text} node Element or text node.
	 * @param {String} attributeName Attribute name like `htmlAttributes`, `htmlSpan`, `htmlCode` etc.
	 * @param {'styles'|'classes'|'attributes'} attributeKey Attribute key in the attributes object
	 * @param {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} attributeValue New attribute value
	 */
	setModelHtmlAttribute( writer, node, attributeName, attributeKey, attributeValue ) {
		setModelHtmlAttribute( writer, node, attributeName, attributeKey, attributeValue );
	}

	/**
	 * TODO to remove
	 * Helper function to update only one attribute from all html attributes on a model selection.
	 *
	 * @protected
	 * @deprecated
	 * @param {module:engine/model/model~Model} model writer
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
	 * @param {String} attributeName Attribute name like `htmlAttributes`, `htmlSpan`, `htmlCode` etc.
	 * @param {'styles'|'classes'|'attributes'} attributeKey Attribute key in the attributes object
	 * @param {Boolean|String|RegExp|Object|Array.<String|RegExp|Object>} attributeValue New attribute value
	 */
	setModelSelectionHtmlAttribute( model, writer, attributeName, attributeKey, attributeValue ) {
		setModelSelectionHtmlAttribute( model, writer, attributeName, attributeKey, attributeValue );
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
