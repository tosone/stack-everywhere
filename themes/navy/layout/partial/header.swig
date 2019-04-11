<header id="header" class="wrapper header">
  <div id="header-inner" class="inner header-inner">
    <h1 id="logo-wrap" class="logo-wrap">
      <a href="{{ url_for_lang('index.html') }}" id="logo" class="logo"><i class="fa fa-apple"></i></a>
    </h1>
    <nav id="main-nav" class="main-nav">
      <ul>
        {{ header_menu('main-nav') }}
      </ul>
    </nav>
    <a id="mobile-nav-toggle" class="mobile-nav-toggle">
      <span class="mobile-nav-toggle-bar"></span>
      <span class="mobile-nav-toggle-bar"></span>
      <span class="mobile-nav-toggle-bar"></span>
    </a>
  </div>
</header>
