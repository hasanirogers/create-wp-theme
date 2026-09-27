<main>
  <section>
    <business-view-home>
      <?php echo \business\Theme::get_page_content('home', 'There was an error grabbing the home page.'); ?>
    </business-view-home>
  </section>

  <section>
    <business-view-about>
      <?php echo \business\Theme::get_page_content('about', 'There was an error grabbing the about page.'); ?>
    </business-view-about>
  </section>

  <section>
    <business-view-testimonials>
      <?php
        $testimonials = get_posts(array(
          'post_type' => 'testimonial',
          'posts_per_page' => -1,
        ));

        if ($testimonials) {
          $testimonialsArray = [];
          foreach ($testimonials as $testimonial) {
            $testimonialsArray[] = str_replace("\n", "", strip_tags(apply_filters('the_content', '&ldquo;'. $testimonial->post_content .'&rdquo;')) . '<br /><br ><cite>&mdash; '. $testimonial->post_title .'</cite>');
          }
          echo '<kemet-rotator effect="flip" speed="8" messages=\''. json_encode($testimonialsArray) .'\'></kemet-rotator>';
        } else {
          echo '<p>Check back later for testimonials.</p>';
        }
      ?>
    </business-view-testimonials>
	</section>

  <section>
    <business-view-booking>
      <?php echo \business\Theme::get_page_content('booking', 'There was an error grabbing the booking page.'); ?>
    </business-view-booking>
  </section>

  <section>
    <business-view-contact>
      <?php echo \business\Theme::get_page_content('contact', ''); ?>
      <business-contact-form
        url="<?php echo rest_url("business/v1/forms/contact"); ?>">
      </business-contact-form>
    </business-view-contact>
	</section>

  <?php get_template_part('includes/parts/footer'); ?>
</main>

