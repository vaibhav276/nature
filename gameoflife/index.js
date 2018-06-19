$(function() {
   let config = {
      cellSize: 10,
      boardWidth: 500,
      boardHeight: 200,
      colorDead: '#f9efa4',
      colorLife: '#000000'
   };

   function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
   }

   function initBoard(config) {
      let xMax = config.boardWidth / config.cellSize;
      let yMax = config.boardHeight / config.cellSize;
      let board = [];
      for (let i = 0; i < xMax; i++) {
         board[i] = new Array(yMax);
         for (let j = 0; j < yMax; j++) {
            board[i][j] = getRandomInt(2);
         }
      }

      return board;
   }

   function initDisplay(config, board) {
      let svg = d3.select('#svg')
             .attr('width', config.boardWidth)
             .attr('height', config.boardHeight);

      svg.empty();

      let xMax = config.boardWidth / config.cellSize;
      let yMax = config.boardHeight / config.cellSize;
      let rect = [];
      for (let i = 0; i < xMax; i++) {
         rect[i] = new Array(yMax);
         for (let j = 0; j < yMax; j++) {
            let color = (board[i][j] == 0 ? config.colorDead : config.colorLife);
            rect[i][j] = svg.append('rect')
               .style('stroke', '#fffeee')
               .style('fill', color)
               .attr('x', config.cellSize*i)
               .attr('y', config.cellSize*j)
               .attr('width', config.cellSize)
               .attr('height', config.cellSize);
         }
      }

      return rect;
   }

   let board = initBoard(config);
   let rect = initDisplay(config, board);
   initRectHandlers();
   let interval = undefined;
   let stepCount = 0;

   // Mutates config, board, rect, interval
   $('#reset').click(() => {
      config.cellSize = parseInt($('#cellSize').val()) || config.cellSize;
      config.boardWidth = parseInt($('#boardWidth').val()) || config.boardWidth;
      config.boardHeight = parseInt($('#boardHeight').val()) || config.boardHeight;

      board = initBoard(config);
      rect = initDisplay(config, board);
      clearInterval(interval);
      interval = undefined;
      initRectHandlers();
      stepCount = 0;
   });

   $('#step').click(() => {
      let newBoard = step(config, board);
      rect = updateDisplay(config, newBoard, rect);
      board = newBoard;
   });

   $('#start').click(() => {
      interval = setInterval(function() {
         let newBoard = step(config, board);
         rect = updateDisplay(config, newBoard, rect);
         board = newBoard;
      }, 100);
   });

   $('#stop').click(() => {
      clearInterval(interval);
   });

   function initRectHandlers() {
      $('rect').click((o) => {
         let x = parseInt(o.currentTarget.attributes.x.nodeValue) / config.cellSize;
         let y = parseInt(o.currentTarget.attributes.y.nodeValue) / config.cellSize;

         board[x][y] = board[x][y] === 0 ? 1 : 0;
         rect = updateDisplay(config, board, rect);
      });
   }

   function step(config, board) {
      let xMax = config.boardWidth / config.cellSize;
      let yMax = config.boardHeight / config.cellSize;
      let newBoard = new Array(xMax);

      for (let i = 0; i < xMax; i++) {
         newBoard[i] = new Array(yMax);
         for (let j = 0; j < yMax; j++) {
            let count = getNeighborCount(config, board, i, j);
            if (count < 2) {
               newBoard[i][j] = 0; // underpopulation
            } else if (count == 3 && board[i][j] == 0) {
               newBoard[i][j] = 1; // reproduction
            } else if (count > 3) {
               newBoard[i][j] = 0; // overpopulation
            } else {
               newBoard[i][j] = board[i][j];
            }
         }
      }
      stepCount++;

      return newBoard;
   }

   $('#log').click(() => {
      let logConfig = Object.assign({}, config);
      logConfig.log = true;
      let x = parseInt($('#x').val());
      let y = parseInt($('#y').val());
      let count = getNeighborCount(logConfig, board, x, y);
   });

   function getNeighborCount(config, board, x, y) {
      let xMax = config.boardWidth / config.cellSize;
      let yMax = config.boardHeight / config.cellSize;
      let count = 0;
      if (config.log == true) {
         console.log("board", board);
         console.log("x = " + x + ", y = " + y + ": neighbors - ");
      }
      for (let i = -1; i <= 1; i++) {
         for (let j = -1; j <= 1; j++) {
            count += board[(xMax+x+i)%xMax][(yMax+y+j)%yMax];
            if (config.log == true) {
               console.log(board[(xMax+x+i)%xMax][(yMax+y+j)%yMax]);
            }
         }
      }
      count -= board[x][y];
      if (config.log == true) {
         console.log("count = " + count);
      }
      return count;
   }

   // Mutates rect
   function updateDisplay(config, board, rect) {
      let xMax = config.boardWidth / config.cellSize;
      let yMax = config.boardHeight / config.cellSize;
      for (let i = 0; i < xMax; i++) {
         for (let j = 0; j < yMax; j++) {
            let color = (board[i][j] == 0 ? config.colorDead : config.colorLife);
            rect[i][j].style('fill', color);
         }
      }
      $('#stepCount').html(stepCount);

      return rect;
   }

});
