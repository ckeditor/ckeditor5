# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is **CKEditor 5**, an open-source modular rich-text editor framework with MVC architecture, custom data model, and virtual DOM, written in TypeScript. This repository contains ~65 core packages that form the editing framework.

**Note**: This repository may be part of a larger workspace setup. If there's a parent directory with additional packages and a separate CLAUDE.md file, refer to that file for workspace-specific patterns and extended functionality.

## Core Architecture

CKEditor 5 is built on a clean **Model-View-Controller (MVC)** architecture with three distinct layers:

### The Editing Engine

The editing engine is the heart of CKEditor 5, consisting of:

1. **Model Layer** (`@ckeditor/ckeditor5-engine/src/model`)
   - Custom data model separate from the DOM
   - Defines the document structure using a schema
   - Handles all data operations (insert, delete, modify)
   - Emits change events for the view to react to
   - Example: Text attributes like bold, links, paragraphs

2. **View Layer** (`@ckeditor/ckeditor5-engine/src/view`)
   - Virtual DOM representation
   - Renders the model for user interaction
   - Two sub-layers:
     - **Editing view**: What users see and interact with (contenteditable)
     - **Data view**: HTML representation for saving/loading data
   - Handles rendering, but not data logic

3. **Controller Layer** (`@ckeditor/ckeditor5-engine/src/controller`)
   - Connects model and view
   - **DataController**: Manages data input/output (setData/getData)
   - **EditingController**: Manages the editing view
   - Handles conversions between model and view

### Editor Class Structure

The base `Editor` class provides:
- `editor.model` - Access to data model
- `editor.editing` - Access to editing controller
- `editor.data` - Data controller for get/set operations
- `editor.commands` - Collection of registered commands
- `editor.plugins` - Collection of loaded plugins
- `editor.config` - Configuration object
- `editor.keystrokes` - Keystroke handler

Editor types (ClassicEditor, InlineEditor, BalloonEditor, DecoupledEditor) extend this base class.

## Plugin System

### Plugin Architecture Principles

1. **Every feature is a plugin** - Even basic typing is implemented as a plugin
2. **Plugins are granular** - Features split into small, focused plugins
3. **Engine/UI separation** - Most features split into:
   - `*Editing` plugin: Schema, commands, model/view conversion
   - `*UI` plugin: Buttons, dropdowns, UI components
   - Main plugin: Combines both for convenience

   Example: `Bold` = `BoldEditing` + `BoldUI`

4. **Plugin dependencies** - Use `static requires = [...]` to declare dependencies

### Plugin Structure

```typescript
import { Plugin } from '@ckeditor/ckeditor5-core';

class MyPlugin extends Plugin {
	static get requires() {
		return [ SomeDependency ];
	}

	static get pluginName() {
		return 'MyPlugin';
	}

	init() {
		// Initialization logic.
		// Access: this.editor
	}

	afterInit() {
		// Code that runs after all plugins are initialized.
	}
}
```

### Common Plugin Patterns

- **Schema definition**: Define what elements/attributes are allowed in the model
- **Converters**: Convert between model ↔ view (both directions)
- **Commands**: Implement user actions (insert, delete, format)
- **Keystroke bindings**: Bind keyboard shortcuts to commands
- **UI components**: Buttons, dropdowns, toolbars

## Commands

Commands implement the **Command pattern** for all editor actions.

### Command Structure

```typescript
import { Command } from '@ckeditor/ckeditor5-core';

class MyCommand extends Command {
	refresh() {
		// Update command state (enabled/disabled, value).
		this.isEnabled = /* check if command can execute */;
		this.value = /* current command value */;
	}

	execute( options ) {
		// Perform the action.
		const model = this.editor.model;

		model.change( writer => {
			// All model modifications go through writer.
			writer.insertText( 'Hello', model.document.selection.getFirstPosition() );
		} );
	}
}
```

### Command Patterns

- Register commands in plugin's `init()`: `editor.commands.add( 'myCommand', new MyCommand( editor ) )`
- Execute via: `editor.execute( 'myCommand', { options } )`
- Commands have state: `isEnabled`, `value`
- Use `refresh()` to update state based on selection/model

