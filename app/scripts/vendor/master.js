/**
 * Register Vue Components
 */

// register the grid component
Vue.component('page-head', {
  template: '#page-head'
})

Vue.component('grid', {
  template: '#grid',
  props: ['colors']

})

var app = new Vue({
  el: '#vueApp',
	mounted: function () {
    window.addEventListener('scroll', this.onScroll);
  },
  methods: {
    onScroll: function(e) {
      if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
				this.addMoreColors();
      }
    },
    addMoreColors: function() {
      // Simple dummy function to add more data.
      this.colors = this.colors.concat([{ hex: "#f6d258"}, { hex: "#efcec5" }, { hex: "#d1af94" },{ hex: "#97d5e0" }, { hex: "#f6d258" }, { hex: "#efcec5"  }]);
    }
  },
  data: function() {
    return {
      colors: [
        { hex: "#f6d258" },
        { hex: "#efcec5" },
        { hex: "#d1af94" },
        { hex: "#97d5e0" },
        { hex: "#f6d258" },
        { hex: "#efcec5" },
        { hex: "#97d5e0" },
        { hex: "#f6d258" },
        { hex: "#efcec5" },
        { hex: "#d1af94" },
        { hex: "#97d5e0" },   
      ]
    }
  }
})

