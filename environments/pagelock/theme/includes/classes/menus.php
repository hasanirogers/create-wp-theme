<?php

Class Simple_Nav_Walker extends Walker_Nav_Menu {
  function start_lvl(&$output, $depth = 0, $args = null) {
    // Don't output nested <ul>
  }

  function end_lvl(&$output, $depth = 0, $args = null) {
    // Don't output nested </ul>
  }

  function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
    $output .= '<a href="' . esc_url($item->url) . '">' . esc_html($item->title) . '</a>';
  }

  function end_el(&$output, $item, $depth = 0, $args = null) {
    // Don't output nested </li>
  }
}
