
// Explanation for Students ---- This is requires the gulp package from node modules
// Gulp exports an object with many methods
// task , watch, src and pipe will be the main ones we use today but see the gulp docs to expand and also see how you might refactor it to no longer use task and maybe use exports, series and parallells
// i don't use them here because they are more magic and make it harder to show what's happening
const gulp = require('gulp');

// Explanation for Students ---- This is for compiling SASS, we haven't learned SASS yet but this is as good a chance as any to to talk about how we could compile it.
// Using dart-sass (the 'sass' package) which is the modern, maintained version
const sass = require('gulp-sass')(require('sass'));

// Use Nodemon programatically
const nodemon = require('gulp-nodemon');

// Explanation for Students ---- This is for those pesky experimental features of css that are not available in all browsers without prefixes like webkit and moz
const autoprefixer = require('gulp-autoprefixer');

// Explanation for Students ---- This is the mastermind that will open up our code in a browser window
const browserSync = require('browser-sync').create();

// Explanation for Students ---- This is a browserSync method that reloads the page we wangt whenever we make a change to have the page reload
const reload = browserSync.reload;

// Explanation for Students ---- This is a NODEJS standard method that lets us call scripts in our package.json or node_modules from our code
var exec = require('child_process').exec;


// Explanation for Students ---- This is the brain child for our self made development server

gulp.task('default', (cb) => {
	// Compile Styles
	exec('npm run styles', function(err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
	// SERVE BACKEND
	nodemon({
		script: 'server.mamba',
    env: { 'NODE_ENV': 'development'},
		ext: 'mamba'
 });
 // SERVE  FRONT END WITH PROXY TO BACKEND
	browserSync.init({
	 open: false,
	 proxy: {
		 target: 'http://localhost:8089',
		 ws: true
	 },
	 serveStatic: ['./public']
	});
	// SET UP WATCHERS TO LISTEN TO CHANGES IN FILES
 	gulp.watch('./src/scss/**/*',  gulp.task('styles'));
	gulp.watch('./api/**/*',  gulp.task('build'));
	gulp.watch('./api_static/**/*',  gulp.task('build'));
	gulp.watch('./src/main.mamba',  gulp.task('build'));
	// LISTEN FOR WHEN TO RELOAD PAGES
	gulp
		.watch([
			'./public/**/*',
			'./public/*',
			'./public/css/**/.#*css',
			'./json/**/*',
			'./json_static/**/*',
			'./json_pillar/**/*',
			'./src/components/**/*',
			'./src/layout/**/*',
			'./src/pages/**/*',
			'./src/**/*'
		])
		.on('change', reload);
		cb()
});

// Explanation for Students ---- This is compiles our styles
gulp.task('styles', (cb) => {
	gulp
		.src('src/scss/**/*.scss')
		.pipe(
			sass({
				outputStyle: 'compressed'
			}).on('error', sass.logError)
		)
		.pipe(
			autoprefixer({
				cascade: false
			})
		)
		.pipe(gulp.dest('./public/css'))
		.pipe(browserSync.stream());
		cb()
});

gulp.task('build', (cb) => {
	exec('npm run create', function(err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
})
