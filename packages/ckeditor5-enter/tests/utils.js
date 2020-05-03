/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getCopyOnEnterAttributes } from '../src/utils';
import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';

describe( 'utils', () => {
	describe( 'getCopyOnEnterAttributes()', () => {
		it( 'filters attributes with copyOnEnter property', () => {
			return ModelTestEditor.create()
				.then( editor => {
					const schema = editor.model.schema;

					schema.extend( '$text', {
						allowAttributes: [ 'foo', 'bar', 'baz' ]
					} );

					schema.setAttributeProperties( 'foo', { copyOnEnter: true } );
					schema.setAttributeProperties( 'baz', { copyOnEnter: true } );

					const allAttributes = ( new Map( [
						[ 'foo', true ],
						[ 'bar', true ],
						[ 'baz', true ]
					] ) )[ Symbol.iterator ]();

					expect( Array.from( getCopyOnEnterAttributes( schema, allAttributes ) ) ).to.deep.equal(
						[
							[ 'foo', true ],
							[ 'baz', true ]
						]
					);
				} );
		} );
	} );
} );
