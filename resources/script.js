const Path = "C:/Users/MusicManSK/AppData/Roaming/.technic/modpacks/official-crafting-dead-mod";
const Log = Path + "/output-client.log";
const Screenshot = Path + "/screenshots/";

const Win = require("electron").remote.getCurrentWindow();
const fs = require("fs");
const edge = require("electron-edge-js");

const Click = edge.func("resources/click.cs");
const getPixelColor = edge.func("resources/getPixel.cs");
const KeyPress = edge.func("resources/keyboard.cs");

//console.log(getPixelColor({ x: 1, y: 1 }, (err, res) => console.log(err, res)));


var circle1 = new MapObject(parseHTML(`<div class="circle1" style="width:0;height:0;pointer-events:none;"></div>`), new Vector(0, 0), true),
    circle2 = new MapObject(parseHTML(`<div class="circle2" style="width:0;height:0;pointer-events:none;"></div>`), new Vector(0, 0), true),
    circle3 = new MapObject(parseHTML(`<div class="circle3" style="width:0;height:0;pointer-events:none;"></div>`), new Vector(0, 0), true),
    circle4 = new MapObject(parseHTML(`<div class="circle4" style="width:0;height:0;pointer-events:none;"></div>`), new Vector(0, 0), true);

var locateGroup = new MapGroup("Located Players"),
    nearGroup = new MapGroup("Nearby Players");

var drop = null,
    interval = null;

var maps = [{
        id: 0,
        src: "Atlanta.png",
        offset: new Vector(0, 0),
        names: ["atlanta", "at", "a"],
        spawns: [
            new Vector(1910, -95),
            new Vector(445, 1779),
            new Vector(-65, 1688),
            new Vector(1775, 562),
            new Vector(-123, 333),
            new Vector(690, 354),
            new Vector(822, -1465),
            new Vector(320, 190),
            new Vector(804, -1433),
            new Vector(689, 324),
            new Vector(942, 1523),
            new Vector(716, 386),
            new Vector(-308, -975),
            new Vector(728, 481),
            new Vector(1397, -1349),
            new Vector(1681, 1863),
            new Vector(832, -1348),
            new Vector(800, -1400),
            new Vector(1124, 911),
            new Vector(1705, 807),
            new Vector(1863, 891),
            new Vector(1100, 886),
            new Vector(1104, 903),
            new Vector(834, -155),
            new Vector(1594, 966),
            new Vector(-28, -782),
            new Vector(680, -1411),
            new Vector(1536, 209),
            new Vector(1124, 911),
            new Vector(772, -1479),
            new Vector(1117, 893),
            new Vector(1166, 933),
            new Vector(1708, -704),
            new Vector(806, -1462),
            new Vector(1465, 102),
            new Vector(696, 278),
            new Vector(814, -1462),
            new Vector(1848, 95)
        ],
        drops: [
            new Vector(718, 324),
            new Vector(254, -1099),
            new Vector(218, -40)
        ]
    },
    {
        id: 1,
        src: "DeadIsland.png",
        offset: new Vector(0, 0),
        names: ["deadisland", "disland", "deadi", "ddi", "di", "dead", "island"],
        spawns: [],
        drops: []
    }
];
var current_map = maps[0];

var Position = new Vector(0, 0);
var tracks = [{}, {}, {}, {}],
    positions = [],
    slot = 3;
var avatars = [],
    located = {};
var debug = true;


var DynMap = new DynamicMap(get("body"), "Atlanta.png", new Vector(0, 0), { center: new Vector(0, 0), scale: 0.5, width: window.innerWidth, height: window.innerHeight });
DynMap.on("load", e => {
    console.log("DynMap Loaded!");


    DynMap.attachObject(circle1);
    circle1.setTransform("translate(-50%, -50%)");
    circle1.on("scale", e => {
        circle1.element.style.borderWidth = 2 * (1 / e.value) + "px";
    });
    DynMap.attachObject(circle2);
    circle2.setTransform("translate(-50%, -50%)");
    circle2.on("scale", e => {
        circle2.element.style.borderWidth = 2 * (1 / e.value) + "px";
    });
    DynMap.attachObject(circle3);
    circle3.setTransform("translate(-50%, -50%)");
    circle3.on("scale", e => {
        circle3.element.style.borderWidth = 2 * (1 / e.value) + "px";
    });

    DynMap.attachObject(circle4);
    circle4.setTransform("translate(-50%, -50%)");
    circle4.on("scale", e => {
        circle4.element.style.borderWidth = 2 * (1 / e.value) + "px";
    });


    DynMap.attachGroup(locateGroup);
    DynMap.attachGroup(nearGroup);


    if(debug) {
        tracks = data_tracks3;
        positions = data_positions3;
        circle1.setPosition(positions[0]);
        circle2.setPosition(positions[1]);
        circle3.setPosition(positions[2]);
    }

});


