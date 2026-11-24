

app.onReady = function() {

	app.getInundationFlg = true;
	$('#btn_Inundation').addClass('ui-state-active');
}

app.map_coordinates = [];
app.reset_map_coordinates = function() {
	app.map_coordinates = [];
}
app.add_map_coordinates = function(feature) {
	var gtype = feature.getGeometry().getType();
	if ( gtype != "Point" ) {
		return 0;
	}
	var coord = feature.getGeometry().getCoordinates();
	var key_coord = ""+parseInt(coord[0])+"_"+parseInt(coord[1]);
	//console.log(key_coord);
	if ( typeof app.map_coordinates[key_coord] == "undefined" ) {
		// new
		app.map_coordinates[key_coord] = 1;
	} else {
		// same cooord
		app.map_coordinates[key_coord] += 1;
	}
	return app.map_coordinates[key_coord];
}
var __p = 0.75;
app.anchors = {
	0 : [1.0*__p, 1.0*__p],
	1 : [1.0*__p, 1.0*__p],
	2 : [1.0*__p, 0.0*__p],
	3 : [0.0*__p, 1.0*__p],
	4 : [0.0*__p, 0.0*__p],
	5 : [-1.0*__p, 1.0*__p],
	6 : [-1.0*__p, 0.0*__p],
};

app.buildOverlayLayers = function() {

	// app.map.on("precompose",function(evt) {
	// 	console.log("precompose");
	// 	app.reset_map_coordinates();
	// });

	app.clickableLayers = [];

	app.treed_layers = {};
	var addTreedLayers = function(layer) {
		app.clickableLayers.push(layer);
		app.treed_layers[layer.get("id")] = layer;
		// console.log("==== loaded : "+layer.get("title"));
	};

	var func_load_layer = function (object) {
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				var obj = object[key];
				(function(obj) {
					if ( typeof obj.conditions != "undefined" ) {
						// 条件あり
						if ( typeof obj.conditions == "function" ) {
							// 条件が関数
						} else {
							// 関数を作成
							var cond = obj.conditions;
							var cond_key = cond.replace(" is visible","");
							var cond_arr = cond.split("="); // ex. 種別=市役所
							if ( app.treed_layers[cond_key] ) {
								obj.condition_func = function(feature,resolution,options) {
									var cond = options.conditions;
									var cond_key = cond.replace(" is visible","");
									// console.log(cond_key);
									return app.treed_layers[cond_key].getVisible();
								};
							} else if (cond_arr.length == 2) {
								// ex. 種別=市役所
								var cond_key = cond_arr[0];
								var cond_val = cond_arr[1];
								var cond_arr_val = cond_val.split(","); // ex. 支所,出張所
								obj.condition_func = function(feature,resolution) {
									var b_visible = false;
									for (let i = 0; i < cond_arr_val.length; i++) {
										var val = cond_arr_val[i];
										if ( feature.getProperties().hasOwnProperty(cond_key) && feature.getProperties()[cond_key] === val ) {
											b_visible = true;
										}
									}
									if ( b_visible ) {
										// // 同一座標の確認
										// var num_same_point = app.add_map_coordinates(feature);
										// if ( num_same_point > 1 ) {
										// 	// console.log( obj.key + " " + num_same_point );
										// }
										// obj.anchor = app.anchors[num_same_point];
									}
									return b_visible;
								};
							} else {
								obj.condition_func = function(feature,resolution) {
									var b_visible = true;
									// 避難所の表示フィルター
									if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_1 ) {
										if ( feature.getProperties().hasOwnProperty(cond) && feature.getProperties()[cond] === "○" ) {
											b_visible = true;
										} else {
											return false;
										}
									} else if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_2 ) {
										var no = feature.getProperties()["番号"];
										var hinanjo_type = feature.getProperties()["種別"];
										var shisetsu_name = feature.getProperties()["施設名"];

										if ( obj.key.indexOf("key_0_1_1_1_0") == 0 ) {
											// if ( hinanjo_type == "指定緊急避難場所兼指定避難所" ) {
											// 	b_visible = true;
											// } else {
											// 	return false;
											// }

											// var cond_1 = ( feature.getProperties().hasOwnProperty("洪水") && feature.getProperties()["洪水"].indexOf("○") >= 0 );
											// var cond_2 = ( feature.getProperties().hasOwnProperty("洪水") && feature.getProperties()["洪水"].indexOf("●") >= 0 );
											// var cond_3 = ( feature.getProperties().hasOwnProperty("指定避難所") && feature.getProperties()["指定避難所"].indexOf("○") >= 0 );
											// var cond_4 = ( feature.getProperties().hasOwnProperty("指定避難所") && feature.getProperties()["指定避難所"].indexOf("×") >= 0 );
											// var cond_5 = ( feature.getProperties().hasOwnProperty("指定避難所") && feature.getProperties()["指定避難所"].indexOf("―") >= 0 );
											// if ( (cond_1 || cond_2) && (cond_3 && !cond_4 && !cond_5) ) {
											// 	b_visible = true;
											// }
										} else if ( obj.key.indexOf("key_0_1_1_2_0") == 0 ) {
											// if ( hinanjo_type == "指定緊急避難場所" ) {
											// 	b_visible = true;
											// } else {
											// 	return false;
											// }
										} else if ( obj.key.indexOf("key_0_1_1_3_0") == 0 ) {
											// if ( hinanjo_type == "水害時使用不可の指定緊急避難場所兼指定避難所" ) {
											// 	b_visible = true;
											// } else {
											// 	return false;
											// }
										} else if ( obj.key.indexOf("key_0_1_1_4_0") == 0 ) {
											// if ( hinanjo_type == "水害時使用不可の指定緊急避難場所" ) {
											// 	b_visible = true;
											// } else {
											// 	return false;
											// }
										} else {
											return false;
										}
									} else if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_3 ) {
										if ( feature.getProperties().hasOwnProperty(cond) && feature.getProperties()[cond] === "○" ) {
											b_visible = true;
										} else {
											return false;
										}
										// keyにより条件を限定する場合
										//if ( obj.key == "key_0_0_0_0_0" || obj.key == "key_0_0_0_0_0" ) {
										//}
									}
									if ( b_visible ) {
										// // 同一座標の確認
										// var num_same_point = app.add_map_coordinates(feature);
										// if ( num_same_point > 1 ) {
										// 	// console.log( obj.key + " " + num_same_point );
										// }
										// obj.anchor = app.anchors[num_same_point];
									}
									return b_visible;
								};
							}
						}
					} else {
						obj.conditions = true;
						obj.condition_func = function(feature,resolution) {
							var b_visible = true;
							if ( b_visible ) {
								// // 同一座標の確認
								// var num_same_point = app.add_map_coordinates(feature);
								// if ( num_same_point > 1 ) {
								// 	// console.log( obj.key + " " + num_same_point + " " + feature.get("施設名称"));
								// }
								// obj.anchor = app.anchors[num_same_point];
							}
							return b_visible;
						};
					}


					if ( obj.geomtype == "tile" ) {
						var layer = app.addTileOverlay(obj.key,obj.title,app.TILE_ROOT+obj.template,obj);
						//if ( obj.url == "arakawa_shinsui" ) {
						//	layer = app.addTileOverlay(obj.key,obj.title,"https://suiboumap.gsi.go.jp/shinsuimap/Tile/21280/L2/8303040001/BP014/BP014_MAX/overlayer/{z}/{x}/{y}.png",obj);
						//}
							if ( layer ) {
								layer.group = obj.group;
								typeof obj.visible != "undefined" && layer.setVisible(obj.visible);
								typeof obj.zIndex != "undefined"  && layer.setZIndex(obj.zIndex);
								layer.setOpacity( (typeof obj.opacity != "undefined" ? obj.opacity : 0.7) );
								addTreedLayers(layer);
								app.map.addLayer(layer);
								layer.on("change:visible",function(){
									app.refreshLayers(KUJUKURI_MAP_TYPE);
								});
							}
					}
					else if ( obj.geomtype == "point" ) {
						var imgPreloader=new Image();
						//onloadイベントハンドラ追加
						imgPreloader.onload=function() {
							//ロード完了でレイヤー作成
							var d = app.addGeoJsonOverlay(obj.key,obj.title,app.GEOJSON_ROOT+obj.url,obj);
							d.then(function(layer) {
								layer.group = obj.group;
								// console.log("==== loaded : "+obj.title+" - "+obj.geomtype+" - "+obj.visible);
								typeof obj.visible != "undefined" && layer.setVisible(obj.visible);
								typeof obj.zIndex != "undefined"  && layer.setZIndex(obj.zIndex);
								addTreedLayers(layer);

								imgPreloader = null;
							});
						}
						//重要、最後に書く
						imgPreloader.src=obj.icon;
					}
					else if ( obj.geomtype == "polygon" || obj.geomtype == "line"  ) {
						// NOTE: 領域中央にアイコン発生
						// if ( obj.key == "key_0_1_4_0_0" ) {
						// 	obj.center_mark = "data/icon/gakekuzure.png";
						// 	obj.scale = 0.3;
						// }

						// NOTE: 避難経路に矢印
						//if ( obj.key == "key_0_0_0_0_0" ) obj.arrow = "data/arrow.png";

						// NOTE: 浸水（内水）水害実績箇所
						// if ( app.kaokushinsui_keys.indexOf(obj.key) >= 0 ) { // 内水氾濫 浸水箇所
						// 	var angle = 135;
						// 	// angleを変更する場合
						// 	// angle = 135 + 90 * app.kaokushinsui_keys.indexOf(obj.key);
						// 	obj.fill_pattern = new ol.style.FillPattern(
						// 		{	pattern: "hatch",
						// 			image: undefined,
						// 			ratio: 1,
						// 			color: obj.fill,
						// 			offset: 0,
						// 			scale: 0.5,
						// 			fill: undefined,
						// 			size: 2,
						// 			spacing: 0,
						// 			angle: angle
						// 		});
						// }
						var d = app.addGeoJsonOverlay(obj.key,obj.title,app.GEOJSON_ROOT+obj.url,obj);
						d.then(function(layer) {
							layer.group = obj.group;
							// console.log("==== loaded : "+obj.title+" - "+obj.geomtype+" - "+obj.visible);
							typeof obj.visible != "undefined" && layer.setVisible(obj.visible);
							typeof obj.zIndex != "undefined"  && layer.setZIndex(obj.zIndex);
							addTreedLayers(layer);
							imgPreloader = null;

							// NOTE: ライン上に矢印を発生させ、アニメーションする
							if ( obj.key == "key_2_4_0_0_0" ) {
								let moving_marker_layer = app.initMovingMarkerLayer(
									layer,
									1000,
									"data/triangle_icon.png"
								);
								layer.moving_marker_layer = moving_marker_layer;
							}
						});
					}
				})(obj);
			}
		}
	}

	func_load_layer(app.OL_LAYER_0);

	var object = null;
	switch ( KUJUKURI_MAP_TYPE ) {
	case KUJUKURI_MAP_TYPE_2 : object = app.OL_LAYER_2; break;
	case KUJUKURI_MAP_TYPE_3 : object = app.OL_LAYER_3; break;
	}
	object && func_load_layer(object);

	// UTFGridレイヤーを作成
	var func_build_utfgrid_layer = function (options) {
		var utfgrid_layer = initUTFGridLayer(
			"utfgrid_"+options.key,//"utfgrid_key_2_1_1_0_0",
			options.title,//"",
			options.urls,//[""],
			(options.extent ? ol.proj.transformExtent(options.extent, "EPSG:4612", "EPSG:3857") : null),
			null,
			{visible : false}
		);
		utfgrid_layer.map_layer = app.treed_layers[options.key];
		utfgrid_layer.map_layer && utfgrid_layer.setVisible( utfgrid_layer.map_layer.getVisible() );
		utfgrid_layer.displayUTFGridInfo = function(gridSource,coordinate,pixel) {
			if ( !app.getInundationFlg || !gridSource || !coordinate) {
				app.infoOverlay.setPosition(undefined);
				app.utfgridMarkerLayer.setVisible(false);
				return;
			}
			var mapElement = app.olMapDiv;
			var viewResolution = /** @type {number} */ (app.map.getView().getResolution());
			// console.log(gridSource);
			gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution,
				function(data) {
					//console.log(data);
					mapElement.style.cursor = data ? 'pointer' : '';
					// console.log(data);
					if (data) {
						var html = "";
						html += "<table><tbody>";
						for (var key in data) {
							if (data.hasOwnProperty(key)) {
								if ( key == options.display_attr[0] ) {
									var val = data[key];
									if (key == 'geometry') return true;
									if (typeof val == 'undefined') return true;
									if (val == null) return true;
									html += "<tr><td>" + options.display_attr[1] + "</td><td class='color-red'>" + val.toFixed(1) + options.display_attr[2] +"</td></tr>";
									//console.log("" + options.display_attr[1] + ", " + val + options.display_attr[2] +"");
									break;
								}
							}
						}
						html += "</tbody></table>";
						var element = app.infoOverlay.getElement();
						element.innerHTML = html;
						app.infoOverlay.setPosition(coordinate);
                        app.utfgridMarkerLayer.setVisible(true);
                        app.utfgridMarkerFeature.getGeometry().setCoordinates(coordinate);
                        app.utfgridMarkerLayer.getSource().changed();
					} else {
						// app.infoOverlay.setPosition(undefined);
                        // app.utfgridMarkerLayer.setVisible(false);
					}
				}
			);
		};
		return utfgrid_layer;
	};

	if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_2 || KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_3) {
		if (ENABLE_UTFGRID) {
			// UTFGridレイヤー(浸水深)
			app.utfgrid_layers = [];
			[
				// "key_2_1_1_0_0,tsunami_shinsui", no val
				"key_2_1_2_0_0,tsunami_10",
				"key_2_1_3_0_0,tsunami_05",
				"key_2_1_4_0_0,tsunami_03",
				"key_2_1_5_0_0,takashio_shinsui",
				"key_2_1_6_0_0,nihonkaiko",
				"key_2_1_7_0_0,chishimakaiko",
				"key_3_1_1_1_0,flood_shinsui_max",
				"key_3_1_2_1_0,flood_shinsui_plan"
			].forEach(function(element){
				var ar = element.split(",");
				app.utfgrid_layers[ar[0]] = func_build_utfgrid_layer({
					key: ar[0],
					title: ar[1],
					urls: [app.GWC_ROOT+"utfgrid/"+ar[1]+"/{z}/{x}/{-y}.utfgrid"],
					display_attr: ["val",shinsui_depth,"[m]"],
					extent: false
				});
			});
			// 浸水継続時間
			[
				// "key_2_1_1_4_0,gousei_shinsuikeizoku",
				// "key_2_1_2_4_0,arakawa_shinsuikeizoku",
				// "key_2_1_3_2_0,tonegawa_shinsuikeizoku",
				// "key_2_1_4_3_0,kamogawa_shinsuikeizoku",
				// "key_2_1_5_3_0,nakagawa_ryu_shinsuikeizoku",
				// "key_2_1_6_3_0,egawa_shinsuikeizoku",
				// "key_2_1_7_3_0,shiba_ryu_shinsuikeizoku",
				// "key_2_1_8_3_0,kamogawa_ryu_shinsuikeizoku",
			].forEach(function(element){
				var ar = element.split(",");
				app.utfgrid_layers[ar[0]] = func_build_utfgrid_layer({
					key: ar[0],
					title: ar[1],
					urls: [app.GWC_ROOT+"utfgrid/"+ar[1]+"/{z}/{x}/{-y}.utfgrid"],
					display_attr: ["val",shinsui_time,shinsui_hour],
					extent: false
				});
			});
		}
	}

    // 浸水深表示ボタン
    $('#btn_Inundation').on('click', function() {
        //console.log('click');
        if ($('#btn_Inundation').hasClass('ui-state-active')) {
            app.getInundationFlg = false;
            $('#btn_Inundation').removeClass('ui-state-active');
            $('#shortdesc').text('');
        } else {
            app.getInundationFlg = true;
            $('#btn_Inundation').addClass('ui-state-active');
            $('#shortdesc').text('地図上でクリックした位置の浸水深を表示します');
        }
    });
	app.getInundationFlg = false;

};

