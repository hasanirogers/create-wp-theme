<!DOCTYPE html>
<html lang="en" data-page="<?php echo esc_attr(get_query_var('pagename')); ?>">
<head><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
  <kemet-drawer effect="push" fill-viewport overlay>
    <aside slot="sidebar">
      <?php get_sidebar(); ?>
    </aside>
    <section slot="body">
      <header>
        <div>
          <button id="drawer-toggle" title="Toggle Drawer">
            <kemet-icon name="list" size="32"></kemet-icon>
          </button>
          <a href="<?php echo home_url('/home'); ?>">
            <img src="https://placehold.co/150x48" alt="Logo">
          </a>
          <nav>
            <?php // it makes sense to hardcode the nav because you need page-slug.php template for each of these items ?>
            <?php include get_template_directory() . '/includes/parts/nav.php'; ?>
          </nav>
        </div>
        <div>
          <kemet-button href="https://deificarts.com" appearance="brand">CTA Button</kemet-button>
        </div>
      </header>
