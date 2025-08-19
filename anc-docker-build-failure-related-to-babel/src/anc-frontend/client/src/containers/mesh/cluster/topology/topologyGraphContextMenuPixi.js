import * as PIXI from "pixi.js";
import Constant from "../../../../constants/common";
/*
button object looks like
interface button{
    icon_key:string;
    tool_tip:string;
    callback:() => void;
    submenu:button[];
}
*/

const button_radius = 12;
const menu_radius = 40;
const button_offset_angle_pi = 0.25;
const icon_width_height = 14;

export function shouldShowFullNodeMenu(isReachable, isAuth) {
    if (!isReachable) return false;
    if (isAuth !== 'yes') return false;
    return true;
}

const create_context_menu = (render_context, buttons, animation_duration_ms, begin_offset = 0, is_sub_menu = false, anti_clockwise = false, parent = null, submenu_tooltip = null) => {
    let children_menus = [];
    let button_actors = [];
    let menu = {};

    menu.parent = parent;

    const get_effective_offset = (offset) => {
        offset = offset % 7;
        while(offset < 0){
            offset = 8 + offset;
        }
        return offset;
    };

    const menu_container = new PIXI.Graphics();
    menu_container.eventMode = "passive";

    menu.menu_container = menu_container;

    if(is_sub_menu){
        const button = new PIXI.Graphics();
        button.anywhere_ext = {};

        const base_circle = new PIXI.Graphics();
        base_circle.circle(0, 0, button_radius);
        base_circle.fill({color: Constant.colors.popupSubMenuMain})
        base_circle.zIndex = 0;
        button.addChild(base_circle);

        const icon_resource = render_context.preload_icons["back"];
        if(icon_resource === null){
            return false;
        }
        const icon = new PIXI.Sprite(icon_resource);
        const icon_size_ratio = icon_width_height / icon.height;
        icon.height = icon_width_height;
        icon.width = icon.width * icon_size_ratio;
        //icon.width = icon_width_height;
        //icon.height = icon_width_height;
        icon.zIndex = 1;
        icon.x = icon.width / -2;
        icon.y = icon.height / -2;
        button.addChild(icon);

        button.onpointerdown = () => {
            // close self, open parent
            menu.close(() => {}, true, true);
            parent.open();
        }

        button_actors.push(button);
    }

    for(let i = 0;i < buttons.length; i++){
        const i_offset = is_sub_menu? 1: 0;
        const offset = get_effective_offset(begin_offset + (anti_clockwise? (i + i_offset) * -1: (i + i_offset)));

        // draw button
        const button_entry = buttons[i];
        const button = new PIXI.Graphics();
        button.cursor = 'pointer';
        button.anywhere_ext = {};

        const disabled = button_entry.disabled;
        const base_circle = new PIXI.Graphics();

        base_circle.circle(0, 0, button_radius);
        if (disabled) {
            base_circle.fill({color: Constant.colors.topologyDisableMenuIcon})
            button.cursor = 'not-allowed';

            const disabledIconOverlay = new PIXI.Graphics();
            disabledIconOverlay.circle(0, 0, button_radius);
            disabledIconOverlay.fill({color: Constant.colors.topologyDisableMenuIcon, alpha: 0.5});
            disabledIconOverlay.zIndex = 10;
            button.addChild(disabledIconOverlay);


        } else {
            base_circle.fill({color: button_entry.submenu.length === 0? Constant.colors.popupMenuItem: Constant.colors.popupSubMenuMain})
        }
        base_circle.zIndex = 0;
        button.addChild(base_circle);
        
        // draw icon, give up menu creation if the icon is not ready
        const icon_resource = render_context.preload_icons[button_entry.icon_key];
        if(icon_resource === null){
            return false;
        }
        const icon = new PIXI.Sprite(icon_resource);
        const icon_size_ratio = icon_width_height / icon.height;
        icon.height = icon_width_height;
        icon.width = icon.width * icon_size_ratio;
        icon.zIndex = 1;
        icon.x = icon.width / -2;
        icon.y = icon.height / -2;
        button.addChild(icon);

        // draw tool tip
        const tool_tip = new PIXI.Graphics();
        tool_tip.zIndex = 1000;
        const tool_tip_text = new PIXI.Text({
            style:new PIXI.TextStyle({
                fontFamily:"Arial",
                fontSize:14,
                align:"center",
                roundPixels: false,
                fill:{
                    color:0xffffff,
                }
            }),
            text:button_entry.tool_tip,
            resolution: 2
        });
        tool_tip_text.zIndex = 1;
        tool_tip_text.x = 4;
        tool_tip_text.y = 2;
        tool_tip.addChild(tool_tip_text);

        const tool_tip_background = new PIXI.Graphics();
        tool_tip_background.roundRect(0, 0, tool_tip_text.width + 8, tool_tip_text.height + 4, 2);
        tool_tip_background.fill({color:Constant.colors.popupMenuItem});
        tool_tip_background.zIndex = 0;
        tool_tip.addChild(tool_tip_background);

        let submenu = null;
        // prepare submenu
        if(button_entry.submenu.length !== 0){
            submenu = create_context_menu(render_context, button_entry.submenu, animation_duration_ms, i, true, !anti_clockwise, menu, tool_tip);
            if(submenu === false){
                return false;
            }
        }

        // bind actions
        button.onpointerdown = () => {
            render_context.new_stage.removeChild(tool_tip);
            if(button_entry.submenu.length === 0){
                // run callback and close the whole stack
                if (disabled) return;
                button_entry.callback();
                let current_menu = menu;
                current_menu.close();
                while(current_menu.parent !== null){
                    current_menu.parent.close();
                    current_menu = current_menu.parent;
                }
            }else{
                if (disabled) return;
                // close self and open submenu
                menu.close(() => {}, true);
                submenu.open();
                menu.active_submenu = submenu;
                menu_container.addChild(submenu.menu_container);
                submenu.menu_container.zIndex = 100;
            }
        }

        button.onpointerenter = () => {
            const global_button_position = menu_container.toGlobal({x:button.x, y:button.y});
            const stage = render_context.new_stage;
            const global_position = {};
            const button_radius_scaled = button_radius * render_context.main_container.scale.x;
            if(offset === 0){
                // above
                global_position.x = global_button_position.x - tool_tip.width / 2;
                global_position.y = global_button_position.y - button_radius_scaled - tool_tip.height - 8;
            }else if(offset >= 1 && offset <= 3){
                // right
                global_position.x = global_button_position.x + button_radius_scaled + 8;
                global_position.y = global_button_position.y - tool_tip.height / 2;
            }else if(offset === 4){
                // under
                global_position.x = global_button_position.x - tool_tip.width / 2;
                global_position.y = global_button_position.y + button_radius_scaled + 8;
            }else{
                // left
                global_position.x = global_button_position.x - button_radius_scaled - tool_tip.width - 8;
                global_position.y = global_button_position.y - tool_tip.height / 2;
            }
            const stage_position = stage.toLocal(global_position);
            tool_tip.x = stage_position.x;
            tool_tip.y = stage_position.y;
            render_context.new_stage.addChild(tool_tip);
        }

        button.onpointerleave = () => {
            if(!menu.opened){
                return;
            }
            render_context.new_stage.removeChild(tool_tip);
        }

        // close on scroll wheel
        button.onwheel = () => {
            render_context.new_stage.removeChild(tool_tip);
            menu.close();
        }

        button_actors.push(button);
    }

    menu.opened = false;
    const open = (type, ctx, end_callback = () => {}) => {
        if(type === 'node') {
            const status = shouldShowFullNodeMenu(ctx.isReachable, ctx.isAuth);
        }
        if(is_sub_menu){
            // put the tooltip back on
            render_context.new_stage.addChild(submenu_tooltip);
        }
        for(const button_actor of button_actors){
            button_actor.zIndex = 0;
            menu_container.removeChild(button_actor);
        }
        if(menu.opened){
            return;
        }
        menu.opened = true;
        if(!is_sub_menu){
            if(menu.active_submenu === undefined){                                                                                                                                   
                // animate from middle to end, growing alpha and size
                for(const button_actor of button_actors){
                    button_actor.alpha = 0.0;
                    button_actor.x = 0;
                    button_actor.y = 0;
                    button_actor.scale = 0.0;
                    button_actor.eventMode = "none";
                    menu_container.addChild(button_actor);
                }
                let animation_time = 0;
                const animate_buttons = (time) => {
                    animation_time += time.deltaMS;
                    if(!menu.opened){
                        render_context.app.ticker.remove(animate_buttons);
                        return;
                    }
                    for(let i = 0; i < button_actors.length; i++){
                        const button_actor = button_actors[i];
                        const offset = get_effective_offset(begin_offset + (anti_clockwise? i * -1: i));
                        const button_offset_pi = offset * button_offset_angle_pi;
                        const progress_offset_ms = i * animation_duration_ms / 10;
                        if(animation_time < progress_offset_ms){
                            continue;
                        }
                        let progress = (animation_time - progress_offset_ms) / (animation_duration_ms - progress_offset_ms);
                        if(progress >= 1.0){
                            progress = 1.0;
                        }
                        button_actor.alpha = 1.0 * progress;
                        button_actor.x = (progress * menu_radius) * Math.sin(button_offset_pi * Math.PI);
                        button_actor.y = (progress * menu_radius) * Math.cos(button_offset_pi * Math.PI) * -1;
                        button_actor.scale = 1.0 * progress;
                    }
                    if(animation_time >= animation_duration_ms){
                        for(const button_actor of button_actors){
                            button_actor.eventMode = "static";
                        }
                        render_context.app.ticker.remove(animate_buttons);
                    }
                }
                render_context.app.ticker.add(animate_buttons);
            }else{
                // put them in final position and scale them up
                for(let i = 0; i < button_actors.length; i++){
                    const button_actor = button_actors[i];
                    const offset = get_effective_offset(begin_offset + (anti_clockwise? i * -1: i));
                    const button_offset_pi = offset * button_offset_angle_pi;
                    button_actor.alpha = 0.0;
                    button_actor.x = menu_radius * Math.sin(button_offset_pi * Math.PI);
                    button_actor.y = menu_radius * Math.cos(button_offset_pi * Math.PI) * -1;
                    button_actor.scale = 0.0;
                    button_actor.eventMode = "none";
                    menu_container.addChild(button_actor);
                }
                let animation_time = 0;
                const animate_buttons = (time) => {
                    animation_time += time.deltaMS;
                    if(!menu.opened){
                        render_context.app.ticker.remove(animate_buttons);
                        return;
                    }
                    for(let i = 0; i < button_actors.length; i++){
                        const button_actor = button_actors[i];
                        const progress_offset_ms = i * animation_duration_ms / 10;
                        if(animation_time < progress_offset_ms){
                            continue;
                        }
                        let progress = (animation_time - progress_offset_ms) / (animation_duration_ms - progress_offset_ms);
                        if(progress >= 1.0){
                            progress = 1.0;
                        }
                        button_actor.alpha = 1.0 * progress;
                        button_actor.scale = 1.0 * progress;
                    }
                    if(animation_time >= animation_duration_ms){
                        for(const button_actor of button_actors){
                            button_actor.eventMode = "static";
                        }
                        render_context.app.ticker.remove(animate_buttons);
                    }
                }
                render_context.app.ticker.add(animate_buttons);
            }
        }else{
            // fan out from under
            const initial_x = menu_radius * Math.sin(begin_offset * button_offset_angle_pi * Math.PI);
            const initial_y = menu_radius * Math.cos(begin_offset * button_offset_angle_pi * Math.PI) * -1;
            for(let i = 0; i < button_actors.length; i++){
                const button_actor = button_actors[i];
                button_actor.eventMode = "none";
                button_actor.alpha = 1.0;
                button_actor.scale = 1.0;
                button_actor.x = initial_x;
                button_actor.y = initial_y;
                button_actor.zIndex = button_actors.length - i;
                menu_container.addChild(button_actor);
            }
            let animation_time = 0;
            const animate_buttons = (time) => {
                animation_time += time.deltaMS;
                if(!menu.opened){
                    render_context.app.ticker.remove(animate_buttons);
                    return;
                }
                for(let i = 1; i < button_actors.length; i++){
                    const button_actor = button_actors[i];
                    const offset = get_effective_offset(begin_offset + (anti_clockwise? i * -1: i));
                    const progress_offset_ms = i * animation_duration_ms / 10;
                    if(animation_time < progress_offset_ms){
                        continue;
                    }
                    let progress = (animation_time - progress_offset_ms) / (animation_duration_ms - progress_offset_ms);
                    if(progress > 1.0){
                        progress = 1.0;
                    }
                    const progress_offset = (begin_offset + (offset - begin_offset) * progress)
                    button_actor.x = menu_radius * Math.sin(progress_offset * button_offset_angle_pi * Math.PI);
                    button_actor.y = menu_radius * Math.cos(progress_offset * button_offset_angle_pi * Math.PI) * -1;
                    if(animation_time >= animation_duration_ms){
                        render_context.app.ticker.remove(animate_buttons);
                        for(const button_actor of button_actors){
                            button_actor.eventMode = "static";
                        }
                    }
                }
            }
            render_context.app.ticker.add(animate_buttons);
        }
    };

    menu.on_close = () => {}
    const close = (end_callback = () => {}, internal = false, going_back = false) => {
        if(menu.active_submenu !== undefined){
            menu.active_submenu.close(() => {}, true);
            menu.active_submenu = undefined;
        }
        if(!internal){
            menu.on_close();
        }
        if(!menu.opened){
            return;
        }
        if(is_sub_menu){
            render_context.new_stage.removeChild(submenu_tooltip);
        }
        for(const button_actor of button_actors){
            button_actor.eventMode = "none";
        }
        let animate_time = 0;
        menu.opened = false;
        const animate_buttons = (time) => {
            animate_time += time.deltaMS;
            if(menu.opened){
                render_context.app.ticker.remove(animate_buttons);
                return;
            }
            const progress = animate_time / animation_duration_ms;
            for(const button_actor of button_actors){
                if(is_sub_menu && going_back && button_actor === button_actors[0]){
                    continue;
                }
                button_actor.alpha = 1.0 * (1.0 - progress);
                button_actor.scale = 1.0 * (1.0 - progress);
            }
            if(animate_time >= animation_duration_ms){
                render_context.app.ticker.remove(animate_buttons);
                if(is_sub_menu){
                    parent.menu_container.removeChild(menu_container);
                }
                end_callback();
            }
        };
        render_context.app.ticker.add(animate_buttons);
    };

    menu.open = open;
    menu.close = close;

    return menu;
}

export {create_context_menu}