function getAvatarURL(name, resolution = 8) {
    return `https://minotar.net/avatar/${name}/${resolution}`;
}


/* Log Listening */
fs.writeFileSync(Log, "");

fs.watchFile(Log, { interval: 1000 }, async(curr, prev) => {
    var file = fs.readFileSync(Log).toString();
    //console.log(file);
    var lines = file.split("\n");
    var change = lines[lines.length - 2];

    var date = new Date((change.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/) || "")[0]);
    var command = change.match(/\[CHAT\].*?MataxePlay > \.(.*)/);

    var nearby = change.match(/\[CHAT\] Players nearby: (.*?)$/);
    var supply = change.match(/\[CHAT\] \[Supply Drop\] \[(.*?)\] (?:(\d*?)m (\d*?)s remaining\.|Supply Drop Incoming!) x:([-0-9]*?) z:([-0-9]*?)$/);
    var screenshot = change.match(/\[CHAT\] Saved screenshot as (.*?)$/);



    if(command) {
        var args = command[1].replace(/\\\./g, ".").split(" ");
        var cmd = args.shift();

        //console.log(command, cmd, args);

        handleCommand(cmd, args);
    }

    if(nearby) {
        if(nearby[1] == "none") {
            stdout.print("No nearby players!");
            tracks[slot] = {};
            slot = 3;
            return;
        }

        var players = nearby[1].split(", ").map(player => {
            var m = player.match(/(.*?)?\((.\d*?)m\)/);
            return [m[1], m[2]];
        });

        //Remove all players from side menu
        var items = [...nearGroup.items];
        for(var item of items) item.destroy();

        tracks[slot] = {};
        for(let player of players) {
            //Parse data
            let m = player[0].match(/(?:\[(\w+)\] \? )?(\w+)/);
            let rank = m[1];
            let name = m[2];
            let distance = +player[1];

            //Set to tracking data
            tracks[slot][name] = distance;

            //Create new player
            let item = new MapItem(name, `${distance} blocks`, getAvatarURL(name));
            item.on("click", e => {
                circle4.element.style.width = distance * 2 + "px";
                circle4.element.style.height = distance * 2 + "px";

                circle4.setPosition(Position, 1000);
                DynMap.translate(Position, 1000);

                var windowSize = Math.min(window.innerWidth, window.innerHeight);
                var margin = 80;

                var r = (windowSize - margin * 2) / 2;
                if(debug) console.log(r, distance, r / distance);

                DynMap.scale(r / distance, 1000);
                item.select();
                //handleCommand("locate", [player]);
            });
            nearGroup.attachItem(item);

            if(debug) console.log(`${player[0]} => ${player[1]}`);
        }

        stdout.print(`<span style="background:${slot == 3 ? "inherit" : "green"}">< Got nearby players! (${players.length})</span>`);

        if(slot != 3) slot++;
        //slot = 3;

    }

    if(supply) {
        var type = supply[1];
        var min = supply[2];
        var sec = supply[3];
        var x = supply[4];
        var z = supply[5];

        console.log(`${type} Supply Drop! ${min}m ${sec}s, X: ${x} Z: ${z}`);

        if(drop) {
            drop.destroy();
            clearInterval(interval);
        }

        var time = new Date();
        time.setMinutes(time.getMinutes() + +min);
        time.setSeconds(time.getSeconds() + +sec);

        drop = new MapObject(parseHTML(`<div class="supplydrop ${type}" tip="X: ${x} Z: ${z}"><div class="time">${min && min ? min+":"+sec : ""}</div><div class="icon" style="background-image:url(SupplyDrop_${type}.png)"></div></div>`), new Vector(x, z), false);
        DynMap.attachObject(drop);
        drop.setTransform("translate(-50%, -100%)");

        setTimeout(() => {
            if(drop) drop.destroy();
            if(interval) clearInterval(interval);
        }, 10 * 60e3);

        if(!min || !sec) return;

        interval = setInterval(() => {
            var d = time - new Date();
            var s = Math.floor(d / 1000) % 60;
            var m = Math.floor(d / 1000 / 60) % 60;

            get(drop.element, ".time").innerHTML = `${fixDigits(m)}:${fixDigits(s)}`;
        }, 1000);
    }

    if(screenshot) {
        Digits.parseImage(Screenshot + screenshot[1]).then(pos => {
            Position = pos;

            DynMap.translate(Position);

            if(slot != 3) { //Tracking
                handleCommand(`pos${slot + 1}`, [Position.x, Position.y]);
            }
        }).catch(err => {
            stdout.print(`> ScreeshotError: ${err}`);
        });
    }
});


