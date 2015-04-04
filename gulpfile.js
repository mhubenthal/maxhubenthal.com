// Project build with Gulp
var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  plugins = gulpLoadPlugins();

gulp.task('js',function(){
  gulp.src(['source/js/gol/gol.js','source/js/gol-2/gol-2.js','source/js/ticker/ticker.js','source/js/main.js'])
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.concat('app.js'))
	  .pipe(plugins.uglify())
		.pipe(gulp.dest('build/js'))
		.pipe(plugins.livereload());
});

gulp.task('less',function(){
  gulp.src('source/less/main.less')
    .pipe(plugins.less())
    .pipe(gulp.dest('build/css'))
		.pipe(plugins.livereload());
});

gulp.task('html',function(){
	gulp.src('source/*.html')
		.pipe(gulp.dest('build'))
		.pipe(plugins.livereload());
});

gulp.task('connect',function(){
	plugins.connect.server({
		root: 'build',
    livereload: true
	});
});

gulp.task('watch',function(){
	plugins.livereload.listen();
	gulp.watch('source/less/main.less', function(event){
		gulp.run('less');
	});
	gulp.watch('source/*.html', function(event){
		gulp.run('html');
	});
	gulp.watch(['source/js/**/*.js','source/js/main.js'], function(event){
		gulp.run('js');
	});	
})

gulp.task('default',['connect','less','js','html','watch']); 
