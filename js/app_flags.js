// 各種フラグ定義
// GoogleMapsモード（true: 有効, false: 無効）
var ENABLE_GOOGLEMAPS = false; // 確認用サイトでは Google Maps を使わない

// UTFGrid（浸水深数値表示）モード（true: 有効, false: 無効）
var ENABLE_UTFGRID = true;



app.ICON_ROOT = "data/icon/";
app.GEOJSON_ROOT = "data/geojson/";
app.TILE_ROOT = "data/tiles/";
// app.TILE_ROOT = "https://www.hazard-map-kujukuri.jp/data/tiles/";
// app.TILE_ROOT = "https://app-geoserver-1.mapweb.jp/kujukurihm/tiles/";
// app.TILE_ROOT = "https://d1w9kqu3i433nd.cloudfront.net/data/tiles/";
app.GWC_ROOT = app.TILE_ROOT;

// 指定ツリー除外モード（true: 除外する, false: 除外しない）
var EXCLUDE_PARENT_TREES = false;
// 除外するツリーの key（最上位階層）　※ app.TREE_0（共通）は除く
var EXCLUDE_PARENT_KEYS = ['key_x_x_x_x_x',''];    // シミュレーションレイヤー


// 浸水想定区域レイヤー要素
// 1, '#F7F5A9',
// 2, '#FFD8C0',
// 3, '#FFB7B7',
// 4, '#FF9191',
// 5, '#F285C9',
// 6, '#DC7ADC')];
app.shinsui_keys = [
	"key_3_1_1_1_0",
	"key_3_1_2_1_0",
];
app.shinsui_max_keys = [
	"key_3_1_1_0_0",
	"key_3_1_1_1_0",
	"key_3_1_1_2_0",
	"key_3_1_1_3_0",
];
app.shinsui_plan_keys = [
	"key_3_1_2_0_0",
	"key_3_1_2_1_0",
];
// 浸水深
app.shinsuishin_keys = [
]
// 浸水継続時間
// 1, '#a0d2ff',
// 2, '#0041ff',
// 3, '#faf500',
// 4, '#ff9900',
// 5, '#ff2800',
// 6, '#b40068')];
app.shinsuikeizoku_jikan_keys = [
];

// 浸水想定区域レイヤーの親要素
app.shinsui_root_keys = [
	"key_2_1_0_0_0",
	"key_3_1_0_0_0",
];

// シミュレーションレイヤーの親要素
app.simulation_root_keys = [
];

// シミュレーションレイヤー要素
app.simulation_keys = [
];
// シミュレーション破堤点レイヤー要素
app.simulation_breakpoint_keys = [
];

// 土砂災害特別警戒区域, 土砂災害警戒区域
app.dosya_keys = [
];
// 内水氾濫 浸水想定範囲
app.naisui_shinsui_keys = [
];
// 内水氾濫	家屋浸水箇所
app.kaokushinsui_keys = [
];
// 内水氾濫	道路冠水箇所
app.dourokansui_keys = [
];
// 家屋倒壊等氾濫想定区域
// 家屋倒壊
app.kaokutoukai_keys = [
	"key_3_1_1_2_0",
	"key_3_1_1_3_0",
];
// 家屋倒壊 tree
app.kaokutoukai_tree_keys = [
];
// 家屋倒壊(氾濫流)
app.kaokutoukai_hanran_keys = [
];
// 家屋倒壊(河岸侵食)
app.kaokutoukai_kagan_keys = [
];
// 家屋倒壊 ol layers
app.kaokutoukai_layer_keys = [
];
// 家屋倒壊等氾濫想定区域 (end)

// 津波 浸水想定範囲
app.tsunami_shinsui_keys = [
	"key_2_1_1_0_0",
	"key_2_1_2_0_0",
	"key_2_1_3_0_0",
	"key_2_1_4_0_0",
	"key_2_1_5_0_0",
	"key_2_1_6_0_0",
	"key_2_1_7_0_0",
];