/* CLI */
const stdin = get(".console .input");
const stdout = get(".console .output");
stdin.buffer = [];
stdin.pointer = 0;
stdin.current = "";
stdin.setSelection = (from, to = from) => {
    stdin.focus();
    stdin.setSelectionRange(from, to);
};
stdout.print = string => {
    stdout.innerHTML += string + "<br>";
    stdout.scrollTo({
        left: 0,
        top: stdout.scrollHeight,
        behavior: "smooth"
    });
};

stdin.onkeydown = e => {
    var input = stdin.value;

    if(e.keyCode === 13) { //Enter
        stdout.print("> " + input);
        stdin.value = "";

        if(!input.trim()) return;

        var args = input.trim().split(" ");
        var cmd = args.shift();

        handleCommand(cmd, args);
    } else if(e.keyCode === 38) { //UP
        if(stdin.pointer == stdin.buffer.length) stdin.current = stdin.value;
        if(stdin.pointer) stdin.value = stdin.buffer[--stdin.pointer];
        stdin.setSelection(stdin.value.length - 1);
        e.preventDefault();
    } else if(e.keyCode === 40) { //DOWN
        if(stdin.pointer < stdin.buffer.length) stdin.value = stdin.buffer[++stdin.pointer] || stdin.current;
        stdin.setSelection(stdin.value.length - 1);
        e.preventDefault();
    }
};

