---
category: framework-contributing
order: 30
modified_at: 2021-10-25
---

# Code style

{@link framework/guides/contributing/development-environment CKEditor 5 development environment} has ESLint enabled both as a pre-commit hook and on CI. This means that code style issues are detected automatically. Additionally, `.editorconfig` files are present in every repository to automatically adjust your IDEs settings (if it is configured to read them).

Here comes a quick summary of these rules.

## General

**LF for line endings**. Never use CRLF.

The recommended maximum **line length is 120 characters**. It cannot exceed 140 characters.

## Whitespace

**No trailing spaces**. Empty lines should not contain any spaces.

Whitespace **inside parenthesis** and **before and after operators**:

```js
function foo( a, b, c, d, e ) {
	if ( a > b ) {
		c = ( d + e ) * 2;
	}
}

foo( bar() );
```

No whitespace for an **empty parenthesis**:

```js
const a = () => {
	// Statements...
};

a();
```

No whitespace **before colon and semicolon**:

```js
let a, b;

a( 1, 2, 3 );

for ( const i = 0; i < 100; i++ ) {
	// Statements...
}
```

## Indentation

Indentation with **tab**, for both code and comments. Never use spaces.

If you want to have the code readable, set **tab** to **4 spaces** in your IDE.

```js
class Bar {
	a() {
		while ( b in a ) {
			if ( b == c ) {
				// Statements...
			}
		}
	}
}
```

**Multiple lines condition**. Use **one tab** for each line:

```js
if (
	some != really.complex &&
	condition || with &&
	( multiple == lines )
) {
	// Statements...
}

while (
	some != really.complex &&
	condition || with &&
	( multiple == lines )
) {
	// Statements...
}
```

<info-box>
	We do our best to avoid complex conditions. As a rule of thumb, we first recommend finding a way to move the complexity out of the condition, for example, to a separate function with early returns for each "sentence" in such a condition.

	However, overdoing things is not good as well and sometimes such a condition can be perfectly readable (which is the ultimate goal here).
</info-box>

## Braces

Braces **start at the same line** as the head statement and end aligned with it:

```js
function a() {
	// Statements...
}

if ( a ) {
	// Statements...
} else if ( b ) {
	// Statements...
} else {
	// Statements...
}

try {
	// Statements...
} catch ( e ) {
	// Statements...
}
```

## Blank lines

The code should read like a book, so put blank lines between "paragraphs" of code. This is an open and contextual rule, but some recommendations would be to separate the following sections:

* variable, class and function declarations,
* `if()`, `for()` and similar blocks,
* steps of an algorithm,
* `return` statements,
* comment sections (comments should be preceded with a blank line, but if they are the "paragraph" themselves, they should also be followed with one),
* etc.

Example:

```js
class Foo extends Plugin {
	constructor( editor ) {
		super( editor );

		/**
		 * Some documentation...
		 */
		this.foo = new Foo();

		/**
		 * Some documentation...
		 */
		this.isBar = false;
	}

	method( bar ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;

		for ( const range of selection.getRanges() ) {
			const position = range.start;

			if ( !position ) {
				return false;
			}

			// At this stage this and this need to happen.
			// We considered doing this differently, but it has its shortcomings.
			// Refer to the tests and issue #3456 to learn more.

			const result = editor.model.checkSomething( position );

			if ( result ) {
				return true;
			}
		}

		return true;
	}

	performAlgorithm() {
		// 1. Do things A and B.
		this.a();
		this.b();

		// 2. Check C.
		if ( c() ) {
			d();
		}

		// 3. Check whether we are fine.
		const areWeFine = 1 || 2 || 3;

		this.check( areWeFine );

		// 4. Finalize.
		this.finalize( areWeFine );

		return areWeFine;
	}
}
```

## Multi-line statements and calls

Whenever there is a multi-line function call:

* Put the first parameter in a new line.
* Put every parameter in a separate line indented by one tab.
* Put the last closing parenthesis in a new line, at the same indendation level as the beginning of the call.

Examples:

