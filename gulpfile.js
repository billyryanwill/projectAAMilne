// plugins
var gulp            = require('gulp'),
	gutil           = require('gulp-util'),
	jshint          = require('gulp-jshint'),
	concat          = require('gulp-concat'),
	clean           = require('gulp-clean'),
	uglify          = require('gulp-uglify'),
	stripDebug      = require('gulp-strip-debug'),
	cssmin          = require('gulp-minify-css'),
	sass            = require('gulp-sass'),
	autoprefixer    = require('gulp-autoprefixer'),
	imagemin        = require('gulp-imagemin'),
	csslint         = require('gulp-csslint'),
	exec            = require('gulp-exec'),
	connect         = require('gulp-connect'),
	watch           = require('gulp-watch'),
	swig            = require('gulp-swig'),
	preprocess      = require('gulp-preprocess'),
	fileinclude     = require('gulp-file-include'),
	plumber			= require('gulp-plumber'),
	runSequence     = require('run-sequence'),
	open 			= require('gulp-open'),
	browserSync 	= require('browser-sync').create(),
	critical 		= require('critical'),
	ngrok 			= require('ngrok'),
	psi				= require('psi'),
	fs	 			= require('fs'),
	https 			= require('https'),
	minify 			= require('gulp-minify'),
	babel 	 		= require('gulp-babel');

// variables
var dir, config, dev, prod;
var userConfig		= require('./gulp-user.json');

// specify browser to open site in, and page to open
var browser = userConfig.browser;
var openPage = userConfig.openPage;

// directories
dir = {
	app:     	'app',
	dest: 		'dist'
};

// configuration
config = {
	src: {
		html:           dir.app + '/html/pages/**/*.swig',
		css:            dir.app + '/styles/{styles}.scss',
		fonts:          dir.app + '/styles/fonts/**/*',
		js:             dir.app + '/scripts',
		img:            dir.app + '/images/**/*',
		jsonData:       dir.app + '/data'
	},
	watch: {
		html:           dir.app + '/html/**/*',
		css:            dir.app + '/styles/**/*.scss',
		img:            dir.app + '/images/**/*',
		js:             dir.app + '/scripts/**/*.js',
		jsonData:       dir.app + '/data'
	},
	dest: {
		html:           dir.dest,
		css:            dir.dest + '/css',
		fonts:          dir.dest + '/fonts',
		js:             dir.dest + '/js',
		img :           dir.dest + '/img',
		jsonData:       dir.dest + '/data'
	}
};


// Autoprefixer array
autoprefixerBrowsers = [
	'ie >= 8',
	'ie_mob >= 10',
	'ff >= 28',
	'chrome >= 34',
	'safari >= 7',
	'opera >= 23',
	'ios >= 7',
	'android >= 4.4',
	'bb >= 10'
];

// environments
dev = gutil.env.dev;
prod = gutil.env.prod;

//set node_env for preprocessor
if (dev === true) { process.env.NODE_ENV = 'dev' }
else if (prod === true) { process.env.NODE_ENV = 'prod' }

// FUNCTIONS
// =========