/* Command Handler */
async function handleCommand(cmd, args = []) {
    stdin.pointer = stdin.buffer.push(cmd + " " + args.join(" "));

    if(cmd == "execute") {
        var code = args.join(" ");
        try {
            stdout.print("Executed result: " + eval(code));
            console.log("Executed result:", eval(code));
        } catch(e) {
            stdout.print(`Failed to execute expression "${code}"`);
            console.error(`Failed to execute expression "${code}"`);
        }
    } else if(cmd == "marker") {
        var pos = new Vector(args.shift(), args.shift());
        var label = args.join(" ");

        DynMap.createMarker(pos, Color.random(128, 64, -200), label);
    } else if(cmd == "center") {
        DynMap.translate(new Vector(+args[0], +args[1]), 1000);
        DynMap.scale(0.5);
    } else if(cmd == "zoom") {
        DynMap.scale(+args[0], 1000);
    } else if(cmd == "window") {
        Win.show();
        Win.maximize();
    } else if(cmd == "map") {
        var name = args[0];
        var _map = null;

        for(var m of maps) {
            if(m.names.includes(name.toLowerCase())) _map = m;
            else if(m.src == name) _map = m;
        }

        if(!_map) stdout.print(`Error: Cannot find map ${name}`);

        DynMap.removeMap();
        DynMap = new DynamicMap(get("body"), _map.src, _map.offset, { center: new Vector(0, 0), scale: 0.5, width: window.innerWidth, height: window.innerHeight });

        current_map = _map;
    } else if(cmd == "sell") {
        var n = args[0] || 3;
        console.log(n);

        var clicks = 0;
        var time = new Date();
        var X = 808;
        var Y = 385;
        var W = 32;
        var H = 32;
        var R = 6;
        var C = 9;
        var B = 4;

        stdout.print("Started clicking...");

        for(var i = 0; i < R; i++) {
            for(var j = 0; j < C; j++) {
                var cX = W / 2;
                var cY = H / 2;

                var bX = B * j;
                var bY = B * i;

                var x = X + j * W + bX + cX;
                var y = Y + i * H + bY + cY;

                for(var k = 0; k < n; k++) {
                    clicks++;
                    await new Promise((resolve, reject) => {
                        Click({ x: x, y: y, left: false }, (err, res) => {
                            if(err) reject(err);
                            else resolve(res);
                        });
                    });
                    await timeout(20);
                }
            }
        }

        stdout.print(`Clicked ${clicks} times (${new Date().getTime() - time}ms)!`);

    } else if(cmd == "screenshot") {
        console.log("Taking screenshot...");
        await new Promise((resolve, reject) => {
            KeyPress({ keyCode: 0x71 }, (err, res) => {
                if(err) reject(err);
                else resolve(res);
            });
        });
        console.log("Screenshot taken!");
    } else if(cmd == "drop") {
        if(drop) {
            DynMap.translate(drop.position, 1000);
            DynMap.scale(0.5);
        }
    } else if(cmd.startsWith("pos")) {
        var id = cmd.match(/pos([1-3])/);

        if(!id) return console.warn(`Invalid syntax! Use ".pos1-3"`);

        var pos = new Vector(args[0], args[1]);
        slot = id[1] - 1;

        positions[slot] = pos;
        window[`circle${id[1]}`].setPosition(pos);
        DynMap.translate(pos);
        DynMap.scale(1);

        stdout.print(`<span style="background:red">< Got position ${id[1]}! [${pos.x}, ${pos.y}]</span>`);
    } else if(cmd == "locate") {
        var nick = args[0];

        var r1 = tracks[0][nick];
        var r2 = tracks[1][nick];
        var r3 = tracks[2][nick];

        circle1.element.style.width = r1 * 2 + "px";
        circle1.element.style.height = r1 * 2 + "px";

        circle2.element.style.width = r2 * 2 + "px";
        circle2.element.style.height = r2 * 2 + "px";

        circle3.element.style.width = r3 * 2 + "px";
        circle3.element.style.height = r3 * 2 + "px";

        if(r1 && r2 && r3) {
            DynMap.translate(located[nick], 1000);
            if(DynMap.scaleAlpha < 1) DynMap.scale(1);
        } else if(r1 || r2 || r3) {
            console.log(r1, r2, r3);
            /*var c1 = r1 && r2;
            var c2 = r2 && r3;
            var c3 = r3 && r1;

            if(c1) {
            	var p = intersection(positions[0], r1, positions[1], r2);
            } else if(c2) {
            	var p = intersection(positions[1], r2, positions[2], r3);
            } else if(c3) {
            	var p = intersection(positions[2], r3, positions[0], r1);
            } else {

            }*/

        } else {
            stdout.print(`< Error: No data!`);
        }

        if(debug) console.log("Located player " + nick);
        stdout.print(`< Player ${nick} located!`);
    } else if(cmd == "begin") {
        slot = 0;
        stdout.print(`< Tracking started!`);

    } else if(cmd == "track") {

        //Remove all items and avatars
        var items = [...locateGroup.items];
        var avatars2 = [...avatars];
        for(var item of items) item.destroy();
        for(var avatar of avatars2) avatar.destroy();
        avatars = [];

        //Get center of circles
        var c1 = positions[0];
        var c2 = positions[1];
        var c3 = positions[2];

        //Get available players
        var players = [];
        for(let player in tracks[1]) {
            if(!tracks[0][player] || !tracks[1][player] || !tracks[2][player]) continue;
            players.push(player);
        }

        //Calculate position for each player
        for(let player in tracks[1]) {

            //Get radiuses of circles for player
            var r1 = tracks[0][player];
            var r2 = tracks[1][player];
            var r3 = tracks[2][player];

            //If player does not exists, continue
            if(!r1 || !r2 || !r3) continue;

            //Get intersection points for all circles
            var p12 = intersection(c1, r1, c2, r2);
            var p13 = intersection(c1, r1, c3, r3);
            var p23 = intersection(c2, r2, c3, r3);

            //Fix for 0 intersection points
            if(!p12[0].x && !p12[1].x) {
                var p = closest(c1, r1, c2, r2);
                p12 = [p, p];
            }
            if(!p13[0].x && !p13[1].x) {
                var p = closest(c1, r1, c3, r3);
                p13 = [p, p];
            }
            if(!p23[0].x && !p23[1].x) {
                var p = closest(c2, r2, c3, r3);
                p23 = [p, p];
            }

            //Setup three triangle points
            var p1, p2, p3;

            //Get distances from roots of (intersection of c1 and c3) to roots of (intersection of c2 and c3)
            var d1 = distance(p13[0], p23[0]);
            var d2 = distance(p13[0], p23[1]);
            var d3 = distance(p13[1], p23[0]);
            var d4 = distance(p13[1], p23[1]);

            //Get the minimal distance
            var min = Math.min(d1, d2, d3, d4);

            //Get p1 and p3 according to minimal distance
            if(min == d1) {
                p1 = p13[0];
                p3 = p23[0];
            } else if(min == d2) {
                p1 = p13[0];
                p3 = p23[1];
            } else if(min == d3) {
                p1 = p13[1];
                p3 = p23[0];
            } else if(min == d4) {
                p1 = p13[1];
                p3 = p23[1];
            } else console.error("JS, go home!");

            //Get distances from roots of (intersection of c1 and c2) to p3
            var d1 = distance(p12[0], p3);
            var d2 = distance(p12[1], p3);

            //Get the minimal distance
            var min = Math.min(d1, d2);

            //Get p2 according to minimal distance
            if(min == d1) {
                p2 = p12[0];
            } else if(min == d2) {
                p2 = p12[1];
            } else console.error("JS, get out!");

            //Get lengths of triangle sides
            var t1 = distance(p1, p2);
            var t2 = distance(p1, p3);
            var t3 = distance(p2, p3);

            //Get circumference of triangle
            var t = t1 + t2 + t3;

            //Set x and y of player
            var x = p3.x;
            var y = p3.y;

            var pos = new Vector(x, y);

            //Add player to located object
            located[player] = pos;

            //Create map object
            var acc = fit(-Math.sqrt(t) * 0.03 + 1, 0, 1) * 100;
            var loot = (1 - (players.indexOf(player) / (players.length - 1))) * 100;
            var url = getAvatarURL(player);
            var tip = `<b style='font-size:15px'>${player}</b><br>
					X: ${~~x} Z: ${~~y}<br>
					<span style='color:#afafaf'>Accuracy: <span style='color:hsl(${map(acc, 0, 100, 0, 120)},100%,50%)'>${acc.toFixed(1)}%</span></span><br>
					<span style='color:#afafaf'>Loot: <span style='color:hsl(${map(loot, 0, 100, 0, 120)},100%,50%)'>${loot.toFixed(1)}%</span></span>`;
            var user = new MapObject(parseHTML(`<div class="avatar" tip="${tip}"><div class="icon" style="background-image:url(${url})"></div></div>`), pos, false, true);
            DynMap.attachObject(user);
            user.setTransform("translate(-50%, -50%)");
            user.on("click", e => {
                handleCommand("locate", [player]);
            });
            avatars.push(user);

            //Add user to side menu
            var item = new MapItem(player, `acc: ${~~acc}% | loot: ${~~loot}%`, url);
            item.on("click", e => {
                handleCommand("locate", [player]);
            });
            locateGroup.attachItem(item);
        }
        stdout.print(`< Tracked ${players.length} palyers!`);
    } else {
        stdout.print(`< Unknown command "${cmd}"!`);
    }
}