```js
const myObj = new MyClass(
	'Some long parameters',
	'To make this',
	'Multi line'
);

fooBar(
	() => {
		// Statements...
	}
);

fooBar(
	new MyClass(
		'Some long parameters',
		'To make this',
		'Multi line'
	)
);

fooBar(
	'A very long string',
	() => {
		// ... some kind
		// ... of a
		// ... callback
	},
	5,
	new MyClass(
		'It looks well',
		paramA,
		paramB,
		new ShortClass( 2, 3, 5 ),
		'Even when nested'
	)
);
```

<info-box>
	Note that the examples above are just showcasing how such function calls can be structured. However, it is best to avoid them.

	It is generally recommended to avoid having functions that accept more than 3 arguments. Instead, it is better to wrap them in an object so all parameters can be named.

	It is also recommended to split such long statements into multiple shorter ones, for example, by extracting some longer parameters to separate variables.
</info-box>

## Strings

Use **single quotes**:

```js
const a = 'I\'m an example for quotes';
```

Long strings can be **concatenated with plus** (`+`):

```js
const html =
	'Line 1\n' +
	'Line 2\n' +
	'Line 3';
```

or template strings can be used (note that the 2nd and 3rd line will be indented in this case):

```js
const html =
	`Line 1
	Line 2
	Line 3`;
```

Strings of HTML should use indentation for readability:

```js
const html =
	`<p>
		<span>${ a }</span>
	</p>`;
```

## Comments

* Comments are always **preceded by a blank line**.
* Comments start with a **capital first letter** and require a period at the end (since they are sentences).
* There must be a **single space at the start** of the text, right after the comment token.

**Block comments** (`/** ... */`) are used for **documentation only**. Asterisks are aligned with space:

```js
/**
 * Documentation for the following method.
 *
 * @returns {Object} Something.
 */
someMethod() {
	// Statements...
}
```

All **other comments** use **line comments** (```//```):

```js
// A comment about the following statement.
foo();

// Multiple line comments
// go through several
// line comments as well.
```

**Comments related to tickets or issues** should not describe the whole issue fully. A short description should be used instead, together with the ticket number in parenthesis:

```js
// Do this otherwise because of a Safari bug. (#123)
foo();
```

## Linting

