[meta:author]:# 'CodedSakura'
[meta:number]:# '001'
[meta:projects]:# 'NC ToC;SVG Editor'
[meta:started_on]:# '2023-10-20'
[meta:published]:# 'false'
[meta:published_on]:# '2000-01-01'
[meta:last_updated_on]:# '2023-10-20'
[meta:tags]:# 'TypeScript;Events;Keyboard;WebApp'
[meta:permalink]:# 'https://bog.codedsakura.dev/posts/001'

# WebApp Global Shortcuts - #001

Developing WebApp tools has lead me to realize I need a plug-and-play global
keyboard shortcut library. This blog post follows my thoughts while developing
such a library.

## Problem definition

I want the library to be able to have specific capabilities.
Most of them are listed here:

- Global (document-level) keyboard and mouse shortcuts
- Multiple assigned shortcuts to a single action
- Arbitrary key combinations
- Key sequences
- Easy shortcut map sharing
- Multiple app-predefined default shortcut maps
- Options to block or pass-through on shortcut
- Key-map support (i.e. on AZERTY, trigger `Z` when key labeled `Z` is pressed)
- Actions on key down, key up, and both
- Contextual actions / action groups
- No dependencies, Drag & Drop


## First thoughts

A simple way to let the library easily communicate with the app would be to
use [JavaScript Event System][1]. That would allow the app to receive
shortcut-triggered commands anywhere with relative ease.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Event


### Shortcut mapping storage

Storing the defined shortcuts for storage & sharing _could_ be done in JSON
format, but that feels boring and non-efficient. So I've decided to make my own
format (and because it's more fun to do so). The 1st draft of that format is
described here:

Each key is represented by a string `MK:O`, where `M` are modifiers (see lower),
`K` are the key-codes, `:` is a literal ':', and `O` are options (see lower).

The key-codes are represented by their JS code name (like `KeyA`, `Space`, 
etc.).

Shortcut like control+shift+s would be represented by `^!KeyS`.

Key combinations are concatenated with a `+` literal. For example,
`Space + KeyA` would indicate that, to trigger the action, space has to be held
before pressing the A key. To allow mixed combinations, use `(+)` literal.
The `+` and `(+)` literals cannot be mixed within a single combination:

- `Space + KeyA & Space (+) KeyW` is legal, but
- `Space + KeyA (+) KeyW` is not.

Any modifiers applied in a combination are applied to all keys in that 
combination. `!Space + KeyA` is the same as `Space + !KeyA` and 
`!Space + !KeyA`. The 1st variation is preffered.

To chain multiple keys in a sequence, like control+K, then control+B, the keys
are concatenated with a `&` literal. For example, `^KeyK&^KeyB`.

Any white-space in the format is ignored entirely, so `^KeyK & ^KeyB` is 
perfectly valid.

To assign these shortcuts to an event name, a simple JSON structure is used,
with a root object that has keys - event names, and values - arrays of 
shortcuts.

For example:
```json
{
	"app:save": [ "^KeyS", "!Semicolon & KeyW & Enter" ],
	"app:exit": [ "^KeyQ", "!Semicolon & KeyQ & Enter" ],
	"app:replace": [ "^KeyR:P" ],
}
```

To create and control an action group (see lower), the value in the root object
is an object, containing event names and shortcut arrays. The keys of action
groups are the action group names.

```json
{
	"context:code": {
		"app:build": [ "^KeyB" ]
	},
	"context:image_editor": {
		"app:brush": [ "^KeyB" ]
	}
}
```

Event and action group names are completely arbitrary.


#### Modifiers:

- `^` - control key
- `!` - shift key
- `#` - meta (windows) key
- `@` - alt key

Each modifier can be prefixed by a `<` or `>` to indicate that only the left or
right key works for the shortcut (except for Alt and Alt Gr keys, Alt Gr is not
supported).

To make a modifier optional, a `?` literal is added after the modifier.
The literal `*?` is equivalent to `^?!?#?@?`.

If the use of just a modifier key is desired, the modifier key's key code must
be used in combination with the appropriate optional modifier (or the `*?` 
literal). For example, `>!?ShiftLeft` should be used to detect the left shift 
3key.


#### Options

- `D` - trigger on key down (if neither `D` or `U` specified, it is the default)
- `U` - trigger on key up (release)
- `B` - block further processing of the key-press (default is pass)
- `P` - prevent default browser actions (default does not)
- `K` - use keyboard layout (default does not)
- `R` - ignore key down repeats (like holding a key down) (default does not 
	ignore, unless `U` is specified)


#### Action groups

Action groups are a set of shortcut actions that are disabled by default, until
the app dispatches an event to toggle them. They can be used to have the same
keys do different actions in different contexts.

Action groups cannot contain other action groups.


#### Mouse buttons

Mouse buttons are treated the same as keys, but following the naming scheme
`MouseLeft`, `MouseScrollUp`, `Mouse4`, etc.


#### Configuration

The timeout between keys in a sequence is configurable, and by default is 1.5
seconds. The configuration key is `sequenceTimeout`.
