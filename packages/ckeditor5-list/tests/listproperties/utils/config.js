/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getNormalizedConfig } from '../../../src/listproperties/utils/config.js';

describe( 'ListProperties - utils - config', () => {
	describe( 'getNormalizedConfig()', () => {
		it( 'should output all list types and enabled `useAttribute`', () => {
			const config = {
				styles: {
					listTypes: [ 'numbered', 'bulleted' ],
					useAttribute: true
				}
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'numbered', 'bulleted' ],
					useAttribute: true
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output `numbered` list type and enabled `useAttribute`', () => {
			const config = {
				styles: {
					useAttribute: true,
					listTypes: [ 'numbered' ]
				}
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'numbered' ],
					useAttribute: true
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output `bulleted` list type and enabled `useAttribute`', () => {
			const config = {
				styles: {
					useAttribute: true,
					listTypes: [ 'bulleted' ]
				}
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'bulleted' ],
					useAttribute: true
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output any list type and enabled `useAttribute`', () => {
			const config = {
				styles: {
					useAttribute: true,
					listTypes: []
				}
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [],
					useAttribute: true
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output `numbered` list type and disabled `useAttribute`', () => {
			const config = {
				styles: {
					listTypes: 'numbered'
				}
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'numbered' ],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output all list types when `styles` is `true`', () => {
			const config = {
				styles: true
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'bulleted', 'numbered' ],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output any list type and disabled `useAttribute` when `styles` is `false`', () => {
			const config = {
				styles: false
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output `numbered` list type and disabled `useAttribute`', () => {
			const config = {
				styles: 'numbered'
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'numbered' ],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output `bulleted` list type and disabled `useAttribute`', () => {
			const config = {
				styles: 'bulleted'
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'bulleted' ],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output all list types and enabled `useAttribute`', () => {
			const config = {
				styles: {
					useAttribute: true
				}
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'bulleted', 'numbered' ],
					useAttribute: true
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output any list type and disabled `useAttribute`', () => {
			const config = {
				styles: undefined
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output all list types and disabled `useAttribute`', () => {
			const config = {
				styles: [ 'bulleted', 'numbered' ]
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'bulleted', 'numbered' ],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output `bulleted` list type and disabled `useAttribute`', () => {
			const config = {
				styles: [ 'bulleted' ]
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'bulleted' ],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should output `numbered` list type and disabled `useAttribute`', () => {
			const config = {
				styles: [ 'numbered' ]
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'numbered' ],
					useAttribute: false
				},
				startIndex: false,
				reversed: false
			} );
		} );

		it( 'should normalize list properties config with `startIndex` and `reversed`', () => {
			const config = {
				styles: true,
				startIndex: true,
				reversed: true
			};

			expect( getNormalizedConfig( config ) ).to.deep.equal( {
				styles: {
					listTypes: [ 'bulleted', 'numbered' ],
					useAttribute: false
				},
				startIndex: true,
				reversed: true
			} );
		} );
	} );
} );
