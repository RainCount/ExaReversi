var shapeInstances = {};

var createTriangleBoard = function(two, boardStructure, colors, rotation) {
    var width = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
    var sideLength = width / 7; // 三角形的边长
    var height = sideLength * Math.sqrt(3) / 2; // 等边三角形的高

    // 获取屏幕的中心坐标
    var centerX = two.width / 2;
    var centerY = two.height / 2;

    // 绘制上半部分的棋盘
    var group = two.makeGroup(); // 创建一个组来存储所有三角形
    boardStructure.forEach((numTriangles, rowIndex) => {
        var y = centerY - (boardStructure.length / 2 * height) + rowIndex * height;
        for (var i = 0; i < numTriangles; i++) {
            var x = centerX - (numTriangles - 1) * sideLength / 2 + i * sideLength;
            var triangle = two.makePolygon(x, y, sideLength / 2, 3);

            // 保存实例，这里使用它的id属性作为键
            shapeInstances[triangle.id] = triangle;

            triangle.noStroke();
            triangle.fill = colors;
            triangle.rotation = rotation;

            group.add(triangle); // 将三角形添加到组中
        }
    });
    group.translation.set(0, rotation === 0 ? sideLength / 7 : -sideLength / 7);

    two.update();
};

var createPolygonBackground = function(two, color) {
    var width = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
    var sideLength = width / 6.85; // 边长

    // 获取屏幕的中心坐标
    var centerX = two.width / 2;
    var centerY = two.height / 2;

    var background = two.makePolygon(centerX, centerY, sideLength * 3, 6);
    background.noStroke();
    background.fill = color;

    background.translation.set(background.translation.x, background.translation.y - sideLength / 2.4);

    two.update();
};

var colors = { up: '#88d675', down: '#ffd34e' , P1: '#4B4B4B', P2: '#F9F9F9', Pre: '#4DC4FF',
    l: ['#FF7B00', '#FF8600', '#FF9100', '#FF9C00', '#FFA700', '#FFB200', '#FFBD00', '#FFC800', '#FFD300', '#FFDE00', '#FFE900'],
}; // 三角形的颜色

var elem = document.getElementById('draw-shapes');
var two = new Two({ 
    fullscreen: true, 
    autostart: true 
}).appendTo(elem);

createPolygonBackground(two, '#F9F9F9');
createTriangleBoard(two, [4, 5, 6, 5, 4, 3], colors.up, 0);
createTriangleBoard(two, [3, 4, 5, 6, 5, 4], colors.down, Math.PI);

