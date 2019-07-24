/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/contentnormalizer
 */

import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

/**
 * Content Normalizer class provides a mechanism to transform input data send through
 * an {@link module:clipboard/clipboard~Clipboard#event:inputTransformation inputTransformation event}. It fixes an input content,
 * which has a source in applications like: MS Word, Google Docs, etc. These applications generate content which frequently
 * is an invalid HTML. Content normalizers transform it, what later might be properly upcast to {@link module:engine/model/model~Model}.
 *
 * Content Normalizers are registered by {@link module:paste-from-office/pastefromoffice~PasteFromOffice} plugin. Each instance is
 * initialized with an activation trigger. Activation trigger is a function which gets content of `text/html` dataTransfer (String) and
 * returns `true` or `false`. Based on this result normalizer applies filters to given data.
 *
 * Filters are function, which are run sequentially, as they were added. Each filter gets data transformed by the previous one.
 *
 * Example definition:
 *
 * 	const normalizer = new ContentNormalizer( contentHtml =>
 * 		contentHtml.includes( 'docs-internal-guid' )
 * 	);
 *
 * 	normalizer.addFilter( ( { data } ) => {
 * 		removeBoldTagWrapper( data.content );
 * 	} )
 *
 * 	normalizer.addFilter( ( { data } ) => {
 * 		// ...
 * 		// another modification of data's content
 * 	} );
 *
 * Normalizers are stored inside Paste from Office plugin and are run on
 * {@link module:clipboard/clipboard~Clipboard#event:inputTransformation inputTransformation event}. Below example is simplified and show
 * how to call normalizer directly on clipboard event.
 *
 * 	editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', ( evt, data ) => {
 * 		normalizer.transform( data );
 * 	} );
 *
 * @class
 */
export default class ContentNormalizer {
	/**
	 * Initialize Content Normalizer.
	 *
	 * @param {Function} activationTrigger The function which checks for what content should be applied this normalizer.
	 * It takes an HTML string from the `text/html` dataTarnsfer as an argument and have to return a boolean value
	 */
	constructor( activationTrigger ) {
		/**
		 * Keeps a reference to the activation trigger function. The function is used to check if current Content Normalizer instance
		 * should be applied for given input data. Check is made during the {@link #transform}.
		 *
		 * @private
		 * @type {Function}
		 */
		this._activationTrigger = activationTrigger;

		/**
		 * Keeps a reference to registered filters with {@link #addFilter} method.
		 *
		 * @private
		 * @type {Set}
		 */
		this._filters = new Set();
	}

	/**
	 * Method checks if passed data should have applied {@link #_filters} registerd in this Content Normalizer.
	 * If yes, then data are transformed and marked with a flag `isTransformedWithPasteFromOffice = true`.
	 * In other case data are not modified.
	 *
	 * Please notice that presence of `isTransformedWithPasteFromOffice` flag in input data prevent transformation.
	 * This forbid of running the same normalizer twice or running multiple normalizers over the same data.
	 *
	 * @param data input data object it should preserve structure defined in
	 * {@link module:clipboard/clipboard~Clipboard#event:inputTransformation Clipboard#inputTransformation event}.
	 */
	transform( data ) {
		const html = data.dataTransfer && data.dataTransfer.getData( 'text/html' );
		const dataReadFirstTime = data.isTransformedWithPasteFromOffice === undefined;
		const hasHtmlData = !!html;

		if ( hasHtmlData && dataReadFirstTime && this._activationTrigger( html ) ) {
			this._applyFilters( data );
			data.isTransformedWithPasteFromOffice = true;
		}
	}

	/**
	 * Adds filter function to Content Normalizer.
	 * Function is called with configuration object where `data` key keeps reference to input data obtained from
	 * {@link module:clipboard/clipboard~Clipboard#event:inputTransformation Clipboard#inputTransformation event}
	 *
	 * See also: {@link module:paste-from-office/contentnormalizer~FilterFunction}
	 *
	 * @param {module:paste-from-office/contentnormalizer~FilterFunction} filterFn
	 */
	addFilter( filterFn ) {
		this._filters.add( filterFn );
	}

	/**
	 * Applies filters stored in {@link #_filters} to currently processed data.
	 *
	 * @private
	 * @param {Object} data input data object it should preserve structure defined in
	 * {@link module:clipboard/clipboard~Clipboard#event:inputTransformation Clipboard#inputTransformation event}.
	 */
	_applyFilters( data ) {
		const writer = new UpcastWriter();
		const documentFragment = data.content;

		for ( const filter of this._filters ) {
			filter( { data, documentFragment, writer } );
		}
	}
}

/**
 * Filter function which is used to transform data of
 * {@link module:clipboard/clipboard~Clipboard#event:inputTransformation Clipboard#inputTransformation event}.
 *
 * Filters are used by {@link module:paste-from-office/contentnormalizer~ContentNormalizer}.
 *
 * Example:
 *
 * 	function removeBoldTagWrapper( { documentFragment, writer } ) {
 * 		for ( const childWithWrapper of documentFragment.getChildren() ) {
 * 			if ( childWithWrapper.is( 'b' ) && childWithWrapper.getStyle( 'font-weight' ) === 'normal' ) {
 * 				const childIndex = documentFragment.getChildIndex( childWithWrapper );
 * 				const removedElement = writer.remove( childWithWrapper )[ 0 ];
 *
 * 				writer.insertChild( childIndex, removedElement.getChildren(), documentFragment );
 * 			}
 * 		}
 * 	}
 *
 * @callback module:paste-from-office/contentnormalizer~FilterFunction
 * @param {Object} config
 * @param {Object} config.data input data object it should preserve structure defined in
 * {@link module:clipboard/clipboard~Clipboard#event:inputTransformation Clipboard#inputTransformation event}.
 * @param {module:engine/view/upcastwriter~UpcastWriter} config.writer upcast writer which can be used to manipulate
 * with document fragment.
 * @param {module:engine/view/documentfragment~DocumentFragment} config.documentFragment the `data.content` obtained from
 * {@link module:clipboard/clipboard~Clipboard#event:inputTransformation Clipboard#inputTransformation event}
 */
