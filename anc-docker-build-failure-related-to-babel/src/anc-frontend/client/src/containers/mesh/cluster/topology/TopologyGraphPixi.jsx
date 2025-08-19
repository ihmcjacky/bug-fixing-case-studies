import store from "../../../../redux/store";
import {toggleLockLayer} from "../../../../redux/common/commonActions";
import {useSelector, useDispatch} from "react-redux";

import Cookies from "js-cookie";

import React, {useEffect, useRef} from "react";

import ClickAwayListener from "@material-ui/core/ClickAwayListener";

//import {getNodeIconImage} from "./topologyGraphHelperFunc";
import {curveMap} from "./topologyGraphHelperFunc";
import {convertIpToMac, getBitRate} from "../../../../util/formatConvertor";
import {searchNodeStatus} from "../../../../util/common";

import * as PIXI from "pixi.js";
import {Bezier} from "bezier-js";
import Constant from "../../../../constants/common";

import {create_context_menu} from "./topologyGraphContextMenuPixi";

// behavior toggles
const disable_hidpi = false;
const render_moving_links = false;

// constant sizes and colors
const node_circle_radius = 20;
const node_circle_cut_radius = 16;
const anm_node_stroke_width = 2;
const anm_node_fill_color = 0xf1f1f1;
const anm_node_stroke_color = 0x122d54;
const reachable_node_fill_color = 0x122d54;
const unreach_node_fill_color = 0xdc4639;
const unmanaged_node_fill_color = 0x9c9c9c;
const node_label_text_size = 11;
const node_icon_width = 20;
const anm_node_icon_width = 32;
const topology_background_color = 0xe5e5e5;
const link_dot_width = 6;
const link_stroke_width = 2;
const adjust_handle_length = 64;
const adjust_handle_width = 8;
const adjust_handle_color = 0x122d54;
const mdop_background_color = 0x8994a9;
const main_container_min_scale = 0.2;
const main_container_max_scale = 2;

// zindice on the topology map
const hitbox_zindex = 100;
const background_zindex = 200;
const background_interactive_zindex = 300;
const link_zindex = 400;
const node_zindex = 500;
const clicked_node_zindex = 601;
const mdop_zindex = 700;
const card_zindex = 800;
const menu_zindex = 900;

const prepare_main_context_menu = (render_context, base, entry, showFullNodeMenu) => {
    const tab_index = {
        "info":0,
        "statistic":1,
        "settings":2,
        "maintenance":3,
        "security":4
    }
    const get_global_pointer_position = () => {
        return render_context.global_pointer_move_event.global;
    }
    base.anywhere_ext.context_menu = create_context_menu(
        render_context,
        [
            {
                icon_key: "info",
                tool_tip: render_context.translator("info"),
                callback: () => {
                    render_context.node_open_info_window_cb(entry.id, tab_index["info"], get_global_pointer_position());
                },
                submenu: [], 
            },
            {
                icon_key: "statistic",
                tool_tip: render_context.translator("statistic"),
                callback: () => {
                    render_context.node_open_info_window_cb(entry.id, tab_index["statistic"], get_global_pointer_position());
                },
                submenu: [],
                disabled: !showFullNodeMenu
            },
            {
                icon_key: "settings",
                tool_tip: render_context.translator("settings"),
                callback: () => {
                    render_context.node_open_info_window_cb(entry.id, tab_index["settings"], get_global_pointer_position());
                },
                submenu: [],
            },
            {
                icon_key: "maintenance",
                tool_tip: render_context.translator("maintenance"),
                callback: () => {
                    render_context.node_open_info_window_cb(entry.id, tab_index["maintenance"], get_global_pointer_position());
                },
                submenu: [],
                disabled: !showFullNodeMenu
            },
            {
                icon_key: "security",
                tool_tip: render_context.translator("security"),
                callback: () => {
                    render_context.node_open_info_window_cb(entry.id, tab_index["security"], get_global_pointer_position());
                },
                submenu: [],
                disabled: !showFullNodeMenu
            },
            {
                icon_key: "networkTools",
                tool_tip: render_context.translator("networkTools"),
                disabled: !showFullNodeMenu,
                submenu: [
                    {
                        icon_key: "linkalignment",
                        tool_tip: render_context.translator("linkalignment"),
                        callback: () => {
                            render_context.node_link_alignment_cb(entry.id);
                        },
                        submenu: []
                    },
                    {
                        icon_key: "spectrumscan",
                        tool_tip: render_context.translator("spectrumscan"),
                        callback: () => {
                            render_context.node_spectrum_scan_cb(entry.id);
                        },
                        submenu: []
                    },
                    {
                        icon_key: "noderecovery",
                        tool_tip: render_context.translator("noderecovery"),
                        callback: () => {
                            render_context.node_recovery_cb(entry.id);
                        },
                        submenu: []
                    },
                ]
            }
        ],
        250
    );
    if(base.anywhere_ext.context_menu === false){
        setTimeout(prepare_main_context_menu, 100);
    }
};

export const networkGraphHandler = {
    zoomToFit: () => {},
    moveNode: () => {},
    moveToCenter: () => {},
    nodesPos: {},
    background: {},
    image: {},
    capture: () => {},
    zoomToNode: () => {},
};
export const adjustModeHandler = {
    getImageCenterPos: () => {},
    adjustMapReset: () => {},
    backgroundTemp: {},
    adjustMapOpacity: () => {},
    fixDimensionView: () => {},
    setViewport: () => {},
    resetToDefault: () => {},
    resetMapSize: () => {},
    setBackgroundColor: () => {},
    resizeOnDrag: {
        dragged: false,
        position: '',
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        imageX: 0,
        imageY: 0,
    },
    nodesStartPos: {},
};

export function shouldShowFullNodeMenu(isReachable, isAuth) {
    if (!isReachable) return false;
    if (isAuth !== 'yes') return false;
    return true;
}

const animate_pan_scale = (new_location, new_scale, render_context, done_cb) => {
    const main_container = render_context.main_container;
    const app = render_context.app;
    const panning_lock = render_context.panning_lock;

    const old_location = {x:main_container.x, y:main_container.y};
    const old_scale = main_container.scale.x;
    const scale_diff = new_scale - old_scale;
    const x_diff = new_location.x - old_location.x;
    const y_diff = new_location.y - old_location.y;

    panning_lock.eventMode = "none";
    const animated_pan_time_ms = 500;

    let animation_time = 0;
    const animate = (time) => {
        animation_time += time.deltaMS;
        if(animation_time >= animated_pan_time_ms){
            app.ticker.remove(animate);
            main_container.x = new_location.x;
            main_container.y = new_location.y;
            main_container.scale = new_scale;
            let background = render_context.background;
            if(background === undefined){
                background = {};
                render_context.background = background;
            }
            let wrapper_style = render_context.background.wrapperStyle;
            if(wrapper_style === undefined){
                wrapper_style = {};
                render_context.background.wrapperStyle = wrapper_style;
            }
            const end_task = () => {
                panning_lock.eventMode = "passive";
                wrapper_style.scale = new_scale;
                wrapper_style.translate = {x:new_location.x, y:new_location.y};
                render_context.update_pan_zoom_cb(render_context.node_pos_ref, render_context.background);
                done_cb();
            }
            setTimeout(end_task, 0);
            return;
        }
        const progress = animation_time / animated_pan_time_ms;
        main_container.scale = old_scale + scale_diff * progress;
        main_container.x = old_location.x + x_diff * progress;
        main_container.y = old_location.y + y_diff * progress;
    }
    app.ticker.add(animate);
}

const create_texture_from_img_svg = (html_image, resolution) => {
    const canvas = document.createElement("canvas");
    const orig_width = html_image.width;
    const orig_height = html_image.height;
    const width = html_image.width * resolution;
    const height = html_image.height * resolution;
    html_image.width = width;
    html_image.height = height;
    canvas.width = width;
    canvas.height = height;
    const canvas_ctx = canvas.getContext("2d");
    canvas_ctx.drawImage(html_image, 0, 0, width, height);

    html_image.width = orig_width;
    html_image.height = orig_height;

    return PIXI.Texture.from(canvas);
}

const deploy_leave_hitbox = (render_context, on_leave) => {
    const leave_hitbox = new PIXI.Graphics();
    leave_hitbox.zIndex = menu_zindex;
    leave_hitbox.eventMode = "static";
    render_context.main_container.addChild(leave_hitbox);
    const position_leave_hitbox = () => {
        const device_pixel_ratio = render_context.device_pixel_ratio === undefined? 1: render_context.device_pixel_ratio;
        leave_hitbox.clear();
        //leave_hitbox.rect(0, 0, window.screen.width / render_context.main_container.scale.x, window.screen.height / render_context.main_container.scale.y);
        //leave_hitbox.fill({color:0x000000});
        leave_hitbox.hitArea = new PIXI.Rectangle(0, 0, window.screen.width / render_context.main_container.scale.x / device_pixel_ratio * 2 , window.screen.height / render_context.main_container.scale.y / device_pixel_ratio * 2);
        const main_container_position = render_context.main_container.toLocal({x:0, y:0});
        leave_hitbox.x = main_container_position.x;
        leave_hitbox.y = main_container_position.y;
    }
    window.addEventListener("resize", position_leave_hitbox);

    const cleanup_order = ["resize", position_leave_hitbox];

    let dangling_window_events = render_context.dangling_window_events;
    if(dangling_window_events === undefined){
        dangling_window_events = [];
        render_context.dangling_window_events = dangling_window_events;
    }
    dangling_window_events.push(cleanup_order);

    position_leave_hitbox();
    const leave_cb = (e, fire_cb = true) => {
        window.removeEventListener("resize", position_leave_hitbox);
        const remove_index = dangling_window_events.indexOf(cleanup_order);
        if(remove_index <= 0){
            dangling_window_events.splice(remove_index, 1);
        }
        render_context.main_container.removeChild(leave_hitbox);
        if(fire_cb){
            on_leave();
        }
    }
    leave_hitbox.onpointerdown = leave_cb;
    leave_hitbox.onwheel = leave_cb;

    return leave_cb;
}

const get_main_container_center = (render_context, with_background) => {
    if(render_context.app === undefined){
        return;
    }

    const get_center = () => {
        const bounds = render_context.main_container.getBounds();
        const local_left = render_context.main_container.toLocal({x:bounds.left, y:0}).x;
        const local_right = render_context.main_container.toLocal({x:bounds.right, y:0}).x;
        const local_top = render_context.main_container.toLocal({x:0, y:bounds.top}).y;
        const local_bottom = render_context.main_container.toLocal({x:0, y:bounds.bottom}).y;
        return {x:(local_left + local_right) / 2, y:(local_top + local_bottom) / 2};
    }

    if(with_background){
        return get_center();
    }

    let background_adjust_actor = render_context.background_adjust_actor;
    let reinsert_background_adjust_actor = background_adjust_actor !== undefined && background_adjust_actor.parent === render_context.main_container;

    let background_actor = render_context.background_actor;
    let reinsert_background_actor = background_actor !== undefined && background_actor.parent === render_context.main_container;

    if(reinsert_background_adjust_actor){
        render_context.main_container.removeChild(background_adjust_actor);
    }
    if(reinsert_background_actor){
        render_context.main_container.removeChild(background_actor);
    }

    const center = get_center();

    if(reinsert_background_adjust_actor){
        render_context.main_container.addChild(background_adjust_actor);
    }
    if(reinsert_background_actor){
        render_context.main_container.addChild(background_actor);
    }

    return center;
}

const background_render_snapshots_equal = (lhs, rhs) => {
    return lhs.width === rhs.width &&
        lhs.height === rhs.height &&
        lhs.url === rhs.url
}

const create_background_render_snapshot = (width, height, url) => {
    return {
        width:width,
        height:height,
        url:url,
    }
}

const background_image_cache = {
    url:"",
    texture:null
}
const create_background_graphics = (width, height, url) => {
    const snapshot = create_background_render_snapshot(width, height, url);

    // create a graphics object and fill the background when ready
    const sprite = new PIXI.Sprite();
    sprite.width = width;
    sprite.height = height;

    let tries = 0;
    if(url !== null){
        const load_image = () => {
            // does not work with release nwjs
            /*
            PIXI.Assets.load({
                src:url,
                loadParser:"loadTextures"
            }).then((resolved_asset) => {
                sprite.texture = resolved_asset;
            }).catch(() => {
                if(tries < 5){
                    tries++;
                    setTimeout(load_image, 1000);
                }
            });
            */
            const img = new Image();
            img.onerror = () => {
                if(tries < 5){
                    tries++;
                    setTimeout(load_image, 1000);
                }
            }
            img.onload = () => {
                const texture = PIXI.Texture.from(img);
                sprite.texture = texture;
                background_image_cache.texture = texture;
                background_image_cache.url = url;
            }
            img.src = url;
        };
        if(url !== background_image_cache.url){
            load_image();
        }else{
            sprite.texture = background_image_cache.texture;
        }
    }

    return {
        snapshot:snapshot,
        image_sprite:sprite
    }
}

const create_link_render_snapshot = (from, to, status, type, link_index, total_link, band, channel, frequency, channel_bandwidth, speed, color) => {
    return {
        from:from,
        to:to,
        status:status,
        type:type,
        link_index:link_index,
        total_link:total_link,
        band:band,
        channel:channel,
        frequency:frequency,
        channel_bandwidth:channel_bandwidth,
        speed:speed,
        color:color,
    };
}

const link_render_snapshots_equal = (lhs, rhs) => {
    return lhs.from.x === rhs.from.x &&
        lhs.from.y === rhs.from.y &&
        lhs.from.device === rhs.from.device &&
        lhs.to.x === rhs.to.x &&
        lhs.to.y === rhs.to.y &&
        lhs.to.device === rhs.to.device &&
        lhs.status === rhs.status &&
        lhs.type === rhs.type &&
        lhs.link_index === rhs.link_index &&
        lhs.total_link === rhs.total_link &&
        lhs.band === rhs.band &&
        lhs.channel === rhs.channel &&
        lhs.frequency === rhs.frequency &&
        lhs.channel_bandwidth === rhs.channel_bandwidth &&
        lhs.speed === rhs.speed &&
        lhs.color === rhs.color;
}

const device_short_form = {
    radio0: 'R0',
    radio1: 'R1',
    radio2: 'R2',
    eth0: 'ETH0',
    eth1: 'ETH1',
    unmanaged: '-',
    undefined: '-',
};

