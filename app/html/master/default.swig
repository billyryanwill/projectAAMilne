<!DOCTYPE html>
<!--[if (IE 8)&!(IEMobile)]><html class="no-js is-ie8 lt-ie9 lt-ie10" lang="en"><![endif]-->
<!--[if IE 9]><html class="no-js is-ie9 lt-ie10" lang="en"><![endif]-->
<!--[if gt IE 9]><!--><html class="no-js" lang="en"><!--<![endif]-->
<head>
	<title>{% block title %}The deep dark wood{% endblock %}</title>
	{% include "../includes/head/meta.swig" %}
	{% include "../includes/head/fonts.swig" %}
	{% include "../includes/head/css.swig" %}
	{% include "../includes/head/icons.swig" %}
	{% include "../includes/head/js.swig" %}
	{% block headcontent %}{% endblock %}
</head>
<body>
	<!-- Google Tag Manager (noscript) -->
	<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KJLDTF"
	height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
	<!-- End Google Tag Manager (noscript) -->
	{% include "../includes/structure/header.swig" %}
	{% block content %}{% endblock %}
	{% include "../includes/foot/css.swig" %}
	{% include "../includes/foot/js.swig" %}
</body>
</html>
