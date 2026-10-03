<?php
/**
 * Plugin Name:       Business Blocks
 * Description:       A collection of blocks for businesses by Deific Arts, LLC.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Deific Arts, LLC
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package           business-blocks
 */

function create_business_block_init() {
	$block_jsons = glob(get_template_directory() . '/blocks/*/block.json');

	if (empty($block_jsons)) {
		return;
	}

	$dev_mode = class_exists('\business\Theme') && \business\Theme::is_vite_dev();

	if ($dev_mode) {
		wp_register_script(
			'vite-client',
			'http://localhost:5173/@vite/client',
			array(),
			null,
			false
		);
		wp_register_script(
			'business-blocks',
			'http://localhost:5173/src/blocks.ts',
			array('vite-client', 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
			null,
			true
		);
	} else {
		wp_register_script(
			'business-blocks',
			get_template_directory_uri() . '/build/blocks.js',
			array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
			null,
			true
		);
		wp_register_style(
			'business-blocks-style',
			get_template_directory_uri() . '/build/blocks.css',
			array(),
			null
		);
	}

	foreach ($block_jsons as $block_json) {
		$args = array('editor_script' => 'business-blocks');

		if (!$dev_mode) {
			$args['style'] = 'business-blocks-style';
			$args['editor_style'] = 'business-blocks-style';
		}

		register_block_type(dirname($block_json), $args);
	}
}
add_action( 'init', 'create_business_block_init' );