const draw_bezier_curve_on_graphics = (graphics, bezier, width, color, alpha, dot_width) => {
    const start_point = bezier.get(0.0);
    const bezier_length = bezier.length();
    graphics.moveTo(start_point.x, start_point.y);
    if(dot_width === 0){
        const dots = Math.ceil(bezier_length / 4);
        for(let i = 0;i < dots; i++){
            const seg = i / dots;
            const point = bezier.get(seg);
            graphics.lineTo(point.x, point.y);
        }
        graphics.stroke({color: color, width: width, alpha: alpha});
    }else{
        const dots = bezier_length / dot_width;
        for(let i = 0;i < dots; i++){
            const seg = i / dots;
            const point = bezier.get(seg);
            if(i % 2 == 0){
                graphics.moveTo(point.x, point.y);
            }else{
                graphics.lineTo(point.x, point.y);
            }
        }
        graphics.stroke({color: color, width: width, alpha: alpha, cap:"round"});
    }
}

const create_link_graphics = (from, to, status, type, link_index, total_link, band, channel, frequency, channel_bandwidth, speed, color, renderer, show_link_label, old_render_elements) => {
    let ret = {};
    ret.snapshot = create_link_render_snapshot(from, to, status, type, link_index, total_link, band, channel, frequency, channel_bandwidth, speed, color);

    let left = from;
    let right = to;
    if(from.x > to.x){
        left = to
        right = from
    }

    let link_description = "";
    if(type === "RadioLink"){
        if(band === "5"){
            link_description = `CH ${channel} ${frequency}`;
        }else{
            link_description = `${frequency}`;
        }
    }else{
        link_description = getBitRate(speed);
    }
    const left_device = device_short_form[left.device] !== undefined? device_short_form[left.device]: left.device
    const right_device = device_short_form[right.device] !== undefined? device_short_form[right.device]: right.device

    let link_label_text = `${left_device} --- ${link_description} --- ${right_device}`;

    if (left.device === 'unmanaged' && right.device === 'unmanaged') {
        link_label_text = `---`;
    }

    const mid_point = {
        x:right.x + (left.x - right.x) / 2,
        y:right.y + (left.y - right.y) / 2
    };

    const x_diff = right.x - left.x;
    const y_diff = right.y - left.y;
    const angle_off_horizontal = Math.atan(y_diff / x_diff);
    const angle_off_vertical = angle_off_horizontal - Math.PI / 2;
    const r = curveMap[total_link - 1][link_index] * 5;
    const x_offset = r * Math.cos(angle_off_vertical) * -1;
    const y_offset = r * Math.sin(angle_off_vertical) * -1;

    const bezier_control_point = {
        x: mid_point.x + x_offset,
        y: mid_point.y + y_offset
    };

    // memory optimization
    let curve = null;
    if(old_render_elements !== undefined){
        curve = old_render_elements.curve;
        curve.clear();
        curve.removeChildren();
    }else{
        curve = new PIXI.Graphics();
    }
    curve.zIndex = 1;
    // used by both the line and the text
    const bezier = new Bezier(left.x, left.y, bezier_control_point.x, bezier_control_point.y, right.x, right.y);
    ret.bezier = bezier;
    draw_bezier_curve_on_graphics(curve, bezier, link_stroke_width, color, 1.0, type === "RadioLink"? link_dot_width: 0);
    // enlarge the hitbox
    draw_bezier_curve_on_graphics(curve, bezier, 16, color, 0.0, 0);
    const curve_length = bezier.length();
    ret.curve = curve;

    /*
    const point_debug = new PIXI.Graphics();
    point_debug.circle(0, 0, 10);
    point_debug.fill(0xff0000);
    point_debug.x = bezier_control_point.x
    point_debug.y = bezier_control_point.y
    curve.addChild(point_debug);
    */

    if(type !== "A-NM" && show_link_label){
        let link_label = null;
        let link_label_changed = false;
        if(old_render_elements !== undefined && old_render_elements.link_label !== undefined && old_render_elements.link_label_text === link_label_text){
            link_label = old_render_elements.link_label;
        }else{
            link_label_changed = true;
            link_label = new PIXI.Text({
                style:new PIXI.TextStyle({
                    fontFamily:"Arial",
                    fontSize: node_label_text_size,
                    fontWeight: "bold",
                    align:"center",
                    stroke: { color: '#ffffff', width: 5, join: 'round' },
                    roundPixels: false
                }),
                text:link_label_text,
                resolution: 2
            });
        }
        ret.link_label_text = link_label_text;
        ret.link_label = link_label;

        if((link_label.width + 40) < curve_length){
            let render_texture = null;
            if(old_render_elements !== undefined && old_render_elements.render_texture !== undefined){
                render_texture = old_render_elements.render_texture;
                if(link_label_changed){
                    render_texture.resize(link_label.width, link_label.height, 2);
                }
            }else{
                render_texture = new PIXI.RenderTexture();
                render_texture.resize(link_label.width, link_label.height, 2);
                link_label_changed = true;
            }
            if(link_label_changed){
                renderer.render(link_label, {renderTexture: render_texture})
            }
            ret.render_texture = render_texture;

            const length_ratio = link_label.width / curve_length;
            const start_ratio = 0.5 - length_ratio / 2;
            const end_ratio = 0.5 + length_ratio / 2;
            const rope_segments = 5;
            const ratio_per_segment = (end_ratio - start_ratio) / rope_segments;
            let points = [];
            if(old_render_elements !== undefined && old_render_elements.link_label_rope_points !== undefined){
                points = old_render_elements.link_label_rope_points;
                points.length = 0;
            }
            for(let i = 0;i <= rope_segments; i++){
                const p = bezier.get(start_ratio + i * ratio_per_segment);
                points.push({
                    x:p.x,
                    y:p.y
                });
            }
            ret.link_label_rope_points = points;

            let link_label_rope = null;
            if(old_render_elements !== undefined && old_render_elements.link_label_rope !== undefined){
                link_label_rope = old_render_elements.link_label_rope;
                link_label_rope.texture = render_texture;
            }else{
                link_label_rope = new PIXI.MeshRope({texture: render_texture, points: points});
            }
            link_label_rope.zIndex = 2;
            curve.addChild(link_label_rope);
        }
    }

    return ret;
}

const create_node_render_snapshot = (is_auth, is_reachable, is_managed, is_anm, is_mobile, operation_mode, hostname_string, has_hidden_eth_link) => {
    return {
        is_auth:is_auth,
        is_reachable:is_reachable,
        is_managed:is_managed,
        is_anm:is_anm,
        is_mobile:is_mobile,
        operation_mode:operation_mode,
        hostname_string:hostname_string,
        has_hidden_eth_link: has_hidden_eth_link
    };
}

const node_render_snapshot_equals = (lhs, rhs) => {
    return lhs.is_auth === rhs.is_auth &&
        lhs.is_reachable === rhs.is_reachable &&
        lhs.is_managed === rhs.is_managed &&
        lhs.is_anm === rhs.is_anm &&
        lhs.is_mobile === rhs.is_mobile &&
        lhs.operation_mode === rhs.operation_mode &&
        lhs.hostname_string === rhs.hostname_string &&
        lhs.has_hidden_eth_link === rhs.has_hidden_eth_link
    ;
}

const create_node_graphics = (is_auth, is_reachable, is_managed, is_anm, is_mobile, operation_mode, preload_icons, hostname_string, has_hidden_eth_link) => {
    let snapshot = create_node_render_snapshot(is_auth, is_reachable, is_managed, is_anm, is_mobile, operation_mode, hostname_string, has_hidden_eth_link);

    // using the origin point as the center of the circle

    let circle = new PIXI.Graphics();
    circle.circle(0, 0, node_circle_radius);
    if(is_anm){
        circle.fill({
            color: anm_node_fill_color
        });
        circle.stroke({
            width: anm_node_stroke_width,
            color: anm_node_stroke_color
        });
    }else{
        let fill_color = unmanaged_node_fill_color
        if(is_managed){
            if(is_reachable){
                fill_color = reachable_node_fill_color;
            }else{
                fill_color = unreach_node_fill_color;
            }
        }
        circle.fill({
            color: fill_color
        })
        circle.stroke({
            color: fill_color,
            width: anm_node_stroke_width
        })
    }

    let hidden_eth_indicator = null;
    if(has_hidden_eth_link){
        const fill_color = 0xffffff;
        hidden_eth_indicator = new PIXI.Graphics();
        hidden_eth_indicator.circle(0, 0, node_circle_radius + anm_node_stroke_width / 2);
        hidden_eth_indicator.fill({
            color: fill_color,
        });
        hidden_eth_indicator.circle(0, 0, node_circle_cut_radius);
        hidden_eth_indicator.cut();
        hidden_eth_indicator.alpha = 0.5;
        hidden_eth_indicator.zIndex = 0;
        circle.addChild(hidden_eth_indicator);
    }
    circle.zIndex = 0;

    const getNodeIconImage = (isAuth, isReachable, isManaged, isANM, isMobile, operationMode, preloadIcon) => {
        // if (isAuth === 'unknown' && isReachable && isManaged) return preloadIcon.cloudOffline;
        if (isANM) return preloadIcon.anm;
        if (isAuth === 'no' && isReachable && isManaged) return preloadIcon.notAuthAp;
        if (operationMode === 'meshMobile') return preloadIcon.meshMobile;
        if (operationMode === 'meshOnly') return preloadIcon.meshOnly;
        if (operationMode === 'meshStatic') return preloadIcon.meshStatic;
        if (operationMode === 'mobileOnly') return preloadIcon.mobileOnly;
        if (operationMode === 'staticOnly') return preloadIcon.staticOnly;
        if (operationMode === 'disable') return preloadIcon.disable;
        return preloadIcon.meshOnly;
    };

    // null or PIXI.Texture
    let icon_resource = getNodeIconImage(is_auth, is_reachable, is_managed, is_anm, is_mobile, operation_mode, preload_icons);
    let icon = null;
    if(icon_resource !== null){        
        icon = new PIXI.Sprite(icon_resource);
        let width = node_icon_width;
        if(is_anm){
            width = anm_node_icon_width;
        }
        const ratio = icon.height / icon.width;
        icon.width = width;
        icon.height = width * ratio;
        icon.x = icon.width / (-2);
        icon.y = icon.height / (-2);
        icon.zIndex = 2;
    }

    // render more then down scale to avoid being blurry
    let hostname = new PIXI.Text({
        style:new PIXI.TextStyle({
            fontFamily:"Arial",
            fontSize: node_label_text_size,
            fontWeight: "bold",
            align:"center",
            stroke: { color: '#ffffff', width: 5, join: 'round' },
            roundPixels: false
        }),
        text:is_anm? "": hostname_string,
        resolution:2,
    });
    // center the label and put it under the node circle
    hostname.y = node_circle_radius + 4;
    hostname.x = hostname.width / (-2);
    hostname.zIndex = 3;

    let hit_area = new PIXI.Circle(0, 0, node_circle_radius)

    let spinner = new PIXI.Graphics();
    //spinner.circle(0, 0, node_circle_radius + anm_node_stroke_width / 2);
    const circle_radius = node_circle_radius + anm_node_stroke_width / 2 + 4;
    spinner.moveTo(0,0);
    spinner.arc(0, 0, circle_radius, 0, Math.PI / 2);
    spinner.fill(0xffffff);
    spinner.moveTo(0,0);
    spinner.arc(0, 0, node_circle_cut_radius + 4, 0, Math.PI / 2);
    spinner.cut();
    spinner.zIndex = 4;

    let spin_time = 0;
    const spin = (time) => {
        spinner.rotation += Math.PI * 2 * (time.deltaMS % 750) / 750;
    }

    return {
        circle:circle,
        icon:icon,
        hostname:hostname,
        hit_area:hit_area,
        snapshot:snapshot,
        spinner:spinner,
        spinner_cb:spin,
        hidden_eth_indicator:hidden_eth_indicator
    };
}

