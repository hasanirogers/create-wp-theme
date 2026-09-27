<?php
namespace business;

Class Config {
  const SLUG = 'business';
  const NICE_NAME = 'Business';
  const PAGE_WIDTH = '1440px';

  const COLORS = array(
    'background' => 'rgb(var(--kemet-color-white))',
    'primary' => 'rgb(var(--kemet-color-violet-900))',
  );

  const POST_SUPPORT_TYPES = array(
    'page' => array('excerpt'),
  );

  const CUSTOMIZE = array(
    'location_fields' => ['name', 'address', 'address-link', 'email', 'phone'],
    'social_media' => [
      array('slug' => 'facebook', 'label' => 'Facebook'),
      array('slug' => 'x', 'label' => 'X'),
      array('slug' => 'instagram', 'label' => 'Instagram'),
      array('slug' => 'youtube', 'label' => 'YouTube'),
      array('slug' => 'linkedin', 'label' => 'LinkedIn'),
      array('slug' => 'nextdoor', 'label' => 'NextDoor'),
    ]
  );
}