app.refreshLayers = function (tree_no) {

	var ol_layer_list = [];
	if ( tree_no == 1 ) {
		ol_layer_list = app.OL_LAYER_0;
	} else if ( tree_no == 2 ) {
		switch ( KUJUKURI_MAP_TYPE ) {
		case KUJUKURI_MAP_TYPE_2 : ol_layer_list = app.OL_LAYER_2; break;
		case KUJUKURI_MAP_TYPE_3 : ol_layer_list = app.OL_LAYER_3; break;
		}
	}
	for ( var l in ol_layer_list ) {
		// console.log(ol_layer_list[l].key);
		var layer = app.treed_layers[ol_layer_list[l].key];
		layer && layer.getSource().changed();
	}
};

app.selectLayerNode = function (tree_no,data) {
	//console.log("selectLayerNode");
	// console.log(data);

	var selKeys = $.map(data.tree.getSelectedNodes(), function(node){
		return node.key;
	});
	// console.log(selKeys);

	for(var i=0; i<selKeys.length; i++){
		switch(selKeys[i]){
		case "":
			break;
		default :
		}
	}

	var ol_layer_list = [];
	if ( tree_no == 1 ) {
		ol_layer_list = app.OL_LAYER_0;
	} else if ( tree_no == 2 ) {
		switch ( KUJUKURI_MAP_TYPE ) {
		case KUJUKURI_MAP_TYPE_2 :
			ol_layer_list = app.OL_LAYER_2;
			break;
		case KUJUKURI_MAP_TYPE_3 :
			ol_layer_list = app.OL_LAYER_3;
			break;	
		}
	}
	for ( var l in ol_layer_list ) {
		// console.log(ol_layer_list[l].key);
		var layer = app.treed_layers[ol_layer_list[l].key];
		layer && layer.setVisible(false);
	}

	for ( var l in app.treed_layers ) {
		var layer = app.treed_layers[l];
		var layer_key = layer.get("id");
		if ( $.inArray(layer_key, selKeys) >= 0 ) {
			// console.log(layer.get("title"));
			layer.setVisible(true);
		}
		// UTFGridをタイル表示に連動
		ENABLE_UTFGRID && app.utfgrid_layers[layer_key] && app.utfgrid_layers[layer_key].setVisible(layer.getVisible());
	}
	// 行政区域界は常に表示
	app.treed_layers["key_0_2_0_0_0"] && app.treed_layers["key_0_2_0_0_0"].setVisible(true);

	// アンダーパスマーカの連動
	// {title:'アンダーパス',key:'key_0_1_3_0_0',	geomtype:'point',	url:'underpath_point.geojson',	icon:app.ICON_ROOT+'underpass.png',scale:1,				visible:true,		zIndex:1102,	anchor:[0.5,0.5] 			},
	// app.treed_layers["key_0_1_2_0_0"] && app.treed_layers["key_0_1_3_0_0"] && app.treed_layers["key_0_1_3_0_0"].setVisible(app.treed_layers["key_0_1_2_0_0"].getVisible());

	app.treed_layers["key_2_4_0_0_0"] && app.layers["MovingMarkerLayer"] && app.layers["MovingMarkerLayer"].setVisible(app.treed_layers["key_2_4_0_0_0"].getVisible());

	// 凡例ダイアログ
	// sedi_disa_hanrei,flood_hanrei
	var hanrei_visible = false;
	if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_1 ) {
		hanrei_visible = false;
	}
	if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_2 ) {
		// 浸水深（凡例制御は後で）
		// var v = app.treed_layers["key_2_1_1_0_0"] && app.treed_layers["key_2_1_1_0_0"].getVisible();
		// hanrei_visible = v;
		//app.utfgrid_layer_1 && app.utfgrid_layer_1.setVisible(v);

		// シミュレーション

		// 浸水深の凡例表示制御
		// $("#flood_hanrei .hanrei_1").css("display",(hanrei_visible?"block":"none"));
		
		// 浸水継続時間
		// v = app.treed_layers["key_2_7_0_0_0"] && app.treed_layers["key_2_7_0_0_0"].getVisible();
		// app.treed_layers["key_2_7_0_0_0"] && $("#flood_hanrei .hanrei_2").css("display",(v?"block":"none"));
		// hanrei_visible = hanrei_visible || v;
		// //app.utfgrid_layer_11 && app.utfgrid_layer_11.setVisible(v);

		// // 浸水（内水）水害実績箇所
		// v = app.treed_layers["key_2_2_0_0_0"] && app.treed_layers["key_2_2_0_0_0"].getVisible();
		// app.treed_layers["key_2_2_0_0_0"] && $("#flood_hanrei .hanrei_3").css("display",(v?"block":"none"));
		// hanrei_visible = hanrei_visible || v;

	}
	if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_3 ) {
		hanrei_visible = false;
	}

	// 津波
	if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_2 ) {
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
	}

	// 洪水
	if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_3 ) {
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
		$("#flood_hanrei .hanrei_1").css("display",(naisui_visible?"none":"block"));
		hanrei_visible |= naisui_visible;
	}

	// 何も表示しなければダイアログを隠す
	if ( hanrei_visible === false) {
		try {
			$('#hanrei_dialog').dialog("close");
		} catch (error) {
		}
	}


	// レイヤー制御時に、ポップアップを非表示
	app.closer && app.closer.onclick();

};
app.exResizeContainer = function (data) {
	console.log("not implement");
	// console.trace();
	// console.log(data);
};
app.buildTree = function() {

	$('#layer_menu_wrpper').accordion({
		header: "div.layer_menu_header"
		,active: 0
		,collapsible: true
		,heightStyle: "content"
	});

	// layer tree
	// 共通
	$("#common_tree").fancytree({
		checkbox: true
		,selectMode: 3
		//,focusOnSelect: true
		,source: app.TREE_0
		,init: function(event, data){
			// app.selectLayerNode(1,data);
		}
		,expand: function(event, data) {
			//console.log('expand');
			if (typeof exResizeContainer === "function") app.exResizeContainer(null);
		}
		,collapse:  function(event, data) {
			//console.log('collapse');
			if (typeof exResizeContainer === "function") app.exResizeContainer(null);
		}
		,click: function(event, data) {
			if (data.targetType == 'title' || data.targetType == 'icon') {
				if (!data.node.isExpanded()) {
					data.node.setExpanded(true);
				} else {
					// data.node.setExpanded(false);
				}
				if (!data.node.isSelected()) {
					data.node.setSelected(true);
				} else {
					data.node.setSelected(false);
				}
			}
		}
		,select: function(event, data) {
			if(app.timerSelectLayerNode1) clearTimeout(app.timerSelectLayerNode1);
			app.timerSelectLayerNode1 = setTimeout(function(){
				app.selectLayerNode(1,data);
				app.timerSelectLayerNode1 = null;
			},300);
		}
	});

	// 地図別の主題
	var func_build_theme_tree = function (object) {
		$("#theme_tree").fancytree({
			checkbox: true
			,selectMode: 3
			,source: object
			,init: function(event, data){
				app.selectLayerNode(2,data);
			}
			,expand: function(event, data) {
				//console.log('expand');
				if (typeof exResizeContainer === "function") app.exResizeContainer(null);
			}
			,collapse:  function(event, data) {
				//console.log('collapse');
				if (typeof exResizeContainer === "function") app.exResizeContainer(null);
			}
			,click: function(event, data) {
				if (data.targetType == 'title' || data.targetType == 'icon') {
					if (!data.node.isExpanded()) {
						data.node.setExpanded(true);
					} else {
						// data.node.setExpanded(false);
					}

					// 浸水想定区域図、シミュレーションの親は子を連動させない
					if ( app.shinsui_root_keys.indexOf(data.node.key) >= 0 ) {
						return false;
					}
					if ( app.simulation_root_keys.indexOf(data.node.key) >= 0 ) {
						return false;
					}

					// my-fancytree-disable
					if ( data.node.data.disable ) {
						return false;
					}


					if (!data.node.isSelected()) {
						data.node.setSelected(true);
					} else {
						data.node.setSelected(false);
					}
					if (!data.node.hasChildren()) {
					}
				} else if (data.targetType == 'checkbox') {
					// my-fancytree-disable
					if ( data.node.data.disable ) {
						return false;
					}

				}
			}
			,select: function(event, data) {
				var this_key = data.node.key;

				// 浸水想定区域図、シミュレーションの親はONにしない
				if ( app.shinsui_root_keys.indexOf(this_key) >= 0 ) {
					// console.log("data.node.setSelected(false);");
					data.node.setSelected(false);
				}
				if ( app.simulation_root_keys.indexOf(this_key) >= 0 ) {
					// console.log("data.node.setSelected(false);");
					data.node.setSelected(false);
				}

				if (ENABLE_UTFGRID) {
					// UTFGridをタイル表示に連動
					app.utfgrid_layers[this_key] && app.utfgrid_layers[this_key].setVisible(data.node.selected);
				}
				
				if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_1 ) {
					// 防災マップ
				} else if ( KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_2 || KUJUKURI_MAP_TYPE == KUJUKURI_MAP_TYPE_3 ) {
					// 2: 津波ハザードマップ
					// 3: 洪水ハザードマップ
					// 浸水深やシミュレーションをOnにしたら、
					// ツリーの異なる枝のノードをすべてOFFにする
					var this_group = this_key.substr(0,10);

					// 浸水想定区域図 was turned to ON.
					if ( data.node.isSelected() && app.shinsui_keys.indexOf(this_key) >= 0 ) {
						data.tree.visit(function(node){
							if ( app.shinsui_keys.indexOf(node.key) >= 0 && this_group != node.key.substr(0,10) ) {
								node.setSelected(false);
							}
							// if ( app.naisui_shinsui_keys.indexOf(node.key) >= 0 ) {
							// 	node.setSelected(false);
							// }
							// if ( app.simulation_keys.indexOf(node.key) >= 0 ) {
							// 	node.setSelected(false);
							// }
						});
					}
					// NOTE: 河川ごとの排他制御

					// NOTE: 想定最大規模と計画規模の排他制御 shinsuishin_keys, shinsuikeizoku_jikan_keys
					if ( data.node.isSelected() && app.shinsui_max_keys.indexOf(this_key) >= 0 ) {
						data.tree.visit(function(node){
							if ( app.shinsui_plan_keys.indexOf(node.key) >= 0 ) {
								node.setSelected(false);
							}
						});
					} else if ( data.node.isSelected() && app.shinsui_plan_keys.indexOf(this_key) >= 0 ) {
						data.tree.visit(function(node){
							if ( app.shinsui_max_keys.indexOf(node.key) >= 0 ) {
								node.setSelected(false);
							}
						});
					}
					// 内水をOnにした
					// if ( data.node.isSelected() && app.naisui_shinsui_keys.indexOf(this_key) >= 0 ) {
					// 	data.tree.visit(function(node){
					// 		if ( app.shinsui_keys.indexOf(node.key) >= 0 ) {
					// 			node.setSelected(false);
					// 		}
					// 		if ( app.simulation_keys.indexOf(node.key) >= 0 ) {
					// 			node.setSelected(false);
					// 		}
					// 	});
					// }

					// シミュレーション was turn to ON.
					// if ( data.node.isSelected() && app.simulation_keys.indexOf(this_key) >= 0 ) {
					// 	// シミュレーションがOnにされたら、浸水想定区域図, 他のシミュレーションをOFFにして、破綻点をONにする
					// 	data.tree.visit(function(node){
					// 		// 浸水想定区域図
					// 		if ( app.shinsui_keys.indexOf(node.key) >= 0 ) {
					// 			node.setSelected(false);
					// 		}
					// 		// 　内水
					// 		if ( app.naisui_shinsui_keys.indexOf(node.key) >= 0 ) {
					// 			node.setSelected(false);
					// 		}
					// 		// 自ツリー以外をOFF
					// 		if ( app.simulation_keys.indexOf(node.key) >= 0 && node.key.substr(0,10) != this_group ) {
					// 			node.setSelected(false);
					// 		}
					// 		// ・同一グループの破綻点をONにする
					// 		if ( node.key.substr(0,12) == this_group + "1_" ) {
					// 			node.setSelected(true);
					// 		}
					// 		// ・破綻点以外のとき、同一グループ内では排他表示
					// 		if ( this_key.substr(0,12) != this_group + "1_" ) {
					// 			if ( node.key.substr(0,10) == this_group + "" && node.key != this_key && node.key.substr(0,12) != this_group + "1_" ) {
					// 				node.setSelected(false);
					// 			}
					// 		}
					// 	});

					// 	// シミュレーション（破堤点）
					// 	var isVisibleBP = (app.simulation_breakpoint_keys.indexOf(this_key) >= 0 );
					// 	表示範囲を変更（破堤点と表示中の画面を含む範囲）
					// 	if (isVisibleBP) {
					// 		var view_extent = app.map.getView().calculateExtent(app.map.getSize());
					// 		var coords = [];
					// 		coords.push(ol.extent.getTopLeft(view_extent));
					// 		coords.push(ol.extent.getTopRight(view_extent));
					// 		coords.push(ol.extent.getBottomLeft(view_extent));
					// 		coords.push(ol.extent.getBottomRight(view_extent));

					// 			app.treed_layers[this_key].getSource().forEachFeature(function(feature) {
					// 			coords.push(feature.getGeometry().getCoordinates());
					// 		});
					// 		var extent = ol.extent.boundingExtent(coords);
					// 		app.map.getView().fit(extent, {"padding": [24, 24, 24, 24]});
					// 	}

					// }

					// 津波 浸水想定区域図 was turned to ON.
					if ( data.node.isSelected() && app.tsunami_shinsui_keys.indexOf(this_key) >= 0 ) {
						data.tree.visit(function(node){
							if ( app.tsunami_shinsui_keys.indexOf(node.key) >= 0 && this_group != node.key.substr(0,10) ) {
								node.setSelected(false);
							}
						});
					}

				}

				if(app.timerSelectLayerNode2) clearTimeout(app.timerSelectLayerNode2);
				app.timerSelectLayerNode2 = setTimeout(function(){
					app.selectLayerNode(2,data);
					app.timerSelectLayerNode2 = null;
				},300);
			}
		});//.addClass('fancytree-radio');
	}

	var object = null;
	switch ( KUJUKURI_MAP_TYPE ) {
		case KUJUKURI_MAP_TYPE_2 :
			if (!EXCLUDE_PARENT_TREES) {
				object = app.TREE_2;
			} else {
				// 指定したKeyを除外する（app_flags.js の EXCLUDE_PARENT_KEYS）
				new_trees = [];
				$.each(app.TREE_2, function(idx, tree){
					if ($.inArray(tree.key, EXCLUDE_PARENT_KEYS) < 0) {
						new_trees.push(tree);
					}
				});
				object = new_trees;
			}
			break;
		case KUJUKURI_MAP_TYPE_3 :
			if (!EXCLUDE_PARENT_TREES) {
				object = app.TREE_3;
			} else {
				// 指定したKeyを除外する（app_flags.js の EXCLUDE_PARENT_KEYS）
				new_trees = [];
				$.each(app.TREE_2, function(idx, tree){
					if ($.inArray(tree.key, EXCLUDE_PARENT_KEYS) < 0) {
						new_trees.push(tree);
					}
				});
				object = new_trees;
			}
			break;
	}
	object && func_build_theme_tree(object);

};

