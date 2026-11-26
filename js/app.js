//

//***** OpenLayers関連 *****
var default_minZoom = 10;
var _mapExtent = [-179.99999997494382, -85.05112877764509, 179.99999997494382, 85.05112877764508]; // EPSG:4612（EPSG:3857 [ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ]）
var _maxZoom = 18; // Google（空中写真）が20まで（21まで拡大可能だが、見た目が変わらず、他の主題と不整合が生じる）※場所によって異なる
var _minZoom = 10;
var _defaultZoom = 13;
app.extent_kujukuri = [140.383439632103, 35.4980612195016, 140.469655713521, 35.5701349335888];
var _defaultCenter = [(app.extent_kujukuri[0]+app.extent_kujukuri[2])/2, (app.extent_kujukuri[1]+app.extent_kujukuri[3])/2,0]; // EPSG:4612


function hex2rgb(hex, opacity) {
	var h = hex.replace("#", "");
	if (h.length == 3 || h.length == 6) {
		h = h.match(new RegExp("(.{" + h.length / 3 + "})", "g"));
	} else {
		h = h.match(new RegExp("(.{" + h.length / 4 + "})", "g"));
	}
	for (var i = 0; i < h.length; i++)
		h[i] = parseInt(h[i].length == 1 ? h[i] + h[i] : h[i], 16);
	if (h.length == 4) {
		h[3] = h[3] / 255.0;
	}
	if (typeof opacity != "undefined") {
		h[3] = opacity;
	}
	if (h.length == 4) {
		return "rgba(" + h.join(",") + ")";
	}
	return "rgb(" + h.join(",") + ")";
}

