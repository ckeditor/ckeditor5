/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// All deltas need to be loaded so they can register themselves as Batch methods.
//
// To solve circular dependencies (deltas need to require Batch class), Batch class body is moved
// to treemodel/delta/batch-base.

import Batch from './delta/batch-base.js';

/* jshint ignore:start */

import d1 from './delta/insertdelta.js';
import d2 from './delta/weakinsertdelta.js';
import d3 from './delta/movedelta.js';
import d4 from './delta/removedelta.js';
import d5 from './delta/attributedelta.js';
import d6 from './delta/splitdelta.js';
import d7 from './delta/mergedelta.js';
import d8 from './delta/wrapdelta.js';
import d9 from './delta/unwrapdelta.js';

/* jshint ignore:end */

export default Batch;
