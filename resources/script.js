var Log = "C:/Users/MusicManSK/AppData/Roaming/.technic/modpacks/official-crafting-dead-mod/output-client.log";
const fs = require("fs");


var circle1 = new MapObject(parseHTML(`<div class="circle1" style="width:0;height:0;pointer-events:none;"></div>`), new Vector(0, 0), true),
    circle2 = new MapObject(parseHTML(`<div class="circle2" style="width:0;height:0;pointer-events:none;"></div>`), new Vector(0, 0), true),
    circle3 = new MapObject(parseHTML(`<div class="circle3" style="width:0;height:0;pointer-events:none;"></div>`), new Vector(0, 0), true);
var drop = null,
    interval = null;
var tracks = [{}, {}, {}, {}],
    positions = [],
    slot = 3;
var avatars = [],
    located = {};
var debug = true;


var Map = new DynamicMap(get("body"), "map.png", new Vector(0, 0), { center: new Vector(0, 0), scale: 0.5, width: window.innerWidth, height: window.innerHeight });
Map.on("load", e => {
    console.log("Map Loaded!");


    Map.attachObject(circle1);
    circle1.setTransform("translate(-50%, -50%)");
    circle1.on("scale", e => {
        circle1.element.style.borderWidth = 2 * (1 / e.value) + "px";
    });

    Map.attachObject(circle2);
    circle2.setTransform("translate(-50%, -50%)");
    circle2.on("scale", e => {
        circle2.element.style.borderWidth = 2 * (1 / e.value) + "px";
    });
    Map.attachObject(circle3);
    circle3.setTransform("translate(-50%, -50%)");
    circle3.on("scale", e => {
        circle3.element.style.borderWidth = 2 * (1 / e.value) + "px";
    });


    if(debug) {
        tracks = data_tracks2;
        positions = data_positions2;
        circle1.setPosition(positions[0]);
        circle2.setPosition(positions[1]);
        circle3.setPosition(positions[2]);
    }

});


/* Log Listening */
fs.writeFileSync(Log, "");

fs.watchFile(Log, { interval: 1000 }, (curr, prev) => {
    var file = fs.readFileSync(Log).toString();
    //console.log(file);
    var lines = file.split("\n");
    var change = lines[lines.length - 2];

    var date = new Date((change.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/) || "")[0]);
    var command = change.match(/\[CHAT\].*?MataxePlay > \.(.*)/);

    var nearby = change.match(/\[CHAT\] Players nearby: (.*?)$/);
    var supply = change.match(/\[CHAT\] \[Supply Drop\] \[(.*?)\] (?:(\d*?)m (\d*?)s remaining\.|Supply Drop Incoming!) x:([-0-9]*?) z:([-0-9]*?)$/);



    if(command) {
        var args = command[1].split(" ");
        var cmd = args.shift();

        //console.log(command, cmd, args);

        handleCommand(cmd, args);
    }

    if(nearby) {
        if(nearby[1] == "none") {
            console.log("No nearby players!");
            tracks[slot] = {};
            slot = 3;
            return;
        }

        var players = nearby[1].split(", ").map(player => {
            var m = player.match(/(.*?)?\((.\d*?)m\)/);
            return [m[1], m[2]];
        });

        tracks[slot] = {};
        for(var player of players) {
            tracks[slot][player[0].match(/[^ ]*$/)] = +player[1];
            console.log(`${player[0]} => ${player[1]}`);
        }

        stdout.print(`<span style="background:${slot == 3 ? "inherit" : "red"}">< Got nearby players! (${players.length})</span>`);

        slot = 3;
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
        Map.attachObject(drop);
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
});


/* CLI */
var stdin = get(".console .input");
var stdout = get(".console .output");
stdout.print = string => {
    stdout.innerHTML += string + "<br>";
    stdout.scrollTo({
        left: 0,
        top: stdout.scrollHeight,
        behavior: "smooth"
    });
}

stdin.onkeypress = e => {
    var input = stdin.value;

    if(e.keyCode === 13) {
        stdout.print("> " + input);
        stdin.value = "";

        if(!input.trim()) return;

        var args = input.trim().split(" ");
        var cmd = args.shift();

        handleCommand(cmd, args);
    }
};


/* Handler */

function handleCommand(cmd, args = []) {
    if(cmd == "execute") {
        var code = args.join(" ");
        try {
            console.log("Executed result:", eval(code));
        } catch(e) {
            console.error(`Failed to execute expression "${code}"`);
        }
    } else if(cmd == "mark") {
        var pos = new Vector(args.shift(), args.shift());
        var label = args.join(" ");

        Map.createMarker(pos, Color.random(128, 64, -200), label);
    } else if(cmd == "center") {
        Map.translate(new Vector(args[0], args[1]), 1000);
        Map.scale(0.5);
    } else if(cmd == "zoom") {
        Map.scale(args[0], 1000);
    } else if(cmd == "drop") {
        if(drop) {
            Map.translate(drop.position, 1000);
            Map.scale(0.5);
        }
    } else if(cmd.startsWith("pos")) {
        var id = cmd.match(/pos([1-3])/);

        if(!id) return console.warn(`Invalid syntax! Use ".pos1-3"`);

        var pos = new Vector(args[0], args[1]);
        slot = id[1] - 1;

        positions[slot] = pos;
        window[`circle${id[1]}`].setPosition(pos);
        Map.translate(pos);
        Map.scale(1);

        stdout.print(`<span style="background:red">< Got position ${id[1]}! [${pos.x}, ${pos.y}]</span>`);
    } else if(cmd == "locate") {
        var nick = args[0];

        var d1 = tracks[0][nick] * 2;
        var d2 = tracks[1][nick] * 2;
        var d3 = tracks[2][nick] * 2;

        circle1.element.style.width = d1 + "px";
        circle1.element.style.height = d1 + "px";

        circle2.element.style.width = d2 + "px";
        circle2.element.style.height = d2 + "px";

        circle3.element.style.width = d3 + "px";
        circle3.element.style.height = d3 + "px";

        Map.translate(located[nick], 1000);
        if(Map.scaleAlpha < 1) Map.scale(1);

        if(debug) console.log("Located player " + nick);
        stdout.print(`< Player ${nick} located!`);
    } else if(cmd == "track") {

        //Remove all avatars
        for(var avatar of avatars) {
            avatar.destroy();
        }
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
            var tip = `<b style='font-size:15px'>${player}</b><br>
					X: ${~~x} Z: ${~~y}<br>
					<span style='color:#afafaf'>Accuracy: <span style='color:hsl(${map(acc, 0, 100, 0, 120)},100%,50%)'>${acc.toFixed(1)}%</span></span><br>
					<span style='color:#afafaf'>Loot: <span style='color:hsl(${map(loot, 0, 100, 0, 120)},100%,50%)'>${loot.toFixed(1)}%</span></span>`;
            var user = new MapObject(parseHTML(`<div class="avatar" tip="${tip}"><div class="icon" style="background-image:url(https://minotar.net/avatar/${player}/8)"></div></div>`), pos, false, true);
            Map.attachObject(user);
            user.setTransform("translate(-50%, -50%)");
            user.on("click", e => {
                handleCommand("locate", [player]);
            });
            avatars.push(user);
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