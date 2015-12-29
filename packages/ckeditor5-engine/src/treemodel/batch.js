/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// All deltas need to be loaded so they can register themselves as Batch methods.
//
// To solve circular dependencies (deltas need to require Batch class), Batch class body is moved
// to treemodel/delta/batch-base.

import Batch from './delta/batch-base';

/* jshint ignore:start */

import d1 from './delta/insertdelta';
import d2 from './delta/weakinsertdelta';
import d3 from './delta/movedelta';
import d4 from './delta/removedelta';
import d5 from './delta/attributedelta';
import d6 from './delta/splitdelta';
import d7 from './delta/mergedelta';
import d8 from './delta/wrapdelta';
import d9 from './delta/unwrapdelta';

/* jshint ignore:end */

export default Batch;
