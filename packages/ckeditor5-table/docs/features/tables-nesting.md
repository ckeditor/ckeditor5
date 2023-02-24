---
menu-title: Nesting tables
category: tables
order: 60
modified_at: 2022-05-19
---

# Nesting tables

{@snippet features/build-table-source}

CKEditor 5 allows nesting tables inside other table's cells. This may be used for creating advanced charts or layouts based on tables. The nested table can be formatted just like a regular one.

<info-box info>
	The basic table feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

## Demo

You can test this feature in the demo below by adding a table in the *"abandoned"* section that was left blank at the bottom of the main table. To nest a table, simply click in the selected cell and use the **"Insert table"** button in the toolbar to insert a new, nested table into an existing one.

{@snippet features/table-nesting}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Known issues

While the table nesting functionality is fully functional, the Markdown code generated with the {@link features/autoformat Markdown output} feature will not properly render nested tables ([#9475](https://github.com/ckeditor/ckeditor5/issues/9475)). Feel free to upvote 👍&nbsp; this issue on GitHub if it is important for you.

## Installation

<info-box info>
	The basic table features are enabled by default in all predefined builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

### Disallow nesting tables

By default, the editor allows nesting a table inside another table's cell.

In order to disallow nesting tables, you need to register an additional schema rule. It needs to be added before the data is loaded into the editor. Due to that, it is best to implement it as a plugin:

```js
function DisallowNestingTables( editor ) {
	editor.model.schema.addChildCheck( ( context, childDefinition ) => {
		if ( childDefinition.name == 'table' && Array.from( context.getNames() ).includes( 'table' ) ) {
			return false;
		}
	} );
}

// Pass it via config.extraPlugins or config.plugins:

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		extraPlugins: [ DisallowNestingTables ],

		// The rest of the configuration.
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
<info-box>
	Check the {@link framework/creating-simple-plugin-timestamp plugin development guide} if you need more information about the technical side of this solution.
</info-box>

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-table).
