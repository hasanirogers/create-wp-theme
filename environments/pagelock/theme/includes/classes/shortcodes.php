<?php
namespace business;

Class ShortCodes {
  public static function init() {
    add_shortcode('business-contact-form', array(self::class, 'render_business_contact_form'));
  }

  public static function render_business_contact_form($props) {
    $default = array(
        'name' => 'contact-form',
        'to' => get_option('admin_email'),
        'from_name' => get_bloginfo('name'),
        'from_email' => get_option('admin_email'),
        'subject' => 'You have mail',
    );

    $attributes = shortcode_atts($default, $props);

    return '<business-'. $attributes['name'] .' to="'. $attributes['to'] .'" subject="'. $attributes['subject'] .'" from-name="'. $attributes['from_name'] .'" from-email="'. $attributes['from_email'] .'"></business-'. $attributes['name'] .'>';
  }
}
ShortCodes::init();
