(function($, exports, window) {

	var text_selector = '.editor-rich-text, .block-editor-rich-text';

	if (!exports) {
		exports = {};
		if (!$) {
			window.fieldSelection = exports;
		}
	}

	if ($) {
		/**
		 * Extend jQuery's prototype
		 * @param {String} [text]
		 * @return {Object|jQuery}
		 */
		$.fn.fieldSelection = function(text) {
			var ret;

			this.each(function() {
				this.focus();
				ret = text == null ? exports.get(this) : exports.replace(this, text);
			});

			return ret || this;
		};
	}

	exports.get = function(elem) {
		var data = { text: '' };

		if (typeof window.getSelection != "undefined") {
			var sel = window.getSelection();

			if (sel.rangeCount) {
				var container = document.createElement("div");
				for (var i = 0, len = sel.rangeCount; i < len; ++i) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}
				data.text = container.innerHTML;
			}
		}

		return data;
	}

	exports.replace = function(elem, html) {
		var range;

		if (window.getSelection && window.getSelection().getRangeAt) {
			var sel = window.getSelection();

			range = sel.getRangeAt(0);
			range.deleteContents();

			var div = document.createElement("div");
			div.innerHTML = html;
			var frag = document.createDocumentFragment(),
				child;
			while ((child = div.firstChild)) {
				frag.appendChild(child);
			}
			range.insertNode(frag);

			var block_id = $(elem).closest('div[data-block]').data("block");
			if (!block_id) {
				return;
			}

			var block = wp.data.select('core/block-editor').getBlock(block_id);
			if (!block.hasOwnProperty('attributes')) {
				return;
			}

			// Update block;
			block.attributes.content = elem.innerHTML;
			wp.data.dispatch('core/block-editor').updateBlock(block_id, block);
		}
	}

}(typeof jQuery != 'undefined' ? jQuery : null,
	typeof exports != 'undefined' ? exports : null,
	window));