// レイヤ設定
// レイヤー一覧
// 上から，
// 前から下層になる
function setLayerList(app) {
	console.log("wait_google");
	if ( !ENABLE_GOOGLEMAPS || (
		typeof google != "undefined"
		&& typeof google.maps != "undefined"
		&& typeof google.maps.SymbolPath != "undefined"
		&& typeof google.maps.SymbolPath.CIRCLE != "undefined" )
		) {
		console.log("setLayerList:started");
		app.layer_list = [
			// 空レイヤー
			{
				tilelayer : new ol.layer.Image({
					title: "空レイヤー"
					,type: ""
					,attribution: false
					,source: new ol.source.ImageStatic({
						url: "images/whitetile.png"
						,projection: "EPSG:4612"
						,crossOrigin: 'Anonymous'
						,imageExtent: [ -180, -90.00, 180.00, 90.00 ]
					})
					,visible: true
					,minResolution: defaultResolution / ( 1 << (_maxZoom) )
					,maxResolution: defaultResolution / ( 1 << (_minZoom) )
					,zIndex: 1
				})

			// 	tilelayer : new ol.layer.Tile({
			// 		overlay: false,
			// 		title: "空レイヤー",
			// 		type: "",
			// 		crossOrigin: 'Anonymous',
			// 		opacity : 1.0,
			// 		zIndex: 0,
			// 		source: new ol.source.XYZ({
			// 				projection: "EPSG:3857"
			// 			,crossOrigin: 'Anonymous'
			// 			,url: "images/clearimage.png"
			// 		})
			// 		,minResolution: defaultResolution / ( 1 << (_maxZoom) )
			// 		,maxResolution: defaultResolution / ( 1 << (_minZoom) )
			// 		,visible: false
			// 	})
			}
			// 九十九里町　基図
			,{
				xxxtilelayer : new ol.layer.Tile({
					title: kujukuri_zenzu, // "九十九里町 全図",
					type: "basemap",
					crossOrigin: 'Anonymous',
					opacity : 1.0,
					source: new ol.source.XYZ({
						urls : [
							app.TILE_ROOT + "basemap/{z}/{x}/{-y}.png",
						]
						,projection: "EPSG:3857"
						,crossOrigin: 'Anonymous'
					})
					,minResolution: defaultResolution / ( 1 << (18) )
					,maxResolution: defaultResolution / ( 1 << (10-1) )
					,visible: false
					,opacity: 1.
					,zIndex: 9
				})
			}
			// 地理院地図（新版）淡色地図
			,{
				tilelayer : new ol.layer.Tile({
					title: chiriin_tile_pale, //"地理院タイル（淡色地図）",
					type: "gsimap",
					crossOrigin: 'Anonymous',
					opacity : 1.0,
					source: new ol.source.XYZ({
						attributions: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>"+chiriin_tile_pale/*地理院タイル（淡色地図）*/+"</a>"
						,urls : [
							"https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
						]
						,projection: "EPSG:3857"
						,crossOrigin: 'Anonymous'
					})
					,minResolution: defaultResolution / ( 1 << (18) )
					,maxResolution: defaultResolution / ( 1 << (5-1) )
					,visible: false
					//,opacity: 0.7	// ※一時コメント化
					,zIndex: 5
				})
			}
			// 地理院地図（新版）色別標高図
			,{
				xxxtilelayer : new ol.layer.Tile({
					title: chiriin_tile_color_elevation,
					type: "gsimap",
					crossOrigin: 'Anonymous',
					source: new ol.source.XYZ({
						attributions: `<a href='http://cyberjapandata.gsi.go.jp/legend/attension_relief.html' target='_blank'>${chiriin_tile_color_elevation}</a>`
						,url: "https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png"
						,projection: "EPSG:3857"
						,crossOrigin: 'Anonymous'
						,tileGrid: ol.tilegrid.createXYZ({ maxZoom: (15) }) // これより小さいTileにならない
					})
					,minResolution: defaultResolution / ( 1 << (18) )
					,maxResolution: defaultResolution / ( 1 << (5-1) )
					,visible: false
					,opacity: 0.7
					,zIndex: 6
				})
			}
		];
		app.layer_list = app.layer_list.concat([{},
			// 地理院地図（新版）写真
			,{
				tilelayer : new ol.layer.Tile({
					title: chiriin_tile_olso,
					type: "gsimap",
					crossOrigin: 'Anonymous',
					source: new ol.source.XYZ({
						attributions: `<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>${chiriin_tile_photo}</a>`
						,url: "https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg"
						,projection: "EPSG:3857"
						,crossOrigin: 'Anonymous'
					})
					,minResolution: defaultResolution / ( 1 << (18) )
					,maxResolution: defaultResolution / ( 1 << (5-1) )
					,visible: false
					,zIndex: 2
				})
			}

			// 地理院地図（新版）標準地図
			,{
				tilelayer : new ol.layer.Tile({
					title: chiriin_tile_standard,
					type: "gsimap",
					crossOrigin: 'Anonymous',
					opacity : 1.0,
					source: new ol.source.XYZ({
						attributions: [`<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>${chiriin_tile_standard}</a>`]
						,urls : [
							"https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
						]
						,projection: "EPSG:3857"
						,crossOrigin: 'Anonymous'
					})
					,minResolution: defaultResolution / ( 1 << (18) )
					,maxResolution: defaultResolution / ( 1 << (5-1) )
					,visible: ENABLE_GOOGLEMAPS ? false : false
					//,opacity: 0.7	// ※一時コメント化
					,zIndex: 4
				})
			}
		]);

		if (ENABLE_GOOGLEMAPS) {
			app.layer_list = app.layer_list.concat([{},
				// Google TERRAIN
				// ,{
				// 	tilelayer : new ol.layer.Vector({
				// 		title: "Google Maps(地形陰影)"
				// 		,type: "gmap"
				// 		,MapTypeId: google.maps.MapTypeId.TERRAIN
				// 		,source: new ol.source.Vector({features: []})
				// 		,visible: false
				// 		,minResolution: defaultResolution / ( 1 << (23) )
				// 		,maxResolution: defaultResolution / ( 1 << (3-1) )
				// 	})
				// }
				// Google Satellite
				// ,{
				// 	tilelayer : new ol.layer.Vector({
				// 		title: "Google Maps(空中写真)"
				// 		,type: "gmap"
				// 		,MapTypeId: google.maps.MapTypeId.SATELLITE
				// 		,source: new ol.source.Vector({features: []})
				// 		,visible: false
				// 		,minResolution: defaultResolution / ( 1 << (23) )
				// 		,maxResolution: defaultResolution / ( 1 << (3-1) )
				// 	})
				// }
				// Google Road
				, {
				tilelayer: new ol.layer.Vector({
					title: "Google Maps"
					, type: "gmap"
					, MapTypeId: google.maps.MapTypeId.ROADMAP
					, source: new ol.source.Vector({ features: [] })
					, visible: true
					, minResolution: defaultResolution / (1 << (23))
					, maxResolution: defaultResolution / (1 << (3-1))
				})
			}
			]);
		}

	} else {
		console.log("wait......");
		setTimeout(setLayerList, 100);
	}
}


