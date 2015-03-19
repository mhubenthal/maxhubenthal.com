var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  plugins = gulpLoadPlugins();

gulp.task('js',function(){
  gulp.src(['source/js/gol.js','source/js/gol-2.js','source/js/ticker.js','source/js/main.js'])
  //	.pipe(plugins.watch('source/js/*.js')) 
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.concat('app.js'))
	  .pipe(plugins.uglify())
		.pipe(gulp.dest('build/js'))
	//	.pipe(plugins.connect.reload());
});

gulp.task('css',function(){
  gulp.src('source/less/main.less')
    .pipe(plugins.watch('source/less/main.less'))
    .pipe(plugins.less())
    .pipe(gulp.dest('build/css'))
		.pipe(plugins.connect.reload());
});

gulp.task('html',function(){
	gulp.src('source/*.html')
		.pipe(plugins.watch('source/*.html'))
		.pipe(gulp.dest('build'))
		.pipe(plugins.connect.reload());
});

gulp.task('connect',function(){
	plugins.connect.server({
		root: 'build',
    livereload: true
	});
});

gulp.task('default',['connect','css','js','html']); 