const create_update_or_remove_mdop_actors = (render_context) => {
    // each actor repersent one mdop group
    // main actor container is always at 0,0
    // each neighbor entry creates a sub actor that syncs to node position
    // on entry change, recreate the whole mdop group actor
    // anchor entries onto node for position changes
    if(render_context.app === undefined){
        return;
    }

    let mdop_actor_lookup = render_context.mdop_actor_lookup;
    if(mdop_actor_lookup === undefined){
        mdop_actor_lookup = {};
        render_context.mdop_actor_lookup = mdop_actor_lookup;
    }

    const mdop_table = render_context.mdop_table;
    const node_actor_lookup = render_context.node_actor_lookup;

    // perform remove then add, no update routine for this type of actors
    let mdop_actors_to_remove = [];
    let mdop_actors_to_add = [];

    for(const [id, actor] of Object.entries(mdop_actor_lookup)){
        const table_entry = mdop_table[id];
        if(table_entry === undefined){
            mdop_actors_to_remove.push({
                id:id,
                actor:actor
            })
            continue;
        }
        const new_render_snapshot = JSON.stringify(table_entry)
        if(new_render_snapshot !== actor.anywhere_ext.render_snapshot){
            mdop_actors_to_remove.push({
                id:id,
                actor:actor
            });
            mdop_actors_to_add.push({
                id:id,
                table_entry:table_entry
            });
        }
    }

    for(const [id, table_entry] of Object.entries(mdop_table)){
        if(mdop_actor_lookup[id] === undefined){
            mdop_actors_to_add.push({
                id:id,
                table_entry:table_entry
            });
        }
    }

    for(const entry of mdop_actors_to_remove){
        const old_table_entry = JSON.parse(entry.actor.anywhere_ext.render_snapshot);
        for(const [node_ip, member] of Object.entries(old_table_entry.neighbors)){
            const node_actor = node_actor_lookup[node_ip];
            if(node_actor === undefined){
                continue;
            }
            const mdop_anchors = node_actor.anywhere_ext.mdop_anchors;
            if(mdop_anchors === undefined){
                continue;
            }
            for(const subactor of entry.actor.anywhere_ext.subactors){
                const remove_index = mdop_anchors.indexOf(subactor);
                if(remove_index >= 0){
                    mdop_anchors.splice(remove_index, 1);
                }
            }
        }
        render_context.main_container.removeChild(entry.actor);
        delete mdop_actor_lookup[entry.id];
    }

    for(const entry of mdop_actors_to_add){
        const base = new PIXI.Graphics();
        mdop_actor_lookup[entry.id] = base;
        render_context.main_container.addChild(base);

        base.anywhere_ext = {}
        base.anywhere_ext.subactors = [];
        const to_render = JSON.parse(JSON.stringify(entry.table_entry));

        base.eventMode = "static";

        const blink_duration = 1000;
        const base_interaction_ref = {};
        const background_radius = 12;
        base.onpointerenter = () => {
            if(render_context.dragging){
                return;
            }
            base_interaction_ref.should_blink = true;

            let blink_time = 0;
            const blink = (time) => {
                blink_time += time.deltaMS;
                const one_third = blink_duration / 3;
                const progress = Math.sin(((blink_time % one_third) / one_third) * Math.PI);
                for(const subactor of base.anywhere_ext.subactors){
                    const background = subactor.anywhere_ext.render_elements.background;
                    const blinking_background = subactor.anywhere_ext.render_elements.blinking_background;
                    blinking_background.clear();
                    blinking_background.roundRect(0, 0, background.width, background.height, background_radius);
                    blinking_background.fill(0x000000);
                    blinking_background.alpha = progress;
                }
                if(blink_time >= blink_duration){
                    for(const subactor of base.anywhere_ext.subactors){
                        subactor.anywhere_ext.render_elements.blinking_background.clear();
                    }
                    render_context.app.ticker.remove(blink);
                }
            }
            base_interaction_ref.last_animation_timeout = setTimeout(() => {
                if(base_interaction_ref.should_blink){
                    base_interaction_ref.should_blink = false;
                    render_context.app.ticker.add(blink);
                }
            }, 750);
        }
        base.onpointerleave = () => {
            clearTimeout(base_interaction_ref.last_animation_timeout);
            base_interaction_ref.should_blink = false;
        }

        for(const [node_ip, member] of Object.entries(entry.table_entry.neighbors)){
            const node_actor = node_actor_lookup[node_ip];
            // if the node actor is not found, remove the entry from the snapshot so that next update can re-render
            if(node_actor === undefined){
                delete to_render.neighbors[node_ip];
                continue
            }

            const subactor = new PIXI.Graphics();
            subactor.anywhere_ext = {};
            base.anywhere_ext.subactors.push(subactor);
            base.addChild(subactor);

            subactor.anywhere_ext.eth = member.eth;

            let mdop_anchors = node_actor.anywhere_ext.mdop_anchors;
            if(mdop_anchors === undefined){
                mdop_anchors = [];
                node_actor.anywhere_ext.mdop_anchors = mdop_anchors;
            }
            mdop_anchors.push(subactor);
            node_actor.anywhere_ext.position_mdop_actors();

            const short_text = new PIXI.Text({
                style:new PIXI.TextStyle({
                    fontFamily:"roboto",
                    fontSize:8,
                    fontWeight: "bold",
                    align:"center",
                    roundPixels: false,
                    fill:{
                        color:0xffffff,
                    }
                }),
                text:"M",
                resolution: 2
            });

            const long_text_content = member.eth === 0? render_context.translator("mdopEth0Label"): render_context.translator("mdopEth1Label");
            const long_text = new PIXI.Text({
                style:new PIXI.TextStyle({
                    fontFamily:"roboto",
                    fontSize:8,
                    fontWeight: "bold",
                    align:"center",
                    roundPixels: false,
                    fill:{
                        color:0xffffff,
                    }
                }),
                text:long_text_content,
                resolution: 2
            });

            const background = new PIXI.Graphics();
            background.roundRect(0, 0, short_text.width + 8, short_text.height + 4, background_radius);
            background.fill(mdop_background_color);
            subactor.addChild(background);

            const blinking_background = new PIXI.Graphics();
            subactor.addChild(blinking_background);

            subactor.anywhere_ext.render_elements = {
                short_text:short_text,
                long_text:long_text,
                background:background,
                blinking_background:blinking_background
            };

            short_text.x = 4;
            short_text.y = 2;
            short_text.zIndex = 2;
            long_text.x = 4;
            long_text.y = 2;
            long_text.alpha = 0;
            long_text.zIndex = 2;
            blinking_background.zIndex = 1;
            background.zIndex = 0;

            subactor.addChild(background);
            subactor.addChild(short_text);

            subactor.eventMode = "static";

            const interaction_ref = {};
            const animation_duration = 400;

            subactor.onpointerenter = () => {
                if(render_context.dragging){
                    return;
                }

                subactor.addChild(long_text);

                interaction_ref.opening = true;
                interaction_ref.closing = false;

                let animation_time_ms = 0;
                const animate = (time) => {
                    if(!interaction_ref.opening){
                        render_context.app.ticker.remove(animate);
                    }
                    animation_time_ms += time.deltaMS;
                    let progress = animation_time_ms / animation_duration;
                    if(progress > 1.0){
                        progress = 1.0;
                    }

                    if(progress > 0.5){
                        let text_progress = (progress - 0.5) / 0.45;
                        if(text_progress > 1.0){
                            text_progress = 1.0
                        }
                        short_text.alpha = 1.0 - text_progress;
                        long_text.alpha = text_progress;
                    }
                    if(progress <= 0.5){
                        let background_progress = progress / 0.45;
                        if(background_progress > 1.0){
                            background_progress = 1.0;
                        }
                        const background_width = short_text.width + (long_text.width - short_text.width) * background_progress + 8;
                        const background_height = short_text.height + (long_text.height - short_text.height) * background_progress + 4;

                        background.clear();
                        background.roundRect(0, 0, background_width, background_height, background_radius);
                        background.fill(mdop_background_color);
                    }

                    if(animation_time_ms >= animation_duration){
                        let background_progress = progress / 0.45;
                        if(background_progress > 1.0){
                            background_progress = 1.0;
                        }
                        const background_width = short_text.width + (long_text.width - short_text.width) * background_progress + 8;
                        const background_height = short_text.height + (long_text.height - short_text.height) * background_progress + 4;

                        background.clear();
                        background.roundRect(0, 0, background_width, background_height, background_radius);
                        background.fill(mdop_background_color);
                        interaction_ref.opening = false;
                        render_context.app.ticker.remove(animate);
                    }
                }
                long_text.alpha = 0;
                short_text.alpha = 1;
                background.clear();
                background.roundRect(0, 0, short_text.width + 8, short_text.height + 4, background_radius);
                background.fill(mdop_background_color);
                render_context.app.ticker.add(animate);
            }

            subactor.onpointerleave = () => {
                if(render_context.dragging){
                    return;
                }

                subactor.addChild(long_text);

                interaction_ref.opening = false;
                interaction_ref.closing = true;

                let animation_time_ms = 0;
                const animate = (time) => {
                    if(!interaction_ref.closing){
                        render_context.app.ticker.remove(animate);
                    }
                    animation_time_ms += time.deltaMS;
                    let progress = animation_time_ms / animation_duration;
                    if(progress > 1.0){
                        progress = 1.0;
                    }

                    if(progress < 0.5){
                        let text_progress = progress / 0.45;
                        if(text_progress > 1.0){
                            text_progress = 1.0;
                        }
                        short_text.alpha = text_progress;
                        long_text.alpha = 1.0 - text_progress;
                    }

                    if(progress >= 0.5){
                        let background_progress = (progress - 0.5) / 0.45;
                        if(background_progress > 1.0){
                            background_progress = 1.0;
                        }
                        const background_width = short_text.width + (long_text.width - short_text.width) * (1.0 - background_progress) + 8;
                        const background_height = short_text.height + (long_text.height - short_text.height) * (1.0 - background_progress) + 4;

                        background.clear();
                        background.roundRect(0, 0, background_width, background_height, background_radius);
                        background.fill(mdop_background_color);
                    }

                    if(animation_time_ms >= animation_duration){
                        interaction_ref.closing = false;
                        render_context.app.ticker.remove(animate);
                        subactor.removeChild(long_text);
                    }
                }
                long_text.alpha = 1;
                short_text.alpha = 0;
                background.clear();
                background.roundRect(0, 0, long_text.width + 8, long_text.height + 4, background_radius);
                background.fill(mdop_background_color);
                render_context.app.ticker.add(animate);
            }

            subactor.onpointerdown = (e) => {
                if(render_context.dragging){
                    return;
                }
                const leave_cb = () => {
                    render_context.node_mdop_clickout_cb();
                }
                const leave_trigger = deploy_leave_hitbox(render_context, leave_cb);
                networkGraphHandler.zoomToNode = (ip) => {
                    if(render_context.app === undefined){
                        return;
                    }
                    const node_actor = render_context.node_actor_lookup[ip];
                    if(node_actor === undefined){
                        return;
                    }
                    const main_container = render_context.main_container;
                    const old_scale = main_container.scale.x;
                    const old_location = {x:main_container.x, y:main_container.y};
                    main_container.x = 0;
                    main_container.y = 0;
                    main_container.scale = main_container_max_scale;
                    const global_location = main_container.toGlobal({x:node_actor.x, y:node_actor.y});
                    const app = render_context.app;
                    const center = {x:app.renderer.width / 2, y:app.renderer.height / 2};

                    const new_location = {x:center.x - global_location.x, y:center.y - global_location.y};

                    main_container.x = old_location.x;
                    main_container.y = old_location.y;
                    main_container.scale = old_scale;

                    animate_pan_scale(new_location, main_container_max_scale, render_context, () => {});

                    leave_trigger();
                    networkGraphHandler.zoomToNode = () => {}
                }

                render_context.node_mdop_click_cb(node_ip, e.client, entry.id);
            }
        }

        base.zIndex = mdop_zindex;

        base.anywhere_ext.render_snapshot = JSON.stringify(to_render);
    }
}

const create_or_update_background_actor = (render_context) => {
    if(render_context.app === undefined){
        return;
    }

    let img_url = null;
    if(render_context.image.set){
        const {hostname, port} = store.getState().common.hostInfo;
        const project_id = Cookies.get("projectId");
        const image_id = render_context.image.id;
        const image_timestamp = render_context.image.timestamp;
        img_url = `http://${hostname}:${port}/media/${project_id}/${image_id}?t=${image_timestamp}`;
    }

    const width = render_context.background.viewSize.width;
    const height = render_context.background.viewSize.height;

    const cur_snapshot = create_background_render_snapshot(width, height, img_url);

    let background_actor = render_context.background_actor;
    if(background_actor === undefined){
        background_actor = new PIXI.Graphics();
        background_actor.anywhere_ext = {};
        background_actor.zIndex = background_zindex;
        background_actor.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
        render_context.background_actor = background_actor;
    }

    if(background_actor.anywhere_ext.render_elements === undefined || !background_render_snapshots_equal(background_actor.anywhere_ext.render_elements.snapshot, cur_snapshot)){
        background_actor.removeChildren();
        const render_elements = create_background_graphics(width, height, img_url);
        background_actor.anywhere_ext.render_elements = render_elements;
        background_actor.addChild(render_elements.image_sprite);
    }

    if(render_context.background.pos === undefined){
        const main_container_center = get_main_container_center(render_context, false);
        render_context.background.pos = {x:main_container_center.x - width / 2, y:main_container_center.y - height / 2};
    }

    background_actor.x = render_context.background.pos.x;
    background_actor.y = render_context.background.pos.y;
    background_actor.alpha = render_context.background.opacity;

    render_context.main_container.removeChild(background_actor);
    if(render_context.background.show || render_context.adjusting_background){
        render_context.main_container.addChild(background_actor);
    }
}