// startup
var startup = function(app) {

	$('#loader-bg ,#loader').height($(window).height()).css('display','block');

	app.setMapType();

	// 表示ズームレベルを制限する
	app.options.minZoom = _minZoom;
	switch ( KUJUKURI_MAP_TYPE ) {
		case KUJUKURI_MAP_TYPE_2 : app.options.maxZoom = _maxZoom; break;
		case KUJUKURI_MAP_TYPE_3 : app.options.maxZoom = _maxZoom; break;
	}
	app.options.defaultZoom = app.options.minZoom;
	app.zoomlevel = app.options.defaultZoom;

	app.setupChangeMapRadio();

	// Openlayers 初期値設定
	setOlDefaultVal(app.options);

	setLayerList(app);

	initLayer(app);

	// 検索窓作成
	app.buildSearchWindow && app.buildSearchWindow();

	////////////////////////////////////////////////////////////
	// 地図基本コントロール設定（使用するコントロールを追加）
	// スケール表示
	initOlScaleLineControl();

	// ズームレベル変更
	initOlZoomSliderControl();

	// overview
	initOlOverView(true);	// collapsed: true　初期非表示

	// マウス座標表示
	initOlMousePositionControl();

	// viewオブジェクト初期設定
	initOlView();

	// mapオブジェクト初期設定
	initOlMap();

	// ハイライト設定
	initHighlightOverlay();

	// 上部

	// 左上
	initGeoLocation();

	// 右上
	init_geocoder();

	// 右下

	// Google Maps 初期設定（layers.js）【無効】
	if ( ENABLE_GOOGLEMAPS ) {
		app.gmap = initGMap(app, "gmap");
	} else {
		app.gmap = false;
	}
	if ( !app.gmap ) {
		app.is_init = true;
		// 確認用サイト：地理院タイル（淡色地図）を初期表示する
		for ( var l in app.layers ) {
			if ( app.layers[l].get("title") == chiriin_tile_pale ) {
				$("#baselayerswitcher input[name=layer][value=" + l + "]").prop("checked", true);
				app.switchBaseLayer();
				break;
			}
		}
	}

	// 地図が出来てから実行する
	func_after_olmap();

	////////////////////////////////////////////////////////////
	// 地図が出来てから実行する
	var func_after = function(app) {
		if ( app.is_init ) {
			console.log("app.js : func_after");

			// 初期表示位置
			setTimeout(function() {
				app.map.getView().fit(ol.proj.transformExtent(app.extent_kujukuri, "EPSG:4612", "EPSG:3857"), app.map.getSize(), {minResolution: 0.149291070869485});
				$(app.olMapDiv).css("opacity",1);
				app.after_resized && app.after_resized();
			}, 1000);
			var geom = new ol.geom.Polygon.fromExtent(app.extent_kujukuri);
			var bl = geom.transform(new ol.proj.Projection({ "code": "EPSG:3857" }), new ol.proj.Projection({ "code": "EPSG:4326" }));
			app.dataCenter = ol.extent.getCenter(bl.getExtent());

			// 情報表示用
			app.infoOverlay = new ol.Overlay({
				element: document.getElementById('display-info'),
				offset: [-5, 0],
				positioning:'center-right',
				stopEvent: false
			});
			app.map.addOverlay(app.infoOverlay);

			// 浸水深ポイント地点のマーク
			app.utfgridMarkerLayer = new ol.layer.Vector({
				title: "utfgridMarkerLayer"
				,source: new ol.source.Vector()
				,projection: "EPSG:3857"
				,visible: false
				,style: function(feature, resolution) {
					return new ol.style.Style({
					  image: new ol.style.Circle({
						radius: 2,
						fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 1.0)'}),
						stroke: new ol.style.Stroke({color: 'rgba(255, 0, 0, 1.0)', width: 1})
					  }),
					});
				}
			});
			app.utfgridMarkerLayer.setZIndex(999999);
			app.map.addLayer(app.utfgridMarkerLayer);
			app.utfgridMarkerLayer.setVisible(false);
			app.utfgridMarkerFeature = new ol.Feature({
				type: 'Point',
				geometry: new ol.geom.Point(0,0)
			});
			app.utfgridMarkerLayer.getSource().addFeature(app.utfgridMarkerFeature);


			// 主題レイヤー
			app.buildOverlayLayers();
			app.buildTree();
			setTimeout(function(){},1000);

			// 「凡例表示」ボタン
			app.buildLegendEvent();

			// アコーディオンボタン
			app.buildAccordionEvent();

			// ハンバーガーボタン
			app.buildHbAccordionEvent();

			// 標高表示機能
			app.initShowElevation();

			// クリックイベント処理
			app.initClickInteraction();

			// 施設一覧
			app.buildFacilityList();

			// 住所検索
			//app.setupOoazaSearch();

			// 印刷ボタン
			app.buildPrintEvent();

			setTimeout(function(){
				$('#loader-bg').delay(900).fadeOut(800); //$('#loader-bg').fadeOut(800);でも可
				$('#loader').delay(600).fadeOut(300); //$('#loader').fadeOut(300);でも可

				app.onReady && app.onReady();
			}, 1000);

		} else {
			setTimeout(function(){
				func_after(app);
			}, 100);
		}
	};
	func_after(app);

	return;
};

