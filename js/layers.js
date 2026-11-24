

function initLayer(app) {
	console.log("initLayer:start");

	// レイヤ定義（ベースマップ）
	app.layers = [];
	// レイヤ定義（オーバーレイ）
	app.overlays = {};

	if ( true ) {
		// タイルレイヤーを作成し、管理配列へ入れる
		app.layers = [];
		var _layers = app.layer_list;
		for ( var m in _layers ) {
			if ( _layers[m].tilelayer ) {
				app.layers.push( _layers[m].tilelayer );
			} else if ( typeof _layers[m].url != "undefined" ) {
				var source = new ol.source.XYZ({
							url: _layers[m].url + _layers[m].serviceVersion + "/" + _layers[m].layername + "/{z}/{x}/{-y}." + _layers[m].type
							,projection: _layers[m].projection
						});
				app.layers.push(
					new ol.layer.Tile({
						title: _layers[m].title
						,id: _layers[m].id
						,overlay: _layers[m].overlay
						,visible: false
						,source: source
						,attribution: false
					})
				);
				source.on('tileloadstart', function() {
					//console.log("imageloadstart");
				});
				source.on('tileloadend', function() {
					//console.log("imageloadend");
				});
				source.on('tileloaderror', function(evt) {
					console.log("imageloaderror");
				});

			}
		}
	}

	// タイルレイヤーのチェックボックスを作成
	for ( var l in app.layers ) {
		if ( app.layers[l].get("overlay") ) {
			// Overlay layer
			addLayerToControl(app.layers[l],app.layers[l].get("title"));
		} else {
			// Base layer
			// 空レイヤはコントロールに表示しない
			if (app.layers[l].get('title') == _whitelayerName) continue;

			var chked = app.layers[l].getVisible() ? "checked" : "" ;
			$("ul#baselayerswitcher").prepend(
				$('<li><label><input type="radio" name="layer" value="'+l+'" '+chked+' />'+app.layers[l].get("title")+'</label></li>')
			);
			app.layers[l].on("change:visible",function(){
				if ( app.gmap ) {
					if ( this.getVisible() ) {
						if ( this.get("type") == "gmap" ) {
							app.gmap.setMapTypeId(this.get("MapTypeId"));
						} else if ( this.get("type") == "basemap" ) {
							app.gmap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
						} else {
							app.gmap.setMapTypeId("");
						}
					} else {
					}
				}
				if ( (this.get('title') == _whitelayerName) && (typeof _meshLayer != "undefined" && _meshLayer != null)) {
					app.meshUpdateOpacity();
				}
				if ( this.getVisible() ) {
					// 背景地図のズーム範囲に制限する
					var maxRes = this.get("maxResolution");
					app.map.getView().set("maxResolution",maxRes ? maxRes : defaultResolution / ( 1 << (app.minZoom) ) );
					var minRes = this.get("minResolution");

					app.map.getView().set("minResolution",minRes ? minRes : defaultResolution / ( 1 << (app.maxZoom) ) );
					if ( typeof this.get("attribution") != "undefined" && !this.get("attribution") ) {
						$("#myattribution").hide();
					} else {
						$("#myattribution").show();
					}
				}
			});
		}
	}

	// オーバーレイ　すべてOn/Offボタン
	app.updateAllOnOff = function (layerboxid) {
		var is_all_on = true;
		var checks;
		if ($("#" + layerboxid).find("input[is_direction=true]").length > 0) {
			checks = $("#" + layerboxid).find("input[type=checkbox]:visible");
		} else {
			checks = $("#" + layerboxid).find("input[type=checkbox]");
		}
		checks.each(function(v) {
			is_all_on = is_all_on && this.checked;
		});
		$("#" + layerboxid + ">button.allonoff").prop("state",is_all_on).html(is_all_on ? "すべてOFF" : "すべてON");
	}
	//updateAllOnOff();
	app.updateAllOnOff("layerbox_2");
	app.updateAllOnOff("layerbox_3");
	app.updateAllOnOff("layerbox_4");

	$(".allonoff").click(function(evt) {
		var layerboxid = $(this).parent("div").attr("id");
		var visible = !$(this).prop("state");
		$(this).next("ul").find("input[type=checkbox]:visible").each(function(v) {
			var layer;
			layer = app.layers[$(this).attr("lid")] || app.overlays[$(this).attr("layerid")];
			layer.setVisible(visible);
			this.checked = visible;
		});
		app.updateAllOnOff(layerboxid);
	});

	// レイヤ表示切替（独自）
	app.switchBaseLayer = function () {
		var checkedBaseLayer = $('#baselayerswitcher input[name=layer]:checked').val();
		if ( app.layers ) {
			for (var l in app.layers) {
				if ( ! app.layers[l].get("overlay") ) {
					app.layers[l].setVisible(false);
					if (l==checkedBaseLayer) {
						app.layers[l].setVisible(true);
						if (app.layers[l].getProperties().title != _whitelayerName) {
			                // 地図が選択された時には強制的に地図表示をオンにする（空レイヤを除く）
							_cur_baselayer = app.layers[l].get('title');
			                $("#ol_map_action input[name=basemap_visible]").prop('checked', true);
						} else {
			                $("#ol_map_action input[name=basemap_visible]").prop('checked', false);
						}
					}
					app.layers[l].changed();
				}
			}
		}
		if ( _cur_baselayer == chiriin_tile_color_elevation ) {
			layerVisible(chiriin_tile_standard,true);
		}
		if ( _cur_baselayer == chiriin_tile_standard || _cur_baselayer == chiriin_tile_pale || _cur_baselayer == chiriin_tile_color_elevation ) {
			layerVisible(_whitelayerName,true);
		} else {
			layerVisible(_whitelayerName,false);
		}
	}
	$("#baselayerswitcher input[name=layer]").bind("change",function() { app.switchBaseLayer() } );

	function addLayerToControl(layer,title,ctlIdx) {
		title = title || layer.get("title");
		var layerId = layer.get("id");
		ctlIdx = ctlIdx || "";

		$("ul#overlayerswitcher" + ctlIdx).prepend(
			$('<li><label><input type="checkbox" name="layer" id="chk_overlay_'+layerId+'" title="'+title+'" layerid="'+layerId+ '"/>'+title+'</label></li>')
		);
		$('#chk_overlay_' + layerId).bind('change', function() {
			var layer = app.overlays[layerId];
			var checked = this.checked;
			if (checked !== layer.getVisible()) {
				layer.setVisible(checked);
			}
			var layerboxid = $(this).parent().parent().parent().parent().attr('id');
			app.updateAllOnOff(layerboxid);
		});
		$('#chk_overlay_' + layerId).prop('checked', layer.getVisible());

		if ( typeof app.overlays[layerId] == "undefined" ) {
			app.overlays[layerId] = layer;
		}
	}
	app.addLayerToControl = addLayerToControl;

	// レイヤコントロールON/OFF（カスタムコントロール）
	/**
	 * @constructor
	 * @extends {ol.control.Control}
	 * @param {Object=} opt_options Control options.
	 */
	class _baseLayerControl extends ol.control.Control {
		/**
		 * @param {Object} [opt_options] Control options.
   		 */
		constructor(opt_options) {
			var options = opt_options || {};

			var span1 = document.createElement('span');
			span1.innerHTML = '<img class="layerswitcher btn_off" src="' + 'images/baselayers.png">';
			span1.className = 'ctl_name';
			span1.id = 'ctlBaseLayerSwitcher';
			$(span1).prop("state","off");

			var button = document.createElement('button');
			//button.className = 'ol-has-tooltip';
			button.type = 'button';

			// var this_ = this;
			var handleLayerControl = function(e) {
				// prevent #layer-control anchor from getting appended to the url
				e.preventDefault();
				switch (e.type) {
				case 'click' :
				case 'touchstart' :
					if ($("#ctlBaseLayerSwitcher").prop("state") == 'off') {
						if ($('#layerbox_1').length) $('#layerbox_1').css('display','block');
						//if ($('#layerbox_2').length) $('#layerbox_2').css('display','block');
						if ($('#baselayerswitcher').length) $('#baselayerswitcher').css('display','block');
						if ($('#overlayerswitcher').length) $('#overlayerswitcher').css('display','block');

						$("#ctlBaseLayerSwitcher").prop("state","on");
						$("#ctlBaseLayerSwitcher > img").attr("src","images/baselayers.png").addClass("btn_on").removeClass("btn_off");

						// if ($('#layerbox_1').length) $('#layerbox_1').css("top",$("#baselayercontrol").position().top+$("#baselayercontrol").height()+5+"px");
						// if ($('#layerbox_2').length) $('#layerbox_2').css("top",$("#baselayercontrol").position().top+$("#baselayercontrol").height()+5+"px");

						if (!$('#layerbox_1 li').length) $('#layerbox_1').css('display','none');
						if (!$('#layerbox_2 li').length) $('#layerbox_2').css('display','none');

						$("#ctlSearchWindow").prop("state","off");
						$("#ctlSearchWindow > img").attr("src","images/btn_search.png").addClass("btn_off").removeClass("btn_on");
						$("#searchmenu").hide();
					} else {
						if ($('#layerbox_1').length) $('#layerbox_1').css('display','none');
						if ($('#layerbox_2').length) $('#layerbox_2').css('display','none');
						if ($('#baselayerswitcher').length) $('#baselayerswitcher').css('display','none');
						if ($('#overlayerswitcher').length) $('#overlayerswitcher').css('display','none');

						$("#ctlBaseLayerSwitcher").prop("state","off");
						$("#ctlBaseLayerSwitcher > img").attr("src","images/baselayers.png").addClass("btn_off").removeClass("btn_on");

						// $("#searchmenu").show();
					}
					$(this).blur();
					break;
				case 'mouseover' :
					break;
				}
			};
			button.appendChild(span1);

			button.addEventListener('click', handleLayerControl, false);
			button.addEventListener('touchstart', handleLayerControl, false);
			button.addEventListener('mouseover', handleLayerControl, false);

			var element = document.createElement('div');
			element.id = "baselayercontrol";
			element.className = 'mytoolbox-button layer-control ol-control ol-unselectable ol-collapsed';
			element.appendChild(button);
			element.title = chizuhyouzi_kirikae;

			super({
				element: element
				,target: "toolbox-righttop"
			});
		}
	};
	// ol.inherits(app._baseLayerControl, ol.control.Control);
	app.baseLayerControl = new _baseLayerControl();

	app.olBaseControls.push(app.baseLayerControl);

	console.log("initLayer:end");
};