const update_background_adjust_actor = (render_context) => {
    if(render_context.app === undefined){
        return;
    }
    let base = render_context.background_adjust_actor;

    if(base === undefined){
        base = new PIXI.Graphics();
        base.zIndex = background_interactive_zindex;
        base.eventMode = "passive";
        base.anywhere_ext = {};
        render_context.background_adjust_actor = base;

        const adjust_handle_top_left = new PIXI.Graphics();
        adjust_handle_top_left.lineTo(0, adjust_handle_length / 2);
        adjust_handle_top_left.moveTo(adjust_handle_width / -2, 0);
        adjust_handle_top_left.lineTo(adjust_handle_length / 2, 0);
        adjust_handle_top_left.stroke({
            color: adjust_handle_color,
            width: adjust_handle_width,
        });
        adjust_handle_top_left.eventMode = "static";
        adjust_handle_top_left.zIndex = 1;
        base.anywhere_ext.adjust_handle_top_left = adjust_handle_top_left;

        const adjust_handle_top = new PIXI.Graphics();
        adjust_handle_top.moveTo((adjust_handle_length / -2), 0);
        adjust_handle_top.lineTo(adjust_handle_length / 2, 0);
        adjust_handle_top.stroke({
            color: adjust_handle_color,
            width: adjust_handle_width
        });
        adjust_handle_top.eventMode = "static";
        adjust_handle_top.zIndex = 1;
        base.anywhere_ext.adjust_handle_top = adjust_handle_top;

        const adjust_handle_top_right = new PIXI.Graphics();
        adjust_handle_top_right.lineTo(0, adjust_handle_length / 2);
        adjust_handle_top_right.moveTo(adjust_handle_width / 2, 0);
        adjust_handle_top_right.lineTo((adjust_handle_length / -2), 0);
        adjust_handle_top_right.stroke({
            color: adjust_handle_color,
            width: adjust_handle_width
        });
        adjust_handle_top_right.eventMode = "static";
        adjust_handle_top_right.zIndex = 1;
        base.anywhere_ext.adjust_handle_top_right = adjust_handle_top_right;

        const adjust_handle_bottom_left = adjust_handle_top_right.clone();
        adjust_handle_bottom_left.rotation = Math.PI;
        adjust_handle_bottom_left.eventMode = "static";
        adjust_handle_bottom_left.zIndex = 1;
        base.anywhere_ext.adjust_handle_bottom_left = adjust_handle_bottom_left;

        const adjust_handle_bottom = adjust_handle_top.clone();
        adjust_handle_bottom.eventMode = "static";
        adjust_handle_bottom.zIndex = 1;
        base.anywhere_ext.adjust_handle_bottom = adjust_handle_bottom;

        const adjust_handle_bottom_right = adjust_handle_top_left.clone();
        adjust_handle_bottom_right.rotation = Math.PI;
        adjust_handle_bottom_right.eventMode = "static";
        adjust_handle_bottom_right.zIndex = 1;
        base.anywhere_ext.adjust_handle_bottom_right = adjust_handle_bottom_right;

        const drag_hitbox = new PIXI.Graphics();
        drag_hitbox.eventMode = "static";
        drag_hitbox.zIndex = 0;
        base.anywhere_ext.drag_hitbox = drag_hitbox;

        const adjust_handle_left = new PIXI.Graphics();
        adjust_handle_left.moveTo(0, (adjust_handle_length / -2));
        adjust_handle_left.lineTo(0, (adjust_handle_length / 2));
        adjust_handle_left.stroke({
            color: adjust_handle_color,
            width: adjust_handle_width
        });
        adjust_handle_left.eventMode = "static";
        adjust_handle_left.zIndex = 1;
        base.anywhere_ext.adjust_handle_left = adjust_handle_left;

        const adjust_handle_right = adjust_handle_left.clone();
        adjust_handle_right.eventMode = "static";
        adjust_handle_right.zIndex = 1;
        base.anywhere_ext.adjust_handle_right = adjust_handle_right;

        const adjust_handle_positions = () => {
            const width = render_context.background.viewSize.width;
            const height = render_context.background.viewSize.height;

            adjust_handle_top_left.x = 0;
            adjust_handle_top_left.y = 0;

            adjust_handle_top.x = width / 2;
            adjust_handle_top.y = 0;

            adjust_handle_top_right.x = width;
            adjust_handle_top_right.y = 0;

            adjust_handle_bottom_left.x = 0;
            adjust_handle_bottom_left.y = height;

            adjust_handle_bottom.x = width / 2;
            adjust_handle_bottom.y = height;

            adjust_handle_bottom_right.x = width;
            adjust_handle_bottom_right.y = height;

            adjust_handle_left.x = 0;
            adjust_handle_left.y = height / 2;

            adjust_handle_right.x = width;
            adjust_handle_right.y = height / 2;

            drag_hitbox.x = 0;
            drag_hitbox.y = 0;
            drag_hitbox.hitArea = new PIXI.Rectangle(0, 0, width, height);
        }
        base.anywhere_ext.adjust_handle_positions = adjust_handle_positions;

        const interaction_ref = {};
        drag_hitbox.onpointerdown = (e) => {
            if(interaction_ref.resizing || interaction_ref.moving){
                return;
            }
            if(render_context.dragging){
                return;
            }

            interaction_ref.moving = true;
            interaction_ref.moving_last_position = render_context.main_container.toLocal(e.global);
            render_context.dragging = true;
        }

        const set_cursor = (name, check_dragging) => {
            if(render_context.dragging && check_dragging){
                return;
            }
            render_context.renderer_parent.style.cursor = name;
        }

        drag_hitbox.onglobalpointermove = (e) => {
            if(interaction_ref.moving){
                set_cursor("grabbing", false);
                const local_position = render_context.main_container.toLocal(e.global);
                const x_offset = local_position.x - interaction_ref.moving_last_position.x;
                const y_offset = local_position.y - interaction_ref.moving_last_position.y;
                interaction_ref.moving_last_position = local_position;
                base.x = base.x + x_offset;
                base.y = base.y + y_offset;
                render_context.background.pos.x = base.x;
                render_context.background.pos.y = base.y;
                create_or_update_background_actor(render_context);
            }

            if(interaction_ref.resizing){
                const local_position = render_context.main_container.toLocal(e.global);
                const x_offset = local_position.x - interaction_ref.resizing_last_position.x;
                const y_offset = local_position.y - interaction_ref.resizing_last_position.y;
                interaction_ref.resizing_last_position = local_position;

                switch(interaction_ref.resize_mode){
                    case "bottom_right":{
                        render_context.background.viewSize.width = render_context.background.viewSize.width + x_offset;
                        render_context.background.viewSize.height = render_context.background.viewSize.width / interaction_ref.aspect_ratio;
                        adjust_handle_positions();
                        create_or_update_background_actor(render_context);
                        break;
                    }
                    case "right":{
                        render_context.background.viewSize.width = render_context.background.viewSize.width + x_offset;
                        adjust_handle_positions();
                        create_or_update_background_actor(render_context);
                        break;
                    }
                    case "bottom":{
                        render_context.background.viewSize.height = render_context.background.viewSize.height + y_offset;
                        adjust_handle_positions();
                        create_or_update_background_actor(render_context);
                        break;
                    }
                    case "top":{
                        render_context.background.viewSize.height = render_context.background.viewSize.height - y_offset;
                        render_context.background.pos.y = render_context.background.pos.y + y_offset;
                        base.y = render_context.background.pos.y;
                        adjust_handle_positions();
                        create_or_update_background_actor(render_context);
                        break;
                    }
                    case "left":{
                        render_context.background.viewSize.width = render_context.background.viewSize.width - x_offset;
                        render_context.background.pos.x = render_context.background.pos.x + x_offset;
                        base.x = render_context.background.pos.x;
                        adjust_handle_positions();
                        create_or_update_background_actor(render_context);
                        break;
                    }
                    case "top_right":{
                        render_context.background.viewSize.width = render_context.background.viewSize.width + x_offset;
                        const ratio_y_offset = render_context.background.viewSize.height - render_context.background.viewSize.width / interaction_ref.aspect_ratio;
                        render_context.background.viewSize.height = render_context.background.viewSize.width / interaction_ref.aspect_ratio;
                        render_context.background.pos.y = render_context.background.pos.y + ratio_y_offset;
                        base.y = render_context.background.pos.y;
                        adjust_handle_positions();
                        create_or_update_background_actor(render_context);
                        break;
                    }
                    case "top_left":{
                        render_context.background.viewSize.width = render_context.background.viewSize.width - x_offset;
                        const ratio_y_offset = render_context.background.viewSize.height - render_context.background.viewSize.width / interaction_ref.aspect_ratio;
                        render_context.background.viewSize.height = render_context.background.viewSize.width / interaction_ref.aspect_ratio;
                        render_context.background.pos.x = render_context.background.pos.x + x_offset;
                        render_context.background.pos.y = render_context.background.pos.y + ratio_y_offset;
                        base.x = render_context.background.pos.x;
                        base.y = render_context.background.pos.y;
                        adjust_handle_positions();
                        create_or_update_background_actor(render_context);
                        break;
                    }
                    case "bottom_left":{
                        render_context.background.viewSize.width = render_context.background.viewSize.width - x_offset;
                        const ratio_y_offset = render_context.background.viewSize.height - render_context.background.viewSize.width / interaction_ref.aspect_ratio;
                        render_context.background.viewSize.height = render_context.background.viewSize.width / interaction_ref.aspect_ratio;
                        render_context.background.pos.x = render_context.background.pos.x + x_offset;
                        base.x = render_context.background.pos.x;
                        adjust_handle_positions();
                        create_or_update_background_actor(render_context);
                        break;
                    }
                }
            }
        }

        const pointerup_callback = () => {
            if(interaction_ref.moving){
                interaction_ref.moving = false;
                render_context.dragging = false;
            }
            if(interaction_ref.resizing){
                interaction_ref.resizing = false;
                render_context.dragging = false;
            }
            set_cursor("inherit", false);
        }

        const start_resizing = (e, mode) => {
            if(interaction_ref.moving){
                return;
            }
            if(interaction_ref.resizing){
                return;
            }
            if(render_context.dragging){
                return;
            }

            interaction_ref.resizing = true;
            interaction_ref.resize_mode = mode;
            interaction_ref.aspect_ratio = render_context.background.viewSize.width / render_context.background.viewSize.height;
            interaction_ref.resizing_last_position = render_context.main_container.toLocal(e.global);
            if(render_context.background.pos === undefined){
                render_context.background.pos = {x:0, y:0};
            }
            render_context.dragging = true;

        }

        adjust_handle_bottom_right.onpointerdown = (e) => {
            start_resizing(e, "bottom_right");
        }
        adjust_handle_right.onpointerdown = (e) => {
            start_resizing(e, "right");
        }
        adjust_handle_bottom.onpointerdown = (e) => {
            start_resizing(e, "bottom");
        }
        adjust_handle_top.onpointerdown = (e) => {
            start_resizing(e, "top");
        }
        adjust_handle_left.onpointerdown = (e) => {
            start_resizing(e, "left");
        }
        adjust_handle_top_right.onpointerdown = (e) => {
            start_resizing(e, "top_right");
        }
        adjust_handle_top_left.onpointerdown = (e) => {
            start_resizing(e, "top_left");
        }
        adjust_handle_bottom_left.onpointerdown = (e) => {
            start_resizing(e, "bottom_left");
        }

        adjust_handle_top_left.onpointerenter = () => {
            set_cursor("nwse-resize", true);
        }
        adjust_handle_top_left.onpointerleave = () => {
            set_cursor("inherit", true);
        }
        adjust_handle_top.onpointerenter = () => {
            set_cursor("ns-resize", true);
        }
        adjust_handle_top.onpointerleave = () => {
            set_cursor("inherit", true);
        }
        adjust_handle_top_right.onpointerenter = () => {
            set_cursor("nesw-resize", true);
        }
        adjust_handle_top_right.onpointerleave = () => {
            set_cursor("inherit", true);
        }
        adjust_handle_right.onpointerenter = () => {
            set_cursor("ew-resize", true);
        }
        adjust_handle_right.onpointerleave = () => {
            set_cursor("inherit", true);
        }
        adjust_handle_bottom_right.onpointerenter = () => {
            set_cursor("nwse-resize", true);
        }
        adjust_handle_bottom_right.onpointerleave = () => {
            set_cursor("inherit", true);
        }
        adjust_handle_bottom.onpointerenter = () => {
            set_cursor("ns-resize", true);
        }
        adjust_handle_bottom.onpointerleave = () => {
            set_cursor("inherit", true);
        }
        adjust_handle_bottom_left.onpointerenter = () => {
            set_cursor("nesw-resize", true);
        }
        adjust_handle_bottom_left.onpointerleave = () => {
            set_cursor("inherit", true);
        }
        drag_hitbox.onpointerenter = () => {
            set_cursor("grab", true);
        }
        drag_hitbox.onpointerleave = () => {
             set_cursor("inherit", true);
        }

        render_context.pointerup_callbacks.push(pointerup_callback);

        render_context.main_container.addChild(base);

        adjustModeHandler.setBackgroundColor = (color) => {
            render_context.background.color = color;
            render_context.renderer_parent.style.background = color;
        }
        adjustModeHandler.adjustMapOpacity = (opacity) => {
            render_context.background.opacity = opacity;
            create_or_update_background_actor(render_context);
        }
        adjustModeHandler.resetMapSize = () => {
            render_context.background.viewSize.height = render_context.background.imgSize.height;
            render_context.background.viewSize.width = render_context.background.imgSize.width;
            create_or_update_background_actor(render_context);
            update_background_adjust_actor(render_context);
        }
        adjustModeHandler.resetToDefault = () => {
            render_context.background.viewSize.height = render_context.background.imgSize.height;
            render_context.background.viewSize.width = render_context.background.imgSize.width;
            const main_container_center = get_main_container_center(render_context, false);
            render_context.background.pos = {x:main_container_center.x - render_context.background.viewSize.width / 2, y:main_container_center.y - render_context.background.viewSize.height / 2};
            create_or_update_background_actor(render_context);
            update_background_adjust_actor(render_context);

            render_context.background.opacity = 1;
            adjustModeHandler.setBackgroundColor("#e5e5e5");
        }
        adjustModeHandler.fixDimensionView = (type, fixed) => {
            let key = "fixWidth";
            if(type !== "width"){
                key = "fixHeight";
            }
            render_context.background[key] = fixed;
            update_background_adjust_actor(render_context);
        }
        adjustModeHandler.setViewport = () => {
            const stage_top_left_in_main_container = render_context.main_container.toLocal({x:0, y:0});
            const app = render_context.app;
            render_context.background.viewSize.height = app.renderer.height / render_context.main_container.scale.x;
            render_context.background.viewSize.width = app.renderer.width / render_context.main_container.scale.y;
            render_context.background.pos.x = stage_top_left_in_main_container.x;
            render_context.background.pos.y = stage_top_left_in_main_container.y;
            create_or_update_background_actor(render_context);
            update_background_adjust_actor(render_context);
        }
    }

    base.removeChildren();
    if(!render_context.adjusting_background){
        render_context.background_bak = undefined;
        return;
    }

    if(render_context.background_bak === undefined){
        render_context.background_bak = JSON.parse(JSON.stringify(render_context.background));
    }

    base.x = render_context.background.pos.x;
    base.y = render_context.background.pos.y;

    base.anywhere_ext.adjust_handle_positions();

    const adjust_handle_top_left = base.anywhere_ext.adjust_handle_top_left;
    const adjust_handle_top = base.anywhere_ext.adjust_handle_top;
    const adjust_handle_top_right = base.anywhere_ext.adjust_handle_top_right;
    const adjust_handle_bottom_left = base.anywhere_ext.adjust_handle_bottom_left;
    const adjust_handle_bottom = base.anywhere_ext.adjust_handle_bottom;
    const adjust_handle_bottom_right = base.anywhere_ext.adjust_handle_bottom_right;
    const adjust_handle_left = base.anywhere_ext.adjust_handle_left;
    const adjust_handle_right = base.anywhere_ext.adjust_handle_right;
    const drag_hitbox = base.anywhere_ext.drag_hitbox;

    base.addChild(drag_hitbox);

    if(!render_context.background.fixHeight && !render_context.background.fixWidth){
        base.addChild(adjust_handle_top_left);
        base.addChild(adjust_handle_top_right);
        base.addChild(adjust_handle_bottom_left);
        base.addChild(adjust_handle_bottom_right);    
    }

    if(!render_context.background.fixHeight){
        base.addChild(adjust_handle_top);
        base.addChild(adjust_handle_bottom);
    }

    if(!render_context.background.fixWidth){
        base.addChild(adjust_handle_left);
        base.addChild(adjust_handle_right);    
    }
}