// 施設一覧表示
app.buildFacilityList = function () {
	var ol_layer_list = [];
	switch ( KUJUKURI_MAP_TYPE ) {
		case KUJUKURI_MAP_TYPE_2 : ol_layer_list = app.OL_LAYER_0.concat(app.OL_LAYER_2); break;
		case KUJUKURI_MAP_TYPE_3 : ol_layer_list = app.OL_LAYER_0.concat(app.OL_LAYER_3); break;
	}
	//console.dir(ol_layer_list);
	for ( var l in ol_layer_list ) {
		// console.log(ol_layer_list[l].key);
		//console.dir(ol_layer_list[l]);
		//var layer = app.treed_layers[ol_layer_list[l].key];
		var layer = ol_layer_list[l];
		var optHtml = "";
		if ( app.facilities_keys.indexOf(layer.key) >= 0 ) {
			optHtml = "<option value='" + layer.key + "'>" + layer.title + "</option>";
			$('#select_summary').append(optHtml);
		}
	}
	// レイヤ選択
	$('#select_summary').on('change', function() {
		//console.log("select_summary : changed");
		var key = this.value;
		app.selectFacilityList(key);
	});
}

// 施設一覧表示：一覧の選択
/*
> これらに記載されている各施設の記載順序は水害ハザードマップ印刷図の順番に準じる
*/
app.selectFacilityList = function (key) {
	// 一覧の初期化
	$('div.summary_container div.list_facility').remove();

	var ol_layer_list = [];
	switch ( KUJUKURI_MAP_TYPE ) {
		case KUJUKURI_MAP_TYPE_2 : ol_layer_list = app.OL_LAYER_0.concat(app.OL_LAYER_2); break;
		case KUJUKURI_MAP_TYPE_3 : ol_layer_list = app.OL_LAYER_0.concat(app.OL_LAYER_3); break;
	}	
	for ( var l in ol_layer_list ) {
		// console.log(ol_layer_list[l].key);
		if (ol_layer_list[l].key == key) {
			// console.dir(ol_layer_list[l]);
			// 施設一覧をテンプレートより複製
			$('div.list_facility_temp').clone().appendTo('div.summary_container').attr('id', key + '_list');
			$('#' + key + '_list').attr('title', key);
			$('#' + key + '_list div.list_name').attr('id', key + '_list');
			$('#' + key + '_list').removeClass('list_dialog_temp');
			$('#' + key + '_list').addClass('list_facility');

			listCount = 1;			// カウント初期化
			var listSortArray = [];	// 一覧ソート用の配列

			var layer = app.treed_layers[ol_layer_list[l].key];
			var isString = false;
			//console.dir(layer.getSource());
			var func_style = layer.getStyleFunction();
			layer.getSource().forEachFeature(function(feature) {
				// console.dir(feature);
				// 関数でフィルタしている地物をリストに出さない
				if ( typeof func_style == "function" && func_style(feature,1) == false ) return;

				//ソート用の配列を作成
				var listSortObj = {};
				// ソート用のkey指定
				var sortVal;
				if (typeof feature.getProperties()['番号'] !== 'undefined') {
					sortVal = feature.getProperties()['番号'];
				} else if (typeof feature.getProperties()['id'] !== 'undefined') {
					sortVal = feature.getProperties()['id'];
				// } else if (typeof feature.getProperties()['名称'] !== 'undefined') {
				// 	sortVal = feature.getProperties()['名称'];
				// 	isString = true;
				} else {
					sortVal = feature.getId();
				}
				if ( app.listsort_keys.indexOf(key) >= 0 ) {
					var opt_name = "";
					if (typeof feature.getProperties()['名称'] !== 'undefined') {
						opt_name = feature.getProperties()['名称'];
					}
					if (typeof app.name2sortkey[opt_name] !== 'undefined') {
						sortVal = app.name2sortkey[opt_name];
					}
				}

				listSortObj = feature.clone();//$.extend(true, {}, feature);
				listSortObj.sort_key = sortVal;
				listSortArray.push(listSortObj);
			});
			// 指定したkeyによりソートを実行
			var listSortedArray = app.sortArrayObject(listSortArray, 1, isString);
			$.each(listSortedArray, function(lidx, sortedFeatureObj) {
					var liHtml = app.createFacilityList(sortedFeatureObj, key, listCount);
					if (liHtml != "") {
						$('#' + key + '_list>div>ul').append(liHtml);
						listCount++;
					}
			});
			// 表示
			$('#' + key + '_list').css('display', 'block');
			break;
		}
	}
}
// ソート用配列を用いて、連想配列の並び替え
// 並び替え対象のオブジェクトに、ソート用のkey「"sort_key"」を追加しておく
// ArrayObj : 並び替え対象のオブジェクト配列
// order : 負数→降順、それ以外→昇順　※文字列に対応
app.sortArrayObject = function (ArrayObj, order, isString) {
	ArrayObj.sort(function(a,b){
		var a_sort_key = a["sort_key"];
		var b_sort_key = b["sort_key"];
		if (!isString) {
			a_sort_key = parseInt(a_sort_key);
			b_sort_key = parseInt(b_sort_key);
		}
		if (order > -1) {
			// 昇順
			if( a_sort_key < b_sort_key ) return -1;
			if( a_sort_key > b_sort_key ) return 1;
		} else {
			// 降順
			if( a_sort_key < b_sort_key ) return 1;
			if( a_sort_key > b_sort_key ) return -1;
		}
		return 0;
	});	
	return ArrayObj;
};
// 施設一覧表の構築
app.createFacilityList = function(feature, layerKey, lCount) {
	//console.log(lCount);
	//console.dir(feature);
	var liHtml = "";

	// console.dir(feature.getProperties());
	var opt_name = "";
	if (typeof feature.getProperties()['名称'] !== 'undefined') {
		opt_name = feature.getProperties()['名称'];
	}
	if (opt_name=="" && typeof feature.getProperties()['施設名'] !== 'undefined') {
		opt_name = feature.getProperties()['施設名'];
	}
	if (opt_name=="" && typeof feature.getProperties()['施設名称'] !== 'undefined') {
		opt_name = feature.getProperties()['施設名称'];
	}
	if (opt_name=="" && typeof feature.getProperties()[kokyoku] !== 'undefined') {
		opt_name = feature.getProperties()[kokyoku];
	}
	if (opt_name=="" && typeof feature.getProperties()[kansokujo] !== 'undefined') {
		opt_name = feature.getProperties()[kansokujo];
	}
	// 基準値の取得
	var coord = app.getFeaturePosition(feature);
	if (lCount % 2 == 0) {
		liHtml += "<li title='" + opt_name + "' onclick='app.exSetCenter(" + coord[0] + "," + coord[1] + ")\; app.exSetLayerOnOff(\"" + layerKey + "\",1)\; app.exOpenInfoWin(\"" + layerKey + "\"," + feature.getId() + ")\;'>";
	} else {
		liHtml += "<li title='" + opt_name + "' class='summary_on' onclick='app.exSetCenter(" + coord[0] + "," + coord[1] + ")\; app.exSetLayerOnOff(\"" + layerKey + "\",1)\; app.exOpenInfoWin(\"" + layerKey + "\"," + feature.getId() + ")\;'>";
	}
	liHtml += "<a style='cursor:pointer; text-decoration: none; padding-left: 4px;' onclick='app.exSetCenter(" + coord[0] + "," + coord[1] + ")\; app.exSetLayerOnOff(\"" + layerKey + "\",1)\; app.exOpenInfoWin(\"" + layerKey + "\"," + feature.getId() + ")\;'>";
	liHtml += opt_name + "</a></li>";

	return liHtml;
}
// 図形（feature）から基準点（中心など）を求める -->
app.getFeaturePosition = function (feature) {
	var coord = [0, 0];
	// console.log(feature.getGeometry().getType());
	// console.dir(feature.getGeometry());
	// console.dir(feature.getProperties());

	switch (feature.getGeometry().getType()) {
		// ポイントのみ対応
		case "Point" :
			// console.dir(feature.getGeometry().getCoordinates());
			coord = feature.getGeometry().getCoordinates();
			break;
		case "LineString" :
		case "LinearRing" :
		case "Polygon" :
		case "MultiPoint" :
		case "MultiLineString" :
		case "MultiPolygon" :
		case "GeometryCollection" :
		case "Circle" :
		default:
			break;
	}
	return coord;
}
// 選択した施設を中心表示する
app.exSetCenter = function (jumpto_x, jumpto_y) {
	app.map.getView().setCenter([jumpto_x, jumpto_y]);
}
// 選択した施設のレイヤを表示する
app.exSetLayerOnOff = function (key, onoff) {
	// 選択した施設のレイヤが表示中であればそのまま
	if (app.treed_layers[key].getVisible()) {
		return;
	}
	// LayerTreeのノードを選択
	// 共通ツリー
	var common_tree = $.ui.fancytree.getTree("#common_tree");
	var node1 = common_tree.getNodeByKey(key);
	//console.dir(node1);
	if (node1 != null) {
		node1.setSelected(true);
		return;
	}
	// 主題別ツリー
	var theme_tree = $.ui.fancytree.getTree("#theme_tree");
	var node2 = theme_tree.getNodeByKey(key);
	// console.dir(node2);
	if (node2 != null) {
		node2.setSelected(true);
	}
}
// 選択した施設のポップアップ情報を表示する
app.exOpenInfoWin = function (key, fid) {
	if ( !(fid) ) return;
	var layer = app.treed_layers[key];
	//console.dir(layer.getSource());
	var feature = layer ? layer.getSource().getFeatureById(fid) : null;
	if (feature != null && !app.not_openpopup) {
		setTimeout (function() {app.popupFeatureProperties(feature);}, 500);
	}
}

