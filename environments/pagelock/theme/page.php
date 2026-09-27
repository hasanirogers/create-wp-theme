<?php
  $slug = get_post_field('post_name');
  get_header();
?>

<main>
  <section>
    <business-view>
      <?php echo \business\Theme::get_page_content($slug, ''); ?>
    </business-view>
	</section>
  <?php get_template_part('includes/parts/footer'); ?>
</main>
<?php get_footer(); ?>