CKEditor 5 development environment uses [ESLint](https://eslint.org) and [stylelint](https://stylelint.io/).

A couple of useful links:

* [Disabling ESLint with inline comments](https://eslint.org/docs/2.13.1/user-guide/configuring#disabling-rules-with-inline-comments).
* [CKEditor 5 ESLint preset](https://github.com/ckeditor/eslint-config-ckeditor5/blob/master/.eslintrc.js) (npm: [`eslint-config-ckeditor5`](http://npmjs.com/package/eslint-config-ckeditor5)).
* [CKEditor 5 stylelint preset](https://github.com/ckeditor/stylelint-config-ckeditor5/blob/master/.stylelintrc) (npm: [`stylelint-config-ckeditor5`](https://www.npmjs.com/package/stylelint-config-ckeditor5)).

<info-box>
	Avoid using automatic code formatters on existing code. It is fine to automatically format code that you are editing, but you should not be changing the formatting of the code that is already written to not pollute your PRs. You should also not rely solely on automatic corrections.
</info-box>

## Visibility levels

Each class property (including methods, symbols, getters or setters) can be public, protected or private. The default visibility is public, so you should not document that a property is public &mdash; there is no need to do this.

Additional rules apply to private properties:

* The names of private and protected properties that are exposed in a class prototype (or in any other way) should be prefixed with an underscore.
* When documenting a private variable that is not added to a class prototype (or exposed in any other way), `//` comments should be used and using `@private` is not necessary.
* A symbol property (e.g. `this[ Symbol( 'symbolName' ) ]`) should be documented as `@property {Type} _symbolName`.

Example:

```js
class Foo {
	/**
	 * The constructor (public, as its visibility isn't defined).
	 */
	constructor() {
		/**
		 * Public property.
		 */
		this.foo = 1;

		/**
		 * Protected property.
		 *
		 * @protected
		 */
		this._bar = 1;

		/**
		 * @private
		 * @property {Number} _bom
		 */
		this[ Symbol( 'bom' ) ] = 1;
	}

	/**
	 * @private
	 */
	_somePrivateMethod() {}
}

// Some private helper.
//
// @returns {Number}
function doSomething() {
	return 1;
}
```

### Accessibility

The table below shows the accessibility of properties:

<table border="1" cellpadding="1" cellspacing="1" style="width:500px">
	<thead>
		<tr>
			<th scope="row">&nbsp;</th>
			<th scope="col">Class</th>
			<th scope="col">Package</th>
			<th scope="col">Subclass</th>
			<th scope="col">World</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th scope="row" style="text-align: left;"><code>@public</code></th>
			<td style="text-align:center">yes</td>
			<td style="text-align:center">yes</td>
			<td style="text-align:center">yes</td>
			<td style="text-align:center">yes</td>
		</tr>
		<tr>
			<th scope="row" style="text-align: left;"><code>@protected</code></th>
			<td style="text-align:center">yes</td>
			<td style="text-align:center">yes</td>
			<td style="text-align:center">yes</td>
			<td style="text-align:center">no</td>
		</tr>
		<tr>
			<th scope="row" style="text-align: left;"><code>@private</code></th>
			<td style="text-align:center">yes</td>
			<td style="text-align:center">no</td>
			<td style="text-align:center">no</td>
			<td style="text-align:center">no</td>
		</tr>
	</tbody>
</table>

(yes – accessible, no – not accessible)

For instance, a protected property is accessible from its own class in which it was defined, from its whole package, and from its subclasses (even if they are not in the same package).

<info-box>
	Protected properties and methods are often used for testability. Since tests are located in the same package as the code, they can access these properties.
</info-box>

## Getters

You can use ES6 getters to simplify class API:

```js
class Position {
	// ...
	get offset() {
		return this.path[ this.path.length - 1 ];
	}
}
```

A getter should feel like a natural property. There are several recommendations to follow when creating getters:

* They should be fast.
* They should not throw.
* They should not change the object state.
* They should not return new instances of an object every time (so `foo.bar == foo.bar` is true). It is OK to create a new instance for the first call and cache it if it is possible.

## Order within class definition

Within class definition the methods and properties should be ordered as follows:

1. Constructor.
1. Getters and setters.
1. Iterators.
1. Public instance methods.
1. Public static methods.
1. Protected instance methods.
1. Protected static methods.
1. Private instance methods.
1. Private static methods.

The order within each group is left for the implementor.

## Tests

There are some special rules and tips for tests.

### Test organization

* Always use an outer `describe()` in a test file. Do not allow any globals, especially hooks (`beforeEach()`, `after()`, etc.) outside the outermost `describe()`.
* The outermost `describe()` calls should create meaningful groups, so when all tests are run together a failing TC can be identified within the code base. For example:

	```js
	describe( 'Editor', () => {
		describe( 'constructor()', () => {
			it( ... );
		} );

		// ...
	} );
	```

	Using titles like *"utils"* is not fine as there are multiple utils in the entire project. *"Table utils"* would be better.
* Test descriptions (`it()`) should be written like documentation (what you do and what should happen), e.g. *"the foo dialog closes when the X button is clicked"*. Also, *"...case 1"*, *"...case 2"* in test descriptions are not helpful.
* Avoid test descriptions like *"does not crash when two ranges get merged"* &mdash; instead explain what is actually expected to happen. For instance: *"leaves 1 range when two ranges get merged"*.
* Most often, using words like "correctly", "works fine" is a code smell. Thing about the requirements &mdash; when writing them you do not say that feature X should "work fine". You document how it should work.
* Ideally, it should be possible to recreate an algorithm just by reading the test descriptions.
* Avoid covering multiple cases under one `it()`. It is OK to have multiple assertions in one test, but not to test e.g. how method `foo()` works when it is called with 1, then with 2, then 3, etc. There should be a separate test for each case.
* Every test should clean after itself, including destroying all editors and removing all elements that have been added.

### Test implementation

* Avoid using real timeouts. Use [fake timers](https://sinonjs.org/releases/v9.0.1/fake-timers/) instead **when possible**. Timeouts make tests really slow.
* However &mdash; do not overoptimize (especially that performance is not a priority in tests). In most cases it is completely fine (and hence recommended) to create a separate editor for every `it()`.
* We aim at having 100% coverage of *all distinctive scenarios*. Covering 100% branches in the code is not the goal here &mdash; it is a byproduct of covering real scenarios.

	Think about this &mdash; when you fix a bug by adding a parameter to an existing function call you do not affect code coverage (that line was called anyway). However, you had a bug, meaning that your test suite did not cover it. Therefore, a test must be created for that code change.
* It should be `expect( x ).to.equal( y )`. **NOT**: ~~`expect( x ).to.be.equal( y )`~~.
* When using Sinon spies, pay attention to the readability of assertions and failure messages.
   * Use named spies, for example:

		```js
		const someCallbackSpy = sinon.spy().named( 'someCallback' );
		const myMethodSpy = sinon.spy( obj, 'myMethod' );
		```
   * Use [sinon-chai assertions](https://www.chaijs.com/plugins/sinon-chai/)

		```js
		expect( myMethodSpy ).to.be.calledOnce
		// expected myMethod to be called once but was called twice
		```

## Naming

### JavaScript code names

Variables, functions, namespaces, parameters and all undocumented cases must be named in [lowerCamelCase](http://en.wikipedia.org/wiki/CamelCase):

```js
let a;
let myLongNamedVariable = true;

function foo() {}

function longNamedFunction( example, longNamedParameter ) {}
```

Classes must be named in [UpperCamelCase](http://en.wikipedia.org/wiki/CamelCase):

```js
class MyClass() {}

const a = new MyClass();
```

Mixins must be named in [UpperCamelCase](http://en.wikipedia.org/wiki/CamelCase), postfixed with "Mixin":

```js
const SomeMixin = {
	method1: ...,
	method2: ...
};
```

Global namespacing variables must be named in [ALLCAPS](http://en.wikipedia.org/wiki/All_caps):

```js
const CKEDITOR_TRANSLATIONS = {};
```

#### Private properties and methods

Private properties and methods are **prefixed with an underscore**:

```js
CKEDITOR._counter;
something._doInternalTask();
```

#### Methods and functions

Methods and functions are **almost always** verbs or actions:

```js
// Good
execute();
this.getNextNumber()

// Bad
this.editable();
this.status();
```

#### Properties and variables

Properties and variables are **almost always** nouns:

```js
const editor = this.editor;
this.name;
this.editable;
```

**Boolean properties and variables** are **always** prefixed by an auxiliary verb:

```js
this.isDirty;
this.hasChildren;
this.canObserve;
this.mustRefresh;
```

### Buttons, Commands and Plugins

#### Buttons

All buttons should follow the **verb + noun** or the **noun** convention. Examples:

* The **verb + noun** convention:
	* `insertTable`
	* `selectAll`
	* `uploadImage`
* The **noun** convention:
	* `bold`
	* `mediaEmbed`
	* `restrictedEditing`

#### Commands

As for commands it is trickier, because there are many more possible combinations of their names than there are for buttons. Examples:

* The **feature-related** convention:
	* **noun-based** case:
		* `codeBlock`
		* `fontColor`
		* `shiftEnter`
	* **verb-based** case:
		* `indent`
		* `removeFormat`
		* `selectAll`
* The **feature + sub-feature** convention:
	* `imageStyle`
	* `imageTextAlternative`
	* `tableAlignment`

For commands, the **noun + verb** (or the **feature + action**) naming conventions **should not be used**, because it does not sound natural (_what do_ vs. _do what_). In most cases the proper name should start with the **action** followed by the **feature** name:

* `checkTodoList`
* `insertTable`
* `uploadImage`

#### Plugins

Plugins should follow the **feature** or the **feature + sub-feature** convention. Examples:
* The **feature** convention:
	* `Bold`
	* `Paragraph`
	* `SpecialCharacters`
* The **feature + sub-feature** convention:
	* `ImageResize`
	* `ListProperties`
	* `TableClipboard`

Plugins must be named in [UpperCamelCase](http://en.wikipedia.org/wiki/CamelCase).

### Shortcuts

For local variables **commonly accepted short versions** for long names are fine:

```js
const attr, doc, el, fn, deps, err, id, args, uid, evt, env;
```

The following are **the only short versions accepted for property names**:

```js
this.lang;
this.config;
this.id;
this.env;
```

### Acronyms and proper names

Acronyms and, partially, proper names are naturally written in uppercase. This may stand against code style rules described above &mdash; especially when there is a need to include an acronym or a proper name in a variable or class name. In such case, one should follow the following rules:

* Acronyms:
	* All lowercase if at the beginning of the variable name: `let domError`.
	* Default camel case at the beginning of the class name: `class DomError`.
	* Default camel case inside the variable or class name: `function getDomError()`.
* Proper names:
	* All lowercase if at the beginning of the variable: `let ckeditorError`.
	* Original case if at the beginning of the class name: `class CKEditorError`.
	* Original case inside the variable or class name: `function getCKEditorError()`.

However, two-letter acronyms and proper names (if originally written uppercase) should be uppercase. So e.g. `getUI` (not `getUi`).

<info-box>
	Two most frequently used acronyms which cause problems:

	* **DOM** &ndash; It should be e.g. `getDomNode()`,
	* **HTML** &ndash; It should be e.g. `toHtml()`.
</info-box>

### CSS classes

CSS class naming pattern is based on [BEM](https://en.bem.info/) methodology and code style. All names are in lowercase with an optional dash (`-`) between the words.

Top–level building **blocks** begin with a mandatory `ck-` prefix:

```css
.ck-dialog
.ck-toolbar
.ck-dropdown-menu
```

**Elements** belonging to the block namespace are delimited by double underscore (`__`):

```css
.ck-dialog__header
.ck-toolbar__group
.ck-dropdown-menu__button-collapser
```

**Modifiers** are delimited by a single underscore (`_`). Key-value modifiers
follow the `block-or-element_key_value` naming pattern:

```css
/* Block modifier */
.ck-dialog_hidden
/* Element modifier */
.ck-toolbar__group_collapsed
/* Block modifier as key_value  */
.ck-dropdown-menu_theme_some-theme
```

In HTML:

```html
<div class="ck-reset_all ck-dialog ck-dialog_theme_lark ck-dialog_visible">
	<div class="ck-dialog__top ck-dialog__top_small">
		<h1 class="ck-dialog__top-title">Title of the dialog</h1>
		...
	</div>
	...
</div>
```

### ID attributes

HTML ID attribute naming pattern follows [CSS classes](#css-classes) naming guidelines. Each ID must begin with the `ck-` prefix and consist of dash–separated (`-`) words in lowercase:

```html
<div id="ck">...</div>
<div id="ck-unique-div">...</div>
<div id="ck-a-very-long-unique-identifier">...</div>
```

### File names

File and directory names must follow a standard that makes their syntax easy to predict:

* All lowercase.
* Only alphanumeric characters are accepted.
* Words are separated by dashes (`-`) ([kebab-case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles)).
	* Code entities are considered single words, so the `DataProcessor` class is defined in the `dataprocessor.js` file.
	* However, a test file covering for "mutations in multi-root editors": `mutations-in-multi-root-editors.js`.
* HTML files have the `.html` extension.

#### Examples

* `ckeditor.js`
* `tools.js`
* `editor.js`
* `dataprocessor.js`
* `build-all.js` and `build-min.js`
* `test-core-style-system.html`

#### Standard files

Widely used standard files do not obey the above rules:

* `README.md`, `LICENSE.md`, `CONTRIBUTING.md`, `CHANGES.md`
* `.gitignore` and all standard "dot-files"
* `node_modules`

## CKEditor 5 custom ESLint rules

In addition to the rules provided by ESLint, CKEditor 5 uses a few custom rules described below.

### Importing between packages: `ckeditor5-rules/no-relative-imports`

While importing modules from the same package, it is allowed to use relative paths, like this:

```js
// Assume we edit a file located in the path: `packages/ckeditor5-engine/src/model/model.js`

import Position from './position';
import insertContent from './utils/insertcontent';
```

While importing modules from other packages, it is not allowed to use relative paths, and the import must be done using the package name, like this:

👎&nbsp; Examples of incorrect code for this rule:

```js
// Assume we edit a file located in the path: `packages/ckeditor5-engine/src/model/model.js`

import CKEditorError from '../../../ckeditor5-utils/src/ckeditorerror';
```

Even if the import statement works locally, it will throw an error when developers install packages from npm.

👍&nbsp; Examples of correct code for this rule:

```js
// Assume we edit a file located in the path: `packages/ckeditor5-engine/src/model/model.js`

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
```

[History of the change.](https://github.com/ckeditor/ckeditor5/issues/7128)

### Description of an error: `ckeditor5-rules/ckeditor-error-message`

Each time a new error is created, it needs a description to be displayed on the {@link support/error-codes error codes} page, like this:

👎&nbsp; Examples of incorrect code for this rule:

```js
// Missing the error's description.

throw new CKEditorError( 'ckeditor5-example-error', this );

// ESLint shouldn't expect the definition of the error as it is already described.

throw new CKEditorError( 'editor-wrong-element', this );
```

👍&nbsp; Examples of correct code for this rule:

```js
// This error occurs for the first time in the project, so it needs to be defined.

/**
 * Description of why the error was thrown and how to fix the code.
 *
 * @error ckeditor5-example-error
 */
throw new CKEditorError( 'ckeditor5-example-error', this );

// This error is already described, so we don't need to provide its documentation.
// We need to disable ESLint for checking the rule.
// It is a good practice to include a note that explains where it is described.

// Documented in core/editor/editor.js
// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
throw new CKEditorError( 'editor-wrong-element', this );
```

[History of the change.](https://github.com/ckeditor/ckeditor5/issues/7822)

### DLL Builds: `ckeditor5-rules/ckeditor-imports`

To make CKEditor 5 plugins compatible with each other, we needed to introduce limitations when importing files from packages.

Packages marked as "Base DLL build" can import between themselves without any restrictions. Names of these packages are specified in the {@link installation/advanced/dll-builds#anatomy-of-a-dll-build DLL builds} guide.

The other CKEditor 5 features (non-DLL) can import "Base DLL" packages using the `ckeditor5` package.

When importing modules from the `ckeditor5` package, all imports must come from the `src/` directory. Other directories are not published on npm, so such imports will not work.

👎&nbsp; Examples of incorrect code for this rule:

```js
// Assume we edit a file located in the path: `packages/ckeditor5-basic-styles/src/bold.js`

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// The import uses the `ckeditor5` package, but the specified path does not exist when installing the package from npm.

import Plugin from 'ckeditor5/packages/ckeditor5-core/src/plugin';
```

👍&nbsp; Examples of correct code for this rule:

```js
// Assume we edit a file located in the path: `packages/ckeditor5-basic-styles/src/bold.js`

import { Plugin } from 'ckeditor5/src/core';
```

Also, non-DLL packages should not import between non-DLL packages to avoid code duplications when building DLL builds.

👎&nbsp; Examples of incorrect code for this rule:

```js
// Assume we edit a file located in the path: `packages/ckeditor5-link/src/linkimage.js`

import { createImageViewElement } from '@ckeditor/ckeditor5-image/src/image/utils.js'
```

To use the `createImageViewElement()` function, consider implementing a utils plugin that will expose the required function in the `ckeditor5-image` package.

When importing a DLL package from another DLL package, an import statement must use the full name of the imported package instead of using the `ckeditor5` notation.

👎&nbsp; Examples of incorrect code for this rule:

```js
// Assume we edit a file located in the path: `packages/ckeditor5-widget/src/widget.js`

import { Plugin } from 'ckeditor5/src/core';
```

👍&nbsp; Examples of correct code for this rule:

```js
// Assume we edit a file located in the path: `packages/ckeditor5-widget/src/widget.js`

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
```

History of changes:

* [Force importing using the `ckeditor5` package.](https://github.com/ckeditor/ckeditor5/issues/8581)
* [Imports from the `ckeditor5` package must use the `src/` directory.](https://github.com/ckeditor/ckeditor5/issues/10030)
* [Imports between DLL packages must use full names of packages.](https://github.com/ckeditor/ckeditor5/issues/10375)

### Cross package imports: `ckeditor5-rules/no-cross-package-imports`

It is allowed to import modules from other packages:

```js
import { toArray } from 'ckeditor5/src/utils';
```

However, some packages cannot import modules from CKEditor 5 as it could lead to code duplication and errors in runtime. Hence, the rule disables this kind of import.

Currently, it applies to the `@ckeditor/ckeditor5-watchdog` package.

👎&nbsp; Examples of an incorrect code for this rule:

```js
// Assume we edit a file located in the `packages/ckeditor5-watchdog/` directory.

import { toArray } from 'ckeditor5/src/utils';
import { toArray } from '@ckeditor/ckeditor5-utils';
import toArray from '@ckeditor/ckeditor5-utils/src/toarray';
```

[History of the change.](https://github.com/ckeditor/ckeditor5/issues/9318)
