---
category: tutorial
order: 50
menu-title: Updating model using commands
---

# Updating model using commands

## Commands purpose

Now that we have data conversion sorted out, let's register a `highlight` command. Commands encapsulate logic that can be execute by other plugins or from the UI, for example by clicking a button in the editor's toolbar.

## Registering a command

Let's create a new `HighlightCommand` class below the `Highlight` function in `src/plugin.js`:

```js
import { Command } from 'ckeditor5/src/core';

class HighlightCommand extends Command {
	refresh() {
		
	}

	execute() {
		
	}
}
```

Then at the bottom of the `Highlight` function add the following code to register the command:

```js
editor.commands.add('highlight', new HighlightCommand( editor ));
```

Our command class has two methods:

* `refresh()` which handles command state,
* `execute()` which handles command logic.

### Command state

In our plugin, the state will indicate if selection(s) in the editor:

* can be highlighted,
* are already highlighted or not.

...

### Command logic

In our plugin, the action will be highlighting text selected in the editor, or — more precisely — toggling the `highlight` attribute on text nodes.

...
