<?php
namespace business;

Class Endpoints {
  public static function init() {
    add_action('rest_api_init', array(self::class, 'add_contact_form'));
  }

  public static function add_contact_form() {
    register_rest_route('business/v1', 'forms/contact', array(
      'methods' => 'POST',
      'permission_callback' => '__return_true',
      'callback' => function ($request) {
        $to = get_theme_mod('business-contact-form-to');
        $subject = get_theme_mod('business-contact-form-subject');
        $fullName = $request->get_param('fullname');
        $email = $request->get_param('email');

        $requiredFieldsFilled = !empty($to) && !empty($email) && !empty($message);

        if (!$requiredFieldsFilled) {
          return array(
            'status' => 'error',
            'success' => false,
            'message' => 'Please fill out all required fields.',
          );
        }

        $message = '
          '. $fullName .' <'. $email .'> wrote the following:
          ---------------------------------------------------
          '. $request->get_param('message') .'
        ';

        $headers = array(
          'From: '. get_theme_mod('business-contact-form-from-name') .' <'. get_theme_mod('business-contact-form-from-email') .'>',
          'Reply-To: '. $fullName .' <'. $email .'>'
        );
        $headers = implode( PHP_EOL, $headers );

        $sent = wp_mail($to, $subject, $message, $headers);

        if ($sent) {
          return array(
            'status' => 'ok',
            'success' => true,
            'message' => 'I got your message!',
          );
        } else {
          return array(
            'status' => 'error',
            'success' => false,
            'message' => 'Oops. There was a problem sending your message.',
          );
        }
      }
    ));
  }
}
Endpoints::init();
