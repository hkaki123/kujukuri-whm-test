/**
 * Define a namespace for the application.
 */
window.app = window.app || {}
var jumpto_x, jumpto_y;

ol.proj.proj4.register(proj4);  // Openlayers5対応

console.log("hash:"+window.location.hash);
if ( window.location.hash.length > 1 ) {
	var tmp = window.location.hash.substring(1);
	var ar_tmp = tmp.split(",");
	if ( ar_tmp.length >= 2 ) {
		// 初期位置をパラメータで受け取る
		jumpto_x = ar_tmp[0];
		jumpto_y = ar_tmp[1];
	}
}


//***** OpenLayers関連 *****
var defaultResolution = 40075016.68557849 / 256; // 156543.03392804097
var _whitelayerName = "空レイヤー";     // 地図非表示時に使用
var NOT_OPENPOPUP = false;	// ふきだしを非表示とする（defaultは表示する）
app.controls = [];

// 共通処理
function log2(x){
	return Math.log(x) / Math.LN2;
}

/**
 * 経緯度をWebメルカトルに変換
 * @param {*} lon 
 * @param {*} lat 
 * @returns 
 */
function lonlat2xy(lon, lat) {
	return ol.proj.transform([lon, lat], "EPSG:4326", "EPSG:3857");
}

/**
 * Ajaxを使用してJSONを取得する
 */
function ajaxGetJSON(method, url, data) {
    var jqXHR = $.ajax({
        type: method || 'GET',
        url: url,
        dataType: "json",
        data: data,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('X-CSRF-Token', app.CSRFToken);
        }
    });
    return jqXHR;
}


// URLパラメータ取得
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

// Openlayers 初期値設定
function setOlDefaultVal(options) {
//console.log("setOlDefaultVal_start");
	console.log(options);
	// 地図初期設定
	app.mapExtent = _mapExtent;
	app.maxZoom = (options.maxZoom ? options.maxZoom : _maxZoom);
	app.minZoom = (options.minZoom ? options.minZoom : _minZoom);
	app.defaultZoom = (options.defaultZoom ? options.defaultZoom : defaultZoom);
	// options.lat, options.lon
	if (options.lat && options.lon) {
		app.defaultCenter = [options.lon, options.lat];
	} else {
		app.defaultCenter = _defaultCenter;
	}

	app.olBaseControls = [];
	app.is_init = false;
	app.mousemode = false;

	app.defaultStyle = {
		'Point': [new ol.style.Style({
			image: new ol.style.Circle({
				fill: new ol.style.Fill({
					color: 'rgba(255,0,255,0.5)'
				}),
				radius: 5,
				stroke: new ol.style.Stroke({
					color: '#f0f',
					width: 1
				})
			})
		})],
		'LineString': [new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#f00',
				width: 3
			})
		})],
		'Polygon': [new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(0,255,255,0.5)'
			}),
			stroke: new ol.style.Stroke({
				color: '#0ff',
				width: 1
			})
		})],
		'MultiPoint': [new ol.style.Style({
			image: new ol.style.Circle({
				fill: new ol.style.Fill({
					color: 'rgba(255,0,255,0.5)'
				}),
				radius: 5,
				stroke: new ol.style.Stroke({
					color: '#f0f',
					width: 1
				})
			})
		})],
		'MultiLineString': [new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: '#0f0',
				width: 3
			})
		})],
		'MultiPolygon': [new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(0,0,255,0.5)'
			}),
			stroke: new ol.style.Stroke({
				color: '#00f',
				width: 1
			})
		})]
	};
	
	app.styleFunction = function(feature, resolution) {
		var featureStyleFunction = feature.getStyleFunction();
		console.dir(feature);
		if (featureStyleFunction) {
			return featureStyleFunction.call(feature, resolution);
		} else {
			return defaultStyle[feature.getGeometry().getType()];
		}
	};


	// ポップアップ関連（属性参照なしの場合も、編集で使用）
	app.not_openpopup = NOT_OPENPOPUP;

}