app.onMoveEnd = function () {
	var center = ol.proj.transform(app.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
	console.log("center: " + center[0] + "," + center[1]);
}

// UTFGridの情報を表示する(デフォルトの処理)
app.displayUTFGridInfo = function(gridSource,coordinate) {
	if ( !gridSource || !coordinate ) {
		app.infoOverlay.setPosition(undefined);
	}
	var mapElement = app.olMapDiv;
	var viewResolution = /** @type {number} */ (app.map.getView().getResolution());
	gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
		function(data) {
			// If you want to use the template from the TileJSON,
			//  load the mustache.js library separately and call
			//  info.innerHTML = Mustache.render(gridSource.getTemplate(), data);
			mapElement.style.cursor = data ? 'pointer' : '';
			if (data) {
				//console.log(data);
				var html = "";
				for (var key in data) {
					if (data.hasOwnProperty(key)) {
						var val = data[key];
						html += "<dt>"+key+"</dt>";
						html += "<dd>"+val+"</dd>";
					}
				}
				var element = app.infoOverlay.getElement();
				element.innerHTML = html;
				// flagElement.src = 'data:image/png;base64,' + data['flag_png'];
				//   nameElement.innerHTML = data["mesh"];
				//   data["node1"] ? nameElement.innerHTML += "<br />node1=" + data["node1"] : "";
				//   data["node2"] ? nameElement.innerHTML += "<br />node2=" + data["node2"] : "";
			}
			app.infoOverlay.setPosition(data ? coordinate : undefined);
		}
	);
};

// 凡例ダイアログ
app.DIALOG_HANREI_WIDTH = 350;
app.DIALOG_HANREI_POSITION = {my: 'left top', at: 'left top', of: '#olmap'};
var winwidth = window.innerWidth;

// 凡例表示ボタン
app.buildLegendEvent = function() {
	$("#btn_legend").on('click', function() {
				// ダイアログの初期化
				var $hanrei = $('#hanrei_dialog');
				if(winwidth < 830){
					app.DIALOG_HANREI_POSITION = {my: 'left top', at: 'left top', of: '#layer_menu'};
				}
				if (!$('#btn_legend').hasClass('ui-state-active')) {
					if (!$hanrei.dialog("instance")) {
						var DIALOG_HANREI_HEIGHT = $('#olmap').height();
						var dialog_opts = {};
						dialog_opts.autoOpen = false;
						//dialog_opts.height = DIALOG_HANREI_HEIGHT;
						//dialog_opts.height = 'auto';
						dialog_opts.width = app.DIALOG_HANREI_WIDTH;
						//dialog_opts.width = 'auto';
						dialog_opts.maxHeight = DIALOG_HANREI_HEIGHT;
						dialog_opts.maxWidth = app.DIALOG_HANREI_WIDTH;
						dialog_opts.position = app.DIALOG_HANREI_POSITION;
						dialog_opts.resizable = true;
						//dialog_opts.zIndex = DIALOG_HANREI_ZINDEX;	//v1.10～ zindexの指定不可に（map.cssでデフォルト値を上書き）
						// jQuery UI 1.14: dialogClass は廃止（$.uiBackCompat 有効時のみ）のため classes で指定
						dialog_opts.classes = { "ui-dialog": "hanrei_dialog" };
						dialog_opts.buttons = {};
						dialog_opts.open = function(event) {
							$("#btn_legend").addClass("ui-state-active")
						};
						dialog_opts.close = function(event) {
							$("#btn_legend").removeClass("ui-state-active")
						};
						dialog_opts.resizeStart = function(event) {
						};
						dialog_opts.resizeStop = function(event, ui) {
							$('#hanrei_dialog').css('width', '100%');
							$('#hanrei_dialog').css('height', ui.size.height-42);
						};
						$('#hanrei_dialog').dialog(dialog_opts);
						$('#hanrei_dialog').parent().css({position:"absolute"});
					}
					setTimeout(function(){
						$('#hanrei_dialog').dialog("open");
						if ( typeof callback == "function" ) { callback(); }
					},5);
					
					var hanrei_visible = false;
					if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_1 ) {
					} else if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_2 ) {
						// 津波
						$('#tsunami_hanrei').show();

						// always visible
						$("#tsunami_hanrei .hanrei_xxx").css("display","block");
						hanrei_visible = true;
						// 浸水深の凡例表示制御
						var tsunami_visible = false;
						app.tsunami_shinsui_keys.forEach(function(k){
							if ( app.treed_layers[k] && app.treed_layers[k].getVisible() ) {
								tsunami_visible = true;
							}
						});
						$("#tsunami_hanrei .hanrei_1").css("display",(tsunami_visible?"block":"none"));
						hanrei_visible |= tsunami_visible;

					} else if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_3 ) {
						// 洪水
						$('#flood_hanrei').show();

						// always visible
						$("#flood_hanrei .hanrei_1").css("display","block");
						hanrei_visible = true;
						// 浸水深の凡例表示制御
						var shinsui_visible = false;
						app.shinsui_keys.forEach(function(k){
							if ( app.treed_layers[k] && app.treed_layers[k].getVisible() ) {
								shinsui_visible = true;
							}
						});
						app.simulation_keys.forEach(function(k){
							if ( app.treed_layers[k] && app.treed_layers[k].getVisible() ) {
								shinsui_visible = true;
							}
						});
						$("#flood_hanrei .hanrei_2").css("display",(shinsui_visible?"block":"none"));
						hanrei_visible |= shinsui_visible;
						// 浸水継続時間の凡例
						var shinsuikeizoku_visible = false;
						app.shinsuikeizoku_jikan_keys.forEach(function(k){
							if ( app.treed_layers[k] && app.treed_layers[k].getVisible() ) {
								shinsuikeizoku_visible = true;
							}
						});
						$("#flood_hanrei .hanrei_4").css("display",(shinsuikeizoku_visible?"block":"none"));
						hanrei_visible |= shinsuikeizoku_visible;
						// 家屋倒壊
						var kaokutoukai_visible = false;
						app.kaokutoukai_keys.forEach(function(k){
							if ( app.treed_layers[k] && app.treed_layers[k].getVisible() ) {
								kaokutoukai_visible = true;
							}
						});
						$("#flood_hanrei .hanrei_3").css("display",(kaokutoukai_visible?"block":"none"));
						hanrei_visible |= kaokutoukai_visible;
						// 内水
						var naisui_visible = false;
						app.naisui_shinsui_keys.forEach(function(k){
							if ( app.treed_layers[k] && app.treed_layers[k].getVisible() ) {
								naisui_visible = true;
							}
						});
						$("#flood_hanrei .hanrei_5").css("display",(naisui_visible?"block":"none"));
						hanrei_visible |= naisui_visible;
					}
					
				} else {
					if ($hanrei.dialog("instance")) {
						$('#hanrei_dialog').dialog("close");
					}
				}
				return false;
			});
};