/**
 * 指定したtitleのレイヤーの表示状態を変更する
 * @param {*} title レイヤー作成時に指定したtitle。layer.get("title")で取得できる値
 * @param {*} visibility true/false/null　nullのとき、トグルする
 */
function layerVisible(title, visibility) {
	if ( !(title) ) return;

	var layer = null;
	for ( var l in app.layers ) {
		if ( app.layers[l].get("title") == title ) {
			layer = app.layers[l];
			break;
		}
	}
	if ( ! layer ) return;

	if ( visibility === null ) {
		visibility = !layer.getVisible();
	}
	layer.setVisible(visibility);

}

// 主題データ追加(tile)
app.addTileOverlay = function (key,title,url,options) {
	if ( !options ) options = {};
	var layerid = key;	// レイヤ制御用
	var source = new ol.source.XYZ({
		url: url
		, projection: "EPSG:3857"
		,crossOrigin: 'Anonymous'
		// ,tileGrid: ol.tilegrid.createXYZ({ maxZoom: (17-1) }) // これより小さいTileにならない
	});
	source.on('tileloadstart', function () {
		//console.log("imageloadstart");
	});
	source.on('tileloadend', function () {
		//console.log("imageloadend");
	});
	source.on('tileloaderror', function () {
		//console.log("imageloaderror");
	});
	var layer = new ol.layer.Tile({
		id: layerid,
		title: title,
		overlay: true,
		visible: false,
		source: source,
		attribution: false,
		type: (options.type ? options.type : null),
		crossOrigin: 'Anonymous',
		opacity: 1.0,
		zIndex: (options.zIndex ? options.zIndex : 1),
		minResolution: defaultResolution / (1 << (options.maxzoom ? options.maxzoom : 18)),
		maxResolution: defaultResolution / (1 << (options.minzoom ? options.minzoom : (5-1))),
		extent: false
	});
	return layer;
};