////////////////////////////////////////////////////////////
// 地図基本コントロール設定
// overview
function initOlOverView(collapsed) {
	if (typeof collapsed == "undefined") collapsed = false;	// default: false（表示）

	app.overview_layer = new ol.layer.Tile({
		title: chiriin_tile_standard,
		crossOrigin: '*',
		opacity : 1.0,
		source: new ol.source.XYZ({
			urls : [
				"https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
			]
			,projection: "EPSG:3857"
			,crossOrigin: '*'
		})
	});
	app.overViewMapControl = new ol.control.OverviewMap({
		// see in overviewmap-custom.html to see the custom CSS used
		className: 'ol-overviewmap ol-custom-overviewmap',
		title: "Overview",
		layers: [ app.overview_layer ],
		collapseLabel: '\u00BB',
		label: '\u00AB',
		collapsed: collapsed,
	});
	app.overViewMapControl.resetExtent_x = function() {
		var ovmap = this.ovmap_;
		var ovmapSize = ovmap.getSize();
		var ovview = ovmap.getView();
		ovview.fit(app.mapExtent, ovmapSize, {nearest:true});
	};
	app.setOverViewNewExtent = function (overviewDiv,map) {
		var offset = overviewDiv.helper.position();
		var divSize = [overviewDiv.helper.width(), overviewDiv.helper.height()];
		var mapSize = map.getSize();
		var c = map.getView().getResolution();
		var xMove = offset.left * (Math.abs(mapSize[0] / divSize[0]));
		var yMove = offset.top * (Math.abs(mapSize[1] / divSize[1]));
		var bottomLeft = [0 + xMove, mapSize[1] + yMove];
		var topRight = [mapSize[0] + xMove, 0 + yMove];
		var left = map.getCoordinateFromPixel(bottomLeft);
		var top = map.getCoordinateFromPixel(topRight);
		var extent = [left[0], left[1], top[0], top[1]];
		map.getView().fit(extent, map.getSize());
		map.getView().setResolution(c);
	};
	app.olBaseControls.push(app.overViewMapControl);
}

// スケール表示
function initOlScaleLineControl() {
	// 単位設定
	var units_distance = "metric";	// default
	if (app.units) {
		if (app.units.distance != "m") {
			units_distance = "us";
		}
	}
	app.scaleLineControl = new ol.control.ScaleLine({
		target : "toolbox-rightbottom"
		,units : units_distance
	});
	app.olBaseControls.push(app.scaleLineControl);
}

// ズームレベル変更
function initOlZoomSliderControl() {
	app.zoomSliderControl = new ol.control.ZoomSlider();
	app.olBaseControls.push(app.zoomSliderControl);
}

// マウス座標表示
function initOlMousePositionControl() {
	app.mousePositionControl = new ol.control.MousePosition({
		xy_coordinateFormat: ol.coordinate.createStringXY(5),
		coordinateFormat: function(coordinate) {
			return ol.coordinate.toStringHDMS(coordinate, 2);
		},
		projection: 'EPSG:4326',
		// comment the following two lines to have the mouse position be placed within the map.
		className: 'custom-mouse-position',
		target: document.getElementById('mouse-position-span'),
		undefinedHTML: '&nbsp;'
	});
	app.mousePositionControl.updateHTML_ = function(pixel) {
		if (pixel && this.mapProjection_) {
			ol.control.MousePosition.prototype.updateHTML_.apply(this, arguments);
		}
	}
	app.olBaseControls.push(app.mousePositionControl);
}

// 全域表示
function initOlZoomToExtentControl() {
	app.zoomToExtentControl = new ol.control.ZoomToExtent({
		tipLabel: "全域表示"
		,label : "E"
		,extent: ol.proj.transformExtent([139.61666666666667, 35.71666666666667, 139.73333333333332, 35.8], "EPSG:4326", "EPSG:3857")	// 
	});
	app.olBaseControls.push(app.zoomToExtentControl);
}

// 地図回転
function initOlRotateControl() {
	app.rotateControl = new ol.control.Rotate({
		//autoHide: false
	});
	app.olBaseControls.push(app.rotateControl);
}

// 印刷コントロール
function initOlPrintControl() {
	// OpenLayers 6以降 ol.inherits は廃止のため class 構文に変更
	app.PrintControl = class extends ol.control.Control {
		constructor(opt_options) {
			var options = opt_options || {};
			var button = document.createElement('button');
			button.innerHTML = '<img src="' + 'images/w_print.png">';

			var handler = function() {
				window.print();
			};
			button.addEventListener('click', handler, false);
			button.addEventListener('touchstart', handler, false);
			var element = document.createElement('div');
			element.id = "printcontrol";
			element.className = 'mytoolbox-button ol-unselectable ol-control';
			element.title = print_ja_en;
			element.appendChild(button);

			super({
				element: element,
				target: "toolbox-righttop"
			});
			this.fullscreen = false;
		}
	};
	app.map.addControl(new app.PrintControl);
}