// URLハッシュから地図を切り替える
app.setMapType = function() {

	var urlhash = window.location.hash;
	if ( urlhash == "" ) {
		urlhash = "tsunami";
		window.location.hash = "tsunami";
		var title_img = "images/title_img.png";
		if (lang == "en") {
			var title_img = "images/title_img_en.png";
		}
	}
	{
		urlhash = urlhash.replace("#","");
		if ( urlhash == "disa_preven") {
		} else if ( urlhash == "tsunami") {
			KUJUKURI_MAP_TYPE = KUJUKURI_MAP_TYPE_2;
			$(".title_img > img").attr("src",title_img);
			if (ENABLE_UTFGRID) {
				$("#btn_Inundation").show();
			} else {
				$("#btn_Inundation").hide();
			}
		} else if ( urlhash == "flood") {
			KUJUKURI_MAP_TYPE = KUJUKURI_MAP_TYPE_3;
			$(".title_img > img").attr("src",title_img);
			if (ENABLE_UTFGRID) {
				$("#btn_Inundation").show();
			} else {
				$("#btn_Inundation").hide();
			}
		} else if ( urlhash == "sedi_disa") {
		} else {
			KUJUKURI_MAP_TYPE = KUJUKURI_MAP_TYPE_2;
			$(".title_img > img").attr("src",title_img);
			if (ENABLE_UTFGRID) {
				$("#btn_Inundation").show();
			} else {
				$("#btn_Inundation").hide();
			}
			window.location.hash = "tsunami";
		}
		$("#radio_map_type > input[name='radio_map_type']").val([urlhash]);
	}

};

