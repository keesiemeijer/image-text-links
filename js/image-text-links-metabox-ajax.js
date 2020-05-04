jQuery(document).ready(function($) {

	var elem;
	var selected;
	var img;
	var editor;

	text_images_init();

	// Gutenberg paragraph block
	var richText = '.rich-text, .block-editor-rich-text__editable';

	$(document).on('focus', richText, function() {
		elem = $(this);
		editor = 'text_block';

	});

	function get_selected_element() {
		if ( window.getSelection && window.getSelection().getRangeAt) {
			var anchorNode = window.getSelection().anchorNode;
			if(anchorNode){
				return anchorNode.parentNode;
			}
		} else if (document.selection && document.selection.createRange) {
			return document.selection.createRange().parentElement();
		}

		return false;
	}

	function text_images_init() {
		img = $('.text-attachments-container').find('img');
		elem = (typeof elem != "undefined") ? elem : false

		if (visual_editor()) {
			// mouseup for visual classic editor
			tinyMCE.onAddEditor.add(function(mgr, ed) {
				ed.onMouseUp.add(function(ed, e) {
					selected_image_links();
				});
			});

			tinyMCE.on('AddEditor', function(e) {
				e.editor.on('MouseUp', function(e) { // now that we know the editor set a callback at "NodeChange."

					selected_image_links();
				});
			});
		}

		img.click(function(e) {
			e.preventDefault();

			var richTextSelected = get_selected_element()
			if( ! richTextSelected || ! $(richTextSelected).is( richText ) ) {
				elem = false;
				editor = '';
			}

			var url = $(this).parents('.text-attachment').find('span').text();
			var title = $(this).attr("title");
			title = (title) ? ' title="' + title + '"' : '';
			if (visual_editor()) {
				var text = tinyMCE.activeEditor.selection.getContent({
					format: 'text'
				});
				if (text && url) {
					var link_text = '<a href="' + url + '"' + title + '>' + text + '</a>';
					tinyMCE.activeEditor.selection.setContent(link_text);
					//scroll_to();
				}
			} else {
				if (typeof elem.fieldSelection == "function") {
					var text = elem.fieldSelection().text;

					if (text && url) {
						var link_text = '<a href="' + url + '"' + title + '>' + text + '</a>';

						elem.fieldSelection(link_text);
						scroll_to();
					}
				}
			}
			selected_image_links();
		});
	}

	function visual_editor() {
		if ('text_block' === editor) {
			return false;
		}

		if ((typeof tinyMCE != "undefined") && tinyMCE.activeEditor && !tinyMCE.activeEditor.isHidden()) {
			return true;
		}

		return false;
	}

	function selected_image_links() {
		if (visual_editor()) {
			selected = tinyMCE.activeEditor.selection.getContent({
				format: 'text'
			});
		} else if (elem) {
			selected = elem.fieldSelection().text;
		} else {
			selected = false;
		}
		if (selected) {
			img.wrap($('<a></a>').attr('href', '#'));
		} else {
			if (img.parent().is("a")) {
				img.unwrap();
			}
		}
	}

	function scroll_to() {
		if (visual_editor()) {
			var element = $('#content_ifr');
		} else {
			var element = elem;
		}
		if(!element) {
			return;
		}

		var targetOffset = element.offset().top - 60;
		$('html, body').animate({
			scrollTop: targetOffset
		}, {
			duration: 150
		});
	}

	$('div#image_text_links input#update-image-links').on('click', function(event) {
		//alert('clicked');
		var parent = $('form#post input#post_ID').prop('value');
		var data = {
			action: 'refresh_image_metabox',
			parent: parent
		};
		jQuery.post(ajaxurl, data, function(response) {
			var obj;
			try {
				obj = jQuery.parseJSON(response);
			} catch (e) { // bad JSON catch
				// add some error messaging ?
			}
			if (obj.success === true) { // it worked. AS IT SHOULD.
				$('div#image_text_links').find('div.text-attachments-container').replaceWith(obj.gallery);
				text_images_init();
				selected_image_links();
				// add some success messaging ?
			} else { // something else went wrong
				// add some error messaging ?
			}
		});
	});
});