// アコーディオンボタン（施設一覧）
app.buildAccordionEvent = function() {
	$('#accordion_wrapper').accordion({
						header: "div.menu_header"
						,active: 0
						,collapsible: true
						,heightStyle: "content"
	});
};
// ハンバーガーボタン
app.buildHbAccordionEvent = function() {
	$("#humberger").on('click', function() {
		var dis = $('.disnone');
        var state = dis.css('display');

        if(state === 'block') {
            dis.css('display', 'none');
        } else {
            dis.css('display', 'block');
        }
	})
};

// 印刷ボタン
app.buildPrintEvent = function() {
	// 印刷用紙サイズ
	app.PRINT_PAPERSIZE = {};
	app.PRINT_PAPERSIZE["full"] = {
		"A4_portrait" : {w:646,h:960},  //A4タテ
		"A4_landscape" : {w:970,h:630}, //A4ヨコ
		"A3_portrait" : {w:970,h:1420},  //A3タテ
		"A3_landscape" : {w:1440,h:960}  //A3ヨコ
	};
	app.PRINT_PAPERSIZE["hanrei"] = {
		"A4_portrait" : {w:646,h:646},  //A4タテ（正方形）
		"A4_landscape" : {w:630,h:630}, //A4ヨコ（正方形）
		"A3_portrait" : {w:970,h:970},  //A3タテ（正方形）
		"A3_landscape" : {w:960,h:960}  //A3ヨコ（正方形）
	};
	$('#btn_print').on('click', function () {
		// console.log('click');
		if ($('#btn_print').hasClass('ui-state-active')) {
			$('#btn_print').removeClass('ui-state-active');
			$('#btn_print').text(printing_screen);
			$('html').removeClass('forprint');
			$('body').removeClass('forprint');
			$('#popup').removeClass('forprint');
			$('#toolbox-righttop').removeClass('forprint');
			$('#toolbox-rightbottom').removeClass('forprint');
			$('.ol-scale-line').removeClass('forprint');
			$('#myattribution').removeClass('forprint');
			$('.ol-zoom').removeClass('forprint');
			$('.ol-zoomslider').removeClass('forprint');
			$('.ol-overviewmap').removeClass('forprint');
			$('#geolocationcontrol').removeClass('forprint');
			$('#mouse-position').removeClass('forprint');
			$('#baselayercontrol').removeClass('forprint');
			$('#searchwindowcontrol').removeClass('forprint');
			$('#searchmenu').removeClass('forprint');
			$('#gmap').removeClass('forprint');

			$('#hanrei_forprint').removeClass('isiconlabel');
			$('#hanrei_layer_1').empty();
			$('#hanrei_layer_2').empty();
			$('#hanrei_image_1').empty();
			$('#hanrei_forprint').hide();

			$('#left_menu').css('display', 'block');		// 左メニュー
			$('#radio_map_type').css('display', 'inline-block');	// 地図切り替えメニュー
			$('#btn_elevation').removeClass('forprint');	// 標高表示
			$('#btn_Inundation').removeClass('forprint');	// 浸水深表示
			
			// ヘッダ調整
			$('#top_menu').removeClass('forprint');	// ヘッダ部
			$('#header').css('width', 'auto');		// ヘッダの幅復元
			$('#header').css('height', 'auto');		// ヘッダの高さ復元
			$('#printMenuTable').css('display', 'none');	// 印刷メニューは非表示	
			$('#copyright').removeClass('forprint');	// コピーライト
			// 地図調整
			$('#view').removeClass('forprint');
			$('#view').css('width', 'calc(100% - 300px)');
			$('#view').css('height', 'calc(100% - 60px)');
			$('#view').css('position', 'absolute');
			$('#view').css('left', '300px');
			$('#view').css('clear', 'none');
			$(window).resize();

		} else {
			$('#btn_print').addClass('ui-state-active');
			$('#btn_print').text(return_map_fromprint);
			$('html').addClass('forprint');
			$('body').addClass('forprint');
			$('#popup').addClass('forprint');
			$('#toolbox-righttop').addClass('forprint');
			$('#toolbox-rightbottom').addClass('forprint');
			$('.ol-scale-line').addClass('forprint');
			$('#myattribution').addClass('forprint');
			$('.ol-zoom').addClass('forprint');
			$('.ol-zoomslider').addClass('forprint');
			$('.ol-overviewmap').addClass('forprint');
			$('#geolocationcontrol').addClass('forprint');
			$('#mouse-position').addClass('forprint');
			$('#baselayercontrol').addClass('forprint');
			$('#searchwindowcontrol').addClass('forprint');
			$('#searchmenu').addClass('forprint');
			$('#gmap').addClass('forprint');
			
			if ($('#hanrei_dialog').dialog("instance")) $('#hanrei_dialog').dialog("close");		// 凡例ダイアログ
			$('#left_menu').css('display', 'none');		// 左メニュー
			$('#radio_map_type').css('display', 'none');	// 地図切り替えメニュー
			$('#btn_elevation').addClass('forprint');	// 標高表示
			$('#btn_Inundation').addClass('forprint');	// 浸水深表示
			// ヘッダ調整
			$('#top_menu').addClass('forprint');	// ヘッダ部
			$('#header').css('width', '650');		// ヘッダの幅調整
			$('#header').css('height', 'auto');		// ヘッダの高さ調整
			$('#printMenuTable').css('display', 'block');	// 印刷メニューを表示
			$('#copyright').addClass('forprint');	// コピーライト
			// 地図調整
			$('#view').addClass('forprint');
			$('#view').css('position', 'relative');
			$('#view').css('left', 'auto');
			$('#view').css('clear', 'both');
			$('#paperSizeSelect').change();

			// 印刷画面用凡例構築
			var hanrei_layer_count = 0;
			var hanrei_icon_label_count = 0;
			var theme_tree = $.ui.fancytree.getTree("#theme_tree");
			var ol_layer_list = [];
			var shinsui_visible = false;
			var shinsuikeizoku_visible = false;
			var kaokutoukai_visible = false;
			var naisui_visible = false;
			var tsunami_visible = false;
			var legend_src = 'data/legend';

			switch ( KUJUKURI_MAP_TYPE ) {
				case KUJUKURI_MAP_TYPE_1 : ol_layer_list = app.OL_LAYER_1; break;
				case KUJUKURI_MAP_TYPE_2 : ol_layer_list = app.OL_LAYER_2; break;
				case KUJUKURI_MAP_TYPE_3 : ol_layer_list = app.OL_LAYER_3; break;
			}
			// 英語マップ時の凡例切替
			if(lang == 'en') {
				legend_src = 'data/legend-en';
				// $('#hanrei_image_1').children().css("width","300px");
				$('#hanrei_layer_1').css("font-size",14);
			}
			for (var l in ol_layer_list) {
				var layer = app.treed_layers[ol_layer_list[l].key];
				if (layer && layer.getVisible()) {
					//console.dir(ol_layer_list[l]);
					// NOTE: 以下はデータに合わせて調整
					if (app.shinsui_keys.includes(ol_layer_list[l].key) || app.simulation_keys.includes(ol_layer_list[l].key)) {
						// 浸水深の凡例
						if (!shinsui_visible) {
							var img2 = `<img class="hanrei_2" src="${legend_src}/flood_shinsui.png" title= ${shinsui_depth_hanrei} alt= ${shinsui_depth_hanrei} style="display: block;"></img>`;
							$('#hanrei_image_1').append(img2);	
							shinsui_visible = true;
						}
					} else if (app.shinsuikeizoku_jikan_keys.includes(ol_layer_list[l].key)) {
						// 浸水継続時間の凡例
						if (!shinsuikeizoku_visible) {
							var img4 = `<img class="hanrei_2" src="${legend_src}/flood_04.png" title= ${shinsui_time_hanrei} alt= ${shinsui_time_hanrei} style="display: block;"></img>`;
							$('#hanrei_image_1').append(img4);	
							shinsuikeizoku_visible = true;
						}
					} else if (app.kaokutoukai_keys.includes(ol_layer_list[l].key)) {
						// 家屋倒壊等氾濫危険区域の凡例
						if (!kaokutoukai_visible) {
							var img3 = `<img class="hanrei_3" src="${legend_src}/flood_kaoku.png" title= ${kaokutoukai_hanrei} alt= ${kaokutoukai_hanrei} style="display: block;"></img>`;
							$('#hanrei_image_1').append(img3);	
							kaokutoukai_visible = true;
						}
					} else if (app.naisui_shinsui_keys.includes(ol_layer_list[l].key)) {
						// 内水の凡例
						if (!naisui_visible) {
							var img5 = `<img class="hanrei_3" src="${legend_src}/flood_05.png" title= ${naisui_hanrei} alt= ${naisui_hanrei} style="display: block;"></img>`;
							$('#hanrei_image_1').append(img5);
							naisui_visible = true;
						}
					} else if (app.tsunami_shinsui_keys.includes(ol_layer_list[l].key)) {
						// 津波浸水深の凡例
						if (!tsunami_visible) {
							var img1 = `<img class="hanrei_1" src="${legend_src}/tsunami_01.png" title= ${tsunami_hanrei} alt= ${tsunami_hanrei} style="display: block;"></img>`;
							$('#hanrei_image_1').append(img1);
							tsunami_visible = true;
						}

					} else {
						var node = theme_tree.getNodeByKey(ol_layer_list[l].key);
						if (node) {
							// console.log(node.title);
							// console.log(node.icon);
							var div = '<div><img src="' +node.icon+ '" class="fancytree-icon" alt=""><span class="fancytree-title">'+node.title+'</span></div>';
							if (hanrei_layer_count < 10) {
								$('#hanrei_layer_1').append(div);
							} else {
								$('#hanrei_layer_2').append(div);
							}
							hanrei_icon_label_count++;
							hanrei_layer_count++;
						}
					}
				}
			}
			var common_tree = $.ui.fancytree.getTree("#common_tree");
			for (var l in app.OL_LAYER_0) {
				var layer = app.treed_layers[app.OL_LAYER_0[l].key];
				if (layer && layer.getVisible()) {
					//console.dir(app.OL_LAYER_0[l]);
					var node = common_tree.getNodeByKey(app.OL_LAYER_0[l].key);
					if (node) {
						// console.log(node.title);
						// console.log(node.icon);
						var div = '<div><img src="' +node.icon+ '" class="fancytree-icon" alt=""><span class="fancytree-title">'+node.title+'</span></div>';
						if (hanrei_layer_count < 10 || lang == 'en') {
							$('#hanrei_layer_1').append(div);
						} else {
							$('#hanrei_layer_2').append(div);
						}
						hanrei_icon_label_count++;
						hanrei_layer_count++;
					}
				}
			}
			if (hanrei_icon_label_count > 0) {
				$('#hanrei_forprint').addClass('isiconlabel');
			}
			if ($('#hanrei_onoff').prop('checked')) {
				$('#hanrei_forprint').show();
			}
		}
	});
	// 印刷用紙サイズ Select
	$('#paperSizeSelect').on('change', function(){
		var paperSizeArr = $('#paperSizeSelect').val().split( ',' );
		var paperSizeVal = paperSizeArr[0];
		var hanreiOnOff = $('#hanrei_onoff').prop('checked');
		// console.log(paperSizeVal);
		var paperSize = printSize2MapSize(paperSizeVal, hanreiOnOff);

		$('#view').css( { width:paperSize.w + 'px', height: paperSize.h + 'px' } );

		// タテ・ヨコでStyle変更
		if (paperSizeVal.indexOf("landscape") > 0) {
			//ヨコ
			$('#view').addClass('landscape');
			$('#hanrei_forprint').addClass('landscape');
		} else {
			// タテ
			$('#view').removeClass('landscape');
			$('#hanrei_forprint').removeClass('landscape');
		}

		$(window).resize();
	});
	// 印刷用紙サイズの取得
	var printSize2MapSize = function (size, hanreiOnOff) {
		var printType = "";
		if (hanreiOnOff) {
			printType = "hanrei";
		} else {
			printType = "full";
		}
		return app.PRINT_PAPERSIZE[printType][size];
	};
	// 印刷ボタン
	$('#printMap').on('click', function () {
		window.print();
	});
	// 印刷用凡例表示
	$("#hanrei_onoff").on('change', function(){
		var checked = $("#hanrei_onoff").prop('checked');
		if (checked) {
			$('#hanrei_forprint').show();
		} else {
			$('#hanrei_forprint').hide();
		}
		$('#paperSizeSelect').change();
	});
	// 印刷画面設定（背景）
	app.printSetting = function (selector){
		var img = $('<img>').attr({'class':'color-block', 'src': 'images/white1.png'});
		var doms = document.querySelectorAll(selector);
		$.each(doms, function(idx, elem){
			var pos = window.getComputedStyle(elem).getPropertyValue("position");
			if(pos === "static") elem.style.position = "relative";
			$(elem).append(img);
		});
	}
	app.printSetting('#popup');
	app.printSetting('.ol-scale-line');
	app.printSetting('.ol-attribution');

}