// 地図切り替えのラジオボタン選択
app.setupChangeMapRadio = function() {

	var r1 = $("#radio_disa_preven");
	var r2 = $("#radio_tsunami");
	var r3 = $("#radio_flood");
	var r4 = $("#radio_sedi_disa");

	r1.on("click",function(){
		$('#loader-bg ,#loader').height($(window).height()).css('display','block');
		window.location.hash = "disa_preven";
		location.reload();
	});
	r2.on("click",function(){
		$('#loader-bg ,#loader').height($(window).height()).css('display','block');
		window.location.hash = "tsunami";
		location.reload();
	});
	r3.on("click",function(){
		$('#loader-bg ,#loader').height($(window).height()).css('display','block');
		window.location.hash = "flood";
		location.reload();
	});
	r4.on("click",function(){
		$('#loader-bg ,#loader').height($(window).height()).css('display','block');
		window.location.hash = "sedi_disa";
		location.reload();
	});
};

// 標高表示機能
app.initShowElevation = function () {

	app.getElevationFlg = false;

    var createTextStyle = function(feature, resolution) {
        var align = "left";
        var baseline = "middle";
        var size = "14px";
        var offsetX = 3;
        var offsetY = 0;
        var weight = "normal";
        var placement = "point";
        var maxAngle = undefined;
        var overflow = true;
        var rotation = 0;
        var font = weight + ' ' + size + ' ' + "Arial";
        var fillColor = "#0000ff";
        var outlineColor = "#ffffff";
        var outlineWidth = 1;

        var txt = app.elevationFeature.get("elevation");
        return new ol.style.Text({
          textAlign: align == '' ? undefined : align,
          textBaseline: baseline,
          font: font,
          text: txt,
          fill: new ol.style.Fill({color: fillColor}),
          stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
          offsetX: offsetX,
          offsetY: offsetY,
          placement: placement,
          maxAngle: maxAngle,
          overflow: overflow,
          rotation: rotation
        });
      };

    function pointStyleFunction(feature, resolution) {
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 2,
            fill: new ol.style.Fill({color: 'rgba(0, 0, 255, 1.0)'}),
            stroke: new ol.style.Stroke({color: 'rgba(0, 0, 255, 1.0)', width: 1})
          }),
          text: createTextStyle(feature, resolution)
        });
      }

    app.elevationLayer = new ol.layer.Vector({
		title: "elevationLayer"
        ,source: new ol.source.Vector()
        ,projection: "EPSG:3857"
		,visible: true
        ,style: pointStyleFunction
	});
	app.elevationLayer.setZIndex(999999);
	app.map.addLayer(app.elevationLayer);
	app.elevationLayer.setVisible(false);

    app.elevationFeature = new ol.Feature({
        type: 'Point',
        geometry: new ol.geom.Point(0,0)
    });
    app.elevationLayer.getSource().addFeature(app.elevationFeature);

    var timer_show_elevation = null;
	app.getShowElevation = function(coordinate) {
        app.olMapDiv.style.cursor = 'progress';
        if ( timer_show_elevation ) clearTimeout(timer_show_elevation);

        timer_show_elevation = setTimeout(function() {
            var point = new ol.geom.Point(coordinate);
            var bl = point.transform(new ol.proj.Projection({ "code": "EPSG:3857" }), new ol.proj.Projection({ "code": "EPSG:4326" }));
            var coord = bl.getCoordinates();
            app.elevationLayer.setVisible(false);

			$.ajax({
				type : "GET",
				dataType : "json",
				url : "https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?outtype=JSON&lon="+coord[0]+"&lat="+coord[1],
				data : {},
				success : function(data, textStatus, XMLHttpRequest) {
                    app.olMapDiv.style.cursor = '';
					if ( data && data.elevation != "-----"  ) {
						var t_unit = "[m]";
						var txt = data.elevation.toFixed(1) + t_unit;
                        // console.log(txt);
                        app.elevationLayer.setVisible(true);

                        app.elevationFeature.set("elevation",txt);
                        app.elevationFeature.getGeometry().setCoordinates(coordinate);
                        app.elevationLayer.getSource().changed();
                    }
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
                    app.elevationLayer.setVisible(false);
                    app.olMapDiv.style.cursor = '';
                    console.log("Error:"+textStatus);
					console.dir(XMLHttpRequest);
				}
            })

		},500);

	};


    // 標高表示ボタン
    $('#btn_elevation').on('click', function() {
        //console.log('click');
        if ($('#btn_elevation').hasClass('ui-state-active')) {
            app.getElevationFlg = false;
            $('#btn_elevation').removeClass('ui-state-active');
            $('#shortdesc').text('');
            // // 一時マーカー初期化
            // if (temp_marker.getMap()) {
            //     temp_marker.setMap(null);
            // }
            // app._mapObj.setOptions({draggableCursor : ''});
			app.elevationLayer.setVisible(false);
        } else {
            app.getElevationFlg = true;
            $('#btn_elevation').addClass('ui-state-active');
            $('#shortdesc').text('地図上でクリックした位置の標高を表示します');
            // app._mapObj.setOptions({draggableCursor : 'default'});
        }
	});
	
    // 市域表示ボタン
    $('#btn_cityarea').on('click', function() {
		//console.log('click');	
		// key_0_2_0_0_0 : 九十九里町
		if (app.treed_layers['key_0_2_0_0_0']) {	
			var extent = app.treed_layers['key_0_2_0_0_0'].getSource().getExtent();
			app.map.getView().fit(extent, {"padding": [24, 24, 24, 24]});
		}	
	});

    app.map.on('click', function(evt) {
        if (evt.dragging) {
            return;
        }
        var coordinate = app.map.getEventCoordinate(evt.originalEvent);
        if ( app.getElevationFlg ) {
			app.getShowElevation && app.getShowElevation(coordinate);
            // return;
        }
    });

}