// 現在地取得・表示
function initGeoLocation() {
	console.log("init_geolocation");
	app.is_trakking = false;	// トラッキング中か

	app.geolocation = new ol.Geolocation({
		trackingOptions: {
			enableHighAccuracy: true,
		},
		projection: app.view.getProjection()
	});
	// listen to changes in position
	app.geolocation.on('change', function(evt) {
		console.log(app.geolocation.getPosition());
		$('#loader-bg').delay(900).fadeOut(800); //$('#loader-bg').fadeOut(800);でも可
		$('#loader').delay(600).fadeOut(300); //$('#loader').fadeOut(300);でも可
		var coordinates = app.geolocation.getPosition();
		app.positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
		// 現在地ボタン押下直後のみ、画面を移動する
		if (!app.is_trakking) {
			app.view.setCenter(coordinates);
			app.is_trakking = true;	
		}
	});
	// listen to error
	app.geolocation.on('error', function(evt) {
		console.log(evt.message);
		$('#loader-bg').delay(900).fadeOut(800); //$('#loader-bg').fadeOut(800);でも可
		$('#loader').delay(600).fadeOut(300); //$('#loader').fadeOut(300);でも可
		app.geolocation.setTracking(false);
		app.is_trakking = false;
		var msg_err = "";
		switch (app.languageMode) {
			case "EN":	// 英語版
				msg_err = 'Could not retrieve current location.\nCheck the location information settings.';
				break;
			default:	// 日本語版
				msg_err = '現在地を取得できませんでした。\n位置情報の設定を確認してください。';
		}
		alert(msg_err);
	});

	// 現在地レイヤの追加
	// 現在地点（精度） Feature
	app.accuracyFeature = new ol.Feature();
	app.geolocation.on('change:accuracyGeometry', function () {
	  app.accuracyFeature.setGeometry(app.geolocation.getAccuracyGeometry());
	});
	// 現在地点	Feature
	app.positionFeature = new ol.Feature();
	app.positionFeature.setStyle(
	  new ol.style.Style({
		image: new ol.style.Circle({
		  radius: 6,
		  fill: new ol.style.Fill({
			color: '#3399CC',
		  }),
		  stroke: new ol.style.Stroke({
			color: '#fff',
			width: 2,
		  }),
		}),
	  })
	);
	new ol.layer.Vector({
		map: app.map,
		source: new ol.source.Vector({
			features: [app.accuracyFeature, app.positionFeature],
		}),
	});

	class GeoLocationControl extends ol.control.Control {
		/**
		 * @param {Object} [opt_options] Control options.
   		 */
		constructor(opt_options) {
			var options = opt_options || {};
			var button = document.createElement('button');
			button.id = "btn_geolocation";
			button.innerHTML = '<img src="' + 'images/location.png">';

			var handler = function() {
				// トラッキング開始
				app.geolocation.setTracking(true);
				// トラッキング開始済みの場合は現在地点へ画面移動
				if (app.is_trakking) {
					app.view.setCenter(app.geolocation.getPosition());
				} else {
					// 未開始
					var msg = "";
					switch (app.languageMode) {
						case "EN":	// 英語版
							msg = "Retrieving current location…";
							break;
						default:	// 日本語版
							msg = "現在地取得中…";
					}
					console.log(msg);
					$('#loader-bg ,#loader').height($(window).height()).css('display','block');
				}
			};
			button.addEventListener('click', handler, false);
			button.addEventListener('touchstart', handler, false);
			var element = document.createElement('div');
			element.id = "geolocationcontrol";
			element.className = 'ol-unselectable ol-control';
			element.title = current_loc_ja_en;
			element.appendChild(button);

			super({
				element: element
			});
		}
	}
	// ol.inherits(app.GeoLocationControl, ol.control.Control);
	app.map.addControl(new GeoLocationControl);

}

////////////////////////////////////////////////////////////
// viewオブジェクト初期設定

function initOlView() {
	app.view = new ol.View({
		projection: "EPSG:3857"
		,center: ol.proj.transform(app.defaultCenter, "EPSG:4612", "EPSG:3857")
		,extent: ol.proj.transformExtent(app.mapExtent, "EPSG:4612", "EPSG:3857")	// minx,miny,maxx,maxy
		,maxResolution: defaultResolution / ( 1 << (app.minZoom) )
		,minResolution: defaultResolution / ( 1 << (app.maxZoom) )
		,resolution: defaultResolution / ( 1 << (app.defaultZoom) )
		,constrainResolution: true
	});

	var func_change_resolution = function(evt){
		if ( typeof Math.log2 == "function" ) {
			app.zoomlevel = Math.log2(defaultResolution/app.view.getResolution());
		} else {
			app.zoomlevel = log2(defaultResolution/app.view.getResolution());
		}
	};
	app.view.on('change:resolution', func_change_resolution);
	var func_change_center = function(evt){
	};
	app.view.on('change:center', func_change_center);

}


