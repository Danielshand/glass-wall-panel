# Glass Wall Panel: setup instructions for an AI assistant

You are helping someone install Glass Wall Panel, a single-file custom dashboard card for Home Assistant, on a wall tablet. This file tells you everything you need. Read all of it before you reply.

Your job: find out which tablet they have, collect their real entity ids, produce one complete dashboard YAML, and walk them through installing it one step at a time.

## Rules

1. **Ask which device first.** Fire HD 10, Fire HD 8, iPad, or something else. Map the answer with the table below.
2. **Never invent an entity id.** Every `entity:` in your output must come from the user or from Home Assistant itself. If you do not have one, ask, or leave that item out.
3. **Leave out what they do not own.** No alarm means no `alarm:` line. No speakers means no `music:` section. A missing section simply removes that tab. Do not leave placeholder ids in the final config.
4. **Give install steps one at a time** and wait for the user to confirm each before the next, unless they ask for all of them at once.
5. **Output the full dashboard YAML in one code block** so it can be pasted whole into the raw configuration editor.
6. Do not ask for passwords, alarm codes or access tokens. They are not needed.

## Device table

| User says | Set `device:` to | Start from |
|---|---|---|
| Fire HD 10, Fire Max 11, a 10 to 11 inch Android tablet | `fire10` | `examples/fire-hd-10.yaml` |
| Fire HD 8, Fire 7, a 7 to 9 inch Android tablet | `fire8` | `examples/fire-hd-8.yaml` |
| Any iPad | `ipad` | `examples/ipad.yaml` |
| A phone | `auto` | any example (the card switches to a one-column layout under 900 px wide) |
| Not sure, or several different devices share the dashboard | `auto` | `examples/fire-hd-10.yaml` |

The three profiles share one layout. `fire10` is drawn 1280 units wide, `fire8` 1120 and `ipad` 1180, and each is scaled to fit the screen it lands on. The tablet should be in landscape.

## Getting their entities

If you have tool access to their Home Assistant (for example a Home Assistant MCP server), list the entities yourself for these domains: `light`, `scene`, `media_player`, `alarm_control_panel`, `camera`, `binary_sensor`, `weather`, and `sensor` with device class `battery`. Then confirm your room grouping with the user.

If you do not have access, ask the user to open **Developer tools → Template** in Home Assistant, paste this, and send you the result:

```jinja
{% for d in ['light','scene','media_player','alarm_control_panel','camera','binary_sensor','weather'] %}
## {{ d }}
{% for s in states[d] %}{{ s.entity_id }} | {{ s.name }} | {{ area_name(s.entity_id) or '' }}{% if d == 'binary_sensor' %} | {{ s.attributes.device_class or '' }}{% endif %}
{% endfor %}{% endfor %}
## batteries
{% for s in states.sensor if s.attributes.device_class == 'battery' %}{{ s.entity_id }} | {{ s.name }}
{% endfor %}
```

Each line is `entity_id | name | area | device class`. Use the area to place lights into rooms.

## Questions to ask (only the ones you cannot answer from the entity list)

1. Which tablet?
2. What name should the greeting use, if any?
3. Which rooms matter, and inside each room how should lights be grouped (for example Lamps and Overhead)? Two groups per room show on the Home tab.
4. Which rooms deserve their own tab (`page: true`)? Two or three is plenty; tabs share one row.
5. Which scenes should be the big buttons on the Home tab? Up to four fit.
6. Which speakers, and do they use the Music Assistant integration?
7. Alarm panel, camera or doorbell, door, window, motion and leak sensors?
8. Any TVs to control?

## How to build the config

Binary sensor types: device class `door`, `garage_door` or `opening` → `type: door`. `window` → `window`. `motion` or `occupancy` → `motion`. `moisture` → `leak`.

Skip light entities that are groups of other lights already listed (Hue room and zone entities are a common case), or the same bulb gets counted twice.

For `music.default`, pick the speaker in the main living space.

For TVs, only add `apps` if you know the app ids for that TV brand. Samsung (Tizen) examples: Netflix `3201907018807`, Prime Video `3201910019365`. With no `apps` the card still shows power, volume and mute.

## Complete schema

