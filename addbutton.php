<?php
/*
Plugin Name: Button Class for Links
Plugin URI: https://benluoma.com
Description: This plugin adds a "Button" checkbox to the Insert/Edit Link box for adding a class attribute set to "btn."
Version: 1.0
Author: Ben Luoma
Author URI: https://benluoma.com
License: GPLv2
License URI: http://www.opensource.org/licenses/GPL-2.0
*/

function tnl_add_nofollow() {
    wp_deregister_script('wplink');
    wp_register_script('wplink',  plugins_url( '/inc/addbutton.js', __FILE__ ), array('jquery'), false, 1);
    wp_enqueue_script('wplink');
    wp_localize_script('wplink', 'wpLinkL10n', array(
        'title' => __('Insert/edit link'),
        'update' => __('Update'),
        'save' => __('Add Link'),
        'noMatchesFound' => __('No results found.'),
        'noFollow' => __(' Button', 'title-and-nofollow-for-links')
    ));
}
add_action('wp_enqueue_editor', 'tnl_add_nofollow', 99999);

function title_nofollow_links_setup(){
    load_plugin_textdomain('title-and-nofollow-for-links', null, dirname( plugin_basename( __FILE__ ) ) . '/lang' );
}
add_action('init', 'title_nofollow_links_setup');

?>