// 主題データ追加(geojson)
app.addGeoJsonOverlay = function (key,title,url,options) {
	if ( !options ) options = {};

	var layer = null;

	//// for load
	if ( typeof app.cache_style == "undefined" ) app.cache_style = {};
	// レイヤーのロード
	var styleFunction = function (feature, resolution) {
		if ( !app.zoomlevel ) return false;
		var geometry = feature.getGeometry();
		var geomtype = geometry.getType();

		var style = app.defaultStyle[geomtype];
		if ( !app.zoomlevel ) return style;
		//var opacity = 0.5;	// default

		// ポリゴン（塗り）は拡大するまで表示しない
		var fill_disable = false;
		if ( resolution > defaultResolution / (1 << (15) ) ) {
			if ( key == "" ) { // 例外：避難場所
			} else if ( key == "key_0_2_0_0_0" ) { // 例外：市域界
			// } else if ( key == "kujukuri_tyoumoku" ) { // 例外：上尾市　※非使用
			} else { // これら以外
				if ( geomtype == "Polygon" || geomtype == "MultiPolygon" ) {
					fill_disable = true;
				}
			}
		}
		// 拡大時は表示しない
		if ( resolution < defaultResolution / (1 << (15) ) ) {
			if ( key == "" ) { // 洪水時避難方向
				return false;
			}
		}

		var cache_key = key+"_"+app.zoomlevel.toFixed(3)+"_"+feature.getId();
		// var cache_key = key+"_"+feature.getId();

		var strokeColor = "#f0f0f0";
		var fillColor = "#FF0000";
		var opacity = 0.7;
		var strokeWidth = 2;

		if ( typeof options.conditions != "undefined" ) {
			// 条件あり
			var func = null;
			// 条件が関数
			if ( typeof options.conditions == "function" ) {
				func = options.conditions;
			}
			if ( typeof options.condition_func == "function" ) {
				func = options.condition_func;
			}
			if ( typeof func == "function" ) {
				if ( func(feature, resolution, options) ) {
					// 関数の戻り値がtrue
					// 表示する
					if ( !(options && options.arrow) && app.cache_style[cache_key] ) return app.cache_style[cache_key];
				} else {
					// 関数の戻り値がfalse
					// 表示しない
					return false;
				}
			}
		} else {

			if ( !(options && options.arrow) && app.cache_style[cache_key] ) return app.cache_style[cache_key];
			if ( options && options.arrow ) {
				if ( resolution > defaultResolution / (1 << (15) ) ) {
					if ( app.cache_style[cache_key] ) return app.cache_style[cache_key];
				}
			}

		}

		var angle = 45; // [deg]
		var size = 100; // [m]
		var radius = size / resolution / Math.cos((app.dataCenter[1] ? app.dataCenter[1] : 36) * Math.PI / 180) / Math.sqrt(2);
		radius = Math.max(radius, 10); // 最小サイズ=10

		// style設定
		if ( geomtype == "Point" || geomtype == "MultiPoint" ) {
			if ( options && options.icon ) {
				style = new ol.style.Style({
					image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ {
						anchor: feature.anchor ? feature.anchor : [0.5, 1],
						anchorXUnits: 'fraction',
						anchorYUnits: 'fraction',
						scale: options.scale ? options.scale : 1.0,
						opacity: 1,
						src: options.icon
					})
				});
			} else {
				style = new ol.style.Style({
					image: new ol.style.RegularShape({
						points: 4,
						angle: Math.PI / 4 + (angle * Math.PI / 180), // 45度傾ける。radiusは頂点までの長さなので辺まではSQRT(2)で割る
						radius: radius,
						stroke: new ol.style.Stroke({
							color: hex2rgb(strokeColor),
							width: strokeWidth
						}),
						fill: new ol.style.Fill({
							color: hex2rgb(fillColor,opacity)
						}),
					})
				});
			}
		} else if ( geomtype == "LineString" || geomtype == "MultiLineString" ) {
			if ( options ) {
				if ( options.stroke != "FALSE" ) {
					style = new ol.style.Style({
						stroke: new ol.style.Stroke({
							color: options.stroke,
							width: 3
						})
					});
				}
				if (options.arrow) {
					if ( resolution < defaultResolution / (1 << (15) ) ) {
						var styles = [style];
						if (geometry.forEachSegment) {
							geometry.forEachSegment(function(start, end) {
								var dx = end[0] - start[0];
								var dy = end[1] - start[1];
								var rotation = Math.atan2(dy, dx);
								// arrows
								styles.push(new ol.style.Style({
									geometry: new ol.geom.Point(end),
									image: new ol.style.Icon({
										src: options.arrow,
										anchor: [0.75, 0.5],
										rotateWithView: true,
										rotation: -rotation
									})
								}));
								return true;
							});
						} else {
							var arr = geometry.getLineStrings();
							for (var index = 0; index < arr.length; index++) {
								// console.log(index);
								var line = arr[index];
								line.forEachSegment(function(start, end) {
									// console.log(start);
									var dx = end[0] - start[0];
									var dy = end[1] - start[1];
									var rotation = Math.atan2(dy, dx);
									// arrows
									styles.push(new ol.style.Style({
										geometry: new ol.geom.Point(end),
										image: new ol.style.Icon({
											src: options.arrow,
											anchor: [0.75, 0.5],
											rotateWithView: true,
											rotation: -rotation
										})
									}));
									return true;
								});
							}
						}
						style = styles;
					}
				}
				if (options.middle_mark) {
					if ( resolution < defaultResolution / (1 << (1) ) ) {
						var styles = [style];
						// middle_mark
						var point = [];
    					if (geometry.getType() == 'LineString') {
							var coords = geometry.getCoordinates();
							var linestring1 = turf.toWgs84(turf.lineString(coords));
							var pt = turf.along(linestring1,turf.length(linestring1,{units: 'kilometers'})*0.5,{units: 'kilometers'});
							styles.push(new ol.style.Style({
								geometry: new ol.geom.Point(turf.getCoord(turf.toMercator(pt))),
								image: new ol.style.Icon({
									src: options.middle_mark,
									scale: options.scale ? options.scale : 1.0,
									anchor: [0.5, 0.5],
									rotateWithView: true,
									rotation: 0
								})
							}));
						} else if (geometry.getType() == 'MultiLineString') {	
							var arr = geometry.getLineStrings();
							for (var index = 0; index < arr.length; index++) {
								// console.log(index);
								var line = arr[index];
								var coords = line.getCoordinates();
								var linestring1 = turf.toWgs84(turf.lineString(coords));
								var pt = turf.along(linestring1,turf.length(linestring1,{units: 'kilometers'})*0.5,{units: 'kilometers'});
								styles.push(new ol.style.Style({
									geometry: new ol.geom.Point(turf.getCoord(turf.toMercator(pt))),
									image: new ol.style.Icon({
										src: options.middle_mark,
										scale: options.scale ? options.scale : 1.0,
										anchor: [0.5, 0.5],
										rotateWithView: true,
										rotation: 0
									})
								}));
							}
						}
						style = styles;
					}
				}
				if (options.center_mark) {
					if ( resolution < defaultResolution / (1 << (1) ) ) {
						var styles = [style];
						// middle_mark
						var point = [];
    					if (geometry.getType() == 'LineString') {
							var coords = geometry.getCoordinates();
							var linestring1 = turf.toWgs84(turf.lineString(coords));
							var pt = turf.centroid(linestring1);
							styles.push(new ol.style.Style({
								geometry: new ol.geom.Point(turf.getCoord(turf.toMercator(pt))),
								image: new ol.style.Icon({
									src: options.center_mark,
									scale: options.scale ? options.scale : 1.0,
									anchor: [0.5, 0.5],
									rotateWithView: true,
									rotation: 0
								})
							}));
						} else if (geometry.getType() == 'MultiLineString') {	
							var arr = geometry.getLineStrings();
							for (var index = 0; index < arr.length; index++) {
								// console.log(index);
								var line = arr[index];
								var coords = line.getCoordinates();
								var linestring1 = turf.toWgs84(turf.lineString(coords));
								var pt = turf.centroid(linestring1);
								styles.push(new ol.style.Style({
									geometry: new ol.geom.Point(turf.getCoord(turf.toMercator(pt))),
									image: new ol.style.Icon({
										src: options.center_mark,
										scale: options.scale ? options.scale : 1.0,
										anchor: [0.5, 0.5],
										rotateWithView: true,
										rotation: 0
									})
								}));
							}
						}
						style = styles;
					}
				}
			} else {
			}
		} else if ( geomtype == "Polygon" || geomtype == "MultiPolygon" ) {
			if ( options ) {
				var stroke = null;
				var fill = null;
				if ( options.stroke != "FALSE" ) {
					stroke = new ol.style.Stroke({
						color: options.stroke,
						width: options.width
					});
				}
				if ( options.fill && options.fill != "FALSE" ) {
					fill = new ol.style.Fill({
						color: options.fill
					});
				}
				if ( options.fill_pattern ) {
					fill = options.fill_pattern;
				}
				style = new ol.style.Style({
					stroke : stroke,
					fill : (fill_disable ? undefined : fill),
				});
			} else {
			}
		}
		//console.log("styleing:"+title);

		app.cache_style[cache_key] = style;
		return style;
	};
	// GeoJSONデータ追加関数
	var getGeoJson = function (layerName, jsonObjs, srcSrid) {
		var geoJsonOverlay = new ol.layer.Vector({
			title: layerName
			, source: new ol.source.Vector({ features: [] })
			, style: styleFunction
			, visible: (typeof options.visible != "undefined" ? options.visible : false)
			, zIndex: (options.zIndex ? options.zIndex: 20)
			, minResolution: defaultResolution / (1 << (options.maxzoom ? options.maxzoom : 30))
			, maxResolution: defaultResolution / (1 << (options.minzoom ? options.minzoom : (10-1)))
		});
		var features = new ol.format.GeoJSON().readFeatures(
			jsonObjs
			, {
				// dataProjection: "EPSG:4326",
				dataProjection: (srcSrid || "EPSG:2451"),	// JGD2000 平面直角座標系 9系
				featureProjection: "EPSG:3857"
			}
		);
		var fidx=0;
		for (var f in features) {
			if (features.hasOwnProperty(f)) {
				var feat = features[f];
				feat.setId(fidx)
				feat.layer_key = key;
				feat.zIndex = (options.zIndex ? options.zIndex: 20);

				var num_same_point = app.add_map_coordinates(feat);
				if ( num_same_point > 1 ) {
					// console.log( obj.key + " " + num_same_point );
				}
				feat.anchor = app.anchors[num_same_point];

			}
			fidx++;
		}
		geoJsonOverlay.getSource().addFeatures(features);

		return geoJsonOverlay;
	};
	var loadData = function (url, name, layerid, srcSrid) {
		var d_getLayer = $.Deferred();
		$.ajax({
			url: url
			, crossDomain: true
			, dataType: "json"
			, type: "GET"
			, cache: false
			, success: function (data) {
				//console.dir(data);
				layer = getGeoJson(name, data, srcSrid);
				layer.set('id', layerid, true);
				// レイヤON/OFF
				// $("ul#overlayerswitcher").prepend(
				// 	$('<li><label><input type="checkbox" name="layer" id="chk_overlay_' + layerid + '" title="' + name + '" layerid="' + layerid + '" checked />' + name + '</label></li>')
				// );
				// $("#chk_overlay_" + layerid + "").click(function () {
				// 	if ($(this).prop("checked")) {
				// 		layer.setVisible(true);
				// 		var extent = layer.getSource().getExtent();
				// 		//extent && app.map.getView().fit(extent, app.map.getSize(), { minResolution: 0.149291070869485 });
				// 	} else {
				// 		layer.setVisible(false);
				// 	}
				// 	// レイヤ更新
				// 	layer.getSource().refresh();
				// });
				app.map.addLayer(layer);
				// layer.setVisible(true);
				d_getLayer.resolve(layer);
				// レイヤーの範囲にフィット
				// var extent = layer.getSource().getExtent();
				// extent && app.map.getView().fit(extent, app.map.getSize(), { minResolution: 0.149291070869485 });
				// レイヤーから中心座標を得る
				// var geom = new ol.geom.Polygon.fromExtent(extent);
				// var bl = geom.transform(new ol.proj.Projection({ "code": "EPSG:3857" }), new ol.proj.Projection({ "code": "EPSG:4326" }));
				// app.dataCenter = ol.extent.getCenter(bl.getExtent());

			}
			, error: function (jqXHR, textStatus) {
				d_getLayer.reject(jqXHR);
			}
		});
		return d_getLayer.promise();
	};
	
	return loadData(url, title, key, options.srcSrid);
	// end for load

};