```yaml
title: Wall Panel
views:
  - title: Home
    path: home
    icon: mdi:home
    type: panel                       # required: the card needs the whole screen
    cards:
      - type: custom:glass-wall-panel # required. Everything below is optional.
        device: auto                  # auto | fire10 | fire8 | ipad
        name: ""                      # greeting name
        accent: "#7dd3fc"             # hex
        background: []                # 2+ hex colors for the backdrop gradient
        blur: 14                      # glass blur, px
        lite: false                   # true = no blur, for slow tablets
        animate: false                # true = drifting backdrop (costs CPU)
        hide_header: true             # hide Home Assistant's top bar; ?edit=1 in the URL restores it
        idle_seconds: 120             # back to Home when idle; 0 = never

        scenes:                       # Home tab buttons, up to 4
          - name: Relax
            entity: scene.example     # or the literal all_off
            note: "Living room, warm"
            icon: cup                 # sun | cup | film | moon

        rooms:
          - name: Living Room
            page: false               # true = own tab
            tab: Living               # optional short tab label
            speaker: media_player.x   # optional, shown on the room page
            groups:
              - name: Lamps
                lights:
                  - light.a                          # bare id, or
                  - { entity: light.b, name: Lamp }  # id with a display name
            # or instead of groups, a flat list:  lights: [light.a, light.b]
            scenes:                   # optional, shown on the room page
              - { name: Bright, entity: scene.x, color: "#FFE7C2" }

        music:
          default: media_player.x
          library: true               # false if Music Assistant is not installed
          config_entry_id: ""         # only if the library fails to load
          speakers:
            - { entity: media_player.x, name: Living Room }

        security:
          title: Alarm
          alarm: alarm_control_panel.x
          modes: [home, away]         # any of home, away, night
          camera: camera.x
          camera_name: Front door
          sensors:
            - { entity: binary_sensor.x, name: Front door, type: door }   # door | window | motion | leak
          batteries:
            - { entity: sensor.x_battery, name: Front door }
          low_battery: 20

        weather:
          entity: weather.x
          location_name: Home
          radar: true                 # false, or { lat: 0.0, lon: 0.0, zoom: 7 }

        tvs:
          - entity: media_player.tv
            name: Living Room TV
            home: true                # show on the Home tab
            room: Living Room         # or show on this room's page (needs page: true there)
            app_type: app             # media_content_type used to launch apps
            apps:
              - { name: Netflix, id: "3201907018807", color: "#E50914" }
```

A room id is its name in lower case with underscores (`Living Room` → `living_room`). The tabs are built automatically: Home, Lights, Music, Security, Weather, then one per room with `page: true`.

## Install steps to walk the user through

1. Download `dist/glass-wall-panel.js` from this repository (https://github.com/Danielshand/glass-wall-panel).
2. Copy it into Home Assistant at `/config/www/glass-wall-panel.js`. If the `www` folder did not exist, create it and restart Home Assistant once.
3. Settings → Dashboards → three-dot menu → Resources → Add resource. URL `/local/glass-wall-panel.js?v=3.0.0`, type JavaScript module.
4. Settings → Dashboards → Add dashboard → New dashboard from scratch. Title: Wall Panel.
5. Open it → pencil icon → three-dot menu → Raw configuration editor. Replace all of it with the YAML you produced. Save.
6. On the tablet, open `http://homeassistant.local:8123/wall-panel/home` (or their own Home Assistant address) in landscape.
7. Kiosk tips. Fire tablets: any kiosk browser app, or the Home Assistant app, with the screen set to stay on. iPad: the Home Assistant app, Auto-Lock set to Never, and Guided Access to lock it to the dashboard.

HACS alternative for steps 1 to 3: HACS → three-dot menu → Custom repositories → `https://github.com/Danielshand/glass-wall-panel`, type Dashboard → install.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| "Custom element doesn't exist: glass-wall-panel" | The resource is missing or cached. Check step 3, then bump the `?v=` number and hard refresh. |
| A light tile says Offline | Wrong entity id, or the device is unavailable. Check Developer tools → States. |
| Music tab: "Could not reach Music Assistant" | Not installed (set `library: false`), or set `music.config_entry_id` to the id at the end of the Music Assistant integration page's URL. |
| Home Assistant's header is gone and they need it | Add `?edit=1` to the URL. |
| Everything looks too small or too large | Set `device` explicitly instead of `auto`. |
| Tablet feels slow | Keep `animate: false`, then try `lite: true`. |
| Radar is blank | It needs internet, and Home Assistant needs a home location set (or give `radar: { lat, lon }`). |
| Alarm will not arm | Some alarms need a code. `security.code` exists but is stored in plain text; tell the user that before using it. |
