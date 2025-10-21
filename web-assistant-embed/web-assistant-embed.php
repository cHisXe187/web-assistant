<?php
/**
 * Plugin Name: Web Assistant Embed
 * Description: Betten Sie Ihren Next.js Web Assistant per iFrame ein (Shortcode + Block).
 * Version: 1.0.0
 * Author: cHisXe187
 */

if (!defined('ABSPATH')) exit;

define('WAE_OPTION_KEY', 'wae_embed_base'); // Basis-URL wie https://web-assistant-8s4s.vercel.app

// --- Activation: Default setzen ---
register_activation_hook(__FILE__, function () {
  if (!get_option(WAE_OPTION_KEY)) {
    add_option(WAE_OPTION_KEY, 'https://web-assistant-8s4s.vercel.app');
  }
});

// --- Admin-Seite ---
require_once __DIR__ . '/includes/admin-page.php';

// --- Shortcode ---
function wae_shortcode($atts = []) {
  $base = rtrim(get_option(WAE_OPTION_KEY, ''), '/');
  if (!$base) return '<p style="color:red">Web Assistant Embed: Basis-URL nicht gesetzt.</p>';

  $a = shortcode_atts([
    'width'   => '100%',
    'height'  => '600px',
    'theme'   => 'light', // light|dark
    'lang'    => 'de',    // de|it
    'welcome' => 'Wie kann ich helfen?',
    'session' => 'global'
  ], $atts, 'web_assistant');

  $params = http_build_query([
    'theme'   => $a['theme'],
    'lang'    => $a['lang'],
    'welcome' => $a['welcome'],
    'session' => $a['session'],
  ]);

  $src = esc_url("{$base}/embed?{$params}");
  $style = sprintf('width:%s; height:%s; border:0;', esc_attr($a['width']), esc_attr($a['height']));

  return sprintf('<iframe loading="lazy" src="%s" style="%s" allow="clipboard-write; cross-origin-isolated"></iframe>', $src, $style);
}
add_shortcode('web_assistant', 'wae_shortcode');

// --- Block registrieren ---
function wae_register_block() {
  wp_register_script('wae-block', plugins_url('block/index.js', __FILE__), ['wp-blocks','wp-element','wp-editor','wp-components','wp-i18n'], '1.0.0', true);
  register_block_type(__DIR__ . '/block', [
    'render_callback' => function($attributes){
      return wae_shortcode($attributes);
    },
    'editor_script' => 'wae-block'
  ]);
}
add_action('init', 'wae_register_block');