/////////////////////////////////////////////////////////////////////////////////////
/**
 * UTFGridレイヤーを作成し、マップに追加する。
 * @param {*} title 名称
 * @param {*} urls XYZテンプレートのURL配列
 * @param {*} extent 地図の範囲
 * @param {*} map_layer_title 関連付ける表示用レイヤーの名称。情報を表示するためには何らかの表示レイヤーに関連付けること
 */
function initUTFGridLayer(id,title,urls,extent,map_layer_title,options) {
	if ( !options ) options = {};
	var gridSource = new ol.source.UTFGrid({
		tileJSON: {
			grids: urls
			// ,maxzoom: 15
			// ,minzoom: 10
		}
		,crossOrigin: '*'
	});
	var utf_layer = new ol.layer.Tile({
		title: title,
		source: gridSource,
		minResolution: defaultResolution / (1 << (options.maxzoom ? options.maxzoom : 18)),
		maxResolution: defaultResolution / (1 << (options.minzoom ? options.minzoom : (5-1))),
		visible : (options && options.visible ? true : false),
	});
	if ( id ) utf_layer.set("id",id);

	// データの範囲を限定する。（不要なリクエストをさせないため）
	if ( extent ) utf_layer.setExtent(extent);

	// 表示用レイヤーを関連付ける。（非表示レイヤーの情報は表示させないため）
	utf_layer.map_layer = null;
	if ( map_layer_title ) {
		for ( var l in app.layers ) {
			if ( app.layers[l].get("title") == map_layer_title ) {
				utf_layer.map_layer = app.layers[l];
				break;
			}
		}
	}
	// デフォルトの属性表示処理
	utf_layer.displayUTFGridInfo = app.displayUTFGridInfo;

	// マウスムーブイベントで情報表示。情報を表示するためには何らかの表示レイヤーに関連付けること
	app.map.on('pointermove', function(evt) {
		if ( utf_layer.map_layer && !utf_layer.map_layer.getVisible() ) {
			return;
		}
		if (evt.dragging) {
			return;
		}
		var pixel = app.map.getEventPixel(evt.originalEvent);
		var coordinate = app.map.getEventCoordinate(evt.originalEvent);
		utf_layer.displayUTFGridInfo && utf_layer.displayUTFGridInfo(gridSource,coordinate,pixel);
	});
	// 外に出たら消すための処理
	$(app.olMapDiv).on('mouseout', function(evt) {
		utf_layer.displayUTFGridInfo && utf_layer.displayUTFGridInfo(null,[0,0]);
	});
	// クリックイベントでも表示
	$(app.olMapDiv).on('mousedown', function(evt) {
		if ( utf_layer.map_layer && !utf_layer.map_layer.getVisible() ) {
			return;
		}
        if (evt.dragging) {
            return;
        }
		var pixel = app.map.getEventPixel(evt.originalEvent);
        var coordinate = app.map.getEventCoordinate(evt.originalEvent);
		utf_layer.displayUTFGridInfo && utf_layer.displayUTFGridInfo(gridSource,coordinate,pixel);
    });

	app.map.addLayer(utf_layer);

	return utf_layer;
}