## Package Structure

Core packages follow this structure:
```
ckeditor5-{feature}/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── {feature}.ts                # Main plugin (combines editing + UI)
│   ├── {feature}editing.ts         # Engine plugin
│   ├── {feature}ui.ts              # UI plugin
│   ├── {feature}command.ts         # Command implementation
│   └── ...                         # Additional implementation files
├── tests/
│   ├── {feature}.js                # Tests (JavaScript, not TypeScript)
│   ├── manual/                     # Manual test samples
│   └── ...
├── theme/
│   └── {feature}.css               # CSS styles
├── docs/
│   └── api/                        # API documentation
└── package.json
```

## Essential Commands

### Installation & Setup
```bash
pnpm install                       # Install all dependencies
pnpm reinstall                     # Clean reinstall
```

### Testing

#### Automated Tests
```bash
pnpm test                         # Run all automated tests
pnpm test -- --files=core         # Run tests for specific package
pnpm test -- -c --files=engine    # Run with coverage
pnpm test -- -w --files=typing    # Watch mode
pnpm test -- -s --files=core      # With source maps for debugging
pnpm test -- -cws --files=engine/view/  # Combined: coverage, watch, source maps

# Pattern matching for --files:
# core                  - All ckeditor5-core tests
# editor-*              - All editor variant packages
# engine/view/          - Specific namespace within package
# core,engine           - Multiple packages (comma-separated)
# !core                 - Everything except core
# !(core|engine)        - All except core and engine
```

Key options:
- `--watch` / `-w` - Watch files and rerun tests on changes
- `--coverage` / `-c` - Generate code coverage reports
- `--source-map` / `-s` - Generate source maps for debugging
- `--verbose` / `-v` - Enable webpack logging
- `--files` - Target specific packages or test files
- `--browsers` - Specify browsers (defaults to Chrome)

#### Manual Tests
```bash
pnpm manual                                      # Start manual test server at http://localhost:8125
pnpm manual -- --files=core                      # Run specific package's manual tests
pnpm manual -- --language=pl                     # Set UI language
pnpm manual -- --additional-languages=ar,pl,es   # Add multiple languages
pnpm manual -- --port=8888                       # Use custom port
pnpm manual -- --disable-watch                   # Disable file watching
pnpm manual:verify                               # Verify all manual tests via headless crawler
```

Manual tests require three files with matching names in `packages/*/tests/manual/`:
- `.md` file - Test description and steps
- `.js` file - Editor initialization code
- `.html` file - HTML markup

Tests use @ckeditor/ckeditor5-dev-tests (custom Karma + Webpack runner).

### Linting
```bash
pnpm lint                          # ESLint for TypeScript/JavaScript
pnpm stylelint                     # Stylelint for CSS
```

### Building
```bash
pnpm dll:build                     # Build DLL bundles
pnpm build:dist                    # Build distribution packages
```

### Documentation
```bash
pnpm docs                            # Build full documentation
pnpm docs -- --skip-api              # Build without API docs (faster)
pnpm docs -- --skip-snippets         # Build without live code snippets
pnpm docs -- --watch                 # Watch mode for guides
pnpm docs -- --guides=framework/*    # Build specific guides (glob pattern)
pnpm docs:api                        # Build API docs only
pnpm docs:serve                      # Serve docs at https://localhost:8080
pnpm docs:verify                     # Verify documentation with crawler
```

Output: `build/docs/` directory

#### CKEditor 5 Documentation MCP Server
Claude Code can access the official CKEditor 5 documentation through an MCP server:

**Installation:**
```bash
claude mcp add --transport http ckeditor5-docs https://ckeditor5.mcp.kapa.ai
```

**Authentication:**
After installation, authenticate by going to `/mcp` → ckeditor5-docs → Authenticate

This provides direct access to CKEditor 5 documentation during development.

### Translations
```bash
pnpm translations:synchronize      # Sync translation files
pnpm translations:validate         # Validate translations
```