// 施設
app.facilities_keys = [
	"key_0_1_1_0_0",
	"key_0_1_2_0_0",
	"key_0_1_3_0_0",
	"key_0_1_4_0_0",
	"key_0_1_5_0_0",
	"key_0_1_6_0_0",
	"key_0_1_7_0_0",
];

// OpenLayers Overlays
app.OL_LAYER_0=[ // 共通														
														
{title:town_office,key:'key_0_1_1_0_0',	geomtype:'point',	url:'town_hall.geojson',	icon:app.ICON_ROOT+'town_hall.png',scale:1,				visible:false,		zIndex:1016,					},
{title:kujukuri_hospital,key:'key_0_1_2_0_0',	geomtype:'point',	url:'kujukuri_hospital.geojson',	icon:app.ICON_ROOT+'kujukuri_hospital.png',scale:1,				visible:false,		zIndex:1016,					},
{title:police,key:'key_0_1_3_0_0',	geomtype:'point',	url:'police_box.geojson',	icon:app.ICON_ROOT+'police_box.png',scale:1,				visible:false,		zIndex:1015,					},
{title:fire_station,key:'key_0_1_4_0_0',	geomtype:'point',	url:'fire_station.geojson',	icon:app.ICON_ROOT+'fire_station.png',scale:1,				visible:false,		zIndex:1014,					},
{title:kodomoen,key:'key_0_1_5_0_0',	geomtype:'point',	url:'kodomoen.geojson',	icon:app.ICON_ROOT+'kodomoen.png',scale:1,				visible:false,		zIndex:1013,					},
{title:bousai_musen,key:'key_0_1_6_0_0',	geomtype:'point',	url:'disaster_radio.geojson',	icon:app.ICON_ROOT+'disaster_radio.png',scale:1,				visible:false,		zIndex:1012,					},
{title:suii_kansokuzyo,key:'key_0_1_7_0_0',	geomtype:'point',	url:'waterlevel_observatory.geojson',	icon:app.ICON_ROOT+'waterlevel_observatory.png',scale:1,				visible:false,		zIndex:1011,					},
{title:kujukuri_machi,key:'key_0_2_0_0_0',	geomtype:'polygon',	url:'kujukuri_area.geojson',			stroke:'rgba(0,0,0,0.3)',width:10,fill:'FALSE',		visible:true,		zIndex:60,	attr_name:'名称',			srcSrid:'EPSG:4612',	},
];app.OL_LAYER_1=[ // 防災マップ														
];app.OL_LAYER_2=[ // 津波ハザードマップ														
														
{title:tsunami_law,key:'key_2_1_1_0_0',	geomtype:'tile',	url:'tsunami_shinsui',				template:'png/tsunami_shinsui/{z}/{x}/{-y}.png',	visible:false,		zIndex:101,					},
{title:ootsunami_10m,key:'key_2_1_2_0_0',	geomtype:'tile',	url:'tsunami_10',				template:'png/tsunami_10/{z}/{x}/{-y}.png',	visible:true,		zIndex:101,					},
{title:ootsunami_5m ,key:'key_2_1_3_0_0',	geomtype:'tile',	url:'tsunami_05',				template:'png/tsunami_05/{z}/{x}/{-y}.png',	visible:false,		zIndex:101,					},
{title:tsunami_3m ,key:'key_2_1_4_0_0',	geomtype:'tile',	url:'tsunami_03',				template:'png/tsunami_03/{z}/{x}/{-y}.png',	visible:false,		zIndex:101,					},
{title:takashio_shinsui,key:'key_2_1_5_0_0',	geomtype:'tile',	url:'takashio_shinsui',				template:'png/takashio_shinsui/{z}/{x}/{-y}.png',	visible:false,		zIndex:101,					},
{title:nihon_kaikou,key:'key_2_1_6_0_0',	geomtype:'tile',	url:'nihonkaiko',				template:'png/nihonkaiko/{z}/{x}/{-y}.png',	visible:false,		zIndex:101,					},
{title:chishima_kaikou,key:'key_2_1_7_0_0',	geomtype:'tile',	url:'chishimakaiko',				template:'png/chishimakaiko/{z}/{x}/{-y}.png',	visible:false,		zIndex:101,					},
														
{title:shitei_kinkyuu_hinan,key:'key_2_2_1_0_0',	geomtype:'point',	url:'hinanjo.geojson',	icon:app.ICON_ROOT+'shiteihinan_kinkyuu-2.png',scale:0.5,				visible:true,	conditions:keyname_tsunami +"=○",	zIndex:1105,					},
{title:tsunami_building,key:'key_2_2_2_0_0',	geomtype:'point',	url:'hinanjo.geojson',	icon:app.ICON_ROOT+'shiteihinan_building.png',scale:0.5,				visible:true,	conditions:remarks + "=" + tsunami_building,	zIndex:1104,					},
{title:tsunami_tower,key:'key_2_2_3_0_0',	geomtype:'point',	url:'hinanjo.geojson',	icon:app.ICON_ROOT+'shiteihinan_tower.png',scale:0.5,				visible:true,	conditions:remarks + "=" + tsunami_tower,	zIndex:1103,					},
{title:shelter,key:'key_2_3_0_0_0',	geomtype:'point',	url:'hinanjo.geojson',	icon:app.ICON_ROOT+'hinanjo.png',scale:1,				visible:false,	conditions: shelter + "=○",	zIndex:1102,					},
{title:tsunami_hinanroad,key:'key_2_4_0_0_0',	geomtype:'line',	url:'hinan_road.geojson',		stroke:'rgba(0,128,0,0.7)',width:3,			visible:true,		zIndex:1101,					},
];app.OL_LAYER_3=[ // 洪水ハザードマップ														
														
														
{title:shinsui_soutei_map,key:'key_3_1_1_1_0',	geomtype:'tile',	url:'flood_shinsui_max',				template:'png/flood_shinsui_max/{z}/{x}/{-y}.png',	visible:true,		zIndex:101,					},
{title:kaokutoukai_kaganshinsyoku,key:'key_3_1_1_2_0',	geomtype:'polygon',	url:'flood-kaoku-kagan.geojson',			stroke:'rgb(233, 0, 0)',width:2,fill:'rgba(233, 0, 0, 0.1)',		visible:true,		zIndex:101,					},
{title:kaokutoukai_hanranryu,key:'key_3_1_1_3_0',	geomtype:'polygon',	url:'flood-kaoku-hanranryuu.geojson',			stroke:'rgb(0, 66, 199)',width:2,fill:'rgba(0, 66, 199, 0.1)',		visible:true,		zIndex:101,					},
														
{title:shinsui_soutei_map,key:'key_3_1_2_1_0',	geomtype:'tile',	url:'flood_shinsui_plan',				template:'png/flood_shinsui_plan/{z}/{x}/{-y}.png',	visible:false,		zIndex:101,					},
{title:siteihinan_and_hinan,key:'key_3_2_0_0_0',	geomtype:'point',	url:'hinanjo.geojson',	icon:app.ICON_ROOT+'shiteihinan_kinkyuu-3.png',scale:1,				visible:false,	conditions:keyname_windflood + "=○",	zIndex:1102,					},
];														
														



