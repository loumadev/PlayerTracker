const Digits = [{
    digit: "0",
    "255": [4, 8, 12, 24, 40, 48, 60, 64, 72, 80, 88, 96, 100, 112, 120, 136, 148, 152, 156],
    "63": [32, 36, 52, 68, 76, 92, 108, 116, 124, 128, 140, 164, 176, 180, 184]
}, {
    digit: "1",
    "255": [8, 28, 32, 56, 80, 104, 128, 144, 148, 152, 156, 160],
    "63": [36, 60, 84, 108, 132, 172, 176, 180, 184, 188]
}, {
    digit: "2",
    "255": [4, 8, 12, 24, 40, 64, 80, 84, 100, 120, 136, 144, 148, 152, 156, 160],
    "63": [32, 36, 52, 68, 92, 108, 112, 128, 164, 172, 176, 180, 184, 188]
}, {
    digit: "3",
    "255": [4, 8, 12, 24, 40, 64, 80, 84, 112, 120, 136, 148, 152, 156],
    "63": [32, 36, 52, 68, 92, 108, 140, 164, 176, 180, 184]
}, {
    digit: "4",
    "255": [12, 16, 32, 40, 52, 64, 72, 88, 96, 100, 104, 108, 112, 136, 160],
    "63": [44, 60, 68, 80, 92, 116, 124, 128, 132, 140, 164, 188]
}, {
    digit: "5",
    "255": [0, 4, 8, 12, 16, 24, 48, 52, 56, 60, 88, 112, 120, 136, 148, 152, 156],
    "63": [28, 32, 36, 40, 44, 76, 80, 84, 116, 140, 164, 176, 180, 184]
}, {
    digit: "6",
    "255": [8, 12, 28, 48, 72, 76, 80, 84, 96, 112, 120, 136, 148, 152, 156],
    "63": [36, 40, 56, 100, 104, 108, 124, 140, 164, 176, 180, 184]
}, {
    digit: "7",
    "255": [0, 4, 8, 12, 16, 24, 40, 64, 84, 104, 128, 152],
    "63": [28, 32, 36, 44, 52, 68, 92, 112, 132, 156, 180]
}, {
    digit: "8",
    "255": [4, 8, 12, 24, 40, 48, 64, 76, 80, 84, 96, 112, 120, 136, 148, 152, 156],
    "63": [32, 36, 52, 68, 92, 104, 108, 124, 140, 164, 176, 180, 184]
}, {
    digit: "9",
    "255": [4, 8, 12, 24, 40, 48, 64, 76, 80, 84, 88, 112, 132, 148, 152],
    "63": [32, 36, 52, 68, 92, 104, 108, 116, 140, 160, 176, 180]
}, {
    digit: "-",
    "255": [72, 76, 80, 84, 88],
    "63": [100, 104, 108, 112, 116]
}];

Digits.parseImage = function(url, maxDigits = 9) {
    return new Promise((resolve, reject) => {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        var img = new Image();
        img.src = url;

        var lL = maxDigits + 1; //Custom
        var lW = 12;
        var lH = 16;

        var X = 28;
        var Y = [124, 164];

        img.onload = e => {
            var w = lW / 2;
            var h = lH / 2;

            canvas.width = w * lL;
            canvas.height = h * 2;

            var position = new Vector();

            for(var c = 0; c < 2; c++) { //coord dimension
                ctx.drawImage(img, X, Y[c], lW * lL, lH, 0, h * c, w * lL, h);

                var digits = "";
                for(var d = 0; d < lW; d++) { //digit
                    var data = ctx.getImageData(w * d, h * c, w, h).data;

                    var result = null;

                    for(var digit of Digits) {
                        var match = true;

                        for(var p = 0; p < data.length; p += 4) { //pixel
                            var r = data[p + 0];
                            var g = data[p + 1];
                            var b = data[p + 2];
                            var a = data[p + 3];

                            var is255 = r == 255 && g == 255 && b == 255;
                            var is63 = r == 63 && g == 63 && b == 63;

                            var should255 = digit["255"].includes(p);
                            var should63 = digit["63"].includes(p);

                            if(should255) {
                                if(!is255) {
                                    match = false;
                                    break;
                                }
                            }
                            if(should63) {
                                if(!is63) {
                                    match = false;
                                    break;
                                }
                            }

                        }

                        if(match) result = digit.digit;
                    }

                    if(!result) break;
                    else digits += result;
                }

                if(!digits) reject("Failed to parse image");

                if(c) position.y = +digits;
                else position.x = +digits;
            }

            resolve(position);
        }
    });
};