const create_update_or_remove_link_actors = (render_context) => {
    if(render_context.app === undefined){
        return;
    }
    const app = render_context.app;
    const main_container = render_context.main_container;
    const link_actor_lookup = render_context.link_actor_lookup;
    const node_actor_lookup = render_context.node_actor_lookup;
    const link_info_ref = render_context.link_info_ref;
    const links_ref = render_context.links_ref.filter((link) => {
        if(!render_context.show_eth_link && link.type === "EthernetLink"){
            return false;
        }
        return true;
    });
    const nodes_ref = render_context.nodes_ref;
    const node_lookup = render_context.node_lookup;

    if(link_actor_lookup === undefined){
        return;
    }

    let link_actors_to_remove = [];
    let link_actors_to_update = [];
    let links_to_add = [];
    let link_lookup = {};

    const gather_link_information = (link) => {
        const from_node = node_lookup[link.from];
        const from_node_actor = node_actor_lookup[link.from];
        const to_node = node_lookup[link.to];
        const to_node_actor = node_actor_lookup[link.to];
        const link_info = link_info_ref[link.id];
        let from = {
            x: from_node_actor.x,
            y: from_node_actor.y,
            // from src/containers/mesh/cluster/topology/topologyGraphHelperFunc.js linkLabelContent
            device: from_node.isManaged ? (link_info !== undefined ? (link.type.includes("Eth") ? link_info.nodes[link.from].eth : link_info.nodes[link.from].radio) : "...") : "unmanaged"
        };
        let to = {
            x: to_node_actor.x,
            y: to_node_actor.y,
            device: to_node.isManaged ? (link_info !== undefined ? (link.type.includes("Eth") ? link_info.nodes[link.to].eth : link_info.nodes[link.to].radio) : "...") : "unmanaged"
        };

        // ref topologyGraphHelperFunc getLinkColor
        let color = Constant.rssiColor.default;

        if(link_info !== undefined && link_info.type === "RadioLink" && render_context.rssi_color.enable && to_node.isManaged && from_node.isManaged){
            const signal_level_to_int = (level) => {
                if (level === '') return 0;
                return parseInt(level.replace(' dBm', ''), 10);
            }

            const signal_level_from = link_info.nodes[link.from].signalLevel;
            const signal_level_to = link_info.nodes[link.to].signalLevel;
            const overall_signal = Math.min(signal_level_to_int(signal_level_from), signal_level_to_int(signal_level_to));

            if(render_context.rssi_color.color.min == render_context.rssi_color.color.max){
                if(render_context.rssi_color.color.max === 0){
                    if(overall_signal > 0){
                        color = Constant.rssiColor.fair;
                    }else{
                        color = Constant.rssiColor.poor;
                    }
                }else if(render_context.rssi_color.color.max == -95){
                    if(overall_signal >= -95){
                        color = Constant.rssiColor.good;
                    }else{
                        color = Constant.rssiColor.fair;
                    }
                }else{
                    if(overall_signal >= render_context.rssi_color.color.max){
                        color = Constant.rssiColor.good;
                    }else{
                        color = Constant.rssiColor.poor;
                    }
                }
            }else{
                if(overall_signal >= render_context.rssi_color.color.max){
                    color = Constant.rssiColor.good;
                }else if(overall_signal >= render_context.rssi_color.color.min){
                    color = Constant.rssiColor.fair;
                }else{
                    color = Constant.rssiColor.poor;
                }
            }

            const min = render_context.rssi_color.color.min;
            const max = render_context.rssi_color.color.max;
            const good = render_context.rssi_color.color.good;
            const fair = render_context.rssi_color.color.fair;
            const poor = render_context.rssi_color.color.poor;  
        }

        return {
            from: from,
            to: to,
            status: link.status,
            type: link.type,
            link_index: link.linkIndex,
            total_link: link.totalLink,
            band: link_info !== undefined ? link_info.info.band : "...",
            frequency: link_info !== undefined ? link_info.info.frequency : "...",
            channel: link_info !== undefined ? link_info.info.channel : "...",
            channel_bandwidth: link_info !== undefined ? link_info.info.channelBandwidth : "...",
            speed: link_info !== undefined ? link_info.info.speed : "...",
            color: color,
            from_node_actor: from_node_actor,
            to_node_actor: to_node_actor
        }
    }

    for(const link of links_ref){
        let link_actor = link_actor_lookup[link.id];
        if(link_actor === undefined){
            const i = gather_link_information(link);
            if(i === null){
                continue;
            }

            links_to_add.push({
                link:link,
                i:i
            });
        }

        link_lookup[link.id] = link;
    }

    for(const [id, actor] of Object.entries(link_actor_lookup)){
        const link = link_lookup[id];
        if(link === undefined){
            link_actors_to_remove.push({
                id:id,
                actor:actor
            });
            continue;
        }

        const i = gather_link_information(link);
        if(i === null){
            continue;
        }
        const new_snapshot = create_link_render_snapshot(i.from, i.to, i.status, i.type, i.link_index, i.total_link, i.band, i.frequency, i.channel_bandwidth, i.speed, i.color);
        if(!link_render_snapshots_equal(actor.anywhere_ext.render_elements.snapshot, new_snapshot)){
            link_actors_to_update.push({
                id:id,
                actor:actor,
                link:link
            })
        }
    }

    for(const entry of link_actors_to_remove){
        // XXX remember to clean up other related rendering
        // let possible callbacks know that the actor is removed
        entry.actor.anywhere_ext.removed = true
        main_container.removeChild(entry.actor)

        const anchor = entry.actor.anywhere_ext.anchor
        const from_node_actor_link_anchors = entry.actor.anywhere_ext.anchor.from_node_actor.link_anchors;
        if(from_node_actor_link_anchors !== undefined){
            const remove_index = from_node_actor_link_anchors.indexOf(anchor);
            if(remove_index >= 0){
                from_node_actor_link_anchors.splice(remove_index, 1);
            }
        }
        const to_node_actor_link_anchors = entry.actor.anywhere_ext.anchor.to_node_actor.link_anchors;
        if(to_node_actor_link_anchors !== undefined){
            const remove_index = to_node_actor_link_anchors.indexOf(anchor);
            if(remove_index >= 0){
                to_node_actor_link_anchors.splice(remove_index, 1);
            }
        }

        delete link_actor_lookup[entry.id]
    }

    for(const entry of links_to_add){
        const link = entry.link;
        const i = entry.i;

        const render_elements = create_link_graphics(i.from, i.to, i.status, i.type, i.link_index, i.total_link, i.band, i.channel, i.frequency, i.channel_bandwidth, i.speed, i.color, render_context.app.renderer, render_context.show_link_label);
        const base = new PIXI.Graphics();
        base.anywhere_ext = {
            render_elements: render_elements
        };
        base.addChild(render_elements.curve);
        base.roundPixels = true;
        base.zIndex = link_zindex;

        link_actor_lookup[link.id] = base;
        main_container.addChild(base);

        // anchor to node
        if(i.from_node_actor.anywhere_ext.link_anchors === undefined){
            i.from_node_actor.anywhere_ext.link_anchors = [];
        }
        const from_node_actor_link_anchors = i.from_node_actor.anywhere_ext.link_anchors;
        if(i.to_node_actor.anywhere_ext.link_anchors === undefined){
            i.to_node_actor.anywhere_ext.link_anchors = [];
        }
        const to_node_actor_link_anchors = i.to_node_actor.anywhere_ext.link_anchors;

        const anchor = {
            from_node_actor:i.from_node_actor,
            to_node_actor:i.to_node_actor,
            link_actor: base
        };

        base.anywhere_ext.anchor = anchor;

        from_node_actor_link_anchors.push(anchor);
        to_node_actor_link_anchors.push(anchor);


        base.eventMode = "static";
        const interaction_ref = {}

        const left_node_overlay_circle = new PIXI.Graphics();
        left_node_overlay_circle.circle(0, 0, node_circle_radius + anm_node_stroke_width / 2);
        left_node_overlay_circle.fill({color: Constant.colors.activeGreen});
        left_node_overlay_circle.zIndex = 1;

        const right_node_overlay_circle = new PIXI.Graphics();
        right_node_overlay_circle.circle(0, 0, node_circle_radius + anm_node_stroke_width / 2);
        right_node_overlay_circle.fill({color: Constant.colors.hoverGreen});
        right_node_overlay_circle.zIndex = 1;

        const link_underlay = new PIXI.Graphics();
        link_underlay.zIndex = 0;

        // on hover event
        const on_hover = (e) => {
            if(link.id === "A-NM"){
                return;
            }
            if(render_context.dragging){
                return;
            }
            if(render_context.adjusting_background){
                return;
            }
            if(render_context.app === undefined){
                return;
            }
            const from_node_actor = i.from_node_actor;
            const to_node_actor = i.to_node_actor;
            let left_node_actor = from_node_actor;
            let right_node_actor = to_node_actor;
            if(from_node_actor.x > to_node_actor.x){
                left_node_actor = to_node_actor;
                right_node_actor = from_node_actor;
            }

            interaction_ref.hover_menu_opened = true;

            render_context.link_hover_begin_cb(
                {
                    id: link.id,
                    nodeAIp: left_node_actor.anywhere_ext.node.id,
                    nodeBIp: right_node_actor.anywhere_ext.node.id,
                    linkColor: base.anywhere_ext.render_elements.snapshot.color,
                    linkType: link.type
                },
                {x: e.client.x, y:e.client.y},
                (right_node_actor.x - left_node_actor.x) * render_context.main_container.scale.x
            );

            left_node_overlay_circle.alpha = 0.0;
            right_node_overlay_circle.alpha = 0.0;

            left_node_actor.addChild(left_node_overlay_circle);
            right_node_actor.addChild(right_node_overlay_circle);

            let node_animate_time_ms = 0.0;
            const animate_node = (time) => {
                node_animate_time_ms += time.deltaMS;
                if(node_animate_time_ms > 250){
                    render_context.app.ticker.remove(animate_node);
                }
                let progress = node_animate_time_ms / 250;
                if(progress > 1.0){
                    progress = 1.0;
                }
                left_node_overlay_circle.alpha = progress;
                right_node_overlay_circle.alpha = progress;
            };
            render_context.app.ticker.add(animate_node);

            base.addChild(link_underlay);
            let link_animate_time_ms = 0.0;
            let link_animate_color = render_elements.snapshot.color;
            interaction_ref.on_hover_animating = true;
            const animate_link = (time) => {
                if(!interaction_ref.hover_menu_opened){
                    render_context.app.ticker.remove(animate_link);
                    return;
                }
                link_animate_time_ms += time.deltaMS;
                let progress = link_animate_time_ms / 250;
                if(progress > 1.0){
                    progress = 1.0;
                }
                if(link_animate_time_ms <= 250 || base.anywhere_ext.render_elements.snapshot.color !== link_animate_color){
                    const extra_width = 4 * progress;
                    link_underlay.clear();
                    draw_bezier_curve_on_graphics(link_underlay, base.anywhere_ext.render_elements.bezier, link_stroke_width + extra_width, base.anywhere_ext.render_elements.snapshot.color, 1.0, link.type === "RadioLink"? link_dot_width: 0);
                    link_animate_color = base.anywhere_ext.render_elements.snapshot.color;
                }
            };
            interaction_ref.animate_link_cb = animate_link;
            render_context.app.ticker.add(animate_link);
        };
        base.onpointerenter = on_hover;

        const on_hover_end = (e) => {
            if(!interaction_ref.hover_menu_opened){
                return;
            }
            if(render_context.app === undefined){
                return;
            }
            interaction_ref.hover_menu_opened = false;
            render_context.link_hover_end_cb();

            let node_animate_time_ms = 0.0;
            const animate_node = (time) => {
                node_animate_time_ms += time.deltaMS;
                let progress = node_animate_time_ms / 250;
                if(progress > 1.0){
                    progress = 1.0;
                }
                left_node_overlay_circle.alpha = 1.0 - progress;
                right_node_overlay_circle.alpha = 1.0 - progress;
                if(node_animate_time_ms > 250){
                    render_context.app.ticker.remove(animate_node);
                    const from_node_actor = i.from_node_actor;
                    const to_node_actor = i.to_node_actor;
                    let left_node_actor = from_node_actor;
                    let right_node_actor = to_node_actor;
                    if(from_node_actor.x > to_node_actor.x){
                        left_node_actor = to_node_actor;
                        right_node_actor = from_node_actor;
                    }
                    left_node_actor.removeChild(left_node_overlay_circle);
                    right_node_actor.removeChild(right_node_overlay_circle);
                }
            };
            render_context.app.ticker.add(animate_node);

            let link_animate_time_ms = 0.0;
            const animate_link = (time) => {
                link_animate_time_ms += time.deltaMS;
                if(interaction_ref.hover_menu_opened){
                    render_context.app.ticker.remove(animate_link);
                    return;
                }
                let progress = link_animate_time_ms / 250;
                if(progress > 1.0){
                    progress = 1.0;
                }
                const extra_width = 4 * (1.0 - progress);
                link_underlay.clear();
                draw_bezier_curve_on_graphics(link_underlay, base.anywhere_ext.render_elements.bezier, link_stroke_width + extra_width, base.anywhere_ext.render_elements.snapshot.color, 1.0, link.type === "RadioLink"? link_dot_width: 0);
                if(link_animate_time_ms >= 250){
                    render_context.app.ticker.remove(animate_link);
                    base.removeChild(link_underlay);
                }
            };
            render_context.app.ticker.add(animate_link);
        };
        base.onpointerleave = on_hover_end;

        base.anywhere_ext.context_menu = false;
        const prepare_context_menu = () => {
            const get_global_pointer_position = () => {
                return render_context.global_pointer_move_event.global;
            }
            base.anywhere_ext.context_menu = create_context_menu(
                render_context,
                [
                    {
                        icon_key: "blocklink",
                        tool_tip: render_context.translator("blocklink"),
                        callback: () => {
                            render_context.link_block_cb(link.id);
                        },
                        submenu: []
                    },
                ],
                250
            );
            if(base.anywhere_ext.context_menu === false){
                setTimeout(prepare_context_menu, 100);
            }
        };
        setTimeout(prepare_context_menu, 100);

        base.onrightclick = (e) => {
            if(link.id === "A-NM"){
                return;
            }
            if(link.type === 'EthernetLink'){
                return;
            }
            if(render_context.adjusting_background){
                return;
            }
            const to_node = i.to_node_actor.anywhere_ext.node;
            const from_node = i.from_node_actor.anywhere_ext.node;
            if(!to_node.isManaged || !from_node.isManaged || !to_node.isAuth || !from_node.isAuth){
                return;
            }

            if(interaction_ref.hover_menu_opened){
                render_context.link_hover_end_cb();
            }
            const context_menu = base.anywhere_ext.context_menu;
            const main_container_pointer_position = render_context.main_container.toLocal(render_context.global_pointer_move_event.global);
            if(context_menu !== false){
                context_menu.menu_container.x = main_container_pointer_position.x;
                context_menu.menu_container.y = main_container_pointer_position.y;
                context_menu.menu_container.zIndex = menu_zindex + 1;
                render_context.main_container.addChild(context_menu.menu_container);
                context_menu.open('link', link);

                const leave_cb = () => {
                    context_menu.close();
                }
                const leave_trigger = deploy_leave_hitbox(render_context, leave_cb);

                context_menu.on_close = () => {
                    leave_trigger(undefined, false);
                }
            }
        }

    }

    for(const entry of link_actors_to_update){
        const i = gather_link_information(entry.link);
        const render_elements = create_link_graphics(i.from, i.to, i.status, i.type, i.link_index, i.total_link, i.band, i.channel, i.frequency, i.channel_bandwidth, i.speed, i.color, render_context.app.renderer, render_context.show_link_label, entry.actor.anywhere_ext.render_elements);

        entry.actor.removeChildren();
        entry.actor.anywhere_ext.render_elements = render_elements;
        entry.actor.addChild(render_elements.curve)
    }

    render_context.link_lookup = link_lookup;
}