//创建一个类，用于存储棋子的状态
class Board {
    constructor() {
        this.rows = [
            // 横行
            [1, 2, 3, 4, 5, 6, 7],
            [8, 9, 10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
            [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
            [39, 40, 41, 42, 43, 44, 45, 46, 47],
            [48, 49, 50, 51, 52, 53, 54],
            // 左斜行
            [2, 1, 9, 8, 18, 17, 28],
            [4, 3, 11, 10, 20, 19, 30, 29, 39],
            [6, 5, 13, 12, 22, 21, 32, 31, 41, 40, 48],
            [7, 15, 14, 24, 23, 34, 33, 43, 42, 50, 49],
            [16, 26, 25, 36, 35, 45, 44, 52, 51],
            [27, 38, 37, 47, 46, 54, 53],
            // 右斜行
            [6, 7, 15, 16, 26, 27, 38],
            [4, 5, 13, 14, 24, 25, 36, 37, 47],
            [2, 3, 11, 12, 22, 23, 34, 35, 45, 46, 54],
            [1, 9, 10, 20, 21, 32, 33, 43, 44, 52, 53],
            [8, 18, 19, 30, 31, 41, 42, 50, 51],
            [17, 28, 29, 39, 40, 48, 49]
        ];
        this.pieces = [];
        for (let i = 1; i <= 54; i++) {
            this.pieces[i] = new Piece(i, null); // 初始时，棋子的颜色为null
        }

        this.pieces[21].color = colors.P1;
        this.pieces[23].color = colors.P1;
        this.pieces[33].color = colors.P1;
        this.pieces[22].color = colors.P2;
        this.pieces[32].color = colors.P2;
        this.pieces[34].color = colors.P2;

        console.log(this.pieces);
        console.log(this.rows.length);
    }

    //判断某个棋子是否可以被放置
    canPlace(pieceId, color) {
        let piece = this.pieces[pieceId];
        if (piece.color === colors.Pre) {
            piece.previousColor = piece.color; // 存储当前颜色到previousColor
            piece.color = null;
        }
        if (piece.color !== null) {
            return false; // 如果棋子已经有颜色了，那么它不能被放置
        }
        let opponentColor = color === colors.P1 ? colors.P2 : colors.P1;
        // 遍历所有的行，查找包含这个棋子的行
        for (let i = 0; i < this.rows.length; i++) {
            let row = this.rows[i];
            let index = row.indexOf(pieceId);
            if (index !== -1) {
                // 如果找到了包含这个棋子的行，那么判断这个棋子是否可以被放置
                // 检查这个棋子左边和右边是否有对方的棋子，如果有，那么这个棋子就可以被放置
                if (index > 0 && this.pieces[row[index - 1]].color === opponentColor) {
                    // 检查对方的棋子的左边是否有自己的棋子
                    for (let j = index - 2; j >= 0; j--) {
                        if (this.pieces[row[j]].color === null || this.pieces[row[j]].color === colors.Pre) {
                            break;
                        } else if (this.pieces[row[j]].color === color) {
                            this.pieces[pieceId].previousColor = this.pieces[pieceId].color; // 存储当前颜色到previousColor
                            this.pieces[pieceId].color = colors.Pre;
                            return true;
                        }
                    }
                }
                if (index < row.length - 1 && this.pieces[row[index + 1]].color === opponentColor) {
                    // 检查对方的棋子的右边是否有自己的棋子
                    for (let j = index + 2; j < row.length; j++) {
                        if (this.pieces[row[j]].color === null || this.pieces[row[j]].color === colors.Pre) {
                            break;
                        } else if (this.pieces[row[j]].color === color) {
                            this.pieces[pieceId].previousColor = this.pieces[pieceId].color; // 存储当前颜色到previousColor
                            this.pieces[pieceId].color = colors.Pre;
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    //按照棋盘的布局，输出棋盘的状态
    printBoard() {
        for (let i = 0; i < 6; i++) {
            let row = this.rows[i];
            let rowStatus = "";

            if(i === 0 || i === 5){
                rowStatus += "  ";
            }
            if(i === 1 || i === 4){
                rowStatus += " ";
            }

            for (let j = 0; j < row.length; j++) {
                let piece = this.pieces[row[j]];
                if (piece.color === null) {
                    rowStatus += "0";
                } else if (piece.color === colors.P1) {
                    rowStatus += "B";
                } else if (piece.color === colors.P2) {
                    rowStatus += "W";
                } else if (piece.color === colors.Pre) {
                    rowStatus += "X";
                }
            }
            console.log(rowStatus);
        }
    }

}

class Piece {
    constructor(id, color) {
        this.id = id;
        this.color = color;
        this.previousColor = color; // 新增属性以存储前一个颜色状态
    }

    flip() {
        this.previousColor = this.color; // 存储当前颜色到previousColor
        if (this.color === colors.P1) {
            this.color = colors.P2;
        } else if (this.color === colors.P2) {
            this.color = colors.P1;
        }
    }
}

class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = colors.P1; // 黑子先下
    }

    // 判断当前玩家是否有合法的落子位置
    hasLegalMove() {
        let result = false;
        for (let i = 1; i <= 54; i++) {
            if (this.board.canPlace(i, this.currentPlayer)) {
                result = true;
            }
        }
        return result;
    }

    // 落子并翻转对方的棋子
    makeMove(pieceId) {
        if (this.board.canPlace(pieceId, this.currentPlayer)) {
            this.board.pieces[pieceId].previousColor = this.board.pieces[pieceId].color; // 存储当前颜色到previousColor
            this.board.pieces[pieceId].color = this.currentPlayer;
            this.flipOpponentPieces(pieceId);
            this.switchPlayer();
        } else {
            console.log("Illegal move!");
        }
    }

    // 翻转对方的棋子
    flipOpponentPieces(pieceId) {
        let opponentColor = this.currentPlayer === colors.P1 ? colors.P2 : colors.P1;
            let flipList = []; // 添加一个等待翻转的列表
        // 遍历所有的行，查找包含这个棋子的行
        for (let i = 0; i < this.board.rows.length; i++) {
            let row = this.board.rows[i];
            let index = row.indexOf(pieceId);
            if (index !== -1) {
                // 如果找到了包含这个棋子的行，那么判断这个棋子是否可以被放置
                // 检查这个棋子左边和右边是否有对方的棋子，如果有，那么这个棋子就可以被放置
                if (index > 0 && this.board.pieces[row[index - 1]].color === opponentColor) {
                    // 检查对方的棋子的左边是否有自己的棋子
                    for (let j = index - 2; j >= 0; j--) {
                        if (this.board.pieces[row[j]].color === null || this.board.pieces[row[j]].color === colors.Pre) {
                            break;
                        } else if (this.board.pieces[row[j]].color === this.currentPlayer) {
                            for (let k = j + 1; k < index; k++) {
                                if (!flipList.includes(row[k])) { // 检查棋子是否已经在列表中
                                    flipList.push(row[k]); // 如果不在列表中，就添加到列表中
                                }
                            }
                            break;
                        }
                    }
                }
                if (index < row.length - 1 && this.board.pieces[row[index + 1]].color === opponentColor) {
                    // 检查对方的棋子的右边是否有自己的棋子
                    for (let j = index + 2; j < row.length; j++) {
                        if (this.board.pieces[row[j]].color === null || this.board.pieces[row[j]].color === colors.Pre) {
                            break;
                        } else if (this.board.pieces[row[j]].color === this.currentPlayer) {
                            for (let k = index + 1; k < j; k++) {
                                if (!flipList.includes(row[k])) { // 检查棋子是否已经在列表中
                                    flipList.push(row[k]); // 如果不在列表中，就添加到列表中
                                }
                            }
                            break;
                        }
                    }
                }
            }                   
        }
        // 在所有可能的行都判断完毕后进行翻转
        for (let i = 0; i < flipList.length; i++) {
            this.board.pieces[flipList[i]].flip();
        } 
    }

    // 切换当前玩家
    switchPlayer(attempts = 0) {
        console.log(attempts);
        if (this.currentPlayer === colors.P1) {
            this.currentPlayer = colors.P2;
        } else {
            this.currentPlayer = colors.P1;
        }
        if (!this.hasLegalMove()) {
            if (attempts < 1) {
                console.log("No legal move for " + this.currentPlayer + ", switch to the other player.");
                //添加一个等待时间，让玩家看到当前玩家已经没有合法的落子位置
                showMessage("当前玩家没有位置落子，切换玩家"); // 在页面上显示消息
                this.switchPlayer(attempts + 1);
            } else {
                console.log("No legal moves for both players. Game over.");
                // 这里可以添加游戏结束的代码
                let score = this.getScore();
                console.log("Final score: " + JSON.stringify(score));
                let message = "最终得分: 黑方 " + score.black + " - 白方 " + score.white;
                if (score.black > score.white) {
                    console.log("Black wins!");
                    message += " 黑方获胜！";
                } else if (score.black < score.white) {
                    console.log("White wins!");
                    message += " 白方获胜！";
                } else {
                    console.log("It's a tie!");
                    message += " 平局!";
                }
                renderMap();
                showEndScreen(message); // 显示游戏结束屏幕
            }
        }
    }

    getScore() {
        let blackScore = 0;
        let whiteScore = 0;
        for (let i = 1; i <= 54; i++) {
            let piece = this.board.pieces[i];
            if (piece.color === colors.P1) {
                blackScore++;
            } else if (piece.color === colors.P2) {
                whiteScore++;
            }
        }
        return {
            black: blackScore,
            white: whiteScore
        };
    }
}


let idMapping = {
    'two-3': 1, 'two-31': 2, 'two-4': 3, 'two-32': 4, 'two-5': 5, 'two-33': 6, 'two-6': 7,
    'two-7': 8, 'two-34': 9, 'two-8': 10, 'two-35': 11, 'two-9': 12, 'two-36': 13, 'two-10': 14, 'two-37': 15, 'two-11': 16,
    'two-12': 17, 'two-38': 18, 'two-13': 19, 'two-39': 20, 'two-14': 21, 'two-40': 22, 'two-15': 23, 'two-41': 24, 'two-16': 25, 'two-42': 26, 'two-17': 27,
    'two-43': 28, 'two-18': 29, 'two-44': 30, 'two-19': 31, 'two-45': 32, 'two-20': 33, 'two-46': 34, 'two-21': 35, 'two-47': 36, 'two-22': 37, 'two-48': 38,
    'two-49': 39, 'two-23': 40, 'two-50': 41, 'two-24': 42, 'two-51': 43, 'two-25': 44, 'two-52': 45, 'two-26': 46, 'two-53': 47,
    'two-54': 48, 'two-27': 49, 'two-55': 50, 'two-28': 51, 'two-56': 52, 'two-29': 53, 'two-57': 54,
};

let lines = [
    ["12", "43"],
    ["7", "38", "18", "49"],
    ["3", "34", "13", "44", "23", "54"],
    ["31", "8", "39", "19", "50", "27"],
    ["4", "35", "14", "45", "24", "55"],
    ["32", "9", "40", "20", "51", "28"],
    ["5", "36", "15", "46", "25", "56"],
    ["33", "10", "41", "21", "52", "29"],
    ["6", "37", "16", "47", "26", "57"],
    ["11", "42", "22", "53"],
    ["17", "48"]
];

console.log(lines);

let userInputResolve = null;

// 创建SVG滤镜
function createSvgFilter(id, blur, matrix) {
    // 创建滤镜元素
    let filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', id);

    // 创建高斯模糊元素
    let feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('in', 'SourceAlpha');
    feGaussianBlur.setAttribute('stdDeviation', blur);

    // 创建偏移元素
    let feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    feOffset.setAttribute('dx', '0');
    feOffset.setAttribute('dy', '0');
    feOffset.setAttribute('result', 'offsetblur');

    // 创建颜色矩阵元素
    let feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    feColorMatrix.setAttribute('type', 'matrix');
    feColorMatrix.setAttribute('values', matrix);

    // 创建合并元素
    let feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    let feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    let feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);

    // 将所有元素添加到滤镜中
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feOffset);
    filter.appendChild(feColorMatrix);
    filter.appendChild(feMerge);

    // 将滤镜添加到SVG的defs元素中
    let svgDefs = document.querySelector('svg defs');
    if (!svgDefs) {
        let svg = document.querySelector('svg');
        svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(svgDefs);
    }
    svgDefs.appendChild(filter);
}

function animateScale(shape, targetScale, duration, two, onComplete = null) {
    const startScale = shape.scale;
    const scaleChange = targetScale - startScale;
    const startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        shape.scale = startScale + (scaleChange * progress);
        two.update();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else if (onComplete) {
            onComplete(); // 调用完成回调
        }
    }

    requestAnimationFrame(animate);
}

// 假设这个函数被调用来为图形添加hover效果
function addHoverEffect(two) {
    console.log(shapeInstances);
    Object.keys(shapeInstances).forEach(function(id) {
        var shape = shapeInstances[id];
        var elem = shape._renderer.elem; // 获取Two.js图形对应的DOM元素

        const originalScale = 1;
        const hoverScale = 1.12; // 放大
        const duration = 175; // 动画持续时间（毫秒）

        elem.addEventListener('mouseenter', function() {
            animateScale(shape, hoverScale, duration, two);
        });

        elem.addEventListener('mouseleave', function() {
            animateScale(shape, originalScale, duration, two);
        });
    });
}0.


function initialize() {
    addHoverEffect(two);
    createSvgFilter('shadow1', '5', '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0');
    createSvgFilter('shadow2', '4', '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0');

    let elem = document.getElementById('two-' + 0);
    elem.setAttribute('transform', 'matrix(1, 0, 0, 1, 0, 70)');
    elem = document.getElementById('two-' + 1);
    elem.style.filter = 'url(#shadow2)';

    for (let i = 0; i < lines.length; i++) {
        for(let j = 0; j < lines[i].length; j++){
            let elem = document.getElementById('two-' + lines[i][j]);
            if (elem) {
                let id = idMapping[elem.id];
                elem.addEventListener('click', function() {
                    // console.log(id);
                    if (userInputResolve) {
                        userInputResolve(id);
                        userInputResolve = null;
                    }
                });
                elem.setAttribute('fill', game.board.pieces[id].color === null ? colors.l[i] : game.board.pieces[id].color);
                elem.style.filter = 'url(#shadow1)';
            }
        }
    }

    // for (let i = 3; i <= 29; i++) {
    //     let elem = document.getElementById('two-' + i);
    //     if (elem) {
    //         let id = idMapping[elem.id];
    //         elem.addEventListener('click', function() {
    //             // console.log(id);
    //             if (userInputResolve) {
    //                 userInputResolve(id);
    //                 userInputResolve = null;
    //             }
    //         });
    //         elem.setAttribute('fill', game.board.pieces[id].color === null ? colors.up : game.board.pieces[id].color);
    //         elem.style.filter = 'url(#shadow1)';
    //     }
    // }
    // for (let i = 31; i <= 57; i++) {
    //     let elem = document.getElementById('two-' + i);
    //     if (elem) {
    //         let id = idMapping[elem.id];
    //         elem.addEventListener('click', function() {
    //             // console.log(id);
    //             if (userInputResolve) {
    //                 userInputResolve(id);
    //                 userInputResolve = null;
    //             }
    //         });
    //         elem.setAttribute('fill', game.board.pieces[id].color === null ? colors.down : game.board.pieces[id].color);
    //         elem.style.filter = 'url(#shadow1)';
    //     }
    // }
}

function flipPieceAnimation(pieceId, newColor) {
    let shape = shapeInstances['two-' + pieceId];
    let piece = game.board.pieces[idMapping['two-' + pieceId]];

    // console.log(piece.color, piece.previousColor)
    if (!shape || piece.color === piece.previousColor || (piece.previousColor === null && piece.color !== colors.Pre)) return; // 如果颜色没有变化，则不执行动画

    if (piece.color === null) {
        animateScale(shape, 0.9, 75, two, () => {
            // 改变颜色
            shape.fill = newColor;
            two.update();

            // 然后放大s
            animateScale(shape, 1, 125, two);
        });
        return;
    }

    if (piece.color === colors.Pre) {
        animateScale(shape, 0.8, 75, two, () => {
            // 改变颜色
            shape.fill = newColor;
            two.update();

            // 然后放大s
            animateScale(shape, 1, 125, two);
        });
        return;
    }

    // 先缩小
    animateScale(shape, 0.2, 75, two, () => {
        // 改变颜色
        shape.fill = newColor;
        two.update();

        // 然后放大s
        animateScale(shape, 1, 125, two);
    });
}

function renderMap() {
    for (let i = 0; i < lines.length; i++) {
        for(let j = 0; j < lines[i].length; j++){
            let elem = document.getElementById('two-' + lines[i][j]);
            if (elem) {
                let id = idMapping[elem.id];
                let piece = game.board.pieces[id];
                let finalColor = piece.color === null ? colors.l[i] : piece.color;
                flipPieceAnimation(lines[i][j], finalColor);
                piece.previousColor = piece.color; // 存储当前颜色到previousColor
            }
        }
    }

    // for (let i = 3; i <= 29; i++) {
    //     let elem = document.getElementById('two-' + i);
        // if (elem) {
        //     // elem.setAttribute('fill', game.board.pieces[idMapping[elem.id]].color === null ? colors.up : game.board.pieces[idMapping[elem.id]].color);
        //     let id = idMapping[elem.id];
        //     let piece = game.board.pieces[id];
        //     let finalColor = piece.color === null ? colors.up : piece.color;
        //     flipPieceAnimation(i, finalColor);
        //     piece.previousColor = piece.color; // 存储当前颜色到previousColor
        // }
    // }
    // for (let i = 31; i <= 57; i++) {
    //     let elem = document.getElementById('two-' + i);
    //     if (elem) {
    //         // elem.setAttribute('fill', game.board.pieces[idMapping[elem.id]].color === null ? colors.down : game.board.pieces[idMapping[elem.id]].color);
    //         let id = idMapping[elem.id];
    //         let piece = game.board.pieces[id];
    //         let finalColor = piece.color === null ? colors.down : piece.color;
    //         flipPieceAnimation(i, finalColor);
    //         piece.previousColor = piece.color; // 存储当前颜色到previousColor
    //     }
    // }
    game.board.printBoard();
}

// 更新分数显示
function updateScoreboard() {
    let score = game.getScore();
    document.getElementById('blackScore').textContent = '黑方: ' + score.black;
    document.getElementById('whiteScore').textContent = '白方: ' + score.white;
}

// 更新当前玩家显示
function updateCurrentPlayer() {
    let currentPlayerText = game.currentPlayer === colors.P1 ? '黑方' : '白方';
    document.getElementById('currentPlayer').textContent = '当前玩家: ' + currentPlayerText;
}

// 游戏结束，显示结束屏幕
function showEndScreen(message) {
    document.getElementById('end-message').textContent = message;
    document.getElementById('end-screen').style.opacity = '1'; // 设置结束屏幕的透明度
    document.getElementById('end-screen').style.display = 'flex'; // 显示结束屏幕
}

// 显示消息的函数
function showMessage(message) {
    let messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.display = 'block'; // 显示消息元素
    messageElement.style.animation = 'none'; // 先清除动画，以便重新开始
    setTimeout(() => {
        messageElement.style.animation = ''; // 重新应用动画
    }, 10); // 设置一个小的延迟，以确保动画可以重新开始
    setTimeout(() => {
        messageElement.style.display = 'none'; // 在一段时间后隐藏消息元素
    }, 2000);
}

// 重新开始游戏
function restartGame() {
    // 隐藏结束屏幕
    document.getElementById('end-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('end-screen').style.display = 'none';
    }, 1000);
    
    game = new Game();
    game.board.printBoard();
    initialize();

    main();
}

function startGame() {
    game.board.printBoard();
    initialize();

    main();
}

async function main() {
    while (game.hasLegalMove()) {
        console.log("Current player: " + game.currentPlayer);
        console.log("Score: " + JSON.stringify(game.getScore()));
        renderMap();
        changeBackgroundColor()
        updateScoreboard(); // 更新分数
        updateCurrentPlayer(); // 更新当前玩家显示
        let pieceId = await getUserInput();
        // console.log(pieceId);
        game.makeMove(pieceId);
    }

    console.log("Game over!");
    let score = game.getScore();
    console.log("Final score: " + JSON.stringify(score));
    let message = "最终得分: 黑方 " + score.black + " - 白方 " + score.white;
    if (score.black > score.white) {
        console.log("Black wins!");
        message += " 黑方获胜！";
    } else if (score.black < score.white) {
        console.log("White wins!");
        message += " 白方获胜！";
    } else {
        console.log("It's a tie!");
        message += " 平局!";
    }
    showEndScreen(message); // 显示游戏结束屏幕
}

function getUserInput() {
    return new Promise(resolve => {
        userInputResolve = resolve;
    });
}

let game = new Game();

startGame();

function changeBackgroundColor() {
    // 获取棋盘上已经下的棋子的数量
    let count = 0;
    for (let i = 1; i <= 54; i++) {
        if (game.board.pieces[i].color === colors.P1 || game.board.pieces[i].color === colors.P2) {
            count++;
        }
    }

    // 定义起始和目标颜色
    let startColor = [256, 256, 256];
    let endColor = [255, 122, 0];

    // 计算新的颜色值
    let newColor = startColor.map((start, i) => {
        return Math.min(start + Math.floor(((endColor[i] - start) / 54) * count), 255);
    });

    // 将新的颜色值转换为十六进制字符串
    newColor = newColor.map(color => color.toString(16).padStart(2, '0')).join('');

    // 设置元素的颜色
    let elem = document.getElementById('two-1');
    elem.setAttribute('fill', '#' + newColor);
}