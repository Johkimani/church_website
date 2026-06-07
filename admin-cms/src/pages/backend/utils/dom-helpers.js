/**
 * DOM Helper Utilities
 * Specialized functions for lean DOM manipulation without a heavy framework
 */
export class DOMHelpers {
    /**
     * Create an element with classes and attributes
     */
    static createElement(tag, className = '', attributes = {}) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        return element;
    }
    /**
     * Clear all children from an element
     */
    static clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
    /**
     * Append multiple children to a parent
     */
    static appendChildren(parent, children) {
        children.forEach((child) => {
            if (child) {
                parent.appendChild(child);
            }
        });
    }
    /**
     * Add multiple event listeners to an element
     */
    static addEventListeners(element, events) {
        Object.keys(events).forEach(event => {
            element.addEventListener(event, events[event]);
        });
    }
}
