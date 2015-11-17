jQuery( document ).ready( function( $ ) {

	var $elem;
	var selected;
	var img;

	text_images_init();

	function text_images_init() {

		img = $( '.text-attachments-container' ).find( 'img' );

		// focus for html
		$( '.wp-editor-area' ).focus( function() {
			$elem = $( this );
		} );

		// mouseup for html
		$( '.wp-editor-area' ).mouseup( function() {
			selected_image_links();
		} );

		// mouseup for visual
		// tinyMCE.onAddEditor.add(function(mgr, ed) {
		// 	ed.onMouseUp.add(function(ed, e) {
		// 		selected_image_links();
		// 	});
		// });

		tinyMCE.on( 'AddEditor', function( e ) {
			e.editor.on( 'MouseUp', function( e ) { // now that we know the editor set a callback at "NodeChange."
console.log('up');				selected_image_links();
			} );
		} );

		img.click( function( e ) {
			e.preventDefault();
			var url = $( this ).parents( '.text-attachment' ).find( 'span' ).text();
			var title = $( this ).attr( "title" );
			title = ( title ) ? ' title="' + title + '"' : '';
			if ( visual_editor() ) {
				var text = tinyMCE.activeEditor.selection.getContent( {
					format: 'text'
				} );
				if ( text && url ) {
					var link_text = '<a href="' + url + '"' + title + '>' + text + '</a>';
					tinyMCE.activeEditor.selection.setContent( link_text );
					scroll_to();
				}
			} else {
				if ( typeof $elem != "undefined" ) {
					var text = $elem.fieldSelection().text;
					if ( text && url ) {
						var link_text = '<a href="' + url + '"' + title + '>' + text + '</a>';
						$elem.fieldSelection( link_text );
						scroll_to();
					}
				}
			}
			selected_image_links();
		} );
	}

	function visual_editor() {
		if ( ( typeof tinyMCE != "undefined" ) && tinyMCE.activeEditor && !tinyMCE.activeEditor.isHidden() ) {
			return true;
		}
		return false;
	}


	function selected_image_links() {
		if ( visual_editor() ) {
			selected = tinyMCE.activeEditor.selection.getContent( {
				format: 'text'
			} );
		} else {
			selected = $elem.fieldSelection().text;
		}
		if ( selected ) {
			img.wrap( $( '<a></a>' ).attr( 'href', '#' ) );
		} else {
			if ( img.parent().is( "a" ) ) {
				img.unwrap();
			}
		}
	}


	function scroll_to() {
		if ( visual_editor() ) {
			var element = $( '#content_ifr' );
		} else {
			var element = $( '.wp-editor-area' );
		}
		var targetOffset = element.offset().top - 60;
		$( 'html, body' ).animate( {
			scrollTop: targetOffset
		}, {
			duration: 150
		} );
	}


	$( 'div#image_text_links input#update-image-links' ).on( 'click', function( event ) {
		//alert('clicked');
		var parent = $( 'form#post input#post_ID' ).prop( 'value' );
		var data = {
			action: 'refresh_image_metabox',
			parent: parent
		};
		jQuery.post( ajaxurl, data, function( response ) {
			var obj;
			try {
				obj = jQuery.parseJSON( response );
			} catch ( e ) { // bad JSON catch
				// add some error messaging ?
			}
			if ( obj.success === true ) { // it worked. AS IT SHOULD.
				$( 'div#image_text_links' ).find( 'div.text-attachments-container' ).replaceWith( obj.gallery );
				text_images_init();
				selected_image_links();
				// add some success messaging ?
			} else { // something else went wrong
				// add some error messaging ?
			}
		} );
	} );
} );