var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  plugins = gulpLoadPlugins();

gulp.task('minify',function(){
  gulp.src(['source/js/gol.js','source/js/ticker.js','source/js/main.js'])
    .pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.concat('app.js'))
		.pipe(plugins.uglify())
		.pipe(gulp.dest('build/js'));
});

gulp.task('less',function(){
  gulp.src('source/less/*.less')
    .pipe(plugins.watch('source/less/*.less'))
    .pipe(plugins.less())
    .pipe(gulp.dest('build/css'))
		.pipe(plugins.connect.reload());
});

gulp.task('html',function(){
	gulp.src('source/*.html')
		.pipe(plugins.watch('source/*.html'))
		.pipe(plugins.connect.reload());
});

gulp.task('css',function(){
	gulp.src('build/*.css')
		.pipe(plugins.watch('build/*.css'))
		.pipe(plugins.connect.reload());
});

gulp.task('watchHtml',function(){
	gulp.watch(['build/*.html'],['html']);
});

gulp.task('watchCss',function(){
	gulp.watch(['build/*.css'],['css']);
});	

gulp.task('connect',function(){
	plugins.connect.server({
		root: 'build',
    livereload: true
	});
});

gulp.task('default',['connect','watchHtml','less','minify']); 
