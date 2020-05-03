1. Play with the editor. You should logs of the changing autosave's states. You should not see logs when you changes the selection.

1. Type something and quickly try to reload the page. You should see something like this: `Reload site? Changes that you made may not be saved.`.

1. Type something and quickly and click the `destroy editor` button. Most recent changes should be logged to the console.

1. Type something without big time gaps. Once you stop typing there should be the first `waiting -> saving` and then the response should show up with the whole editor's content.

1. Type something. Once you'll see the `waiting -> saving` change, type something else. Then you should see the response and the `saving->waiting` change. Then you should see another response from the fake server.
