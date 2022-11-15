<?php
$webpack = \Config::get('materia.urls.js_css');
$vendor = \Config::get('materia.urls.js_css') . 'vendor/';
$cdnjs = '//cdnjs.cloudflare.com/ajax/libs/';

return [
	'groups' => [
		'login'      => [$webpack.'js/login.js'],
		'profile'    => [$webpack.'js/profile.js'],
		'settings'   => [$webpack.'js/settings.js'],
		'admin'      => [$webpack.'js/admin.js'],
		'support'    => [$webpack.'js/support.js'],
		'user_admin' => [$webpack.'js/user-admin.js'],
		'widget_admin' => [$webpack.'js/widget-admin.js'],
		'author'     => [$webpack.'js/author.js'],
		'student'    => [$webpack.'js/student.js'],
		'materia'    => [$webpack.'js/materia.js'],
		'homepage'   => [$webpack.'js/homepage.js'],
		'catalog'    => [$webpack.'js/catalog.js'],
		'my_widgets' => [$webpack.'js/my-widgets.js'],
		'detail'     => [$webpack.'js/detail.js'],
		'playpage'   => [$webpack.'js/player-page.js'],
		'createpage' => [$webpack.'js/creator-page.js'],
		'scores'     => [$webpack.'js/scores.js'],
		'guides'     => [$webpack.'js/guides.js'],
		'retired'    => [$webpack.'js/retired.js'],
		'no_attempts'=> [$webpack.'js/no-attempts.js'],
		'draft_not_playable' => [$webpack.'js/draft-not-playable.js'],
		'no_permission' => [$webpack.'js/no-permission.js'],
		'embedded_only' => [$webpack.'js/embedded-only.js'],
		'pre_embed'  => [$webpack.'js/pre-embed-placeholder.js'],
		'help'       => [$webpack.'js/help.js'],
		'404'        => [$webpack.'js/404.js'],
		'500'        => [$webpack.'js/500.js'],
		'qset_history' => [$webpack.'js/qset-history.js'],
		'angular'    => [$vendor.'angular.min.js'],
		'ng-animate' => [$vendor.'angular-animate.min.js'],
		'jquery'     => [$vendor.'jquery.min.js'],
		'dataTables' => [$vendor.'jquery.dataTables.min.js'],
		'labjs'      => [$vendor.'LAB.min.js'],
		'hammerjs'   => [$vendor.'hammer.min.js'],
		'swfobject'  => [$vendor.'swfobject.js'],

		'react'      => [
			'//unpkg.com/react@16.13.1/umd/react.development.js',
			'//unpkg.com/react-dom@16.13.1/umd/react-dom.development.js',
			$webpack.'js/include.js'
		],
		'jqplot'     => [
			$cdnjs . 'jqPlot/1.0.9/jquery.jqplot.min.js',
			$cdnjs . 'jqPlot/1.0.9/plugins/jqplot.barRenderer.min.js',
			$cdnjs . 'jqPlot/1.0.9/plugins/jqplot.canvasTextRenderer.min.js',
			$cdnjs . 'jqPlot/1.0.9/plugins/jqplot.canvasAxisTickRenderer.min.js',
			$cdnjs . 'jqPlot/1.0.9/plugins/jqplot.categoryAxisRenderer.min.js',
			$cdnjs . 'jqPlot/1.0.9/plugins/jqplot.cursor.min.js',
			$cdnjs . 'jqPlot/1.0.9/plugins/jqplot.highlighter.min.js',
		],
		'question-importer' => [$webpack . 'js/question-importer.js']
	]
];
