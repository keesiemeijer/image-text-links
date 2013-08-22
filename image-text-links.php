<?php
/*
Plugin Name: Image Text Links
Version: 0.1
Plugin URI:
Description: Hallo sarah en Kees. Een makkelijke manier om tekst links te maken van foto's als je een postje schrijft.
Author: keesiemeijer
Author URI:
License: GPL v2
Text Domain: image-text-links
Domain Path: /lang

This plugin is a altered verion of the Gallery Metabox by Bill Erickson.
http://www.billerickson.net
http://wordpress.org/plugins/gallery-metabox/

This plugin is used on just one of my site's and has some personal messeges (in Dutch) for the users of that site. If you want to use this on your own site remove the messages

*/

if ( !class_exists( 'Image_Text_Links' ) ) {
	class Image_Text_Links {

		/**
		 * @var string The plugin version.
		 */
		var $version = '0.1';

		/**
		 * @var string The database options name for this plugin.
		 */
		var $option_name = 'image_text_links_options';

		/**
		 * @var array $options Stores the options for this plugin.
		 */
		var $options = array();

		/**
		 * @var string $localizationDomain Domain used for localization.
		 */
		var $text_domain = 'image-text-links';

		/**
		 * @var string $pluginurl The url to this plugin.
		 */
		var $pluginurl = '';

		/**
		 * @var string $pluginpath The path to this plugin.
		 */
		var $pluginpath = '';

		/**
		 * @var string $image_size Image size to link to.
		 */
		var $image_size = 'full';


		function __construct() {

			$this->pluginurl = plugin_dir_url( __FILE__ );
			$this->pluginpath = plugin_dir_path( __FILE__ );

			add_action( 'admin_enqueue_scripts', array( $this, 'image_text_links_admin_scripts' ) );
			add_action( 'add_meta_boxes', array( $this, 'admin_scripts'   ), 5 );
			add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
			add_action( 'wp_ajax_refresh_image_metabox', array( $this, 'refresh_image_metabox' ) );

		}


		/**
		 * Enqueue scripts and styles on admin pages.
		 */
		function image_text_links_admin_scripts( $hook ) {

			/* only load scripts on post.php and post-new.php */
			if ( !in_array( $hook, array( 'post.php', 'post-new.php' ) ) )
				return;

			/* Register styles and scripts. */
			wp_register_script( 'image-text-links-selected-js', $this->pluginurl . 'js/selected-text.js' );

			/* Enqueue styles and scripts. */
			wp_enqueue_script( 'image-text-links-selected-js' );

		}


		/**
		 * Adds the meta box container
		 */
		public function add_meta_box() {

			add_meta_box(
				'image_text_links'
				, __( 'Image Text Links', $this->text_domain )
				, array( &$this, 'gallery_metabox' )
				, 'post'
				, 'advanced'
				, 'high'
			);

			wp_enqueue_script( 'image-text-links-metabox-ajax' );
		}


		/**
		 * registers the admin scripts
		 */
		public function admin_scripts() {

			wp_register_script( 'image-text-links-metabox-ajax', $this->pluginurl . 'js/image-text-links-metabox-ajax.js', array( 'jquery' ), null, true );

		}


		/**
		 * Build the Metabox
		 *
		 * @param object $post
		 *
		 * @author Bill Erickson
		 */

		public function gallery_metabox( $post ) {

			$original_post = $post;
			echo $this->gallery_metabox_html( $post->ID );
			$post = $original_post;
		}


		/**
		 * Image array for gallery metabox
		 *
		 * @param int $post_id
		 * @return string html output
		 *
		 * @author Bill Erickson
		 */
		public function gallery_images( $post_id ) {

			$args = array(
				'post_type'         => 'attachment',
				'post_status'       => 'inherit',
				'post_parent'       => $post_id,
				'post_mime_type'    => 'image',
				'posts_per_page'    => -1,
				'order'             => 'ASC',
				'orderby'           => 'menu_order',
			);

			$images = get_posts( $args );

			return $images;
		}


		/**
		 * Display setup for images, which include filters and AJAX return
		 *
		 * @param int $post_id
		 * @return string html output
		 *
		 * @author Bill Erickson
		 */
		public function gallery_display( $loop ) {

			$gallery = '<div class="text-attachments-container">';

			foreach ( $loop as $attachment ) {

				$gallery .= '<div class="text-attachment" style="float: left; padding: 0 1em 1em 0;">';
				$url = wp_get_attachment_thumb_url( $attachment->ID );
				$url_large = wp_get_attachment_image_src( $attachment->ID, $this->image_size );
				$title = ( $attachment->post_content ) ? 'title="' . $attachment->post_content . '"' : '';
				$gallery .= '<img src="' . $url. '" width="100" height="100" ' . $title . '/>';
				$gallery .= '<span style="display: none;">' . $url_large[0] .'</span>';
				$gallery .= '</div>';
			}
			$gallery .= '<div style="clear: both"></div>';
			$gallery .= '</div>';

			return $gallery;
		}


		/**
		 * Gallery Metabox HTML
		 *
		 * @param int $post_id
		 * @return string html output
		 *
		 * @author Bill Erickson
		 */
		public function gallery_metabox_html( $post_id ) {

			$return = '';
			$intro = '<p class="metabox-update">';

			// this i
			$intro .= '<p>' .  __( 'Hallo Sarah en Kees. Hiermee kan je makkelijk (text) linkjes maken van foto\'s. Selecteer text in de editor hierboven en klik een plaatje hieronder om er een link van te maken', $this->text_domain ) . '</p>';

			$intro .= '<input id="update-image-links" class="be-button button-secondary" type="button" value="Update uploaded images" name="update-text-images"></p>';

			$return .=  $intro;

			$loop = $this->gallery_images( $post_id );

			if ( empty( $loop ) )
				$return .= '<p>'. __( 'No images found.', $this->text_domain ) . '</p>';

			$gallery = $this->gallery_display( $loop );

			$return .= $gallery;

			return $return;
		}


		/**
		 * Gallery Metabox AJAX Update
		 *
		 * This function will refresh image gallery on AJAX call.
		 *
		 *
		 * @author Andrew Norcross
		 *
		 */
		public function refresh_image_metabox() {

			$parent = $_POST['parent'];
			$loop = $this->gallery_images( $parent );
			$images = $this->gallery_display( $loop );

			$ret = array();

			if ( !empty( $parent ) ) {
				$ret['success'] = true;
				$ret['gallery'] = $images;
			} else {
				$ret['success'] = false;
			}

			echo json_encode( $ret );
			die();

		}



	} // end class

	if ( is_admin() )
		new Image_Text_Links();

} // class exists