### Changelog
```bash
pnpm nice                          # Create changelog entry interactively
```

## Development Patterns

### Import Patterns and Package Layers

CKEditor 5 source code is organized in layers, and each layer has specific rules for importing modules from other packages. **The ESLint rule `ckeditor5-rules/ckeditor-imports` enforces these patterns** - when in doubt, run the linter.

#### Layer 1: Base Utilities (`ckeditor5-utils`)
The foundational layer with no external dependencies.

```typescript
// ✅ Only relative imports within the package
import { EmitterMixin } from './emittermixin.js';
import { uid } from './uid.js';
```

#### Layer 2: Framework Core (`ckeditor5-core`, `ckeditor5-engine`, `ckeditor5-ui`)
Core framework packages that form the editing foundation.

```typescript
// ✅ Import from other framework packages using @ckeditor/* format
import { Config, ObservableMixin } from '@ckeditor/ckeditor5-utils';
import { Conversion } from '@ckeditor/ckeditor5-engine';

// ✅ Relative imports within the same package
import { Editor } from './editor/editor.js';
```

#### Layer 3: Main Aggregator (`ckeditor5`)
The main package that re-exports all framework packages for easier consumption by feature packages.

```typescript
// This package re-exports from framework packages:
// ckeditor5/src/core.ts -> exports * from '@ckeditor/ckeditor5-core'
// ckeditor5/src/engine.ts -> exports * from '@ckeditor/ckeditor5-engine'
// ckeditor5/src/ui.ts -> exports * from '@ckeditor/ckeditor5-ui'
```

#### Layer 4: Feature Packages (all other packages)
Feature packages like `ckeditor5-alignment`, `ckeditor5-basic-styles`, `ckeditor5-table`, etc.

```typescript
// ✅ Import framework modules through the main ckeditor5 package
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { DowncastAttributeDescriptor } from 'ckeditor5/src/engine.js';
import { ButtonView } from 'ckeditor5/src/ui.js';

// ✅ Relative imports within the same package
import { AlignmentCommand } from './alignmentcommand.js';
import { isSupported } from './utils.js';

// ❌ DO NOT import framework packages directly
import { Plugin } from '@ckeditor/ckeditor5-core'; // WRONG!
```

#### Import Rules Summary

| Package Type | Import Framework From | Import Own Modules |
|--------------|----------------------|-------------------|
| `ckeditor5-utils` | N/A (base layer) | Relative imports |
| Framework (`core`, `engine`, `ui`) | `@ckeditor/ckeditor5-*` | Relative imports |
| Features (all others) | `ckeditor5/src/*.js` | Relative imports |

**Important**: Always include file extensions (`.js`) in import paths. The ESLint rule `ckeditor5-rules/require-file-extensions-in-imports` enforces this.

### Code Style Conventions

CKEditor 5 follows specific code style rules enforced by ESLint and documented in the [official code style guide](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/code-style.html).

#### Key Rules

**Naming Conventions:**
- Variables/functions: `lowerCamelCase`
- Classes: `UpperCamelCase`
- Constants: `ALLCAPS`
- Private members: prefix with `_` (e.g., `_privateMethod()`)
- Boolean variables: use auxiliary verb prefix (e.g., `isDirty`, `hasChildren`, `canObserve`)

**Formatting:**
- **Indentation**: Tabs (display as 4 spaces)
- **Max line length**: 120 characters (140 absolute max)
- **Whitespace**: Inside parentheses and around operators
  - `function foo( a, b )` not `function foo(a, b)`
  - `c = ( d + e ) * 2` not `c=(d+e)*2`
- **Strings**: Use single quotes `'string'` not `"string"`
- **Line endings**: LF only (no CRLF)

**Comments:**
- Precede with blank line
- Start with capital letter, end with period
- Use `//` for inline comments, `/** */` only for documentation

**File naming:**
- Lowercase with dashes: `data-processor.ts`
- Classes as single words: `DataProcessor` → `dataprocessor.ts`