// 地図クリックイベント
app.initClickInteraction = function() {

	app.map.on('click', function(evt) {

		var pickedFeature = null;
		app.map.forEachFeatureAtPixel(
			evt.pixel,
			function(feature, layer) {
				if (typeof feature.zIndex == "undefined" ) return false;
				if ( pickedFeature ) {
					if ( pickedFeature.zIndex < feature.zIndex ) {
						pickedFeature = feature;
					} else {
					}
				} else {
					pickedFeature = feature;
				}
				return false;
			}
		);
		// if (pickedFeature) { console.dir(pickedFeature); }

		// 属性表示処理
		if (pickedFeature ) {
			app.popupFeatureProperties(pickedFeature);
		} else {
			app.closer.onclick();
		}
	});

	if ( !app.popup_element ) {
		app.popup_element = document.getElementById('popup');
		// var element = document.getElementById('popup');
		app.closer = document.getElementById('popup-closer');
		app.closer.onclick = function() {
			//console.log("app.closer.onclick");
			app.popup.setPosition(undefined);
			this.blur();
			app.highlightOverlay.getSource().clear();
			return false;
		};

		app.popup = new ol.Overlay({
			element: app.popup_element
			,positioning: 'bottom-center'
			//,stopEvent: false
			,stopEvent: true
			,autoPan: false
			,offset: [0,-30]
		});
		app.map.addOverlay(app.popup);

		// change mouse cursor when over marker
		app.map.on('pointermove', function (e) {
			if (e.dragging) {
				// $(app.popup_element).hide();
				// $(app.popup_element).popover('destroy');
				return;
			}
			var pixel = app.map.getEventPixel(e.originalEvent);
			var hit = app.map.hasFeatureAtPixel(pixel);
			app.map.getTarget().style.cursor = hit ? 'pointer' : '';
		});
	}

};

