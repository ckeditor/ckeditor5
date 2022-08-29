---
category: features
modified_at: 2022-08-29
---

# Undo/Redo support


<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

## Demo

Use the demo below to toggle between editing modes and test the feature. Some features, like exports or search, are still functional even in the read-only mode. While the search is available, the replace function, however, is disabled, as changing the content is blocked.

{@snippet features/undo-redo}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Common API

The editor provides the following API to manage the read-only mode:

*