/**
 * [lintReporter description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function lintReporter(file) {
	gutil.log(gutil.colors.red(file.csslint.errorCount) + ' Warnings in ' + gutil.colors.yellow(file.path));

	file.csslint.results.forEach(function(result) {
		gutil.log(result.error.message + ' on line ' + result.error.line);
	});
};


// TASKS
// =========

var onError = function (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
};

// Create browser sync
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});


// Page Speed Insights Test
var site = '';

gulp.task('ngrok-url', function(cb) {
  return ngrok.connect(3000, function (err, url) {
    site = url;
    console.log('serving your tunnel from: ' + site);
    cb();
  });
});

gulp.task('psi-desktop', function (cb) {
  psi(site, {
    nokey: 'true',
    strategy: 'desktop'
  }, cb);
});

gulp.task('psi-mobile', function (cb) {
  psi(site, {
    nokey: 'true',
    strategy: 'mobile'
  }, cb);
});
gulp.task('psi-seq', function (cb) {
  return runSequence(
    'ngrok-url',
    'psi-desktop',
    'psi-mobile',
    cb
  );
});

gulp.task('psi', ['psi-seq'], function() {
  console.log('Woohoo! Check out your page speed scores!')
  process.exit();
})

gulp.task('criticalCss', function(){
	gutil.log('TASK: Processing Critical Path CSS');
	critical.generate({
		inline: true,
		base: 'dist/',
		src: 'index.html',
		dest: 'index.html',
		minify: true,
		width: 1300,
		height: 900
	});
})

//swig task
gulp.task('swig', function() {
	gutil.log('TASK: Process SWIG templates');
	var opts = {
		load_json: true,
		defaults: {cache: false}
	};
	return gulp.src(config.src.html)
		.pipe(swig(opts))
		.pipe(gulp.dest(config.dest.html))
		.pipe(dev ? connect.reload() : gutil.noop());
});

// Lint Task
gulp.task('lint', function() {
	gutil.log('TASK: JS Lint');
	return gulp.src('/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

// Compile Sass
gulp.task('sass', function() {
	gutil.log('TASK: Process SASS files');
	return gulp.src(config.src.css)
		.pipe(plumber({errorHandler: onError}))
		.pipe(sass())
		.pipe(autoprefixer('last 2 version', '> 5%'))
		.pipe(dev ? csslint.reporter(lintReporter) : gutil.noop())
		.pipe(cssmin())
		.pipe(gulp.dest(config.dest.css))
		.pipe(browserSync.stream())
		.pipe(dev ? connect.reload() : gutil.noop());
});

// copy css assets
gulp.task('cssAssets', function (){
	gutil.log('TASK: Copy CSS Assets files');
	return gulp.src(config.src.fonts)
		.pipe(gulp.dest(config.dest.fonts))
		.pipe(dev ? connect.reload() : gutil.noop());
});

// image copy task
gulp.task('img', function() {
	gutil.log('TASK: Copy Image files');
	return gulp.src(config.src.img)
		.pipe(!dev ? imagemin() : gutil.noop())
		.pipe(gulp.dest(config.dest.img))
		.pipe(dev ? connect.reload() : gutil.noop());
});




// Concatenate & Minify JS
// (excludes vendor)?
// use requireJS?
gulp.task('scripts', function() {
	gutil.log('TASK: Scripts');
	return gulp.src(config.dest.js)
		.pipe(preprocess())
		.pipe(babel({presets:['es2015']}))
		.pipe(concat('all.min.js'))
		.pipe(gulp.dest(config.dest.js))
		.pipe(dev ? connect.reload() : gutil.noop());
});

//js vendor copy task
gulp.task('jsvendor', function() {
	gutil.log('TASK: Copy JS Vendor files');
	return gulp.src(config.src.js + '/vendor/*')
		.pipe(preprocess())
		.pipe(!dev ? uglify({ outSourceMap: false, compress: { drop_console: true } }) : gutil.noop())
		.pipe(gulp.dest(config.dest.js + '/vendor'))
		.pipe(dev ? connect.reload() : gutil.noop());
});


// copy json data files to dist/assets/data
gulp.task('copy', function () {
	gutil.log('TASK: Copy JSON files');
	gutil.log(config.src.jsonData + '/*.json');
	gutil.log(config.dest.jsonData);
	return gulp.src(config.src.jsonData + '/*.json')
		.pipe(gulp.dest(config.dest.jsonData))
		.pipe(dev ? connect.reload() : gutil.noop());
});



//connect task
gulp.task('connect', function () {
	gutil.log('TASK: Connect to server');
	return connect.server({
		root: [dir.dest],
		port: 8000,
		livereload: true
	});
});

//watch task
gulp.task('watch', function() {
	gutil.log('TASK: Initiate watch');
	//watch html files
	gulp.watch(config.watch.html, { interval: 1000 }, ['swig']).on('change', browserSync.reload);
	//watch css files
	gulp.watch(config.watch.css, { interval: 1000 }, ['sass']).on('change', browserSync.reload);
	//watch img files
	gulp.watch(config.watch.img, { interval: 1000 }, ['img']);
	//watch js files
	gulp.watch(config.watch.js, { interval: 500 }, ['scripts','jsvendor']).on('change', browserSync.reload);
	//watch json files
	gulp.watch(config.watch.jsonData, { interval: 1000 }, ['copy']);
});

//clean task
gulp.task('clean', function() {
	gutil.log('TASK: Clean');
	return gulp.src([dir.dest, '.sass-cache'], {read: false})
		.pipe(clean({force:true}));
});

// // default build task for local hosting
gulp.task('build', ['swig', 'sass', 'jsvendor', 'scripts','cssAssets', 'img', 'copy']);

//default task
gulp.task('default', [ 'serve' ], function(){
	gutil.log('Making ' + dir.dest + ' writeable');
	return gulp.src(dir.dest)
		.pipe(exec('cd '+dir.dest))
		.pipe(exec('cd ..'));
});

gulp.task('open', function() {
	gutil.log('Opening http://localhost:8000'+openPage);
	return gulp.src(dir.dest+openPage)
		  .pipe(open('', { url: 'http://localhost:8000'+openPage, app: browser }));
});

gulp.task('serve', function(callback) {
  runSequence('clean',
			  'build',
			  'connect',
			  'watch',
			  'browser-sync',
			  'open',
			  callback);
});