**TypeScript Best Practices:**
- Use explicit return types on exported functions
- Avoid `any` type - use specific types or generics
- Avoid `@ts-ignore` - fix the underlying issue instead
- No magic numbers - use named constants
- Prefer composition over inheritance
- Inject dependencies via constructors

**Testing Conventions:**
- Use Arrange-Act-Assert (AAA) structure in tests
- Write isolated, self-validating tests
- One test per scenario - avoid multiple assertions for different cases

**Dependencies:**
- Use minimal external libraries
- Only add dependencies when actively used in code
- Use `pnpm add` (not npm or yarn)

### Model Operations

Always use `model.change()` for modifications:
```typescript
editor.model.change( writer => {
	writer.insertText( 'text', position );
	writer.setAttribute( 'bold', true, range );
	writer.remove( range );
} );
```

### Schema Definition

Define what's allowed in the model:
```typescript
schema.register( 'myElement', {
	allowIn: '$root',
	allowChildren: '$text',
	allowAttributes: [ 'myAttribute' ]
} );
```

### Converters (Model ↔ View)

**Model to View (Downcast)**:
```typescript
editor.conversion.for( 'editingDowncast' ).elementToElement( {
	model: 'myElement',
	view: 'div'
} );
```

**View to Model (Upcast)**:
```typescript
editor.conversion.for( 'upcast' ).elementToElement( {
	view: 'div',
	model: 'myElement'
} );
```

### UI Components

UI components from `@ckeditor/ckeditor5-ui`:
- `ButtonView` - Buttons
- `DropdownView` - Dropdowns
- `ToolbarView` - Toolbars
- `View` - Base view class

### Selection and Ranges

- `editor.model.document.selection` - Current selection in model
- Use `Range` for spans of content
- Use `Position` for specific locations
- Use `writer.setSelection()` to modify selection

## TypeScript Patterns

### Type Exports
Core packages export TypeScript types for public APIs. Import like:
```typescript
import type { Editor } from '@ckeditor/ckeditor5-core';
```

### Module Augmentation
Some packages augment core types via `augmentation.ts` files.

## Testing Strategy

### Test File Patterns
- Tests are `.js` files (not `.ts`)
- Located in `packages/*/tests/`
- Manual tests in `packages/*/tests/manual/`

### Common Test Utilities
- `VirtualTestEditor` - Lightweight editor for unit tests
- `ClassicTestEditor` - Classic editor for integration tests
- `setData()` / `getData()` - Set/get model data in tests
- `DomEmitter` - Test DOM events

## Important Core Packages

- **ckeditor5-core**: Editor base, plugin system, commands
- **ckeditor5-engine**: Model, view, controller, schema, converters
- **ckeditor5-ui**: UI component library
- **ckeditor5-utils**: Utility functions, event system
- **ckeditor5-typing**: Typing and input handling
- **ckeditor5-clipboard**: Copy/paste handling
- **ckeditor5-undo**: Undo/redo functionality
- **ckeditor5-enter**: Enter key handling
- **ckeditor5-widget**: Widget system for complex elements

## Extended Workspace Setup

This repository can be used standalone or as part of a larger workspace that includes additional packages. When used within a larger setup:

- The workspace may use a unified pnpm configuration that links multiple package directories
- Additional packages may extend core CKEditor 5 functionality
- There may be a parent-level CLAUDE.md with workspace-specific documentation
- Build and test commands may be coordinated across multiple package sets

Check for a `pnpm-workspace.yaml` in parent directories to identify workspace boundaries.

## Node & Package Manager Requirements

- **Node.js**: >=24.11.0
- **pnpm**: >=10.17.0 (Yarn is not supported)

## Documentation Resources

- **Framework Docs**: https://ckeditor.com/docs/ckeditor5/latest/framework/index.html
- **API Docs**: https://ckeditor.com/docs/ckeditor5/latest/api/index.html
- **Architecture Guide**: https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/intro.html
- **Plugin Development**: https://ckeditor.com/docs/ckeditor5/latest/framework/plugins/creating-plugins.html

## CI/CD

CircleCI is used for continuous integration (see `.circleci/config.yml`). The CI pipeline runs tests, linting, and validation checks.