const create_update_or_remove_node_actors = (render_context, fit_canvas_when_done) => {
    if(render_context.app === undefined){
        return;
    }
    if(render_context.node_pos_ref === undefined){
        render_context.node_pos_ref = {};
        return;
    }
    const app = render_context.app;
    const main_container = render_context.main_container;

    let node_actors_to_remove = [];
    let nodes_to_add = [];
    let node_lookup = {};
    let node_actors_to_update = [];
    for(const node of render_context.nodes_ref){
        //console.log(render_context)
        if(render_context.node_actor_lookup === undefined){
            return;
        }

        //if node is not in the node_actor_lookup, add it to the list of nodes to add
        const actor = render_context.node_actor_lookup[node.id]
        if(actor == undefined){
            nodes_to_add.push(node)
        }else{
            if(actor.anywhere_ext.render_elements.icon === null){
                node_actors_to_update.push({
                    actor:actor,
                    node:node
                })
            }else{
                const node_info = render_context.node_info_ref[node.id]
                
                let new_snapshot = create_node_render_snapshot(
                    node.isAuth,
                    node.isReachable,
                    node.isManaged,
                    node.id == "A-NM",
                    node.isMobile,
                    node.operationMode,
                    node.id == "A-NM"? render_context.translator("anmLabel"): node_info !== undefined? node_info.hostname : convertIpToMac(node.id),
                    render_context.hidden_links_by_node[node.id] !== undefined
                );
                
                if(!node_render_snapshot_equals(new_snapshot, actor.anywhere_ext.render_elements.snapshot)){
                    node_actors_to_update.push({
                        actor:actor,
                        node:node
                    })
                }
            }
        }

        node_lookup[node.id] = node;        
    }
    for(const [id, actor] of Object.entries(render_context.node_actor_lookup)){
        if(node_lookup[id] === undefined){
            node_actors_to_remove.push({
                id:id,
                actor:actor
            });
        }
    }

    for(const entry of node_actors_to_remove){
        // let possible callbacks know the actor is gone
        entry.actor.anywhere_ext.removed = true;
        main_container.removeChild(entry.actor);
        delete render_context.node_actor_lookup[entry.id];
        const pointerup_callbacks = render_context.pointerup_callbacks
        const callback_index = pointerup_callbacks.indexOf(entry.actor.anywhere_ext.pointerup_callback);
        if(callback_index >= 0){
            pointerup_callbacks.splice(callback_index, 1);
        }
        if(render_context.app){
            render_context.app.ticker.remove(entry.actor.anywhere_ext.render_elements.spinner_cb);
        }
        // likely need to clean up other actors related to the node as well
    }

    nodes_to_add.sort((lhs, rhs) => {
        if(lhs.id === "A-NM"){
            return -1;
        }
        if(rhs.id === "A-NM"){
            return 1;
        }
        if(lhs.id > rhs.id){
            return 1;
        }
        return -1;
    });

    let node_position_updated = false;
    for(const entry of nodes_to_add){
        // using the origin point as the center of the circle
        let base = new PIXI.Graphics();
        base.anywhere_ext = {}

        base.anywhere_ext.node = entry;

        const node_info = render_context.node_info_ref[entry.id]
        let node_pos = entry.id === "A-NM" ?render_context.node_pos_ref["A-NM"]: render_context.node_pos_ref[entry.id];

        if(node_pos === undefined){
            const new_pos = {x:0, y:0};
            const hit_test = (pos) => {
                for(const [id, node_actor] of Object.entries(render_context.node_actor_lookup)){
                    const distance = Math.sqrt(Math.pow(pos.x - node_actor.x, 2) + Math.pow(pos.y - node_actor.y, 2));
                    if (distance < 120){
                        return true;
                    }
                }
                return false;
            }

            let position_set = false;
            for(let i = 0;true;i++){
                for(let y = 0;y <= i;y++){
                    const test_pos = {...new_pos};
                    test_pos.x += 120 * i;
                    test_pos.y += 120 * y;
                    if(!hit_test(test_pos)){
                        node_pos = test_pos;
                        render_context.node_pos_ref[entry.id] = test_pos;
                        node_position_updated = true;
                        position_set = true;
                        break;
                    }
                    if(position_set){
                        break;
                    }
                }
                if(position_set){
                    break;
                }

                for(let x = i - 1; x >= 0; x--){
                    const test_pos = {...new_pos};
                    test_pos.x += 120 * x;
                    test_pos.y += 120 * i;
                    if(!hit_test(test_pos)){
                        node_pos = test_pos;
                        render_context.node_pos_ref[entry.id] = test_pos;
                        node_position_updated = true;
                        position_set = true;
                        break;
                    }
                    if(position_set){
                        break;
                    }
                }
                if(position_set){
                    break;
                }
            }
        }

        const hostname = entry.id === "A-NM" ? render_context.translator("anmLabel") : (node_info !== undefined ? (entry.isHostNode ? node_info.hostname + "\n" + render_context.translator("hnLbl") : node_info.hostname) : convertIpToMac(entry.id))
        let render_elements = create_node_graphics(
            entry.isAuth,
            entry.isReachable,
            entry.isManaged,
            entry.id == "A-NM",
            entry.isMobile,
            entry.operationMode,
            render_context.preload_icons,
            hostname,
            render_context.hidden_links_by_node[entry.id] !== undefined
        );
        base.anywhere_ext.render_elements = render_elements;

        base.addChild(render_elements.circle);
        if(render_elements.icon !== null){
            base.addChild(render_elements.icon);
        }
        base.addChild(render_elements.hostname);
        base.hitArea = render_elements.hit_area;
        base.interactiveChildren = true;
        base.eventMode = "static"


        if(entry.isAuth !== "yes" && entry.isReachable && entry.isManaged){
            base.addChild(render_elements.spinner);
            if(render_context.app){
                render_context.app.ticker.add(render_elements.spinner_cb);
            }
        }
        
        base.x = node_pos.x
        base.y = node_pos.y
        base.zIndex = node_zindex;
        base.roundPixels = false;

        const showFullNodeMenu = shouldShowFullNodeMenu(entry.isReachable, entry.isAuth)

        base.anywhere_ext.context_menu = false;

        setTimeout(() => prepare_main_context_menu(render_context, base, entry, showFullNodeMenu), 100);

        base.anywhere_ext.unmanaged_context_menu = false;
        const prepare_unmanaged_context_menu = () => {
            const tab_index = {
                "info":0,
                "statistic":1,
                "settings":2,
                "maintenance":3,
                "security":4
            }
            base.anywhere_ext.unmanaged_context_menu = create_context_menu(
                render_context,
                [
                    {
                        icon_key: "add",
                        tool_tip: render_context.translator("add"),
                        callback: () => {
                            render_context.node_add_cb(entry.id);
                        },
                        submenu: []
                    }
                ],
                250
            );
            if(base.anywhere_ext.unmanaged_context_menu === false){
                setTimeout(prepare_unmanaged_context_menu, 100);
            }
        };
        setTimeout(prepare_unmanaged_context_menu, 100);

        let interaction_ref = {}
        base.onpointerdown = (e) => {
            interaction_ref.dragging = true;
            render_context.dragging = true;
            if(interaction_ref.hover_menu_opened){
                render_context.node_hover_end_cb(entry.id);
            }
            base.zIndex = clicked_node_zindex;
            for(const [id, actor] of Object.entries(render_context.node_actor_lookup)){
                if(actor !== base){
                    actor.zIndex = node_zindex;
                }
            }
            if(interaction_ref.last_animation_timeout !== undefined){
                clearTimeout(interaction_ref.last_animation_timeout);
            }
        };

        base.onglobalpointermove = (e) => {
            if(!interaction_ref.dragging){
                return;
            }

            const local_position = main_container.toLocal(e.global);
            base.x = local_position.x;
            base.y = local_position.y;

            // const fade_time_ms = 1;

            if(base.anywhere_ext.link_anchors !== undefined){
                for(const link_anchor of base.anywhere_ext.link_anchors){
                    let r = link_anchor.link_actor.anywhere_ext.render_elements.snapshot;
                    r.from.x = link_anchor.from_node_actor.x;
                    r.from.y = link_anchor.from_node_actor.y;
                    r.to.x = link_anchor.to_node_actor.x;
                    r.to.y = link_anchor.to_node_actor.y;

                    link_anchor.link_actor.removeChildren();

                    if(!render_moving_links && link_anchor.link_actor.alpha === 1){
                        link_anchor.link_actor.alpha = 0;

                        // let time_animated_ms = 0;
                        // const animate_fade_out = (t) => {
                        //     time_animated_ms += t.deltaMS;
                        //     let progress = time_animated_ms / fade_time_ms;
                        //     if(progress > 1){
                        //         progress = 1;
                        //     }
                        //     link_anchor.link_actor.alpha = (1 - progress);
                        //     if(progress === 1){
                        //         link_anchor.link_actor.alpha = 0;
                        //         render_context.app.ticker.remove(animate_fade_out);
                        //     }
                        // }
                        // if(link_anchor.link_actor.anywhere_ext.last_fade_callback !== undefined){
                        //     render_context.app.ticker.remove(link_anchor.link_actor.anywhere_ext.last_fade_callback);
                        // }
                        // link_anchor.link_actor.anywhere_ext.last_fade_callback = animate_fade_out;
                        // render_context.app.ticker.add(animate_fade_out);
                    }

                    if(render_moving_links || link_anchor.link_actor.alpha !== 0){
                        const render_elements = create_link_graphics(r.from, r.to, r.status, r.type, r.link_index, r.total_link, r.band, r.channel, r.frequency, r.channel_bandwidth, r.speed, r.color, render_context.app.renderer, render_context.show_link_label, link_anchor.link_actor.anywhere_ext.render_elements);
                        link_anchor.link_actor.anywhere_ext.render_elements = render_elements;
                        link_anchor.link_actor.addChild(render_elements.curve);
                    }
                }
            }

            base.anywhere_ext.position_mdop_actors();
        };

        const pointerup_callback = () => {
            if(!interaction_ref.dragging){
                return;
            }
            interaction_ref.dragging = false;
            render_context.dragging = false;
            node_pos.x = base.x;
            node_pos.y = base.y;

            // const fade_time_ms = 1;

            if(base.anywhere_ext.link_anchors !== undefined){
                for(const link_anchor of base.anywhere_ext.link_anchors){
                    let r = link_anchor.link_actor.anywhere_ext.render_elements.snapshot;
                    r.from.x = link_anchor.from_node_actor.x;
                    r.from.y = link_anchor.from_node_actor.y;
                    r.to.x = link_anchor.to_node_actor.x;
                    r.to.y = link_anchor.to_node_actor.y;

                    link_anchor.link_actor.removeChildren();

                    const render_elements = create_link_graphics(r.from, r.to, r.status, r.type, r.link_index, r.total_link, r.band, r.channel, r.frequency, r.channel_bandwidth, r.speed, r.color, render_context.app.renderer, render_context.show_link_label, link_anchor.link_actor.anywhere_ext.render_elements);
                    link_anchor.link_actor.anywhere_ext.render_elements = render_elements;
                    link_anchor.link_actor.addChild(render_elements.curve);

                    if(!render_moving_links){
                        link_anchor.link_actor.alpha = 1;

                        // let time_animated_ms = 0;
                        // const animate_fade_in = (t) => {
                        //     time_animated_ms += t.deltaMS;
                        //     let progress = time_animated_ms / fade_time_ms;
                        //     if(progress > 1){
                        //         progress = 1;
                        //     }
                        //     link_anchor.link_actor.alpha = progress;
                        //     if(progress === 1){
                        //         link_anchor.link_actor.alpha = 1;
                        //         render_context.app.ticker.remove(animate_fade_in);
                        //     }
                        // }
                        // if(link_anchor.link_actor.anywhere_ext.last_fade_callback !== undefined){
                        //     render_context.app.ticker.remove(link_anchor.link_actor.anywhere_ext.last_fade_callback);
                        // }
                        // link_anchor.link_actor.anywhere_ext.last_fade_callback = animate_fade_in;
                        // if(link_anchor.link_actor.alpha !== 1.0){
                        //     render_context.app.ticker.add(animate_fade_in);
                        // }
                    }
                }
            }

            render_context.update_node_positions_cb(render_context.node_pos_ref, render_context.background);
        };
        base.anywhere_ext.pointerup_callback = pointerup_callback;

        base.onpointerenter = (e) => {
            if(render_context.adjusting_background){
                return;
            }
            if(entry.id !== "A-NM" && !interaction_ref.dragging && !render_context.dragging){
                interaction_ref.hover_menu_opened = true;
                render_context.node_hover_begin_cb(entry.id, {x: e.client.x, y:e.client.y});

                const mdop_neighbor_ids = []
                const node_ref = render_context.node_lookup[entry.id];
                for(const mdop_id of node_ref.mdopInfo.mdopIdList){
                    const mdop = render_context.mdop_table[mdop_id];
                    if(mdop === undefined){
                        continue;
                    }

                    for(const [ip, details] of Object.entries(mdop.neighbors)){
                        mdop_neighbor_ids.push(ip);
                    }
                }

                interaction_ref.last_animation_timeout = setTimeout(() => {
                    let animation_time_ms = 0;
                    const blink_duration = 1000;
                    const blink_segment = 1000 / 3;
                    const animate = (time) => {
                        animation_time_ms += time.deltaMS;
                        const progress = Math.sin(((animation_time_ms % blink_segment) / blink_segment) * Math.PI);
                        const indicators = [];
                        for(const id of mdop_neighbor_ids){
                            const node_actor = render_context.node_actor_lookup[id];
                            if(node_actor === undefined){
                                continue;
                            }
                            const hidden_eth_indicator =  node_actor.anywhere_ext.render_elements.hidden_eth_indicator;
                            if(hidden_eth_indicator !== null){
                                indicators.push(hidden_eth_indicator);
                            }
                        }

                        let alpha = 0.5 + progress * 0.5;
                        if(animation_time_ms >= blink_duration){
                            render_context.app.ticker.remove(animate);
                            alpha = 0.5;
                        }
                        for(const indicator of indicators){
                            indicator.alpha = alpha;
                        }
                    }
                    render_context.app.ticker.add(animate);
                }, 750);
            }
        };

        base.onpointerleave = (e) => {
            if(interaction_ref.hover_menu_opened){
                render_context.node_hover_end_cb(entry.id);
            }
            if(interaction_ref.last_animation_timeout !== undefined){
                clearTimeout(interaction_ref.last_animation_timeout);
            }
        };

        base.onrightclick = (e) => {
            if(render_context.adjusting_background){
                return;
            }
            if(interaction_ref.hover_menu_opened){
                render_context.node_hover_end_cb(entry.id);
            }
            if(entry.id === "A-NM"){
                return;
            }
            if(!base.anywhere_ext.node.isAuth){
                return;
            }
            let context_menu = base.anywhere_ext.context_menu;
            if(!base.anywhere_ext.node.isManaged){
                context_menu = base.anywhere_ext.unmanaged_context_menu;
            }

            if(context_menu !== false){
                context_menu.menu_container.x = base.x;
                context_menu.menu_container.y = base.y;
                context_menu.menu_container.zIndex = menu_zindex + 1;
                render_context.main_container.addChild(context_menu.menu_container);
                context_menu.open('node', base.anywhere_ext.node);

                const leave_cb = () => {
                    context_menu.close();
                }

                const leave_trigger = deploy_leave_hitbox(render_context, leave_cb);

                context_menu.on_close = () => {
                    leave_trigger(undefined, false);
                }
            }
            if(interaction_ref.last_animation_timeout !== undefined){
                clearTimeout(interaction_ref.last_animation_timeout);
            }
        }

        render_context.pointerup_callbacks.push(pointerup_callback);

        render_context.node_actor_lookup[entry.id] = base
        main_container.addChild(base);

        base.anywhere_ext.position_mdop_actors = () => {
            if(base.anywhere_ext.mdop_anchors === undefined){
                return;
            }
            const mdop_anchors = base.anywhere_ext.mdop_anchors;
            mdop_anchors.sort((lhs, rhs) => {
                if(lhs.anywhere_ext.eth > rhs.anywhere_ext.eth){
                    return 1;
                }
                return -1;
            })
            for(let i = 0;i < mdop_anchors.length; i++){
                const mdop_actor = mdop_anchors[i];
                mdop_actor.x = base.x + node_circle_radius + 4;
                mdop_actor.y = base.y - node_circle_radius + i * 30 - 3;
            }
        }
    }
    if(node_position_updated){
        render_context.update_node_positions_cb(render_context.node_pos_ref, render_context.background);
    }
    
    for(const entry of node_actors_to_update){
        entry.actor.anywhere_ext.node = entry.node;

        const node_info = render_context.node_info_ref[entry.node.id]
        if(render_context.app){
            render_context.app.ticker.remove(entry.actor.anywhere_ext.render_elements.spinner_cb)
        }
        const spinner_rotation_progress = entry.actor.anywhere_ext.render_elements.spinner.rotation;

        const hostname = entry.node_id === "A-NM" ? render_context.translator("anmLabel") : (node_info !== undefined ? (entry.node.isHostNode ? node_info.hostname + "\n" + render_context.translator("hnLbl") : node_info.hostname) : convertIpToMac(entry.node.id))
        let render_elements = create_node_graphics(
            entry.node.isAuth,
            entry.node.isReachable,
            entry.node.isManaged,
            entry.node.id === "A-NM",
            entry.node.isMobile,
            entry.node.operationMode,
            render_context.preload_icons,
            hostname,
            render_context.hidden_links_by_node[entry.node.id] !== undefined
        );

        entry.actor.anywhere_ext.render_elements = render_elements;
        
        entry.actor.removeChildren();
        entry.actor.addChild(render_elements.circle);
        if(render_elements.icon !== null){
            entry.actor.addChild(render_elements.icon);
        }
        entry.actor.addChild(render_elements.hostname);
        entry.actor.hitArea = render_elements.hit_area;
        entry.actor.anywhere_ext.render_elements = render_elements;

        if(entry.node.isAuth !== "yes" && entry.node.isReachable && entry.node.isManaged){
            entry.actor.addChild(render_elements.spinner);
            render_elements.spinner.rotation = spinner_rotation_progress;
            if(render_context.app){
                render_context.app.ticker.add(render_elements.spinner_cb);
            }
        }
        const base = entry.actor;
        base.anywhere_ext.context_menu = false;
        const showFullNodeMenu = shouldShowFullNodeMenu(entry.node.isReachable, entry.node.isAuth);
        setTimeout(() => prepare_main_context_menu(render_context, base, entry.node, showFullNodeMenu), 100);

    }

    render_context.node_lookup = node_lookup;

    if(fit_canvas_when_done){
        const wrapper_style = render_context.background.wrapperStyle;
        if(
            wrapper_style !== undefined &&
            wrapper_style.scale !== undefined &&
            wrapper_style.translate !== undefined &&
            wrapper_style.translate.x !== undefined &&
            wrapper_style.translate.y !== undefined &&

            wrapper_style.scale !== null &&
            wrapper_style.translate.x !== null &&
            wrapper_style.translate.y !== null
        ){
            main_container.scale = wrapper_style.scale;
            main_container.x = wrapper_style.translate.x;
            main_container.y = wrapper_style.translate.y;
        }else{
            networkGraphHandler.zoomToFit();
        }
    }
}

