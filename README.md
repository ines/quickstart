# quickstart.js: A micro-form for user-specific installation instructions

If you're publishing open-source software, you're probably familiar with this
scenario: You want to make it easy for your users to download, install and
use your library across operating systems and platforms, so you upload it to
a variety of package managers and provide detailed instructions and documentation.

But each package manager has its own, specific download command – sometimes even
two. If you want to use a virtual environment, you need to add a few commands to
the top. But wait, the activation command in Windows looks different. And if
you're on Python 3, it's actually called `venv`, not `virtualenv`. And after
installation, there's other stuff to set up and install. How? Well...

![It depends...](https://cloud.githubusercontent.com/assets/13643239/26151827/c2de05d6-3b04-11e7-8ea0-67087b177d10.gif)

The problem with linear installations docs is that they easily become verbose.
You want to make sure to cover every platform and setup, while at the same
time, keeping it simple for beginners or users who just want to install your
software, and not sift through lengthy explanations that are not actually
relevant to them. This ended up becoming an annoying issue for us at
[spaCy](https://spacy.io), so I built [`quickstart.js`](quickstart.js). It's
[super lightweight](https://raw.githubusercontent.com/ines/quickstart/master/quickstart.min.js), easy to customise and will even build
the form for you – if you want it to.

**Quickstart was inspired by [Pytorch](http://pytorch.org)'s "Getting started"
widget. Its filtering functionality is based on a simple CSS rule, similar
to [Jets.js](https://jets.js.org). This makes it fast and allows complex
filtering rules with only one minimal DOM modification.** For more info on
this, see the [How it works](#how-it-works) section.

## Examples

You can see Quickstart in action on [spacy's installation docs](https://spacy.io/docs/usage).
For a code example you can modify, see the [`example.html`](example.html) or
check out [this demo on CodePen](https://codepen.io/ines/pen/OmobKq).

![Screenshot](https://cloud.githubusercontent.com/assets/13643239/26161117/4891b0e2-3b23-11e7-9a9d-965dd50f58e9.jpg)

> ⚠️ **Important note:**  Because Quickstart relies on JavaScript, I strongly
> recommend to only use it **in addition to existing installation docs**, not
> to provide new information that's not available elsewhere. Otherwise, users
> who don't have JavaScript enabled won't be able to access your docs.
> Quickstart will make sure its container is visible, so you can safely set it
> to `display: none` in your CSS or HTML. This will hide it if JavaScript is
> disabled.

## Usage

Quickstart can take care of rendering the widget and the markup required for the
form and options – all you have to do is **include the script and stylesheet**:

```html
<!-- in <head> -->
<link rel="stylesheet" href="quickstart.css">

<!--- before </body> -->
<script src="quickstart.min.js"></script>
```

Options are defined as a **simple array**. Each group and  option needs to have a
unique `id` and a `title`, which will be displayed in the form. To allow multiple
selections in a group, set `multiple: true`. To mark an option as checked by
default, add `checked: true`.

```javascript
const groups = [
    {
        id: "os",
        title: "Operating system",
        options: [
            { id: "mac", title: "macOS / OSX", checked: true },
            { id: "windows", title: "Windows" },
            { id: "linux", title: "Linux" }
        ]
    },
    {
        id: "python",
        title: "Python version",
        options: [
            { id: 2, title: "2.x" },
            { id: 3, title: "3.x", checked: true }
        ]
    },
    {
        id: "config",
        title: "Configuration",
        multiple: true,
        options: [
            { id: "venv", title: "virtualenv" }
        ]
    }
]
```

You also need to set up a container to tell Quickstart **where to put the widget**,
which **commands or instructions** are available and when to display them. This
is all done in **plain HTML**, to make it easy to update and edit.

Each command is a simple `<span>` with data attributes `data-qs-` plus the ID
of the option group. For example, a command with `data-qs-os="windows"` will
only be shown if the user has selected `windows` from the group `os`. If a
command has more than one condition specified, it will only be shown if
**all conditions are true**.

```html
<div id="quickstart">
    <span data-qs-config="venv" data-qs-python="2">python -m pip install -U virtualenv</span>
    <span data-qs-config="venv" data-qs-python="3">python -m pip install -U venv</span>
    <span data-qs-config="venv" data-qs-python="2">virtualenv .env</span>
    <span data-qs-config="venv" data-qs-python="3">venv .env</span>
    <span data-qs-config="venv" data-qs-os="mac">source .env/bin/activate</span>
    <span data-qs-config="venv" data-qs-os="linux">source .env/bin/activate</span>
    <span data-qs-config="venv" data-qs-os="windows">.env\Scripts\activate</span>
</div>
```

Note that Quickstart currently does not support adding multiple values per group.
If a command is the same for both `mac` and `linux`, for example, you'll have to
add it twice.

You can now **initialise the widget** with the selector of the container (in
this case, `#quickstart` for `<div id="quickstart">`) and the array of option
groups:

```javascript
const qs = new Quickstart('#quickstart', groups)
```

Optionally, `Quickstart` can take a third argument, an object containing custom
settings. The following settings are available:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `noInit` | boolean | `false` | Don't initialise the widget on load. This means you can call or add an event listener using `Quickstart.init()` yourself whenever and however you want. |
| `prefix` | string | `'qs'` | Prefix to use for data attributes and class names, i.e. `data-[prefix]-` and `.[prefix]-`.  |

## How it works

Quickstart uses a technique similar to the one powering
[Jets.js](https://jets.js.org/), a native CSS search engine (see their website
for more info, including a pretty cool animation and speed comparison). Instead
of filtering the elements in Javascript and modifying them one by one, only a
single CSS expression is added. Here's the gist:

Let's say you have a condition, like `os == "mac"` and you want to show or hide
DOM elements based on whether or not they match. (You also want to do this in
Vanilla JS without a Virtual DOM and other helpers, so removing and re-adding
elements is out of the question and too expensive.) First, you need to label the
elements you want to show or hide, for example by assigning them a class like
`.os-mac`, or in this case, a data attribute   `data-qs-os="mac"`.

Every time an input value changes, you need to update the
DOM to reflect that change. For exampe, you could iterate over all elements,
check if they have `data-qs-os` set to `"mac"` and if not, hide them – either
by adding a class `.hide`, or setting them to `display: none`. You also need to
un-hide previously hidden elements if they now *do match*.  Now if your elements
contain more than one condition, for example, `os == mac && python == 2`, you
can't get away with only filtering the elements based on the user's
latest decision – you also need to take all previous settings into account.
You'll only know whether the element matches the condition by checking the
settings for both `os` **and** `python`. This becomes easier with query selectors
like `:checked`, but it's still **a lot of computation on
each click.**

Instead, Quickstart only writes one CSS rule on each update, for example:

```css
[data-qs-results] > [data-qs-os]:not([data-qs-os="mac"]) { display: none }
```

This means: All elements that are direct children of the results wrapper, have a
`data-qs-os` attribute, i.e. depend on the operating system, but do not have
`data-qs-os` set to `"mac"`, will be hidden. This ensures that only elements
that match **all conditions** are visible.

If multiple selections are allowed, all checked options for that group are
fetched, for example `[data-qs-model]:checked`, and combined into one expression:

```css
[data-qs-results] > [data-qs-model]:not([data-qs-model="en"]):not([data-qs-model="de"]) { display: none }
```

> ⁉️ **Why not compile one large expression for all possible cases upfront?** In
> theory, the sibling selector `~` would let you hide elements that are siblings
> of a `:checked` input – e.g. `[name="os"][value="mac"]:checked ~
> [data-qs-os]:not([data-qs-os="mac"]) { display: none }`. So you *could* generate
> a giant expression like this based on the available groups and options, and
> scrap the event listeners and other JavaScript logic. But this only works for
> **siblings**, meaning that the inputs, labels and commands would all have to
> live in the same container. This is inconvenient and very limiting, both in
> terms of semantics and styling options.

## Using Quickstart with your own markup

While Quickstart is able to generate the form markup and all required wrappers,
you **don't have to** do it that way are free to use your own custom markup
instead. This is especially useful if you want to apply your own classes and
styling, or add more info to the form.

When you initialise Quickstart **without a `groups` argument**, it will look
for groups in your HTML markup – specifically, elements with the `data-qs-group`
attribute. It will then add the required style tags and event listeners to them.
Quickstart will also check if theres a `data-qs-results` attribute present
in your markup. If so, it won't create it for you.

Here's an example of a very basic widget:

```html
<div id="quickstart" class="qs">
    <fieldset class="qs-group" data-qs-group="os">
        <legend class="qs-legend">Operating system</legend>
        <input class="qs-input qs-input--radio" type="radio" name="os" id="mac" value="mac" checked="">
        <label class="qs-label" for="mac">macOS / OSX</label>

        <input class="qs-input qs-input--radio" type="radio" name="os" id="windows" value="windows">
        <label class="qs-label" for="windows">Windows</label>

        <input class="qs-input qs-input--radio" type="radio" name="os" id="linux" value="linux">
        <label class="qs-label" for="linux">Linux</label>
    </fieldset>
    <fieldset class="qs-group" data-qs-group="config">
        <legend class="qs-legend">Configuration</legend>
        <input class="qs-input qs-input--checkbox" type="checkbox" name="config" id="venv" value="venv">
        <label class="qs-label" for="venv">virtualenv</label>
    </fieldset>

    <pre class="qs-code">
        <code class="qs-results" data-qs-results>
            <span data-qs-config="venv" data-qs-python="2">python -m pip install -U virtualenv</span>
            <span data-qs-config="venv" data-qs-python="3">python -m pip install -U venv</span>
            <span data-qs-config="venv" data-qs-python="2">virtualenv .env</span>
            <span data-qs-config="venv" data-qs-python="3">venv .env</span>
            <span data-qs-config="venv" data-qs-os="mac">source .env/bin/activate</span>
            <span data-qs-config="venv" data-qs-os="linux">source .env/bin/activate</span>
            <span data-qs-config="venv" data-qs-os="windows">.env\Scripts\activate</span>
        </code>
    </pre>
</div>
```

If you're using your own markup Quickstart won't mess with it and simply trust
you to know what you're doing. The only thing it'll add is a `<style>` tag
for each group, containing its filtering logic. It also won't add any CSS classes
or remove anything else within its container. **Quickstart's only reference points
to the DOM are the  `data-qs-group` and `data-qs-results` attributes.**

## Styling Quickstart

Quickstart comes with a very basic and minimal [stylesheet](quickstart.css).
Under the hood, multi-select options are rendered as `<input type="checkbox"/>`,
and single-select options as `<input type="radio"/>`. By default, they're hidden,
with custom styles applied to the `<label>` **following a checked input** and
its `:before` pseudo-element. This creates the illusion of styled radio buttons
and checkboxes. If you're letting Quickstart generate the markup for you, it'll
come with the following classes:

| Name | Description |
| --- | --- |
| `.qs` | Container of quickstart widget. |
| `.qs-group` | A single option group. |
| `.qs-legend` | Title of a single option group. |
| `.qs-input` | Input field. |
| `.qs-input--radio` | Input field of `type="radio"`. |
| `.qs-input--checkbox` | Input field of `type="checkbox"`. |
| `.qs-label` | Input label. |
| `.qs-code` | Code block containing the results. |
| `.qs-results` | Results, i.e. available commands for a configuration. |

If you have a custom `prefix` set in your options, `qs` will be replaced with
that.


> ⚠️ **Important note:** When styling option groups, keep in mind that the
> default markup generated by Quickstart will render them as `<fieldset>`
> elements with `<legend>` titles – the recommended and semantically correct
> way for groups of form fields. However, those elements can sometimes behave
> in unexpected ways, especially across browsers, and don't always follow the
> same logic as `<div>` or `<span>` elements (for more information, see
> [this blog post](https://thatemil.com/blog/2015/01/03/reset-your-fieldset/)
> on resetting fieldsets).