////////////////////////////////////////////////////////////
// mapオブジェクト初期設定
function initOlMap() {
    if (typeof app.OLMap == "undefined") {
        console.log("use ol.Map");
        app.OLMap = ol.Map;
    } else {
    }
	app.olMapDiv = document.getElementById('olmap');
	app.map = new app.OLMap({
		target: app.olMapDiv
		,layers: app.layers
		,view: app.view
		,logo: false
		,controls: ol.control.defaults.defaults({
			rotate:false
			,zoom:true
			,attribution:true
			,attributionOptions: /** @type {olx.control.AttributionOptions} */ {
				collapsible: false
				,target: document.getElementById("myattribution")
			}
		}).extend(app.olBaseControls)
		,interactions: ol.interaction.defaults.defaults({
			altShiftDragRotate:false
			,pinchRotate:false})
	});

	//【moveendイベント】
	if ( app.onMoveEnd ) app.map.on('moveend', app.onMoveEnd);

}

// ハイライト設定
function initHighlightOverlay() {
	var highlightStyle = new ol.style.Style({
		image: new ol.style.Circle({
			fill: new ol.style.Fill({
				color: 'rgba(255,0,255,0.5)'
			}),
			radius: 6,
			stroke: new ol.style.Stroke({
				color: '#f0f',
				width: 1
			})
		})
		,stroke: new ol.style.Stroke({
			color: 'rgba(255,0,0,0.6)',
			width: 2
		})
		,fill : new ol.style.Fill({
			color: 'rgba(255,64,64,0.2)',
		})
	});
	app.highlightOverlay = new ol.layer.Vector({
		title: "highlightOverlay"
		,source: new ol.source.Vector()
		,visible: true
		,style: [highlightStyle]
	});
	app.highlightOverlay.setZIndex(99999);
	app.map.addLayer(app.highlightOverlay);
}


// ポップアップ属性表示（click）設定
function initPopupOverlay() {
	app.map.addOverlay(app.popup);
	app.map.on('click', function(evt) {
		app.highlightOverlay.getSource().clear();
		if ( (app.mousemode || $("#draw-form").attr("mode")) && $("#modify-dialog.ui-dialog-content").length) {
			// 図形編集中か否か
			if ($("#modify-dialog").dialog( "isOpen" )) {
				app.restoreModify('map').then(
					function(){	// done
					}
					,function(){	// fail
						return;
					}
				);
			} else {
				app.closer.onclick();
			}
			return;
		}
		// ふきだし表示を制御
		if (app.not_openpopup) return;

		var pickedFeature = app.map.forEachFeatureAtPixel(
			evt.pixel,
			function(pickedFeature, pickedLayer) {
				//属性表示用に、レイヤID、NAMEの追加
				var layerId = pickedLayer.get('id');
				var layerName = pickedLayer.get('title');
				pickedFeature.setProperties({
					'layerid': layerId
					,'layername': layerName
				},false);
				return pickedFeature;
			}
		);
		if (pickedFeature) { console.dir(pickedFeature); }

		// 属性表示処理
		if (pickedFeature && pickedFeature.get('layername') != 'highlightOverlay' && 
			(pickedFeature.get('subtype') || pickedFeature.popup_html)) {
			app.openPopup(pickedFeature);
		} else {
			app.closer.onclick();
		}
	});
}