////////////////////////////////////////////////////////////
// Google Mapsレイヤーの初期設定
function initGMap(app, div_gmap) {
	console.log("initGMap: start");

	var gmap = new google.maps.Map(document.getElementById(div_gmap), {
		disableDefaultUI: true,
		keyboardShortcuts: false,
		draggable: false,
		disableDoubleClickZoom: true,
		scrollwheel: false,
		streetViewControl: false
	});

	// Google Mapsの初期表示設定
	gmap.setTilt(0);
	gmap.setCenter(new google.maps.LatLng(app.defaultCenter[1], app.defaultCenter[0]));
	gmap.setZoom(app.defaultZoom);

	var ol_view = app.map.getView();

	var EVENT_WAIT = 10;

	var change_center_timer = false;
	ol_view.on('change:center', function() {
		if (change_center_timer !== false) {
			clearTimeout(change_center_timer);
		}
		//console.log('change:center');
		change_center_timer = setTimeout(function() {
			var center = ol.proj.transform(ol_view.getCenter(), 'EPSG:3857', 'EPSG:4326');
			gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
		}, EVENT_WAIT);
	});

	var change_res_timer = false;
	ol_view.on('change:resolution', function() {
		if (change_res_timer !== false) {
			clearTimeout(change_res_timer);
		}
		change_res_timer = setTimeout(function() {
			if ( typeof Math.log2 == "function" ) {
				app.zoomlevel = Math.log2(defaultResolution/app.map.getView().getResolution());
			} else {
				app.zoomlevel = log2(defaultResolution/app.map.getView().getResolution());
			}
			// console.log("z=%d, olz=%d res=%f",app.zoomlevel ,ol_view.getZoom() ,ol_view.getResolution());
			gmap.setZoom(app.zoomlevel);
		}, EVENT_WAIT);
	});

	var resize_timer = false;
	app.map.on('change:size', function() {
		if (resize_timer !== false) {
			clearTimeout(resize_timer);
		}
		resize_timer = setTimeout(function() {
			var center = ol.proj.transform(ol_view.getCenter(), 'EPSG:3857', 'EPSG:4326');
			gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
		}, EVENT_WAIT);
	});
	gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(app.olMapDiv);

	google.maps.event.addListenerOnce(gmap, 'idle', function(){
		// do something only the first time the map is loaded
		console.log("inited gmap");

		setTimeout(function(){
			$($("#baselayerswitcher input[name=layer][value=4]")[0]).prop("checked",true);
			app.switchBaseLayer();
			app.is_init = true;
			if (lang == "ja") {
				setTimeout(function(){
					$($("#baselayerswitcher input[name=layer][value=1]")[0]).prop("checked",true);
					app.switchBaseLayer();
					app.is_init = true;
				}, 500);
			}

		}, 100);
	});

	// Googleマップの最大ズームより拡大した時にGoogleマップを隠す
	ol_view.on("change:resolution",function(){
		for ( var l in app.layers ) {
			if ( app.layers[l].get("type") == "gmap" ) {
				if ( app.layers[l].getVisible() ) {
					if ( app.zoomlevel <= 20 ) {
						app.gmap.setMapTypeId(app.layers[l].get("MapTypeId"));
					} else {
						app.gmap.setMapTypeId("");
					}
				}
			}
		}
	});

	return gmap;
}
