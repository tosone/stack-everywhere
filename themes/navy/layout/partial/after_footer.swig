<!-- Scripts -->
<!-- build:js js/dist.main.js -->
{{ js('js/jquery') }}
{{ js('js/hammer') }}
{{ js('assets/bootstrap/js/bootstrap') }}
{{ js('js/lang_select') }}
{{ js('js/toc') }}
{{ js('js/mobile_nav') }}
<!-- endbuild -->
{% if page.layout === 'plugins' %}
<!-- build:js js/dist.plugins.js -->
{{ js('js/lunr') }}
{{ js('js/plugins') }}
<!-- endbuild -->
{% endif %}
<script id="__bs_script__">//<![CDATA[
    document.write("<script async src='http://HOST:3000/browser-sync/browser-sync-client.js?v=2.26.3'><\/script>".replace("HOST", location.hostname));
//]]></script>