// 属性表示処理（編集時も実行）
app.openPopup = function (selectedFeature) {
	var clonesFeature = selectedFeature.clone();
	clonesFeature.setStyle(null);
	if ( app.mousemode || $("#draw-form").attr("mode") ) {
	} else {
		app.highlightOverlay.getSource().addFeature(clonesFeature);
		app.highlightOverlay.getSource().changed();
	}
	setTimeout( function() {
		var geometry = selectedFeature.getGeometry();
		var geomtype = geometry.getType();
		switch (geomtype) {
		case 'Point':
			var coord = geometry.getCoordinates();
			break;
		case 'LineString':
			var coord = geometry.getCoordinateAt(0.5);
			break;
		case 'Polygon':
			var coord = geometry.getInteriorPoint().getCoordinates();
			break;
		default :
			var coord = geometry.getFirstCoordinate();
		}
		app.popup.setPosition(coord);
		$('#popup').show();

		var container = document.getElementById('popup-content');
		var layerName = "";
		if (selectedFeature.get('layername')) {
			layerName = selectedFeature.get('layername');
		} else {
			layerName = app.drawLayer.get('title');
		}
		var subtype = selectedFeature.get('subtype');

		var content = "";
		if (selectedFeature.get('note') || selectedFeature.get('note') === "") {
			content = selectedFeature.get('note');
		} else if (selectedFeature.popup_html) {
			content = selectedFeature.popup_html;
		}

		if ($("#draw-form").attr( "mode" )) {
			$(container).siblings("button").show();
			if (subtype == 'Text') {
				$("button.ol-feature-text").show();
			} else {
				$("button.ol-feature-text").hide();
			}
		} else {
			$(container).siblings("button").hide();
		}
		$("#popup-title").text(layerName);

		// ふきだし表示を制御
		if (app.not_openpopup) {
			$("button.ol-popup-edit").hide();
		} else {
			container.innerHTML = content;
		}
		app.clickedFeature = selectedFeature;	// 編集用に保存

	}, 200);
};

// 機能切替処理
app.exitCurrentMode = function (mode) {
	var d_exitCurrentMode = new $.Deferred();

	// mode デフォルト値
	if ( typeof mode == "undefined" ) mode = "default";

	var ret = false;
	var msg = "";

	switch (mode) {
	// search-counting
	case "search-counting" :
		msg = "集計結果のリスト・ハイライト表示は解除されますが、よろしいですか？";
		var scf = app.searchCountingOverlay.getSource().getFeatures();
		if (scf.length==0) {
			d_exitCurrentMode.resolve();
		} else {
			app.newConfirm(msg).then(
				function(){	// done
					app.searchCountingOverlay.getSource().clear();
					d_exitCurrentMode.resolve();
				}
				,function(){	// fail
					d_exitCurrentMode.reject();
				}
			);
		}
		break;
	// draw, measure-length, measure-area
	default :
		msg = "未登録のデータはクリアされますが、よろしいですか？";
		var currentTempLayer = app.getCurrentTempLayerFromDialogMode ();
		var f = currentTempLayer.getSource().getFeatures();
		if ( f.length==0 ) {
			d_exitCurrentMode.resolve();
		} else {
			app.newConfirm(msg).then(
				function(){	// done
					app.removeAllFeature(currentTempLayer);
					d_exitCurrentMode.resolve();
				}
				,function(){	// fail
					d_exitCurrentMode.reject();
				}
			);
		}
		break;
	}
	return d_exitCurrentMode.promise();
};

// 排他コントロール制御
// 使用中のコントロールをinActiveに切り替える
// 切替前に作図中のデータがないかチェックする
// draw, measure-length, measure-area, precheck,
app.setInActiveControl = function (mode) {
	console.log("setInActiveControl:start");
	var d_setInActiveControl = $.Deferred();

	for (i=0; i<app.controls.length; i++) {
		var ctl = app.controls[i];
		if (!ctl.get('active')) {
			if (i == app.controls.length-1) d_setInActiveControl.resolve();
			continue;
		}

		switch (mode) {
		case "draw" :
		case "measure-length" :
		case "measure-area" :
			// 機能を切り替える場合は、未保存のデータがないかチェック
			app.exitCurrentMode().then(
				function() {	// done
					// 図形編集中の場合の処理
					if ($("#modify-dialog").dialog( "isOpen" )) {
						// 次の app.newConfirm が正常に起動しないため、待機する
						setTimeout(function() {
							app.restoreModify('dialog').then(
								function() {	// done
									$('#modify-dialog').dialog("close");	// ダイアログは閉じる

									$("#draw-edit").removeClass("edit_type-selected");

									ctl.set('active', false);
									$("#" + ctl.element.id + " button").click();
									app.mousemode = false;

									d_setInActiveControl.resolve();
								}
								, function() {	// fail
									d_setInActiveControl.reject();
								}
							);
						}, 1);
					} else {
						app.closer.onclick();

						$("#draw-edit").removeClass("edit_type-selected");

						ctl.set('active', false);
						$("#" + ctl.element.id + " button").click();
						app.mousemode = false;

						d_setInActiveControl.resolve();
					}
				}
				, function() {	// fail
					if (ctl.get('active')) {
						var currentTempLayer = app.getCurrentTempLayerFromDialogMode ();
						if (currentTempLayer) currentTempLayer.setVisible(true);
					}
					d_setInActiveControl.reject();
				}
			);
			break;

		case "search-counting" :
		case "precheck" :
			// 機能を切り替える場合は、選択・ハイライト中のデータがないかチェック
			app.exitCurrentMode(mode).then(
				function() {	// done
					ctl.set('active', false);
					$("#" + ctl.element.id + " button").click();
					app.mousemode = false;

					d_setInActiveControl.resolve();
				}
				, function() {	// fail
					d_setInActiveControl.reject();
				}
			);
			break;

		default :
			ctl.set('active', false);
			$("#" + ctl.element.id + " button").click();
			app.mousemode = false;

			d_setInActiveControl.resolve();
			break;
		}
		console.log("setInActiveControl:end");
		break;
	}
	return d_setInActiveControl.promise();
};

