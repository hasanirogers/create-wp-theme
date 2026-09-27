<?php
namespace business;

use business\Config as Config;

Class Gutenberg {
  public static function init() {
    add_action('init', array(self::class, 'blocks'));
  }

  public static function blocks() {
    // register_block_type(Config::SLUG . '/your-block');
  }
}
Gutenberg::init();
