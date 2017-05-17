/**
 * quickstart.js
 * A micro-form for user-specific installation instructions
 *
 * @author Ines Montani <ines@ines.io>
 * @version 0.0.1
 * @license MIT
 */

'use strict';

/** Generate a quickstart widget. */
class Quickstart {
    /**
     * Construct the widget's settings.
     * @param {(string|Node)=} container - Query selector or container element.
     * @param {Array.Object=} groups - Option groups to render. If not set, it'll look for them in the container DOM.
     * @param {Object=} options - Custom settings.
     * @param {string} options.prefix - Prefix to use for data attributes and CSS classes.
     * @param {boolean} options.noInit - Don't initialise event listener.
     */
    constructor(container = '#quickstart', groups, options = {}) {
        this.container = (typeof container === 'string') ? this._$(container) : container;
        this.groups = groups;
        this.pfx = options.prefix || 'qs';
        this.dpfx = `data-${this.pfx}`;
        this.init = this.init.bind(this);
        if (!options.noInit) document.addEventListener('DOMContentLoaded', this.init);
    }

    /**
     * Initialise the widget and create all required markup. Will be called
     * automatically on DOMContentLoaded, or, if options.noInit is set, can be
     * called by user after class initialisation.
     * @this Quickstart
     */
    init() {
        this.updateContainer();
        this.container.style.display = 'block';
        this.container.classList.add(`${this.pfx}`);
        const groups = this.groups;
        if (groups instanceof Array) groups.reverse()
            .forEach(this.createGroup.bind(this));
        else this._$$(`[${this.dpfx}-group]`)
            .forEach(this.updateGroup.bind(this));
    }

    /**
     * Add change event listener to option group and fire it once to initialise default options.
     * @param {Node} group - Option group container element.
     * @param {string} id - Unique ID of option group.
     */
     initGroup(group, id) {
        group.addEventListener('change', this.update.bind(this));
        group.dispatchEvent(new CustomEvent('change', { detail: id }));
    }

    /**
     * Update user-created option groups in the dom with default styles.
     * @param {Node} group - Option group container element.
     */
    updateGroup(group) {
        const id = group.getAttribute(`${this.dpfx}-group`);
        const styles = this.createStyles(id);
        group.insertBefore(styles, group.firstChild);
        this.initGroup(group, id);
    }

    /**
     * Update user-created option groups in the dom with default styles.
     * @this Quickstart
     * @param {Event} ev - Change event.
     * @param {string=} ev.detail - Option group ID passed in via custom event on initialisation.
     * @param {string} ev.target.name - Option group ID.
     */
    update(ev) {
        const id = ev.detail || ev.target.name;
        const checked = this._$$(`[name=${id}]:checked`)
            .map(opt => opt.value);
        const exclude = checked
            .map(value => `:not([${this.dpfx}-${id}="${value}"])`).join('');
        const css = `[${this.dpfx}-results]>[${this.dpfx}-${id}]${exclude} {display: none}`;
        this._$(`[${this.dpfx}-style="${id}"]`).textContent = css;
    }

    /**
     * Analyse the container and if relevant elements are already found, reorder
     * DOM tree if necessary and move all spans into the results wrapper.
     * Hopefully doesn't try to be too "smart" on a user's behalf. Note how CSS
     * classes are only added if new elements are create to allow user customisation.
     */
    updateContainer() {
        if (this._$(`[${this.dpfx}-results]`)) return;
        const preNodes = this.childNodes(this.container, 'pre');
        const pre = preNodes ? preNodes[0] : this._c('pre', `${this.pfx}-code`);
        const codeNodes = this.childNodes(pre, 'code')
            || this.childNodes(this.container, 'code');
        const code = codeNodes ? codeNodes[0] : this._c('code', `${this.pfx}-results`);
        code.setAttribute(`${this.dpfx}-results`, '');
        const spans = this.childNodes(code, 'span')
            || this.childNodes(pre, 'span')
            || this.childNodes(this.container, 'span');
        if (spans) spans.forEach(span => code.appendChild(span));
        pre.appendChild(code);
        this.container.appendChild(pre);
    }

    /**
     * Create an option group.
     * @param {Object} data - Option group settings.
     * @param {string} data.id - Unique ID of option group. Will be used as input name.
     * @param {string} data.title - Option group title.
     * @param {boolean=} data.multiple - Allow multiple select.
     * @param {Array.Object} data.options - Available options.
     * @param {string} data.options.id - Unique ID of individual option.
     * @param {string} data.options.title - Option title.
     * @param {boolean=} data.options.checked - Make option default checked option.
     */
    createGroup(data) {
        const group = this._c('fieldset', `${this.pfx}-group`);
        group.setAttribute(`${this.dpfx}-group`, data.id);
        group.innerHTML = this.createStyles(data.id).outerHTML
        group.innerHTML += `<legend class="${this.pfx}-legend">${data.title}</legend>`
        group.innerHTML += data.options.map(option => {
            const type = data.multiple ? 'checkbox' : 'radio';
            return `<input class="${this.pfx}-input ${this.pfx}-input--${type}" type="${type}" name="${data.id}" id="${option.id}" value="${option.id}" ${option.checked ? 'checked' : ''} /><label class="${this.pfx}-label" for="${option.id}">${option.title}</label>`
            }).join('');
        this.container.insertBefore(group, this.container.firstChild);
        this.initGroup(group, data.id);
    }

    /**
     * Create option group-specific <style> tag
     * @param {string} id - Unique ID of option group.
     * @returns {Node} Style element.
     */
    createStyles(id) {
        const styles = this._c('style');
        styles.setAttribute(`${this.dpfx}-style`, id);
        styles.textContent = `[${this.dpfx}-results]>[${this.dpfx}-${id}] {display: none}`;
        return styles;
    }

    /**
     * Check if node has children and filter them by node name, i.e. tag.
     * @param {Node} parent - Parent node to analyse.
     * @param {string} nodeName - Node name to filter out.
     * @returns {Array|false} Array of child nodes or false if no nodes found.
     */
    childNodes(parent, nodeName) {
        const name = nodeName.toUpperCase();
        if (!parent.hasChildNodes) return false;
        const childNodes = [...parent.childNodes]
            .filter(node => node.nodeName === name);
        return childNodes.length ? childNodes : false;
    }

    /**
     * Shortuct for document.querySelector()
     * @param {string} el - Query selector to match.
     * @returns {Node} Selected node.
     */
    _$(el) {
        return document.querySelector(el)
    }

    /**
     * Shortuct for document.querySelectorAll() that converts NodeList to Array
     * @param {string} el - Query selector to match.
     * @returns {Array} Array of selected nodes.
     */
    _$$(el) {
        return [...document.querySelectorAll(el)]
    }

    /**
     * Shortuct for creating DOM element with class name.
     * @param {string} tag - Tag name of element to create.
     * @param {string=} classname - Element class name, will be added as one string.
     * @returns {Node} The create DOM node.
     */
    _c(tag, classname) {
        const element = document.createElement(tag);
        if(classname) element.className = classname;
        return element;
    }
}