// tree
;app.TREE_0=[ // 共通			
{title:bousai_shisetsu,key:'key_0_1_0_0_0',	icon:false,	folder:false,expanded:true,selected:true,extraClasses:"",	children:[
{title:town_office,key:'key_0_1_1_0_0',	icon:app.ICON_ROOT+'town_hall.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:kujukuri_hospital,key:'key_0_1_2_0_0',	icon:app.ICON_ROOT+'kujukuri_hospital.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:police,key:'key_0_1_3_0_0',	icon:app.ICON_ROOT+'police_box.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:fire_station,key:'key_0_1_4_0_0',	icon:app.ICON_ROOT+'fire_station.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:kodomoen,key:'key_0_1_5_0_0',	icon:app.ICON_ROOT+'kodomoen.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:bousai_musen,key:'key_0_1_6_0_0',	icon:app.ICON_ROOT+'disaster_radio.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:suii_kansokuzyo,key:'key_0_1_7_0_0',	icon:app.ICON_ROOT+'waterlevel_observatory.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
],},				
];app.TREE_1=[ // 防災マップ			
];app.TREE_2=[ // 津波ハザードマップ			
{title:shinsui_soutei_map,key:'key_2_1_0_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"hide_checkbox",	children:[
{title:tsunami_law,key:'key_2_1_1_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:ootsunami_10m,key:'key_2_1_2_0_0',	icon:false,	folder:false,expanded:true,selected:true,extraClasses:"",	},
{title:ootsunami_5m,key:'key_2_1_3_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:tsunami_3m,key:'key_2_1_4_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:takashio_shinsui,key:'key_2_1_5_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:nihon_kaikou,key:'key_2_1_6_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:chishima_kaikou,key:'key_2_1_7_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	},
],},	{title:shitei_kinkyuu_hinan,key:'key_2_2_0_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	children:[
{title:shitei_kinkyuu_hinan,key:'key_2_2_1_0_0',	icon:app.ICON_ROOT+'shiteihinan_kinkyuu-2.png',	folder:false,expanded:true,selected:true,extraClasses:"",	},
{title:tsunami_building,key:'key_2_2_2_0_0',	icon:app.ICON_ROOT+'shiteihinan_building.png',	folder:false,expanded:true,selected:true,extraClasses:"",	},
{title:tsunami_tower,key:'key_2_2_3_0_0',	icon:app.ICON_ROOT+'shiteihinan_tower.png',	folder:false,expanded:true,selected:true,extraClasses:"",	},
],},	{title:shelter,key:'key_2_3_0_0_0',	icon:app.ICON_ROOT+'hinanjo.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
{title:tsunami_hinanroad,key:'key_2_4_0_0_0',	icon:app.ICON_ROOT+"hinan_road.png",	folder:false,expanded:true,selected:true,extraClasses:"",	},
];app.TREE_3=[ // 洪水ハザードマップ			
{title:shinsui_soutei_map_etc,key:'key_3_1_0_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"hide_checkbox",	children:[
{title:soutei_max,key:'key_3_1_1_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	children:[
{title:shinsui_soutei_map,key:'key_3_1_1_1_0',	icon:false,	folder:false,expanded:true,selected:true,extraClasses:"",	},
{title: kaokutoukai_kaganshinsyoku,key:'key_3_1_1_2_0',	icon:false,	folder:false,expanded:true,selected:true,extraClasses:"",	},
{title:kaokutoukai_hanranryu,key:'key_3_1_1_3_0',	icon:false,	folder:false,expanded:true,selected:true,extraClasses:"",	},
],},	{title:planning_scale,key:'key_3_1_2_0_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	children:[
{title:shinsui_soutei_map,key:'key_3_1_2_1_0',	icon:false,	folder:false,expanded:true,selected:false,extraClasses:"",	},
],},],},	{title:siteihinan_and_hinan,key:'key_3_2_0_0_0',	icon:app.ICON_ROOT+'shiteihinan_kinkyuu-3.png',	folder:false,expanded:true,selected:false,extraClasses:"",	},
			
];				




// 施設検索のリストを指定通りの順にするための設定
app.listsort_keys = [
];

app.name2sortkey = {
}
;

// 避難所種別対応表
// no : type
app.xxx_hinanjo_types = {

	
}
;

//番号:施設名,地震,洪水,大規模な火事,指定避難所（水害時）,所在地,地区
app.xxx_hinanjo_attrs = {
};

