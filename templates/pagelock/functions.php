<?php
namespace business;

use business\Config as Config;

if (!class_exists('\business\Theme')) {
  class Theme {
    private static $instance = null;

    public static function get_instance() {
      if (self::$instance === null) {
        self::$instance = new self;
      }

      return self::$instance;
    }

    private function __construct() {
      $classes = preg_grep('/^([^.])/', scandir(get_template_directory() . '/includes/classes'));
      $adminClasses = preg_grep('/^([^.])/', scandir(get_template_directory() . '/includes/admin'));
      $postTypes = preg_grep('/^([^.])/', scandir(get_template_directory() . '/includes/posts'));

      // includes
      foreach ($classes as $class) {
        require_once(get_template_directory() . '/includes/classes/' . $class);
      }

      foreach ($adminClasses as $adminClass) {
        require_once(get_template_directory() . '/includes/admin/' . $adminClass);
      }

      foreach ($postTypes as $postType) {
        require_once(get_template_directory() . '/includes/posts/' . $postType);
      }

      require_once(get_template_directory() . '/blocks/blocks.php');


      // disable admin bar
      add_filter('show_admin_bar', '__return_false');

      // enqueue scripts and styles
      add_action('wp_enqueue_scripts', array($this, 'add_assets'));
      add_action('admin_enqueue_scripts', array($this, 'add_assets_admin'));

      // enqueue fonts
      add_action('wp_enqueue_scripts', array($this, 'add_fonts'));

      // meta info
      add_action('wp_head', array($this, 'add_meta_tags'));

      // colors
      add_action('wp_head', array($this, 'add_theme_colors'));

      // body classes
      add_filter('body_class', array($this, 'add_body_classes'));

      // react refresh preamble for dev mode HMR
      add_action('admin_head', array($this, 'react_refresh_preamble'));

      // enqueue blocks HMR
      add_action('enqueue_block_editor_assets', array($this, 'enqueue_blocks_hmr'));

      // vite outputs ES modules
      add_filter('script_loader_tag', array($this, 'add_module_type'), 10, 2);

      // menu
      // register_nav_menu('header', 'Header');
      register_nav_menu('drawer', 'Drawer');
      register_nav_menu('top-nav-left', 'Top Nav Left');
      register_nav_menu('top-nav-right', 'Top Nav Right');
      // register_nav_menu('useful-links', 'Useful Links');
      register_nav_menu('legal', 'Legal');
      register_nav_menu('footer-social-media', 'Footer Social Media');

      // title tag
      add_theme_support('title-tag');

      // thumbnail
      add_theme_support('post-thumbnails');

      // align
      add_theme_support('align-wide');

      // post support types
      add_post_type_support('page', CONFIG::POST_SUPPORT_TYPES['page']);

      // svg upload support
      add_filter('upload_mimes', array($this, 'add_svg_upload'), 10, 1);
    }

    public static function add_assets() {
      if (self::is_vite_dev()) {
        self::enqueue_vite_client();
        wp_enqueue_script('bundle-js', 'http://localhost:5173/src/frontend.ts', array('vite-client'), null, true);
      } else {
        wp_enqueue_style('bundle-css', get_theme_file_uri('/build/frontend.css'), array(), null);
        wp_enqueue_script('bundle-js', get_theme_file_uri('/build/frontend.js'), array(), null, true);
      }

      wp_enqueue_style('parent-css', get_template_directory_uri() . '/style.css');
    }

    public static function add_assets_admin() {
      if (self::is_vite_dev()) {
        self::enqueue_vite_client();
        wp_enqueue_script('admin-js', 'http://localhost:5173/src/admin.ts', array('vite-client', 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element'), null, true);
      } else {
        wp_enqueue_style('admin-css', get_theme_file_uri('/build/admin.css'));
        wp_enqueue_script('admin-js', get_theme_file_uri('/build/admin.js'), array('wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element'), false, true);
      }
    }

    private static function enqueue_vite_client() {
      wp_enqueue_script('vite-client', 'http://localhost:5173/@vite/client', array(), null, false);
    }

    public static function add_module_type($tag, $handle) {
      $module_handles = array('vite-client', 'bundle-js', 'admin-js', 'business-blocks');
      if (in_array($handle, $module_handles, true)) {
        $tag = str_replace('<script ', '<script type="module" ', $tag);
      }
      return $tag;
    }

    public static function add_fonts() {
      wp_enqueue_style( 'spectral', 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap', false );
    }

    public static function add_meta_tags() {
      $siteLogoID = get_theme_mod('business-site-logo');
      $siteLogoURL = wp_get_attachment_url($siteLogoID);

      echo '<meta name="author" content="Deific Arts, LLC">';
      echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
      echo '<base href="/">';
      echo '<link rel="icon" href="'. $siteLogoURL .'">';
      echo '<meta name="description" content="'. get_bloginfo('description') .'">';
      echo '<meta name="theme-color" content="#2557a7"/>';
      echo '<meta name="mobile-web-app-capable" content="yes">';
      echo '<meta name="application-name" content="'. get_bloginfo('name') .'">';
      echo '<meta name="apple-mobile-web-app-capable" content="yes">';
      echo '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">';
      echo '<meta name="apple-mobile-web-app-title" content="'. get_bloginfo('name') .'">';
      echo '<link rel="shortcut icon" type="image/x-icon" href="images/favicon.ico">';
    }

    public static function add_theme_colors() {
      $pageWidth = get_theme_mod('site-page-width') ? get_theme_mod('site-page-width') : Config::PAGE_WIDTH;

      echo '
        <style>
          :root {
            --page-width: '. $pageWidth .';
          }
        </style>
      ';
    }

    public static function add_body_classes($classes) {
      global $post;

      $classes[] = Config::SLUG;
      if ($post) {
        $classes[] = Config::SLUG . '--' . $post->post_name;
      }

      return $classes;
    }

    public static function add_svg_upload($upload_mimes) {
      $upload_mimes['svg'] = 'image/svg+xml';
      $upload_mimes['svgz'] = 'image/svg+xml';
      return $upload_mimes;
    }

    public static function add_custom_organization_schema() {
      $schema = array(
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => get_bloginfo('name'),
        'url' => home_url(),
        'logo' => get_theme_file_uri('/screenshot.jpg'),
      );
      echo '<script type="application/ld+json">' . json_encode($schema) . '</script>';
    }

    public static function get_page_content($slug, $error_message = '') {
      $page = get_page_by_path($slug);
      if ($page) {
        $content = apply_filters('the_content', $page->post_content);
        return $content;
      } else {
        return $error_message;
      }
    }

    public static function get_vite_asset( string $entry ): string {
      if (self::is_vite_dev()) {
        return 'http://localhost:5173/' . ltrim( $entry, '/' );
      }

      $manifest_path = get_template_directory() . '/build/.vite/manifest.json';
      if ( file_exists( $manifest_path ) ) {
        $manifest = json_decode( file_get_contents( $manifest_path ), true );
        if ( isset( $manifest[ $entry ]['file'] ) ) {
          return get_template_directory_uri() . '/build/' . $manifest[ $entry ]['file'];
        }
      }

      return '';
    }

    public static function is_vite_dev(): bool {
      static $is_dev = null;
      if (null === $is_dev) {
        $is_dev = false;
        // wp-env runs PHP in Docker, where the host machine is host.docker.internal
        foreach (array('http://host.docker.internal:5173', 'http://localhost:5173') as $base) {
          $response = wp_remote_get($base . '/src/frontend.ts', array('timeout' => 1));
          if (!is_wp_error($response) && 200 === wp_remote_retrieve_response_code($response)) {
            $is_dev = true;
            break;
          }
        }
      }
      return $is_dev;
    }

    public static function react_refresh_preamble() {
      if (!self::is_vite_dev()) {
        return;
      }

      echo '<script type="module">
          import RefreshRuntime from "http://localhost:5173/@react-refresh"
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
      </script>';
    }

    public static function enqueue_blocks_hmr() {
      if (!self::is_vite_dev()) {
        return;
      }

      self::enqueue_vite_client();
      wp_enqueue_script(
        'business-blocks',
        'http://localhost:5173/src/blocks.ts',
        array( 'vite-client', 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ),
        null,
        true
      );
    }
  }
}

Theme::get_instance();