// コントロール初期化処理
// draw, measure-length, measure-area, precheck,
app.removeInteractions = function (mode) {
	switch (mode) {
	case "draw" :
	case "measure-length" :
	case "measure-area" :
		// ダイアログを閉じる
		$("#draw-form").removeClass( "dialog_open" );
		$("#draw-form").hide();
		if (mode == "measure-length" || mode == "measure-area") {
			$("#draw-box>hr").show();
			$(".edit_type-row").show();
			$("#style-table").show();
		}

		// removeInteraction
		app.map.removeInteraction(app.draw);
		app.map.removeInteraction(app.singleClick);
		app.map.removeInteraction(app.modify);
		app.map.removeInteraction(app.move);
		//app.map.removeInteraction(app.selectPointerMove);
		if (mode == "measure-length" || mode == "measure-area") {
			app.map.removeInteraction(app.drawMeasure);

			if (app.measureTooltipElement) {
				app.measureTooltipElement.parentNode.removeChild(app.measureTooltipElement);
				app.measureTooltipElement = null;
			}
			if (app.helpTooltipElement) {
				app.helpTooltipElement.parentNode.removeChild(app.helpTooltipElement);
				app.helpTooltipElement = null;
			}
			app.map.un('pointermove', app.pointerMoveHandler);
		}
		break;

	case "search-counting" :
		// ダイアログを閉じる
		$("#search-result div").empty();
		$("#search-result ul").empty();
		$("#tab1").addClass('active');
		$("#cont1").addClass('active');
		$("#tab2").removeClass('active');
		$("#cont2").removeClass('active');
		$("#search-form").removeClass( "dialog_open" );
		$("#search-form").hide();

		// removeInteraction
		app.map.removeInteraction(app.selectClick);
		app.map.removeInteraction(app.draw);
		break;

	default :
		break;
	}

};


app.after_resized = function() {
	console.log('olmap.js:after_resized');
	if ( app && app.map ) app.map.updateSize();
	if ( app && app.gmap ) google.maps.event.trigger(app.gmap, "resize");
}


////////////////////////////////////////////////////////////
// 地図が出来てから実行する
var func_after_olmap = function() {
	if ( app.is_init ) {
		console.log("olmap: func_after");
		// オーバービューマップの枠線ol-overviewmap ol-custom-overviewmap ol-unselectable ol-control
		$(".ol-overviewmap-box").draggable({drag: function (event, ui) {  }});
		$(".ol-overviewmap-box").on("dragstop", function (event, ui) {
			app.setOverViewNewExtent(ui,app.map);
			/* After drag the box left and top are off */
			$(".ol-overviewmap-box").css("left", "auto");
			$(".ol-overviewmap-box").css("top", "auto");
		});
		
		var win_resize_timer = false;
		// view に width, height を設定する（印刷時にずれが生じるため）
		$(window).resize(function() {
			if (win_resize_timer !== false) {
				clearTimeout(win_resize_timer);
			}
			win_resize_timer = setTimeout(function() {
				console.log('olmap.js:resized');

				app.after_resized && app.after_resized();

			}, 200);
		});

		$(function(){
			$(window).resize();
		});

		setTimeout(function(){
			if ( typeof jumpto_y != "undefined" ) {
				console.log('%s,%s', jumpto_x, jumpto_y);
				app.map.getView().setCenter(ol.proj.transform([jumpto_x, jumpto_y], "EPSG:4612", "EPSG:3857"));
			}
		}, 1000);


	} else {
		setTimeout(function(){
			func_after_olmap();
		}, 100);
	}
};
