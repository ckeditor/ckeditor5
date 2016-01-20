/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// Batch is split into two files because of circular dependencies reasons.

// Deltas require `register` method that require `Batch` class and is defined in batch-base.js.
// We would like to group all deltas files in one place, so we would only have to include batch.js
// which would already have all default deltas registered.

// Import default suite of deltas so a feature have to include only Batch class file.
import d1 from './delta/insertdelta.js';
import d2 from './delta/weakinsertdelta.js';
import d3 from './delta/movedelta.js';
import d4 from './delta/removedelta.js';
import d5 from './delta/attributedelta.js';
import d6 from './delta/splitdelta.js';
import d7 from './delta/mergedelta.js';
import d8 from './delta/wrapdelta.js';
import d9 from './delta/unwrapdelta.js';
/*jshint unused: false*/

import Batch from './batch-base.js';
export default Batch;
