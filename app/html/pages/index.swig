{% extends '../master/default.swig' %}
{% block content %}

<main id="vueApp">

	

	<page-head></page-head>
    <grid :colors="colors"></grid>

</main>
<script type="text/x-template" id="page-head">
		<header>
		<h1>Vue.JS Grid Template</h1>
		</header>
	</script>
	
	<script type="text/x-template" id="grid">
		<div class="grid">
			<transition-group name="pop">
				<div class="color" v-for="(color, index) in colors" v-bind:key="{index}" v-bind:style="{ backgroundColor: color.hex }"></div>
		</transition-group>
		</div>
	</script>
{% endblock %}