// 情報PopUp
app.popupFeatureProperties = function (feature) {
	if ( !feature ) {
		$(app.popup_element).hide();
		return false;
	}
	// keyが無ければ属性情報は表示しない
	if ( !(feature.layer_key) ) {
		return false;
	}
	// console.log("layer_key : "+feature.layer_key);
	// // 指定したkeyの属性情報は表示しない
	// if ( app.kaokutoukai_layer_keys.indexOf(feature.layer_key) >= 0 || app.kaokushinsui_keys.indexOf(feature.layer_key) >= 0 || app.dourokansui_keys.indexOf(feature.layer_key) >= 0 ) {
	// 	$(app.popup_element).hide();
	// 	return false;
	// }

	var geometry = feature.getGeometry();
	var geomtype = geometry.getType();
	var extent = geometry.getExtent();
	var coordinate = ol.extent.getTopLeft(extent);
	if (geomtype != "Point" && geomtype != "MultiPoint") {
		//console.log(geometry.getCoordinates());
		var flatCoordinates = geometry.flatCoordinates;
		coordinate = [flatCoordinates[0],flatCoordinates[1]];
		for (var i = 0 ; i < flatCoordinates.length ; i += 2 ) {
			var x = flatCoordinates[i];
			var y = flatCoordinates[i+1];
			if ( coordinate[1] < y ) {
				if ( ol.extent.containsCoordinate( app.map.getView().calculateExtent(app.map.getSize()),[x,y]) ) {
					coordinate = [x,y];
				}
			}
		}
		app.popup.setOffset([0,0]);
	} else {
		app.popup.setOffset([0,-30]);
	}
	app.popup.setPosition(coordinate);
	$(app.popup_element).show();

	var geom = feature.getGeometry().clone();
	var bl = geom.transform(new ol.proj.Projection({ "code": "EPSG:3857" }), new ol.proj.Projection({ "code": "EPSG:4326" }));

	var olfPropsObj = feature.getProperties();
	console.dir(olfPropsObj);
	var displayProps = "";

	var t_layer = null;
	var display_attrs = false;
	if ( feature.layer_key ) {
		for ( var l in app.OL_LAYER_0 ) {
			if ( feature.layer_key == app.OL_LAYER_0[l].key ) {
				t_layer = app.OL_LAYER_0[l];
				break;
			}
		}
		if ( t_layer == null ) {
			var ol_layer_list;
			switch ( KUJUKURI_MAP_TYPE ) {
				case KUJUKURI_MAP_TYPE_2 : ol_layer_list = app.OL_LAYER_2; break;
				case KUJUKURI_MAP_TYPE_3 : ol_layer_list = app.OL_LAYER_3; break;
			}
			for ( var l in ol_layer_list ) {
				if ( feature.layer_key == ol_layer_list[l].key ) {
					t_layer = ol_layer_list[l];
					break;
				}
			}
		}
		if ( t_layer ) {
			if ( t_layer.attr_name ) {
				display_attrs = t_layer.attr_name.split(",");
			}
		}
	} else {
	}
	if ( feature.layer_key == "kujukuri_tyoumoku") {
		display_attrs = "PREF_NAME,CITY_NAME,S_NAME,".split(",");
	}

	var t_title = (t_layer && t_layer.title) ? t_layer.title : "";

	var flag = false;
	displayProps += "<div class='table'><table><tbody>";
	$.each(olfPropsObj, function(key, val) {
		var t_key = "";
		var t_val = "";
		// 指定したkeyの属性情報は表示しない
		if ( app.dosya_keys.indexOf(feature.layer_key) >= 0 || app.kaokutoukai_layer_keys.indexOf(feature.layer_key) >= 0 || app.kaokushinsui_keys.indexOf(feature.layer_key) >= 0 || app.dourokansui_keys.indexOf(feature.layer_key) >= 0 ) {
			//displayProps += "<tr><td>" + "○○○○" + "</td></tr>";
			return false;
		}
		// if (feature.layer_key == 'key_0_0_0_0_0') {
			// displayProps += "<tr><td>" + "○○○○" + "</td></tr>";
		// 	return false;
		// }
		if (feature.layer_key.indexOf('key_0_1_')>=0) {
			if (key == keyname_address) return false;
		}
		if (key == 'geometry') return true;
		if (key == 'Id') return true;
		if (key == 'area') return true;
		// 避難所関連の「風水害時」「洪水時」は undefined, nullでも表示する。
		if (key == '風水害時' || key == '洪水時') {
			if (typeof val == 'undefined' || val == null) {
				t_val = "×";
			} else {
				t_val = val;
			}
		} else {
			if (typeof val == 'undefined') return true;
			if (val == null) return true;
			t_val = val;
		}
		if (key == 'id') return true;
		if (key == 'layer') return true;
		if (key == '住所の精度') return true;
		if (key == 'マッチング') return true;
		if (key == '緯度') return true;
		if (key == '経度') return true;
		if (key == '距離') return true;
		if (key == '合成ランク') return true;
		if (key == 'アイテムID') return true;
		if (key == 'ID') return true;
		if (key == 'アイテムク') return true;
		if (key == '原点X') return true;
		if (key == '原点Y') return true;
		if (key == '原点Z') return true;
		if ( feature.layer_key == "key_0_1_10_0_0" && key == "番号") return true;
		t_key = key;
		if ( key == "No_" ) t_key = "No";
		if ( key == "nno" ) t_key = "No";
		if ( key == "no" ) t_key = "No";
		//if ( key == "name" ) t_key = "名称";
		if ( key == "本番号2" ) t_key = "区域番号";
		if ( key == "PREF_NAME" ) t_key = "都道府県";
		if ( key == "CITY_NAME" ) t_key = "市区町村";
		if ( key == "S_NAME" ) t_key = "大字";
		if ( key == "RIVER" ) return true;
		if ( key == "説明" ) return true;
		if ( feature.layer_key.indexOf("key_0_1_1_") >= 0 ) {
			if ( key == "場所_地震" ) t_key = "　　地震";
			if ( key == "場所_洪水" ) {
				t_key = "　　洪水";
				if ( t_val == "●" ) t_val = "○ (校舎3階以上を利用)";
				if ( t_val == "●(※3)" ) t_val = "○ (6階展望室を利用)";
			}
			if ( key == "場所_火事" ) t_key = "　　大規模な火事";
			// if ( key == "指定避難所" ) t_key = "指定避難所(水害時)";
			if ( key == "避難所洪水" ) t_key = "　　洪水";
			if ( key == "避難所地震" ) t_key = "　　地震";
		}
		if (key == 'No' || t_key == 'No') return true;
		if (key == shelter) return true;
		if (key == keyname_tsunami) return true;
		if (key == keyname_earthquake) return true;
		if (key == keyname_windflood) return true;
		if (key == remarks) return true;
		if (feature.layer_key.indexOf('key_0_1_1_')>=0) {
			if (key == '種別') return false;
		}
		// ヘリポート
		if (feature.layer_key.indexOf("key_0_1_9_0_0") >= 0 ) {
			if (key == '種別') {
				t_title = val;
				return true;
			}
		}

		// 
		if ( display_attrs ) {
			if ( display_attrs.indexOf(key) >= 0 ) {
				if ( t_key == "" ) {
					displayProps += "<tr><td colspan=2>" + t_val + "</td></tr>";
				} else {
					displayProps += "<tr><td>" + t_key + "</td><td>" + t_val + "</td></tr>";
				}
				flag = true;
			}
		} else {
			if ( t_key == "" ) {
				displayProps += "<tr><td colspan=2>" + t_val + "</td></tr>";
			} else {
				displayProps += "<tr><td>" + t_key + "</td><td>" + t_val + "</td></tr>";
			}
			flag = true;
		}
		// 避難所・避難場所のグループ見出し（この属性の次に差し込む）
		if (feature.layer_key.indexOf("key_0_1_1_") >= 0 ) {
			if ( t_key == "施設名") {
				displayProps += "<tr><td colspan=2>" + shitei_kinkyuu_hinan + "</td></tr>";
			}
			if ( t_key == "　　大規模な火事") {
				displayProps += "<tr><td colspan=2>" + "指定避難所" + "</td></tr>";
			}
		}
	});
	if ( feature.layer_key.indexOf("key_3_2_0_0_0") >= 0 || feature.layer_key.indexOf("key_2_3_0_0_0") >= 0) {
		displayProps += "<tr><td>" + keyname_tsunami + "</td><td>" + (olfPropsObj[keyname_tsunami] || "×") + "</td></tr>";
		displayProps += "<tr><td>" + keyname_earthquake + "</td><td>" + (olfPropsObj[keyname_earthquake] || "×") + "</td></tr>";
		displayProps += "<tr><td>" + keyname_windflood + "</td><td>" + (olfPropsObj[keyname_windflood] || "×") + "</td></tr>";
		if (olfPropsObj[remarks]) { displayProps += "<tr><td>" + remarks + "</td><td>" + (olfPropsObj[remarks] || " ") + "</td></tr>"; }

	}
	displayProps += "</tbody></table></div>";

	if ( !flag ) {
		displayProps = "";
	}
	
	//注釈表示
	var comment = (t_layer && t_layer.note) ? t_layer.note : "";
	if (comment != "") displayProps += '<div class="popup_comment">' + comment + '</div>';

	// 経路探索
	var dstLat, dstLng;
	if (bl != null) {
		dstLat = bl.flatCoordinates[1];
		dstLng = bl.flatCoordinates[0];
	}
	var btn_route_search = "<a href='javascript:void();' id='btn_route_search' onClick='app.routeSearch("+dstLat+","+dstLng+",this);'>" + bubble_route +"</a>";
	// 避難経路と矢印を除く
	if (["key_0_2_0_0_0","key_2_4_0_0_0","key_3_1_1_2_0","key_3_1_1_3_0"].indexOf(feature.layer_key) == -1 && feature.layer_key.indexOf("key_") >= 0 ) {
		displayProps += "<div class='route_search'>" + btn_route_search + "</>";
	}
	// 水位観測所(key_0_1_7_0_0)に水位グラフのURLを追加
	if (["key_0_1_7_0_0"].indexOf(feature.layer_key) == 0 ) {
		const graph_urls = {
			[nakadai] : "http://suibo.bousai.pref.chiba.lg.jp/bousaip/river/graph_65_0.html",
			[naruto] : "http://suibo.bousai.pref.chiba.lg.jp/bousaip/river/graph_30_0.html",
			[koseki] : "http://suibo.bousai.pref.chiba.lg.jp/bousaip/river/graph_13_0.html",
			[fudodo] : "http://suibo.bousai.pref.chiba.lg.jp/bousaip/river/graph_34_0.html",
			[kujune] : "http://suibo.bousai.pref.chiba.lg.jp/bousaip/river/graph_3_0.html"
		};
		const kansokujo_name = feature.getProperties()[kansokujo];
		console.log(graph_urls)
		if ( graph_urls[kansokujo_name] ) {
			displayProps += "<div class='graph_link'>" +
			"<a href='"+graph_urls[kansokujo_name]+"' target='_blank'>" + bubble_suii +"</a>"
			+"</a>";
		}
	}

	// max-heightは指定しない。
	//var maxh = $(app.olMapDiv).height() * 0.6;
	//$(app.popup_element).css("max-height", maxh + "px");
	//$(app.popup_element).children("#popup-content").css("max-height", "calc(" + maxh + "px - 1em)");
	//$(app.popup_element).children("#popup-content > div.table").css("max-height", "calc(" + maxh + "px - 1em)");
	$(app.popup_element).children("#popup-content").html('<div>' + displayProps + '</div>').show();
	// $(app.popup_element).children("#popup-title").html((t_layer && t_layer.title) ? t_layer.title : "").show();
	$(app.popup_element).children("#popup-title").html(t_title).show();
	if ( displayProps.length == 0 ) {
		// $(app.popup_element).children("#popup-content").html('<div style="text-align: center;">' + ((t_layer && t_layer.title) ? t_layer.title : "") + '</div>').show();
		$(app.popup_element).children("#popup-content").html('<div style="text-align: center;">' + (t_title) + '</div>').show();
		$(app.popup_element).children("#popup-title").hide();
		$("#popup").css("min-width","200px");
	}

	// サーチメニューを隠す
	$("#ctlSearchWindow").prop("state","off");
	$("#ctlSearchWindow > img").attr("src","images/btn_search.png").addClass("btn_off").removeClass("btn_on");
	$("#searchmenu").hide();

	// 背景地図ボタンを隠す
	$("#ctlBaseLayerSwitcher").prop("state","off");
	$("#ctlBaseLayerSwitcher > img").attr("src","images/baselayers.png").addClass("btn_off").removeClass("btn_on");
	if ($('#layerbox_1').length) $('#layerbox_1').css('display','none');
	if ($('#layerbox_2').length) $('#layerbox_2').css('display','none');
	if ($('#baselayerswitcher').length) $('#baselayerswitcher').css('display','none');
	if ($('#overlayerswitcher').length) $('#overlayerswitcher').css('display','none');

	return true;
};

