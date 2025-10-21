<?php
if (!defined('ABSPATH')) exit;

add_action('admin_menu', function () {
  add_options_page('Web Assistant Embed', 'Web Assistant Embed', 'manage_options', 'wae-embed', 'wae_render_admin');
});

add_action('admin_init', function () {
  register_setting('wae_settings_group', WAE_OPTION_KEY, [
    'type' => 'string',
    'sanitize_callback' => 'esc_url_raw',
    'default' => ''
  ]);
  add_settings_section('wae_main', 'Einstellungen', function(){}, 'wae_settings');
  add_settings_field('wae_field', 'Basis-URL des Web Assistants (z. B. https://web-assistant-8s4s.vercel.app)', function(){
    $val = esc_attr(get_option(WAE_OPTION_KEY, ''));
    echo "<input type='url' name='".WAE_OPTION_KEY."' value='$val' class='regular-text' />";
  }, 'wae_settings', 'wae_main');
});

function wae_render_admin() {
?>
  <div class="wrap">
    <h1>Web Assistant Embed</h1>
    <form action="options.php" method="post">
      <?php
        settings_fields('wae_settings_group');
        do_settings_sections('wae_settings');
        submit_button('Speichern');
      ?>
    </form>
    <p>Verwende den Shortcode <code>[web_assistant]</code> oder den Gutenberg-Block <strong>Web Assistant</strong>.</p>
  </div>
<?php
}