app.buildSearchWindow = function() {

	/**
	 * @constructor
	 * @extends {ol.control.Control}
	 * @param {Object=} opt_options Control options.
	 */
	class _SearchWindowControl extends ol.control.Control {
		/**
		 * @param {Object} [opt_options] Control options.
   		 */
		constructor(opt_options) {
			var options = opt_options || {};

			var span1 = document.createElement('span');
			span1.innerHTML = '<img class="ctlSearchWindow btn_on" src="' + 'images/btn_search.png">';
			span1.className = 'ctl_name';
			span1.id = 'ctlSearchWindow';
			$(span1).prop("state","on");

			var button = document.createElement('button');
			//button.className = 'ol-has-tooltip';
			button.type = 'button';

			// var this_ = this;
			var handleSearchWindowControl = function(e) {
				e.preventDefault();
				switch (e.type) {
				case 'click' :
				case 'touchstart' :
					if ($("#ctlSearchWindow").prop("state") == 'off') {
						$("#ctlSearchWindow").prop("state","on");
						$("#ctlSearchWindow > img").attr("src","images/btn_search.png").addClass("btn_on").removeClass("btn_off");

						$("#searchmenu").show();

						// 背景地図ボタン
						$("#ctlBaseLayerSwitcher").prop("state","off");
						$("#ctlBaseLayerSwitcher > img").attr("src","images/baselayers.png").addClass("btn_off").removeClass("btn_on");
						if ($('#layerbox_1').length) $('#layerbox_1').css('display','none');
						if ($('#layerbox_2').length) $('#layerbox_2').css('display','none');
						if ($('#baselayerswitcher').length) $('#baselayerswitcher').css('display','none');
						if ($('#overlayerswitcher').length) $('#overlayerswitcher').css('display','none');

					} else {
						$("#ctlSearchWindow").prop("state","off");
						$("#ctlSearchWindow > img").attr("src","images/btn_search.png").addClass("btn_off").removeClass("btn_on");

						$("#searchmenu").hide();

					}
					$(this).blur();
					break;
				case 'mouseover' :
					break;
				}
			};
			button.appendChild(span1);

			button.addEventListener('click', handleSearchWindowControl, false);
			button.addEventListener('touchstart', handleSearchWindowControl, false);
			button.addEventListener('mouseover', handleSearchWindowControl, false);

			var element = document.createElement('div');
			element.id = "searchwindowcontrol";
			element.className = 'mytoolbox-button search-window-control ol-control ol-unselectable ol-collapsed';
			element.appendChild(button);
			element.title = search_ja_en;

			super({
				element: element
				,target: "toolbox-righttop"
			});
		}
	};
	// ol.inherits(app._SearchWindowControl, ol.control.Control);
	app.SearchWindowControl = new _SearchWindowControl();

	app.olBaseControls.push(app.SearchWindowControl);
};