// 経路探索
app.routeSearch = function(dstLat, dstLng, button){
	// console.log('dstLat:' + dstLat);
	// console.log('dstLng:' + dstLng);
	// ボタン連打防止
	$(button).prop('disabled', true);
	// Google Maps ルートURL
	var GOOGLEMAPS_ROUTE_URL = "https://www.google.com/maps/dir/?api=1";
	// Google Maps に渡すパラメータの作成
	// https://developers.google.com/maps/documentation/urls/get-started?hl=ja#directions-action
	var prm_gmap_route = "";

	// origin： 出発点（緯度,経度）
	// NOTE: デフォルトでは、デバイスの位置情報など、最も関連性の高い開始位置が設定されます。
	// NOTE: Google Maps で位置情報を使用するため、本サイトでの位置情報の許可は不要
	var org_latlng = [];
	if (app.geolocation.getPosition()) {
		org_latlng = ol.proj.transform(app.geolocation.getPosition(),"EPSG:3857", "EPSG:4326");
	}
	if (org_latlng.length == 2) {
		prm_gmap_route += "&origin=" + org_latlng[1] + "," + org_latlng[0];
	}
	// destination: 終点（緯度,経度）
	if (dstLat && dstLng) {
		prm_gmap_route += "&destination=" + dstLat + "," + dstLng;
	}
	// travelmode: 移動手段（'driving'|'walking'|'bicycling'）
	prm_gmap_route += '&travelmode=walking';
	// dir_action: navigate
	// NOTE: オリジンが利用できるかどうかに基づいて、ターンバイターン ナビゲーションまたは指定されたデスティネーションへのルート プレビューを起動します。
	// prm_gmap_route += '&dir_action=navigate';

	// 新規タブで表示
	// console.log(GOOGLEMAPS_ROUTE_URL + prm_gmap_route);
	window.open(GOOGLEMAPS_ROUTE_URL + prm_gmap_route);

	// ボタン活性化
	$(button).prop('disabled', false);
};


/**
 * ラインレイヤーに動く矢印を追加する
 * @param {*} line_layer ラインレイヤー
 * @param {*} interval 矢印の間隔[m]
 * @param {*} icon_url 矢印アイコン画像
 * @returns 作成したレイヤー
 * @description
 * convert -size 100x100 xc:transparent -fill "rgba(0,128,0,0.7)" -draw "path 'M 50,10 L 20,90 L 80,90 Z' " -resize 64x64 output.png

 */
app.initMovingMarkerLayer = function(
	line_layer,
	interval,
	icon_url
) {
	const point_off = 10;

	var arrow_style = new ol.style.Style({
		image: new ol.style.Icon({
			anchor: [0.5, 0.5],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			src: icon_url,
			scale: [0.5,0.5],
			opacity: 1.0,
			rotation: 0
		}),
	});

	var style_function = function (feature, resolution) {
		var geometry = feature.getGeometry();
		var geomtype = geometry.getType();
		var style = arrow_style.clone();
		if ( typeof feature.bearing != "undefined" ) {
			style.getImage().setRotation(
				((feature.bearing + 0 + 0) * Math.PI / 180)
			);
		}
		return style;
	};

	let new_layer = new ol.layer.Vector({
		name: "MovingMarkerLayer",
		declutter: false,
		source: new ol.source.Vector({}),
		style: style_function,
		zIndex : 1000,
		visible : false
	});

	app.layers["MovingMarkerLayer"] = new_layer;
	app.map.addLayer(new_layer);

	// 初期設定と同様にライン座標列を取得し、一定間隔ごとに点を発生させる。
	// NOTE: このとき、時間から算出したオフセット分をずらす
	function moveFeature(event) {
		// console.log(event);
		let layer = event.target;
		if ( !(layer.lastTime) ) return;
		let features = layer.getSource().getFeatures();
		const time = Date.now();
		
		for (let index = 0; index < features.length; index++) {
			const feature = features[index];
			feature.lastTime = feature.lastTime || layer.lastTime;
			const elapsedTime = time - feature.lastTime; // オフセット計算用
			let line_offset = feature.line_offset + (elapsedTime*0.001) * 100 * 2; // 1s -> 100m
			if ( true || (feature.line_id == 8 && feature.fno == 1) ) {

				let line_wgs84 = feature.line_wgs84;
				if ( feature.line_len <= line_offset + point_off ) {
					line_offset = point_off;
					feature.line_offset = point_off;
					feature.lastTime = Date.now();
				}
				let along = turf.along(line_wgs84, line_offset, {units: 'meters'});
				let lineSliceAlong = turf.lineSliceAlong(line_wgs84, line_offset-point_off, line_offset+point_off, {units: 'meters'});
				let coords = turf.getCoords(turf.toMercator(lineSliceAlong));
				feature.bearing = turf.bearing(turf.toWgs84(coords[0]), turf.toWgs84(coords[coords.length-1]));
				let coord = turf.getCoord(turf.toMercator(along));
				feature.getGeometry().setCoordinates(coord);
				let lon = coord[0];
				let lat = coord[1];
				// console.log(layer.lastTime, elapsedTime*0.001, line_offset, feature.bearing, coord);
			}

		}
		if ( layer.timer ) {
			clearInterval(layer.timer);
		}
		// NOTE: 作成済み図形の座標を変更し、再描画
		layer.timer = setInterval(() => {
			layer.changed();
		}, 1000);
	}
	new_layer.startAnimation = function() {
		new_layer.animating = true;
		new_layer.lastTime = new_layer.lastTime || Date.now(); // 基準時間
		new_layer.on('postrender', moveFeature);
	}
	new_layer.stopAnimation = function() {
		new_layer.animating = false;
		new_layer.un('postrender', moveFeature);
	}

	// NOTE: ラインレイヤーから座標列を取得し、一定間隔ごとに点を発生させる
	new_layer.line_features = line_layer.getSource().getFeatures();
	// console.log(new_layer.line_features);
	for (let index = 0; index < new_layer.line_features.length; index++) {
		const line_feature = new_layer.line_features[index];
		const coordinates = line_feature.getGeometry().getCoordinates();
		let line_id = line_feature.get("Id");
		// console.log(coordinates);
		for (let j = 0; j < coordinates.length; j++) {
			let line = turf.lineString(coordinates[j]);
			let line_wgs84 = turf.toWgs84(line);
			// console.log(line_wgs84);
			let line_len = turf.length(line_wgs84, {units: 'meters'});
			// console.log(line_len);
			let fno = 0;
			for (let l = interval; l < line_len - point_off; l += interval) {
				fno++;
				let along = turf.along(line_wgs84, l, {units: 'meters'});
				// console.log(along);
				let lineSliceAlong = turf.lineSliceAlong(line_wgs84, l-point_off, l+point_off, {units: 'meters'});
				let coords = turf.getCoords(turf.toMercator(lineSliceAlong));
				// console.log(coords);
				// bearing in decimal degrees, between -180 and 180 degrees (positive clockwise, the north is 0 degrees)
				let bearing = turf.bearing(turf.toWgs84(coords[0]), turf.toWgs84(coords[coords.length-1]));
				// console.log(bearing);
				let coord = turf.getCoord(turf.toMercator(along));
				let lon = coord[0];
				let lat = coord[1];
				let feature = new ol.Feature({
					geometry: new ol.geom.Point([lon, lat]),
				});
				feature.line_wgs84 = line_wgs84; // 発生元のライン座標列
				feature.line_len = line_len;
				feature.line_offset = l; // 起点からの距離[m]
				feature.line_id = line_id; // 発生元ラインの属性(Id)
				feature.fno = fno;
				feature.layer_key = "";
				feature.zIndex = 0;
				feature.bearing = bearing;
				feature.set("bearing", bearing);
				new_layer.getSource().addFeature(feature);
			}
		}
	}

	new_layer.on("change:visible",function(evt){
		// console.log(evt);
		let layer = evt.target;
		if ( layer.getVisible() ) {
			layer.startAnimation();
		} else {
			layer.stopAnimation();
		}
	});
	setTimeout(function(){
		new_layer.setVisible(line_layer.getVisible());
	},1000);

	return new_layer;
};