// Currently under performance evaluation
// Follows TopologyGraph api, not a complete implementation at the moment
const TopologyGraphPixi = (props) => {
    const {lang} = useSelector(store => store.common);
    const dispatch = useDispatch();

    const render_context = useRef({});

    const resize_container = () => {
        if(render_context.current.app === undefined){
            return;
        }

        const device_pixel_ratio = render_context.current.device_pixel_ratio === undefined? 1: render_context.current.device_pixel_ratio;

        const backdrop_hitbox = render_context.current.backdrop_hitbox;
        backdrop_hitbox.hitArea = new PIXI.Rectangle(0, 0, window.screen.width * device_pixel_ratio, window.screen.height * device_pixel_ratio);
    }

    const process_links = (links, show_eth_links) => {
        const link_lookup = {};
        const hidden_links_by_node = {};
        for(const link of links){
            if(link.type === "EthernetLink" && !show_eth_links){
                let from_entry = hidden_links_by_node[link.from];
                if(from_entry === undefined){
                    from_entry = []
                    hidden_links_by_node[link.from] = from_entry;
                }
                from_entry.push(link);

                let to_entry = hidden_links_by_node[link.to];
                if(to_entry === undefined){
                    to_entry = []
                    hidden_links_by_node[link.to] = to_entry;
                }
                to_entry.push(link);

                continue;
            }
            const lookup_key = link.from > link.to ? `${link.from}-${link.to}` : `${link.to}-${link.from}`
            let entry = link_lookup[lookup_key];
            if(entry === undefined){
                entry = [];
                link_lookup[lookup_key] = entry;
            }
            entry.push(link)
        }
        const processed_links = []
        for(const [key, entry] of Object.entries(link_lookup)){
            let index = 0;
            for(const link of entry){
                link.totalLink = entry.length;
                link.linkIndex = index;
                index++;
                processed_links.push(link)
            }
        }
        return [processed_links, hidden_links_by_node];
    }

    const update_graph = () => {
        render_context.current.nodes_ref = props.graph.nodes.filter(() => {return true});
        [render_context.current.links_ref, render_context.current.hidden_links_by_node] = process_links(props.graph.links, props.showEthLink);
        render_context.current.node_info_ref = props.nodeInfo;
        render_context.current.link_info_ref = props.linkInfo;
        render_context.current.show_link_label = props.showLinkLabel;
        render_context.current.rssi_color = props.rssiColor;
        render_context.current.show_eth_link = props.showEthLink;
        render_context.current.image = props.image;
        render_context.current.background = props.background;
        render_context.current.mdop_table = props.mdopTable;

        if(render_context.current.renderer_parent !== undefined){
            render_context.current.renderer_parent.style.background = render_context.current.background.color;
        }
        render_context.current.adjusting_background = props.adjustMode;

        // insert a-nm node and link to hostnode
        const nodes_ref = render_context.current.nodes_ref;
        const links_ref = render_context.current.links_ref;
        let anm_found = false;
        let host_node = null;
        let anm_link = null;
        for(const node of nodes_ref){
            if(node.id === "A-NM"){
                anm_found = true;
            }
            if(node.isHostNode){
                host_node = node;
            }
            if(host_node !== null && anm_found){
                break;
            }
        }
        if(!anm_found){
            nodes_ref.push({
                id: "A-NM",
            });
        }
        for(const link of links_ref){
            if(link.id === "A-NM"){
                anm_link = link;
                break;
            }
        }
        if(host_node !== null){
            if(anm_link === null){
                anm_link = {};
                links_ref.push(anm_link);
            }
            anm_link.id = "A-NM";
            anm_link.from = "A-NM";
            anm_link.type = "A-NM";
            anm_link.to = host_node.id;
            anm_link.totalLink = 1;
            anm_link.linkIndex = 0;
        }

        const draw_task = () => {
            create_update_or_remove_node_actors(render_context.current, false);
            create_update_or_remove_link_actors(render_context.current);
            create_or_update_background_actor(render_context.current);
            update_background_adjust_actor(render_context.current);
            create_update_or_remove_mdop_actors(render_context.current);
        }
        setTimeout(draw_task, 0);
    }

    const init_graph = () => {
        console.log("kenny_init_graph")
        console.log(props.pixiSettings)
        let antialias= false,
            resolution= 1,
            maxFPS= 30,
            minFPS= 10,
            clearBeforeRender= true,
            preference= 'webgl';
        if (props.pixiSettings) {
            antialias = props.pixiSettings.antialias;
            resolution = props.pixiSettings.resolution;
            maxFPS = props.pixiSettings.maxFPS;
            minFPS = props.pixiSettings.minFPS;
            clearBeforeRender = props.pixiSettings.clearBeforeRender;
            preference = props.pixiSettings.preference;
        }
        const renderer_parent = document.getElementById("topology-graph")
        renderer_parent.oncontextmenu = () => {return false};
        const app = new PIXI.Application();

        const pointerup_callbacks = []
        render_context.current.pointerup_callbacks = pointerup_callbacks;
        const run_pointerup_callbacks = () => {
            for(const callback of pointerup_callbacks){
                callback();
            }
        }

        //window.addEventListener("mouseup", run_pointerup_callbacks);
        //window.addEventListener("mouseout", run_pointerup_callbacks);
        //window.addEventListener("touchend", run_pointerup_callbacks);

        dispatch(toggleLockLayer(true));
        app.init({
            antialias,
            preference,
            backgroundAlpha: 0.0,
            resolution,
            clearBeforeRender,
        }).then(() => {
            let preload_icons = {
                blocklink: null,
                info: null,
                statistic: null,
                settings: null,
                maintenance: null,
                security: null,
                linkalignment: null,
                spectrumscan: null,
                rssi: null,
                anm: null,
                notAuthAp: null,
                router: null,
                add: null,
                networkTools: null,
                back: null,
                noderecovery: null,
                meshMobile: null,
                meshOnly: null,
                meshStatic: null,
                mobileOnly: null,
                staticOnly: null,
                disable: null,
                cloudOffline: null,
                historicalData: null,
            }
            app.ticker.minFPS = minFPS;
            app.ticker.maxFPS = maxFPS;
            const remove_curtain = () => {
                for(const [key, texture] of Object.entries(preload_icons)){
                    if(texture === null){
                        return;
                    }
                }
                update_graph();
                dispatch(toggleLockLayer(false));
            }
            for(const key of Object.keys(preload_icons)){
                let path = `/img/icons/${key}.svg`;
                const load_svg = () => {
                    // this does not work with release nwjs
                    /*
                    PIXI.Assets.load(path).then((resolved_asset) => {
                        preload_icons[key] = resolved_asset
                    }).catch(() => {
                        // for now, just try again later
                        setTimeout(load_svg(), 1000);
                    })
                    */
                    const img = new Image();
                    img.onerror = () => {
                        console.error({failed_image_path:path});
                        setTimeout(load_svg(), 1000);
                    }
                    img.onload = () => {
                        const texture = create_texture_from_img_svg(img, 4);
                        preload_icons[key] = texture;
                        remove_curtain();
                    }
                    img.src = path;
                }
                load_svg();
            }
            render_context.current.preload_icons = preload_icons

            renderer_parent.appendChild(app.canvas);
            app.canvas.style.width = "100%";
            app.canvas.style.height = "100%";
            app.canvas.setAttribute("id", "pixi_topology_canvas");
            render_context.current.renderer_parent = renderer_parent;
            render_context.current.app = app;
            render_context.current.nodes_ref = props.graph.nodes.filter(() => {return true});
            [render_context.current.links_ref, render_context.current.hidden_links_by_node] = process_links(props.graph.links, props.showEthLink);
            render_context.current.node_info_ref = props.nodeInfo;
            render_context.current.link_info_ref = props.linkInfo;
            render_context.current.translator = props.t;
            render_context.current.node_pos_ref = props.nodesPos;
            render_context.current.rssi_color = props.rssiColor;
            render_context.current.show_eth_link = props.showEthLink;
            render_context.current.image = props.image;
            render_context.current.background = props.background;
            render_context.current.renderer_parent.style.background = render_context.current.background.color;
            render_context.current.adjusting_background = props.adjustMode;
            render_context.current.mdop_table = props.mdopTable;

            render_context.current.update_node_positions_cb = props.eventHandler.updateUiProjectSettings;
            render_context.current.update_pan_zoom_cb = props.eventHandler.updateUiProjectSettings;
            render_context.current.open_context_menu_cb = props.eventHandler.map.openContextMenu;
            render_context.current.close_context_menu_cb = props.eventHandler.map.closeContextMenu;
            render_context.current.node_hover_begin_cb = props.eventHandler.node.onHover;
            render_context.current.node_hover_end_cb = props.eventHandler.node.onHoverLeave;
            render_context.current.node_open_info_window_cb = props.eventHandler.node.menuFunc.openDraggableBox;
            render_context.current.node_link_alignment_cb = props.eventHandler.node.menuFunc.openLinkAlignment;
            render_context.current.node_spectrum_scan_cb = props.eventHandler.node.menuFunc.openSpectrumScan;
            render_context.current.node_recovery_cb = props.eventHandler.node.menuFunc.openNodeRecovery;
            render_context.current.node_add_cb = props.eventHandler.node.menuFunc.addDeviceToList;
            render_context.current.link_hover_begin_cb = props.eventHandler.link.onHover;
            render_context.current.link_hover_end_cb = props.eventHandler.link.onHoverLeave;
            render_context.current.link_block_cb = props.eventHandler.link.menuFunc.blocklink;
            render_context.current.node_mdop_click_cb = props.eventHandler.node.onMdopClick;
            render_context.current.node_mdop_clickout_cb = props.eventHandler.node.onMdopLeave;


            // insert a-nm node and link to hostnode
            const nodes_ref = render_context.current.nodes_ref;
            const links_ref = render_context.current.links_ref;
            let anm_found = false;
            let host_node = null;
            let anm_link = null;
            for(const node of nodes_ref){
                if(node.id === "A-NM"){
                    anm_found = true;
                }
                if(node.isHostNode){
                    host_node = node;
                }
                if(host_node !== null && anm_found){
                    break;
                }
            }
            if(!anm_found){
                nodes_ref.push({
                    id: "A-NM",
                });
            }
            for(const link of links_ref){
                if(link.id === "A-NM"){
                    anm_link = link;
                    break;
                }
            }
            if(host_node !== null){
                if(anm_link === null){
                    anm_link = {};
                    links_ref.push(anm_link);
                }
                anm_link.id = "A-NM";
                anm_link.from = "A-NM";
                anm_link.type = "A-NM";
                anm_link.to = host_node.id;
                anm_link.totalLink = 1;
                anm_link.linkIndex = 0;
            }

            // set initial positions if no position was found for A-NM
            /*
            const node_pos_ref = render_context.current.node_pos_ref;
            if(node_pos_ref["127.0.0.1"] === undefined){
                // initialize positions
                const horizontal_offset = 120;
                const vertical_offset = 120;
                const nodes_per_row = 10;
                let current_node = 2;
                nodes_ref.sort((a, b) => {
                    return a.id < b.id ? -1 : 1
                })
                for(const node of nodes_ref){
                    if(node.id == "A-NM"){
                        node_pos_ref["127.0.0.1"] = {
                            x:0,
                            y:0
                        };
                        continue;
                    }
                    if(node.isHostNode){
                        node_pos_ref[node.id] = {
                            x:horizontal_offset,
                            y:0
                        }
                        continue;
                    }
                    const row_num = Math.floor(current_node / nodes_per_row);
                    const col_num = current_node % nodes_per_row;
                    node_pos_ref[node.id] = {
                        x: horizontal_offset * col_num,
                        y: vertical_offset * row_num
                    }
                    current_node++;
                }
            }
            */

            // interaction locking containers
            let inapp_lock = new PIXI.Graphics();
            inapp_lock.eventMode = "passive";
            renderer_parent.onpointerenter = () => {
                inapp_lock.eventMode = "passive";
            }
            renderer_parent.onpointerleave = () => {
                inapp_lock.eventMode = "none";
            }
            render_context.current.inapp_lock = inapp_lock;
            app.stage.addChild(inapp_lock);

            let panning_lock = new PIXI.Graphics();
            panning_lock.eventMode = "passive";
            render_context.current.panning_lock = panning_lock;
            inapp_lock.addChild(panning_lock);

            let new_stage = new PIXI.Graphics();
            new_stage.eventMode = "static";
            render_context.current.new_stage = new_stage;
            panning_lock.addChild(new_stage);

            let main_container = new PIXI.Graphics();
            main_container.eventMode = "passive";
            main_container.zIndex = 1;
            main_container.x = 80;
            main_container.y = 80;
            new_stage.addChild(main_container);
            render_context.current.main_container = main_container;

            app.stage.eventMode = "passive";
            main_container.scale = 1.0;
            let ui_settings_timeout = null;
            new_stage.onwheel = (e) => {
                const local_pointer_position = main_container.toLocal(e.global);
                const current_scale = main_container.scale.x;
                let new_scale = current_scale + 0.0005 * e.deltaY * -1;
                if(new_scale < main_container_min_scale){
                    new_scale = main_container_min_scale;
                }
                if(new_scale > main_container_max_scale){
                    new_scale = main_container_max_scale;
                }
                main_container.scale = new_scale;
                const scale_diff = new_scale - current_scale;
                main_container.x = main_container.x - local_pointer_position.x * (scale_diff);
                main_container.y = main_container.y - local_pointer_position.y * (scale_diff);
                let background = render_context.current.background;
                if(background === undefined){
                    background = {};
                    render_context.current.background = background;
                }
                let wrapper_style = render_context.current.background.wrapperStyle;
                if(wrapper_style === undefined){
                    wrapper_style = {};
                    render_context.current.background.wrapperStyle = wrapper_style;
                }
                wrapper_style.scale = new_scale;
                wrapper_style.translate = {x:main_container.x, y:main_container.y};
                if(ui_settings_timeout !== null){
                    clearTimeout(ui_settings_timeout);
                }
                ui_settings_timeout = setTimeout(() => {
                    render_context.current.update_pan_zoom_cb(render_context.current.node_pos_ref, render_context.current.background);
                }, 1000);
            }
            new_stage.onpointerup = run_pointerup_callbacks;
            new_stage.onpointerleave = run_pointerup_callbacks;
            render_context.current.global_pointer_move_event = {
                client:{
                    x:0,
                    y:0
                },
                global:{
                    x:0,
                    y:0
                }
            };
            new_stage.onglobalpointermove = (e) => {
                render_context.current.global_pointer_move_event = e;
            };

            let backdrop_hitbox = new PIXI.Graphics();
            backdrop_hitbox.hitArea = new PIXI.Rectangle(0, 0, window.screen.width * window.devicePixelRatio, window.screen.height * window.devicePixelRatio);
            backdrop_hitbox.eventMode = "static";
            backdrop_hitbox.zIndex = 0;
            let backdrop_hitbox_interaction_ref = {}
            backdrop_hitbox.onpointerdown = (e) => {
                if(backdrop_hitbox_interaction_ref.context_menu_opened){
                    render_context.current.close_context_menu_cb();
                    backdrop_hitbox_interaction_ref.context_menu_opened = false;
                }

                backdrop_hitbox_interaction_ref.dragging = true;
                render_context.current.dragging = true;
                let pointer_location = new_stage.toLocal(e.global);
                backdrop_hitbox_interaction_ref.main_container_offset = {x:pointer_location.x - main_container.x, y:pointer_location.y - main_container.y};
            }
            backdrop_hitbox.onglobalpointermove = (e) => {
                if(!backdrop_hitbox_interaction_ref.dragging){
                    return;
                }
                let pointer_location = new_stage.toLocal(e.global);
                main_container.x = pointer_location.x - backdrop_hitbox_interaction_ref.main_container_offset.x;
                main_container.y = pointer_location.y - backdrop_hitbox_interaction_ref.main_container_offset.y;
            }
            const backdrop_hitbox_pointerup = () => {
                if(!backdrop_hitbox_interaction_ref.dragging){
                    return;
                }
                render_context.current.dragging = false;
                backdrop_hitbox_interaction_ref.dragging = false;

                let background = render_context.current.background;
                if(background === undefined){
                    background = {};
                    render_context.current.background = background;
                }
                let wrapper_style = render_context.current.background.wrapperStyle;
                if(wrapper_style === undefined){
                    wrapper_style = {};
                    render_context.current.background.wrapperStyle = wrapper_style;
                }
                wrapper_style.translate = {x:main_container.x, y:main_container.y}
                wrapper_style.scale = main_container.scale.x;
                render_context.current.update_pan_zoom_cb(render_context.current.node_pos_ref, render_context.current.background);
            };
            pointerup_callbacks.push(backdrop_hitbox_pointerup);
            backdrop_hitbox.onrightclick = (e) => {
                if(render_context.current.adjusting_background){
                    return;
                }
                backdrop_hitbox_interaction_ref.context_menu_opened = true;
                render_context.current.open_context_menu_cb({x:e.client.x, y:e.client.y});
            }

            new_stage.addChild(backdrop_hitbox);
            render_context.current.backdrop_hitbox = backdrop_hitbox;

            render_context.current.node_actor_lookup = {};
            render_context.current.link_actor_lookup = {};

            const draw_task = () => {
                create_update_or_remove_node_actors(render_context.current, true);
                create_update_or_remove_link_actors(render_context.current);
                create_or_update_background_actor(render_context.current);
                update_background_adjust_actor(render_context.current);
                create_update_or_remove_mdop_actors(render_context.current);
            }

            setTimeout(draw_task, 0);

            networkGraphHandler.zoomToFit = () => {
                const center_main_container = () => {
                    const main_container = render_context.current.main_container;
                    const app = render_context.current.app;

                    // derive new scale
                    const padding = 240;
                    let bounds = main_container.getLocalBounds();
                    const width_scale = app.renderer.width / (bounds.width + padding * 2);
                    const height_scale = app.renderer.height / (bounds.height + padding * 2);
                    let scale = width_scale > height_scale? height_scale: width_scale;
                    scale = scale < main_container_min_scale? main_container_min_scale: scale;
                    scale = scale > main_container_max_scale? main_container_max_scale: scale;

                    const new_location = {x:app.renderer.width / 2 - bounds.width * scale / 2 - bounds.left * scale, y:app.renderer.height / 2 - bounds.height * scale / 2 - bounds.top * scale};
                    animate_pan_scale(new_location, scale, render_context.current, () => {});
                }

                let background_adjust_actor = render_context.current.background_adjust_actor;
                let reinsert_background_adjust_actor = background_adjust_actor !== undefined && background_adjust_actor.parent === render_context.current.main_container;

                let background_actor = render_context.current.background_actor;
                let reinsert_background_actor = background_actor !== undefined && background_actor.parent === render_context.current.main_container;

                if(reinsert_background_adjust_actor){
                    render_context.current.main_container.removeChild(background_adjust_actor);
                }
                if(reinsert_background_actor){
                    render_context.current.main_container.removeChild(background_actor);
                }

                center_main_container();

                if(reinsert_background_adjust_actor){
                    render_context.current.main_container.addChild(background_adjust_actor);
                }
                if(reinsert_background_actor){
                    render_context.current.main_container.addChild(background_actor);
                }
            }

            networkGraphHandler.capture = () => {
                const p = app.renderer.extract.base64({
                    antialias:true,
                    format:"png",
                    target: app.stage,
                    clearColor:render_context.current.renderer_parent.style.background,
                    frame:new PIXI.Rectangle(0, 0, app.renderer.width, app.renderer.height),
                    resolution:render_context.current.main_container.scale.x >= 1.0? 1.0: 1.0 / render_context.current.main_container.scale.x
                });
                return p;
            }

            const update_renderer_size = () => {
                if(render_context.current.app === null){
                    window.removeEventListener("resize", update_renderer_size);
                    return;
                }

                let parent_bounds = renderer_parent.getBoundingClientRect();

                let device_pixel_ratio = window.devicePixelRatio;
                if(disable_hidpi){
                    device_pixel_ratio = 1;
                }
                render_context.current.device_pixel_ratio = device_pixel_ratio;
                const width = parent_bounds.width * device_pixel_ratio;
                const height = parent_bounds.height * device_pixel_ratio;

                render_context.current.app.canvas.width = width;
                render_context.current.app.canvas.height = height;
                render_context.current.app.renderer.resize(width, height);
            }
            window.addEventListener("resize", update_renderer_size);

            const update_pixel_ratio = () => {
                const mq_string = `(resolution: ${window.devicePixelRatio}dppx)`;
                const media = matchMedia(mq_string);
                media.addEventListener("change", update_pixel_ratio);

                if(render_context.current.app !== null){
                    update_renderer_size();
                }
            }

            update_pixel_ratio();
        }).catch(() => {
            // critical?
        })

        return () => {
            renderer_parent.removeChild(app.canvas);
            render_context.current.app.destroy(false, {
                children: true,
                context: true,
                style: true,
                texture: true,
                textureSource: false
            });
            delete render_context.current.app;
            render_context.current.app = null;

            const dangling_window_events = render_context.dangling_window_events;
            if(dangling_window_events !== undefined){
                for(const [event, cb] of dangling_window_events){
                    window.removeEventListener(event, cb);
                }
            }
        }
    }

    useEffect(init_graph, [])

    useEffect(update_graph, [props.lastUpdateTime.graph])
    useEffect(update_graph, [props.graphUpdate])
    useEffect(update_graph, [props.mdopTable])
    useEffect(update_graph, [lang])
    useEffect(update_graph, [props.showEthLink]);
    useEffect(update_graph, [props.lastUpdateTime.nodeInfo]);
    useEffect(update_graph, [props.lastUpdateTime.linkInfo]);
    useEffect(update_graph, [props.showLinkLabel]);
    useEffect(update_graph, [props.rssiColor]);
    useEffect(update_graph, [props.image]);
    useEffect(update_graph, [props.background]);
    useEffect(update_graph, [props.adjustMode]);
    useEffect(() => {
        const app = render_context.current.app;
        if(app){
            app.ticker.maxFPS = props.pixiSettings.maxFPS;
            app.ticker.minFPS = props.pixiSettings.minFPS;
        }

    }, [props.pixiSettings.maxFPS, props.pixiSettings.minFPS]);

    // ???
    useEffect(() => {
        render_context.current.link_block_cb = props.eventHandler.link.menuFunc.blocklink;
    }, [props.eventHandler.link.menuFunc.blocklink])
    useEffect(() => {
        render_context.current.node_open_info_window_cb = props.eventHandler.node.menuFunc.openDraggableBox;
    }, [props.eventHandler.node.menuFunc.openDraggableBox])

    const on_mount_init = () => {
        window.addEventListener('resize', resize_container);
    }
    useEffect(on_mount_init, []);

    const close_menus = () => {
        // implement when menus are here
    }

    return (
        <ClickAwayListener
            onClickAway={
                () => {
                    close_menus();
                }}
            >
                <div
                    id="topology-graph"
                    style={{
                        width: '100vw',
                        height: '100%',
                        position: 'relative',
                        userSelect: 'none',
                        background: props.background.show && props.image.set ?
                            props.background.color : '#e5e5e5',
                    }}
                />
        </ClickAwayListener>
    );
}

export default TopologyGraphPixi;
