var elem = document.getElementById('draw-shapes');
var params = { width: 285, height: 250 };
var two = new Two(params).appendTo(elem);

// 定义三角形的边长和间隙
var sideLength = 50;
var gap = -10;  // 适当的间隙
var height = Math.sqrt(3) / 2 * sideLength;

// 计算中心点位置
var centerX = params.width / 2;
var centerY = params.height / 2;

// 绘制六个等边三角形
var triangles = [];
for (var i = 0; i < 6; i++) {
    var angle = (Math.PI / 3) * i;
    var x = centerX + (height + gap) * Math.cos(angle);
    var y = centerY + (height + gap) * Math.sin(angle);

    var triangle = two.makePolygon(x, y, sideLength / 2, 3);
    if (i % 2 === 0) {
        triangle.rotation = -Math.PI / 2 + angle;
    } else {
        triangle.rotation = Math.PI / 6 + angle;
    }
    triangle.fill = '#333'; // 填充颜色
    triangle.noStroke();

    triangles.push(triangle);
}

// 渲染到屏幕
two.update();