/* === Maths === */

function intersection(pos1, r1, pos2, r2) {
    var x1 = pos1.x,
        y1 = pos1.y;
    var x2 = pos2.x,
        y2 = pos2.y;

    var d, p, e1, e2, x1t, y1t, x2t, y2t, m;

    d = Math.hypot(x2 - x1, y2 - y1);
    p = Math.sqrt((d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (-d + r1 + r2)) / 4;
    e1 = (x1 + x2) / 2 + (x2 - x1) * (r1 * r1 - r2 * r2) / (2 * d * d);
    e2 = (y1 + y2) / 2 + (y2 - y1) * (r1 * r1 - r2 * r2) / (2 * d * d);

    m = p / (d * d);

    x1t = e1 + 2 * (y1 - y2) * m;
    y1t = e2 - 2 * (x1 - x2) * m;
    x2t = e1 - 2 * (y1 - y2) * m;
    y2t = e2 + 2 * (x1 - x2) * m;

    return [new Vector(x1t, y1t), new Vector(x2t, y2t)];
}

function closest(pos1, r1, pos2, r2) {
    var d = distance(pos1, pos2);
    var isInside = d < Math.max(r1, r2);

    var a1 = angle(pos1, pos2);
    var a2 = angle(pos2, pos1);

    var a = isInside ? (r1 > r2 ? a1 : a2) : a1;

    var p1, p2;

    p1 = new Vector(
        pos1.x + cos(a) * r1,
        pos1.y + sin(a) * r1
    );

    p2 = new Vector(
        pos2.x + cos(a + (isInside ? 0 : PI)) * r2,
        pos2.y + sin(a + (isInside ? 0 : PI)) * r2
    );

    return new Vector(
        (p1.x + p2.x) / 2,
        (p1.y + p2.y) / 2
    );
}